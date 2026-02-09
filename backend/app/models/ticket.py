from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    category_id: Mapped[int | None] = mapped_column(ForeignKey("ticket_categories.id"), nullable=True)
    type: Mapped[str] = mapped_column(String(50))
    price: Mapped[int] = mapped_column(Integer)
    participant_name: Mapped[str] = mapped_column(String(255))
    participant_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="valid")
    qr_code_data: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
