from fastapi import APIRouter
from app.api.routes import auth, admin, events, tickets, users

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(events.router)
api_router.include_router(tickets.router)
api_router.include_router(users.router)
