import logging
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("cyberintel.db.session")

Base = declarative_base()

# Determine connection URL: use direct PostgreSQL or local SQLite for development
_db_url = settings.DATABASE_URL
if not _db_url:
    # Safe local fallback for instant testing without mandatory external DB
    _db_url = "sqlite+aiosqlite:///./cyberintel_dev.db"
    logger.info("DATABASE_URL not set; using local sqlite+aiosqlite database for development.")

# Ensure asyncpg driver dialect is specified if a raw postgres:// url is given
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgresql://") and not _db_url.startswith("postgresql+asyncpg://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Configure engine with connection pooling
engine = create_async_engine(
    _db_url,
    echo=settings.DEBUG and False,
    future=True,
    pool_pre_ping=True,
    **({"pool_size": 10, "max_overflow": 20} if "sqlite" not in _db_url else {})
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an async database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
