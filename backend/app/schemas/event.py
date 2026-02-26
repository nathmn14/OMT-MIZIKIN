from pydantic import BaseModel, Field

class TicketCategoryCreate(BaseModel):
    name: str
    price: int
    currency: str = "$"
    stock: int

class TicketCategoryOut(TicketCategoryCreate):
    id: int

    class Config:
        from_attributes = True

class EventCreate(BaseModel):
    title: str
    description: str | None = None
    date: str
    time: str | None = None
    location: str
    image_url: str | None = None
    price_standard: int = 0
    price_vip: int = 0
    currency: str = "$"
    categories: list[TicketCategoryCreate] = Field(default_factory=list)

class EventOut(EventCreate):
    id: int
    organizer_id: int | None = None
    tickets_remaining: int
    categories: list[TicketCategoryOut] = Field(default_factory=list)

    class Config:
        from_attributes = True

class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    date: str | None = None
    time: str | None = None
    location: str | None = None
    image_url: str | None = None
    price_standard: int | None = None
    price_vip: int | None = None
    currency: str | None = None
    categories: list[TicketCategoryCreate] | None = None
