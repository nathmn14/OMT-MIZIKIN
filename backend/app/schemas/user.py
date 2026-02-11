from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    nom: str
    status: str
    is_approved: bool
    phone: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserDetailOut(BaseModel):
    """Schéma détaillé pour l'admin (sans mot de passe)"""
    id: int
    email: EmailStr
    role: str
    nom: str
    status: str
    is_approved: bool
    phone: str | None = None
    payment_method: str | None = None
    payment_detail: str | None = None
    plain_password: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRole(BaseModel):
    """Schéma pour modifier le rôle d'un utilisateur"""
    role: str


class ResetPasswordRequest(BaseModel):
    """Schéma pour réinitialiser le mot de passe d'un utilisateur"""
    new_password: str

