from pydantic import BaseModel, EmailStr

class TicketPurchaseRequest(BaseModel):
    event_id: int
    category_id: int | None = None
    ticket_type: str | None = None
    price: int | None = None
    quantity: int = 1
    participant_name: str
    participant_email: EmailStr | None = None

class TicketOut(BaseModel):
    id: int
    event_id: int
    category_id: int | None = None
    type: str
    price: int
    participant_name: str
    participant_email: EmailStr | None = None
    status: str
    qr_code_data: str

    class Config:
        from_attributes = True

class VerifyTicketRequest(BaseModel):
    qr_code_data: str
