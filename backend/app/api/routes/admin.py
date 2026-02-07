"""
Routes d'administration
Gestion des utilisateurs, modération et rôles
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import require_role
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserOut, UserDetailOut, UserUpdateRole, ResetPasswordRequest
from app.services import user as user_service

router = APIRouter(prefix="/admin", tags=["admin"])


# ============================================
# GESTION DES UTILISATEURS
# ============================================

@router.get("/users", response_model=list[UserDetailOut])
async def list_all_users(
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """Liste tous les utilisateurs avec leurs informations détaillées"""
    users = await user_service.get_all_users(session)
    return users


@router.get("/users/pending", response_model=list[UserDetailOut])
async def list_pending_users(
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """Liste les utilisateurs en attente d'approbation"""
    users = await user_service.get_pending_users(session)
    return users


@router.get("/users/approved", response_model=list[UserDetailOut])
async def list_approved_users(
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """Liste les utilisateurs approuvés"""
    users = await user_service.get_approved_users(session)
    return users


@router.get("/users/role/{role}", response_model=list[UserDetailOut])
async def list_users_by_role(
    role: str,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """Liste les utilisateurs par rôle"""
    users = await user_service.get_users_by_role(session, role)
    return users


@router.get("/users/{user_id}", response_model=UserDetailOut)
async def get_user_details(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """Récupère les détails d'un utilisateur spécifique"""
    user = await user_service.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ============================================
# MODÉRATION DES INSCRIPTIONS
# ============================================

@router.post("/users/{user_id}/approve", response_model=UserOut)
async def approve_user(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """Approuve l'inscription d'un utilisateur"""
    try:
        user = await user_service.approve_user(session, user_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/users/{user_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
async def reject_user(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """Rejette et supprime une inscription en attente"""
    try:
        await user_service.reject_user(session, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/users/{user_id}/toggle-approval", response_model=UserOut)
async def toggle_user_approval(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """Bascule l'état d'approbation d'un utilisateur (approuvé <-> en attente)"""
    try:
        user = await user_service.toggle_user_approval(session, user_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ============================================
# GESTION DES RÔLES
# ============================================

@router.patch("/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: int,
    role_update: UserUpdateRole,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("admin"))
):
    """
    Modifie le rôle d'un utilisateur
    
    Rôles disponibles: organisateur, verificateur, admin, user
    """
    # Empêcher un admin de se retirer ses propres droits
    if user_id == current_user.id and role_update.role != "admin":
        raise HTTPException(
            status_code=400, 
            detail="You cannot remove your own admin privileges"
        )
    
    try:
        user = await user_service.update_user_role(session, user_id, role_update.role)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# GESTION DES MOTS DE PASSE
# ============================================

@router.post("/users/{user_id}/reset-password", response_model=UserOut)
async def reset_user_password(
    user_id: int,
    password_reset: ResetPasswordRequest,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin"))
):
    """
    Réinitialise le mot de passe d'un utilisateur
    
    Note: Le mot de passe est hashé avant d'être stocké en base de données
    """
    if len(password_reset.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long"
        )
    
    try:
        user = await user_service.reset_user_password(
            session, 
            user_id, 
            password_reset.new_password
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ============================================
# SUPPRESSION D'UTILISATEURS
# ============================================

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("admin"))
):
    """
    Supprime définitivement un utilisateur
    
    Note: Un admin ne peut pas se supprimer lui-même
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )
    
    try:
        await user_service.delete_user(session, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

