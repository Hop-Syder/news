from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import get_settings
from backend.routers import auth, entrepreneurs, contact, storage
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
)\n\n# Include routers with /api prefix\napp.include_router(auth.router, prefix=\"/api\")\napp.include_router(entrepreneurs.router, prefix=\"/api\")\napp.include_router(contact.router, prefix=\"/api\")\napp.include_router(storage.router, prefix=\"/api\")\n\n\n# Root endpoint\n@app.get(\"/\")\nasync def root():\n    \"\"\"Root endpoint\"\"\"\n    return {\n        \"message\": settings.APP_NAME,\n        \"version\": settings.APP_VERSION,\n        \"status\": \"operational\",\n        \"environment\": settings.ENVIRONMENT,\n        \"docs\": \"/api/docs\"\n    }\n\n\n@app.get(\"/api\")\nasync def api_root():\n    \"\"\"API root endpoint\"\"\"\n    return {\n        \"message\": f\"{settings.APP_NAME} - API\",\n        \"version\": settings.APP_VERSION,\n        \"status\": \"operational\",\n        \"endpoints\": {\n            \"auth\": \"/api/auth\",\n            \"entrepreneurs\": \"/api/entrepreneurs\",\n            \"contact\": \"/api/contact\",\n            \"storage\": \"/api/storage\",\n            \"docs\": \"/api/docs\"\n        }\n    }\n\n\n@app.get(\"/health\")\n@app.get(\"/api/health\")\nasync def health_check():\n    \"\"\"Health check endpoint\"\"\"\n    return {\n        \"status\": \"healthy\",\n        \"version\": settings.APP_VERSION\n    }\n\n\n# Startup event\n@app.on_event(\"startup\")\nasync def startup_event():\n    logger.info(f\"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...\")\n    logger.info(f\"📍 Environment: {settings.ENVIRONMENT}\")\n    logger.info(f\"🔗 Supabase URL: {settings.SUPABASE_URL}\")\n    logger.info(f\"🌐 CORS Origins: {settings.cors_origins_list}\")\n    logger.info(\"✅ Server started successfully!\")\n\n\n# Shutdown event\n@app.on_event(\"shutdown\")\nasync def shutdown_event():\n    logger.info(\"👋 Server shutting down...\")\n\n\nif __name__ == \"__main__\":\n    import uvicorn\n    uvicorn.run(\n        \"server:app\",\n        host=\"0.0.0.0\",\n        port=8001,\n        reload=True\n    )\n