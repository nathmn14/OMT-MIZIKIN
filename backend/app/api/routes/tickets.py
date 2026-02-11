from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_current_user, require_roles
from app.db.session import get_session
from app.models.ticket import Ticket
from app.models.scan import Scan
from app.models.event import Event
from app.models.user import User
from app.schemas.ticket import TicketPurchaseRequest, TicketOut, VerifyTicketRequest
from app.services.ticketing import purchase_tickets

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.get("", response_model=list[TicketOut])
async def list_tickets(
    event_id: int | None = None, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Ticket).order_by(Ticket.id.desc())
    
    if current_user.role == "organisateur":
        # Join with Event to filter by organizer_id
        stmt = stmt.join(Event).where(Event.organizer_id == current_user.id)
    elif current_user.role != "admin":
        # Maybe handle other roles or just limit to what they should see
        # For now, let's say only admin and owner can see lists
        pass

    if event_id is not None:
        stmt = stmt.where(Ticket.event_id == event_id)
        
    result = await session.execute(stmt)
    return result.scalars().all()

@router.get("/lookup", response_model=TicketOut)
async def lookup_ticket(code: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Ticket).where(Ticket.qr_code_data == code))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/checkout", response_model=list[TicketOut])
async def checkout(req: TicketPurchaseRequest, session: AsyncSession = Depends(get_session)):
    try:
        tickets = await purchase_tickets(session, req)
        await session.commit()
        for t in tickets:
            await session.refresh(t)
        return tickets
    except ValueError as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(ticket_id: int, session: AsyncSession = Depends(get_session)):
    ticket = await session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/verify", response_model=TicketOut)
async def verify_ticket(req: VerifyTicketRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Ticket).where(Ticket.qr_code_data == req.qr_code_data))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.status == "used":
        raise HTTPException(status_code=400, detail="Ticket already used")

    ticket.status = "used"
    session.add(Scan(ticket_id=ticket.id, verifier_id=None))
    await session.commit()
    await session.refresh(ticket)
    return ticket
