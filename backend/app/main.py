import uuid
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import SIHException, create_error_response
from app.core.cache import cache_manager
from app.api.v1.router import api_v1_router
from app.db.session import engine
from app.db.base import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    setup_logging()
    logger.info("Initializing SIH Dual-Hazard Backend Application Gateway...")
    await cache_manager.init_redis()
    
    # Initialize DB tables for development/demo mode if needed
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schemas initialized.")
    except Exception as e:
        if settings.DEMO_MODE:
            logger.info("PostgreSQL unavailable; initializing in-memory SQLite database for DEMO_MODE fallback.")
            from sqlalchemy.ext.asyncio import create_async_engine
            import app.db.session as db_session
            db_session.engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
            db_session.AsyncSessionLocal.configure(bind=db_session.engine)
            async with db_session.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("In-memory SQLite database schemas initialized successfully for demo mode.")
        else:
            logger.warning(f"Database schema auto-creation notice: {e}")

    yield

    # Shutdown sequence
    logger.info("Shutting down backend services...")
    await cache_manager.close()
    await engine.dispose()



app = FastAPI(
    title="SIH Dual-Hazard Early Warning & Decision Support API",
    description="Central API Gateway for Flood + Landslide Early Warning, Risk Fusion, What-If Simulator & Route Risk Analysis",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Correlation ID & Latency Middleware
@app.middleware("http")
async def add_request_context(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", f"req_{uuid.uuid4().hex[:10]}")
    request.state.request_id = request_id
    start_time = time.time()

    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"
        return response
    except Exception as exc:
        process_time = time.time() - start_time
        logger.error(f"Unhandled exception on request {request_id}: {exc}", exc_info=True)
        return create_error_response(
            status_code=500,
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected internal server error occurred.",
            request_id=request_id
        )


# Global SIH Exception Handler
@app.exception_handler(SIHException)
async def sih_exception_handler(request: Request, exc: SIHException):
    request_id = getattr(request.state, "request_id", None)
    return create_error_response(
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
        request_id=request_id
    )


# Mount Master API v1 Router
app.include_router(api_v1_router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {
        "system": "SIH Dual-Hazard Early Warning & Decision Support Backend Gateway",
        "status": "operational",
        "docs": "/docs",
        "version": "1.0.0"
    }
