from pydantic import BaseModel, EmailStr, validator, Field

class RegisterRequest(BaseModel):
    nom: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: str | None = None
    payment_method: str | None = None
    payment_detail: str | None = None

    @validator("nom")
    def clean_nom(cls, v):
        import html
        return html.escape(v)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str
