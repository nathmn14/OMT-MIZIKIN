from pydantic import BaseModel, Field

class TicketCategoryCreate(BaseModel):
    name: str
    price: int
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
    categories: list[TicketCategoryCreate] = Field(default_factory=list)

class EventOut(EventCreate):
    id: int
    tickets_remaining: int
    categories: list[TicketCategoryOut] = Field(default_factory=list)

    class Config:
        from_attributes = True
