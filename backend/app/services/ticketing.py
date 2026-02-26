import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event
from app.models.ticket_category import TicketCategory
from app.models.ticket import Ticket


def generate_qr() -> str:
    return "OMT-" + uuid.uuid4().hex[:10].upper()


async def purchase_tickets(session: AsyncSession, req):
    await session.execute(text("BEGIN IMMEDIATE"))

    event = await session.get(Event, req.event_id)
    if event is None:
        raise ValueError("Event not found")

    qty = max(1, req.quantity)

    if req.category_id is not None:
        cat = await session.get(TicketCategory, req.category_id)
        if cat is None or cat.event_id != event.id:
            raise ValueError("Invalid category")
        if cat.stock < qty:
            raise ValueError("Not enough tickets in category")
        cat.stock -= qty
        price = cat.price
        ticket_type = cat.name
    else:
        if not req.ticket_type:
            raise ValueError("ticket_type required when no category_id")
        if req.ticket_type.lower() == "vip":
            price = event.price_vip
        else:
            price = event.price_standard
        ticket_type = req.ticket_type

    if event.tickets_remaining < qty:
        raise ValueError("Not enough tickets remaining")
    event.tickets_remaining -= qty

    tickets = []
    for _ in range(qty):
        t = Ticket(
            event_id=event.id,
            category_id=req.category_id,
            type=ticket_type,
            price=price,
            payment_currency=getattr(req, 'payment_currency', '$'),
            price_paid=getattr(req, 'price_paid', price) or price,
            participant_name=req.participant_name,
            participant_email=req.participant_email,
            status="valid",
            qr_code_data=generate_qr(),
        )
        session.add(t)
        tickets.append(t)

    return tickets
