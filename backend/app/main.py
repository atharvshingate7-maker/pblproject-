import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.errors import (
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler
)
from app.db.session import engine, Base
from app.api.routes import health, files, analysis

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("cyberintel.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager: handles startup and shutdown hooks.
    """
    logger.info("Initializing CyberIntel AI Backend...")
    # Create tables if not existing (especially for local development fallback)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified/initialized successfully.")
    except Exception as e:
        logger.warning(f"Database table sync note: {e}")

    yield

    logger.info("Shutting down CyberIntel AI Backend...")
    await engine.dispose()


def create_application() -> FastAPI:
    """
    FastAPI Application Factory.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="Production-ready FastAPI backend for CyberIntel AI Forensic Matrix & File Analysis",
        lifespan=lifespan,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
    )

    # 1. CORS Middleware (Fully configured for Axios frontend running on http://localhost:5173)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition", "X-Total-Count"]
    )

    # 2. Global Exception Handlers (Standardized Axios-friendly JSON envelope)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # 3. Register Feature Route Endpoints under /api
    prefix = settings.API_V1_PREFIX  # /api
    app.include_router(health.router, prefix=prefix)
    app.include_router(files.router, prefix=prefix)
    app.include_router(analysis.router, prefix=prefix)

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
