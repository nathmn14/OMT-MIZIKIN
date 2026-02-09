from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.deps import require_role, require_roles
from app.db.session import get_session
from app.models.event import Event
from app.models.ticket_category import TicketCategory
from app.models.user import User
from app.schemas.event import EventCreate, EventOut

router = APIRouter(prefix="/events", tags=["events"])

@router.get("", response_model=list[EventOut])
async def list_events(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Event).options(selectinload(Event.categories)).order_by(Event.id.desc())
    )
    return result.scalars().unique().all()

@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: int, session: AsyncSession = Depends(get_session)):
    event = await session.get(Event, event_id, options=[selectinload(Event.categories)])
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("", response_model=EventOut)
async def create_event(req: EventCreate, session: AsyncSession = Depends(get_session)):
    tickets_remaining = sum(c.stock for c in req.categories) if req.categories else 0

    event = Event(
        title=req.title,
        description=req.description,
        date=req.date,
        time=req.time,
        location=req.location,
        image_url=req.image_url,
        price_standard=req.price_standard,
        price_vip=req.price_vip,
        tickets_remaining=tickets_remaining,
    )
    session.add(event)
    await session.flush()

    if req.categories:
        for c in req.categories:
            session.add(TicketCategory(
                event_id=event.id,
                name=c.name,
                price=c.price,
                stock=c.stock,
            ))

    await session.commit()

    result = await session.execute(
        select(Event).options(selectinload(Event.categories)).where(Event.id == event.id)
    )
    return result.scalars().first()

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_roles(["admin", "organisateur"]))
):
    """Supprime un événement (Admin ou Organisateur)"""
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    await session.delete(event)
    await session.commit()
