from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.deps import require_role, require_roles, get_current_user
from app.db.session import get_session
from app.models.event import Event
from app.models.ticket_category import TicketCategory
from app.models.user import User
from app.schemas.event import EventCreate, EventOut, EventUpdate

router = APIRouter(prefix="/events", tags=["events"])

@router.get("", response_model=list[EventOut])
async def list_events(
    organizer_id: int | None = None,
    session: AsyncSession = Depends(get_session)
):
    query = select(Event).options(selectinload(Event.categories))
    if organizer_id is not None:
        query = query.where(Event.organizer_id == organizer_id)
    
    result = await session.execute(query.order_by(Event.id.desc()))
    return result.scalars().unique().all()

@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: int, session: AsyncSession = Depends(get_session)):
    event = await session.get(Event, event_id, options=[selectinload(Event.categories)])
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("", response_model=EventOut)
async def create_event(
    req: EventCreate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "organisateur"]))
):
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
        organizer_id=current_user.id
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

@router.put("/{event_id}", response_model=EventOut)
async def update_event(
    event_id: int,
    req: EventUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "organisateur"]))
):
    """Met à jour un événement existant (Admin ou Organisateur propriétaire)"""
    event = await session.get(Event, event_id, options=[selectinload(Event.categories)])
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Vérification de propriété
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier cet événement")

    # Mise à jour des champs de base
    for field, value in req.model_dump(exclude={"categories"}, exclude_unset=True).items():
        setattr(event, field, value)

    # Gestion des catégories si fournies
    if req.categories is not None:
        # Supprimer les anciennes catégories
        from sqlalchemy import delete
        await session.execute(delete(TicketCategory).where(TicketCategory.event_id == event_id))
        
        # Ajouter les nouvelles
        total_stock = 0
        for c in req.categories:
            session.add(TicketCategory(
                event_id=event.id,
                name=c.name,
                price=c.price,
                stock=c.stock,
            ))
            total_stock += c.stock
        
        event.tickets_remaining = total_stock

    await session.commit()
    
    # Rafraîchir pour renvoyer l'objet complet
    result = await session.execute(
        select(Event).options(selectinload(Event.categories)).where(Event.id == event.id)
    )
    return result.scalars().first()

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "organisateur"]))
):
    """Supprime un événement (Admin ou Organisateur propriétaire)"""
    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Vérification de propriété
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à supprimer cet événement")

    await session.delete(event)
    await session.commit()
