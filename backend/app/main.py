from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.api.router import api_router


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except (FileNotFoundError, StarletteHTTPException) as exc:
            status_code = getattr(exc, "status_code", None)
            if status_code is not None and status_code != 404:
                raise
            return await super().get_response("index.html", scope)


app = FastAPI(title=settings.app_name)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


# ensure database tables exist and seed initial data on startup
@app.on_event("startup")
async def startup_event():
    from app.db import init_db
    # create tables if missing and add default users/events
    await init_db.init_models()
    await init_db.seed_data()

frontend_dir = Path(__file__).resolve().parents[2] / "frontend"

@app.get("/health")
async def health():
    return {"status": "ok", "name": settings.app_name}

if frontend_dir.is_dir():
    app.mount("/", SPAStaticFiles(directory=frontend_dir, html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return JSONResponse({"status": "ok", "name": settings.app_name})
