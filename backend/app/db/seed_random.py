import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from app.db.session import engine, AsyncSessionLocal
from app.models.base import Base
from app.models.user import User
from app.models.event import Event
from app.models.ticket_category import TicketCategory
from app.models.ticket import Ticket
from app.models.scan import Scan
from app.core.security import hash_password

# Données pour la génération
FIRST_NAMES = ["Jean", "Marie", "Pierre", "Sophie", "Lucas", "Léa", "Thomas", "Camille", "Nicolas", "Julie"]
LAST_NAMES = ["Dupont", "Martin", "Lefebvre", "Moreau", "Bernard", "Petit", "Durand", "Leroy", "Morel", "Simon"]
ROLES = ["organisateur", "verificateur", "user"]
EVENT_TITLES = [
    "Concert Nocturne", "Festival de la Gastronomie", "Salon du High-Tech", 
    "Exposition d'Art Moderne", "Marathon de la Ville", "Soirée Jazz & Wine",
    "Conférence IA", "Spectacle d'Humour", "Atelier Cosmétique", "Match de Gala"
]
LOCATIONS = ["Palais des Congrès, Paris", "Zénith, Nantes", "Eurexpo, Lyon", "Parc des Expos, Marseille", "Stade de France, Saint-Denis"]
IMAGE_URLS = [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800",
    "https://images.unsplash.com/photo-1540575861501-7c00117ffae6?w=800",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800"
]

async def seed_random_data():
    async with AsyncSessionLocal() as session:
        # 1. Nettoyage (Optionnel - décommentez si vous voulez repartir à zéro)
        # await session.execute(delete(Scan))
        # await session.execute(delete(Ticket))
        # await session.execute(delete(TicketCategory))
        # await session.execute(delete(Event))
        # await session.execute(delete(User).where(User.email.not_in(["admin@omt.com"])))
        # await session.commit()

        # 2. Création d'utilisateurs
        users = []
        for i in range(15):
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(LAST_NAMES)
            email = f"{fname.lower()}.{lname.lower()}{random.randint(1,99)}@example.com"
            role = random.choice(ROLES)
            u = User(
                email=email,
                password_hash=hash_password("password123"),
                role=role,
                nom=f"{fname} {lname}",
                phone=f"06{random.randint(10000000, 99999999)}",
                status="active",
                is_approved=True
            )
            session.add(u)
            users.append(u)
        
        await session.flush() # Pour avoir les IDs

        # 3. Création d'événements
        events = []
        for i in range(8):
            title = random.choice(EVENT_TITLES) + f" {2026}"
            date_base = datetime.now() + timedelta(days=random.randint(30, 365))
            ev = Event(
                title=title,
                description=f"Description aléatoire pour {title}. Un événement à ne pas manquer !",
                date=date_base.strftime("%Y-%m-%d"),
                time=f"{random.randint(18, 21)}:00",
                location=random.choice(LOCATIONS),
                image_url=random.choice(IMAGE_URLS),
                tickets_remaining=random.randint(100, 500),
                price_standard=random.randint(20, 60),
                price_vip=random.randint(80, 150)
            )
            session.add(ev)
            events.append(ev)
        
        await session.flush()

        # 4. Catégories de billets pour chaque événement
        for ev in events:
            cat1 = TicketCategory(event_id=ev.id, name="Standard", price=ev.price_standard, stock=ev.tickets_remaining // 2)
            cat2 = TicketCategory(event_id=ev.id, name="VIP", price=ev.price_vip, stock=ev.tickets_remaining // 4)
            session.add_all([cat1, cat2])
        
        await session.flush()

        # 5. Création de billets vendus
        # On prend quelques utilisateurs au hasard pour acheter des billets
        buyers = [u for u in users if u.role == "user"]
        if not buyers: buyers = users # Fallback
        
        verifiers = [u for u in users if u.role == "verificateur"]
        if not verifiers: verifiers = users # Fallback

        for _ in range(30):
            ev = random.choice(events)
            buyer = random.choice(buyers)
            is_vip = random.random() > 0.8
            ticket = Ticket(
                event_id=ev.id,
                type="VIP" if is_vip else "Standard",
                price=ev.price_vip if is_vip else ev.price_standard,
                participant_name=buyer.nom,
                participant_email=buyer.email,
                qr_code_data=f"OMT-{random.randint(100000, 999999)}-{random.randint(1000, 9999)}",
                status="used" if random.random() > 0.7 else "valid"
            )
            session.add(ticket)
            await session.flush()

            # Si le billet est marqué comme "used", on ajoute un scan
            if ticket.status == "used":
                scan = Scan(
                    ticket_id=ticket.id,
                    verifier_id=random.choice(verifiers).id,
                    scanned_at=datetime.utcnow() - timedelta(minutes=random.randint(1, 120))
                )
                session.add(scan)

        await session.commit()
        print("Données fictives générées avec succès !")

if __name__ == "__main__":
    asyncio.run(seed_random_data())
