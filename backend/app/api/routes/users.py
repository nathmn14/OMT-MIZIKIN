"""
Routes utilisateurs (non-admin)
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import require_roles
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/verifiers", response_model=list[UserOut])
async def list_verifiers(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "organisateur"]))
):
    """Liste tous les utilisateurs avec le rôle vérificateur."""
    result = await session.execute(
        select(User)
        .where(User.role == "verificateur")
        .where(User.is_approved == True)
        .order_by(User.nom)
    )
    return result.scalars().all()
