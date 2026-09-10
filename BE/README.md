# Backend (FastAPI)

FastAPI + SQLite backend for the "learn by doing" project. Each thing you learn
(RAG, MCP, etc.) becomes its own module under `app/modules/`.

## Runs on

- **Port `8420`** (set in `.env` as `BACKEND_PORT`)
- Docs (Swagger UI): http://127.0.0.1:8420/docs

## Folder structure

```
BE/
├── app/
│   ├── main.py              # App entrypoint, registers all routers
│   ├── core/
│   │   ├── config.py        # Reads settings from .env
│   │   └── database.py      # SQLite engine, session, Base, init_db
│   ├── models/              # ORM models (import them in __init__.py)
│   ├── routers/
│   │   └── health.py        # /health check
│   └── modules/             # One folder per thing you learn
│       └── example_module/  # Template — copy this to start a new module
│           └── router.py
├── requirements.txt
├── .env / .env.example      # Config (port, db url, CORS)
└── app.db                   # SQLite file (auto-created on first run)
```

## Setup & run

From the `BE/` folder:

```powershell
# 1. Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy env file (already provided, edit if needed)
copy .env.example .env

# 4. Run the server
python -m app.main
```

Then open http://127.0.0.1:8420/docs to try the endpoints.

## Adding a new module (e.g. RAG)

1. Copy `app/modules/example_module/` → `app/modules/rag/`.
2. Write your endpoints in `app/modules/rag/router.py`.
3. If you need database tables, add a `models.py` and import it in
   `app/models/__init__.py`.
4. Register the router in `app/main.py`:
   ```python
   from app.modules.rag.router import router as rag_router
   app.include_router(rag_router, prefix="/rag")
   ```

## What was set up for you

- FastAPI app with CORS enabled for the React frontend.
- SQLite database wired up via SQLAlchemy (`app.db`, auto-created on startup).
- Config loaded from `.env` (port, database URL, CORS origins).
- A `/health` route and an `example_module` you can copy for new modules.
- Runs on the uncommon port **8420**.



<!-- suppose if i wanna search relative answer or words. 
e.g. i vectorize and store "I'm using macbook Neo" but i questioned "what gadget i have?" will it respond? what are the conditions? -->