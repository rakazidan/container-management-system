from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_pool, close_pool, get_pool
from app.routers import zones, containers, agents, areas, dashboard, gps
from app.utils.startup import run_startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown lifecycle."""
    await create_pool()
    pool = get_pool()
    await run_startup(pool)   # buat tabel + seed jika kosong
    yield
    await close_pool()


app = FastAPI(
    title="Container Management System API",
    description="Backend API untuk manajemen container shipping yard",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
PREFIX = "/api/v1"
app.include_router(zones.router,      prefix=PREFIX, tags=["Zones"])
app.include_router(containers.router, prefix=PREFIX, tags=["Containers"])
app.include_router(agents.router,     prefix=PREFIX, tags=["Shipping Agents"])
app.include_router(areas.router,      prefix=PREFIX, tags=["Areas"])
app.include_router(dashboard.router,  prefix=PREFIX, tags=["Dashboard"])
app.include_router(gps.router,        prefix=PREFIX, tags=["GPS"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Container Management System API",
        "status": "active",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": "Container Management API"}
