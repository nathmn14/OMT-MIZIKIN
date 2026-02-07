from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    nom: str
    email: EmailStr
    password: str
    phone: str | None = None
    role: str = "organisateur"
    payment_method: str | None = None
    payment_detail: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str
