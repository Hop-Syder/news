from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from routers import auth, entrepreneurs, contact, storage, stats
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Nexus Connect API - Powered by Supabase",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(entrepreneurs.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(storage.router, prefix="/api")
app.include_router(stats.router, prefix="/api")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "docs": "/api/docs"
    }


@app.get("/api")
async def api_root():
    """API root endpoint"""
    return {
        "message": f"{settings.APP_NAME} - API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "endpoints": {
            "auth": "/api/auth",
            "entrepreneurs": "/api/entrepreneurs",
            "contact": "/api/contact",
            "storage": "/api/storage",
            "stats": "/api/stats",
            "docs": "/api/docs"
        }
    }


@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    logger.info(f"📍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🔗 Supabase URL: {settings.SUPABASE_URL}")
    logger.info(f"🌐 CORS Origins: {settings.cors_origins_list}")
    logger.info("✅ Server started successfully!")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 Server shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
