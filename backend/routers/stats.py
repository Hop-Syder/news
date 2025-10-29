from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from models.common import PlatformStatsResponse
from services.supabase_client import get_supabase_admin
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("", status_code=status.HTTP_200_OK, response_model=PlatformStatsResponse)
async def get_global_stats(supabase: Client = Depends(get_supabase_admin)):
    """
    Get global statistics for the platform.
    - Total registered users
    - Total entrepreneur profiles
    - Number of countries covered
    """
    try:
        # Note: Supabase-py v2 doesn't have a direct count on auth users.
        # This is a simplified approach. For an exact user count, a custom function or table might be needed.
        users_count_res = supabase.table('user_profiles').select('id', count='exact').execute()
        entrepreneurs_count_res = supabase.table('entrepreneurs').select('id', count='exact').execute()

        # For countries, we get distinct country codes
        countries_res = supabase.table('entrepreneurs').select('country_code').execute()
        countries_count = len(set(item['country_code'] for item in countries_res.data))

        return PlatformStatsResponse(
            total_users=users_count_res.count or 0,
            total_entrepreneurs=entrepreneurs_count_res.count or 0,
            countries_covered=countries_count,
        )
    except Exception as e:
        logger.error(f"Failed to fetch stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch platform statistics."
        )
