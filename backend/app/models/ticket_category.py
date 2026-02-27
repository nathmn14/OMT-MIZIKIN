from __future__ import annotations

from sqlalchemy import String, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class TicketCategory(Base):
    __tablename__ = "ticket_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    price: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10), default="$")
    stock: Mapped[int] = mapped_column(Integer)

    __table_args__ = (
        CheckConstraint('stock >= 0', name='check_category_stock_positive'),
    )

    event: Mapped["Event"] = relationship("Event", back_populates="categories")
