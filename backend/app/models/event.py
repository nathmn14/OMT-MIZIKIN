from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, DateTime, Integer, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

# Table d'association pour les vérificateurs d'événements
event_verifiers = Table(
    "event_verifiers",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("verifier_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    date: Mapped[str] = mapped_column(String(20))
    time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    location: Mapped[str] = mapped_column(String(255))
    image_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    tickets_remaining: Mapped[int] = mapped_column(Integer, default=0)
    price_standard: Mapped[int] = mapped_column(Integer, default=0)
    price_vip: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(10), default="$")
    organizer_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    categories: Mapped[list["TicketCategory"]] = relationship(
        "TicketCategory",
        back_populates="event",
        cascade="all, delete-orphan",
    )

    # Relation avec les vérificateurs
    verifiers: Mapped[list["User"]] = relationship(
        "User",
        secondary=event_verifiers,
        backref="assigned_events"
    )
