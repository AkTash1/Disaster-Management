"""
FastAPI application entry point for the Disaster Intelligence Multimodal Platform.
Provides CORS middleware, REST API v1 routing, Starlette static serving, and SPA fallback.
"""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.schema_store import schema_store
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize schema store and pre-load mock seed datasets."""
    schema_store.initialize()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Health Check
@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint confirming server operational status."""
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "tables_loaded": len(schema_store.get_table_names()),
    }


# Static Files Mount - resolved robustly across local and Vercel environments
static_dir = Path(settings.STATIC_DIR)
if not static_dir.exists():
    static_dir = Path(__file__).resolve().parent / "static"

if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


# Root and SPA Fallback
@app.get("/", include_in_schema=False)
async def serve_root():
    """Serve shell index.html at root path."""
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse(
        content={"message": f"{settings.PROJECT_NAME} Backend API Live. Visit /docs for interactive documentation."}
    )


@app.get("/{full_path:path}", include_in_schema=False)
async def spa_fallback(full_path: str):
    """
    SPA client-side routing fallback.
    Returns 404 for missing /api/ or /docs routes, serves static files if requested, or index.html for frontend view paths.
    """
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404, detail="Resource not found")

    # If a static asset request bypassed the mount, serve it directly from static_dir
    if full_path.startswith("static/"):
        rel_path = full_path.replace("static/", "", 1)
        file_path = static_dir / rel_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        raise HTTPException(status_code=404, detail="Static file not found")

    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))

    return JSONResponse(status_code=404, content={"detail": "Not Found"})
