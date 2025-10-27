from supabase import create_client, Client
from functools import lru_cache
from config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


@lru_cache()
def get_supabase_admin() -> Client:
    """
    Get Supabase client with service_role key (admin access)
    Use for backend operations that bypass RLS
    """
    try:
        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        logger.info("Supabase admin client initialized")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase admin client: {e}")
        raise


def get_supabase_client(access_token: str = None) -> Client:
    """
    Get Supabase client with optional user token
    If token provided, RLS policies will be enforced for that user
    """
    try:
        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        
        if access_token:
            # Set user session for RLS
            client.postgrest.auth(access_token)
        
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise
