import asyncio
from sqlalchemy import select
from app.db.session import engine, AsyncSessionLocal
from app.models.base import Base
from app.models.user import User
from app.models.event import Event
from app.models.ticket_category import TicketCategory
from app.models.ticket import Ticket
from app.models.scan import Scan
from app.core.security import hash_password

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def seed_data():
    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(User).where(User.email == "admin@omt.com"))
        if existing.scalars().first() is None:
            users = [
                User(email="orga@omt.com", password_hash=hash_password("orga123"), role="organisateur", nom="Marie Dupont", status="active", is_approved=True),
                User(email="verif@omt.com", password_hash=hash_password("verif123"), role="verificateur", nom="Jean Martin", status="active", is_approved=True),
                User(email="admin@omt.com", password_hash=hash_password("admin123"), role="admin", nom="Admin OMT", status="active", is_approved=True),
            ]
            session.add_all(users)

        existing_evt = await session.execute(select(Event).where(Event.title == "Festival Jazz & Blues 2026"))
        if existing_evt.scalars().first() is None:
            ev1 = Event(
                title="Festival Jazz & Blues 2026",
                description="Une soiree exceptionnelle avec les plus grands artistes de jazz.",
                date="2026-03-15",
                time="19:30",
                location="Palais des Congres, Paris",
                image_url="https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800",
                tickets_remaining=150,
                price_standard=45,
                price_vip=120,
            )
            session.add(ev1)
            await session.flush()
            session.add_all([
                TicketCategory(event_id=ev1.id, name="Standard", price=45, stock=100),
                TicketCategory(event_id=ev1.id, name="VIP", price=120, stock=50),
            ])

        await session.commit()

async def main():
    await init_models()
    await seed_data()

if __name__ == "__main__":
    asyncio.run(main())
