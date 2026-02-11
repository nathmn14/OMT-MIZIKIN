"""
Service de gestion des utilisateurs
Contient la logique métier pour la modération et la gestion des utilisateurs
"""
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.core.security import hash_password
from typing import List, Optional


async def get_all_users(session: AsyncSession) -> List[User]:
    """Récupère tous les utilisateurs"""
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    return list(result.scalars().all())


async def get_pending_users(session: AsyncSession) -> List[User]:
    """Récupère les utilisateurs en attente d'approbation"""
    result = await session.execute(
        select(User).where(User.is_approved == False).order_by(User.created_at.desc())
    )
    return list(result.scalars().all())


async def get_approved_users(session: AsyncSession) -> List[User]:
    """Récupère les utilisateurs approuvés"""
    result = await session.execute(
        select(User).where(User.is_approved == True).order_by(User.created_at.desc())
    )
    return list(result.scalars().all())


async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
    """Récupère un utilisateur par son ID"""
    return await session.get(User, user_id)


async def approve_user(session: AsyncSession, user_id: int) -> User:
    """Approuve un utilisateur"""
    user = await session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    
    user.is_approved = True
    user.status = "active"  # Synchronisation avec l'ancien champ
    await session.commit()
    await session.refresh(user)
    return user


async def reject_user(session: AsyncSession, user_id: int) -> bool:
    """Rejette et supprime un utilisateur en attente"""
    user = await session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    
    # On ne peut rejeter que les utilisateurs non approuvés
    if user.is_approved:
        raise ValueError("Cannot reject an approved user")
    
    await session.delete(user)
    await session.commit()
    return True


from datetime import datetime
from app.models.event import Event

async def update_user_role(session: AsyncSession, user_id: int, new_role: str) -> User:
    """Met à jour le rôle d'un utilisateur"""
    # Validation des rôles autorisés
    allowed_roles = ["organisateur", "verificateur", "admin", "user"]
    if new_role not in allowed_roles:
        raise ValueError(f"Invalid role. Allowed roles: {', '.join(allowed_roles)}")
    
    user = await session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    
    # Si l'utilisateur est un organisateur, vérifier s'il a des événements futurs
    if user.role == "organisateur":
        today = datetime.now().strftime("%Y-%m-%d")
        # On cherche s'il existe au moins un événement à partir d'aujourd'hui
        result = await session.execute(
            select(Event).where(
                Event.organizer_id == user_id,
                Event.date >= today
            ).limit(1)
        )
        if result.scalars().first():
            raise ValueError("Impossible de modifier le rôle : cet organisateur a encore des événements programmés.")

    user.role = new_role
    await session.commit()
    await session.refresh(user)
    return user


async def reset_user_password(session: AsyncSession, user_id: int, new_password: str) -> User:
    """Réinitialise le mot de passe d'un utilisateur"""
    user = await session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    
    user.password_hash = hash_password(new_password)
    await session.commit()
    await session.refresh(user)
    return user


async def delete_user(session: AsyncSession, user_id: int) -> bool:
    """Supprime définitivement un utilisateur"""
    user = await session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    
    await session.delete(user)
    await session.commit()
    return True


async def get_users_by_role(session: AsyncSession, role: str) -> List[User]:
    """Récupère tous les utilisateurs d'un rôle spécifique"""
    result = await session.execute(
        select(User).where(User.role == role).order_by(User.created_at.desc())
    )
    return list(result.scalars().all())


async def toggle_user_approval(session: AsyncSession, user_id: int) -> User:
    """Bascule l'état d'approbation d'un utilisateur"""
    user = await session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    
    user.is_approved = not user.is_approved
    user.status = "active" if user.is_approved else "pending"
    await session.commit()
    await session.refresh(user)
    return user
