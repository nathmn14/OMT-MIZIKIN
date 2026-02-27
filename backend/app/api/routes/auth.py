from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserOut
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
async def register(req: RegisterRequest, session: AsyncSession = Depends(get_session)):
    exists = await session.execute(select(User).where(User.email == req.email))
    if exists.scalars().first():
        raise HTTPException(status_code=409, detail="Email already used")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        plain_password=req.password,
        role="participant", # Rôle par défaut sécurisé
        nom=req.nom,
        phone=req.phone,
        payment_method=req.payment_method,
        payment_detail=req.payment_detail,
        status="pending",
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Vérification de l'approbation avec le nouveau champ is_approved
    if not user.is_approved:
        raise HTTPException(status_code=403, detail="Account pending approval")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access, refresh_token=refresh)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(req: RefreshRequest):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    access = create_access_token(str(user_id))
    refresh = create_refresh_token(str(user_id))
    return TokenResponse(access_token=access, refresh_token=refresh)

@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user
