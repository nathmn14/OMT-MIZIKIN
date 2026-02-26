from sqlalchemy import Table, Column, Integer, ForeignKey
from app.models.base import Base

event_verifiers = Table(
    "event_verifiers",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
)
