import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

logger = logging.getLogger("sih-backend.db")

# Default database URL
db_url = settings.DATABASE_URL

# Fallback for local demo mode if Postgres is not running locally
if settings.DEMO_MODE and "sqlite" not in db_url:
    # Try connecting to postgres, if failing we can fallback gracefully
    pass

try:
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
except Exception as e:
    logger.warning(f"Async engine creation warning: {e}. Falling back to sqlite in-memory for demo.")
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
