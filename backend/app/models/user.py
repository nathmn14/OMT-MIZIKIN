from datetime import datetime
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    plain_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="organisateur")
    nom: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    payment_detail: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # Gardé pour compatibilité
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)  # Nouveau champ pour modération
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
