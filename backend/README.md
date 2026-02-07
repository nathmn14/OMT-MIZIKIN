# OMT Events Backend (FastAPI + SQLite)

## Setup
1. Create a virtual env
2. Install deps
3. Copy .env.example to .env and set SECRET_KEY

## Run
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Init DB with demo data (optional)
python -m app.db.init_db

# Start API
uvicorn app.main:app --reload --port 8000
```

## Notes
- SQLite is great for getting started. For heavy concurrency, switch to Postgres later.
- CORS is set from .env `CORS_ORIGINS`.
