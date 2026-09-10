"""FastAPI application entrypoint.

Run with:  python -m app.main
Or:        uvicorn app.main:app --reload --port 8420
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db

# Import model modules so their tables are registered before init_db().
import app.models  # noqa: F401

# --- Module routers ---------------------------------------------------------
from app.routers.health import router as health_router
from app.modules.example_module.router import router as example_router
from app.modules.embeddings_module.router import router as embeddings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup: create database tables.
    init_db()
    yield
    # Add shutdown cleanup here if you ever need it.


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Allow the React frontend to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"app": settings.app_name, "status": "running"}


# Register routers. Give each module its own prefix.
app.include_router(health_router)
app.include_router(example_router, prefix="/example")
app.include_router(embeddings_router)
# app.include_router(rag_router, prefix="/rag")   <-- add modules like this


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=settings.backend_port, reload=True)
