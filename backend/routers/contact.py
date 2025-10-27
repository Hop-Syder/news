from fastapi import APIRouter, HTTPException, Depends, status
from models.contact import ContactMessageCreate, ContactMessage, StatsResponse
from services.supabase_client import get_supabase_admin
from supabase import Client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", response_model=ContactMessage, status_code=status.HTTP_201_CREATED)
async def create_contact_message(message_data: ContactMessageCreate, supabase: Client = Depends(get_supabase_admin)):
    try:
        result = supabase.table('contact_messages').insert(message_data.model_dump()).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create contact message")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create contact message error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to send message: {str(e)}")


@router.get("/stats", response_model=StatsResponse)
async def get_stats(supabase: Client = Depends(get_supabase_admin)):
    try:
        def _extract_count(result) -> int:
            if hasattr(result, "count") and result.count is not None:
                return result.count
            data = getattr(result, "data", None)
            if isinstance(data, list):
                return len(data)
            return 0

        def _is_missing_is_active(error) -> bool:
            if not error:
                return False
            message = None
            if isinstance(error, dict):
                message = error.get("message") or error.get("hint")
            if not message:
                message = getattr(error, "message", None)
            if not message:
                message = str(error)
            message = message.lower()
            return "is_active" in message and ("column" in message or "does not exist" in message or "missing" in message)

        users_result = supabase.table('user_profiles').select('id', count='exact', head=True).execute()
        if getattr(users_result, "error", None):
            logger.warning(f"user count error: {users_result.error}")
        total_users = _extract_count(users_result)

        profiles_query = supabase.table('entrepreneurs').select('id', count='exact', head=True).eq('is_active', True)
        profiles_result = profiles_query.execute()
        error = getattr(profiles_result, "error", None)

        if error and _is_missing_is_active(error):
            logger.warning("is_active column missing when counting entrepreneurs. Falling back to total count.")
            profiles_result = supabase.table('entrepreneurs').select('id', count='exact', head=True).execute()
            error = getattr(profiles_result, "error", None)

        if error:
            logger.error(f"Entrepreneur count error: {error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve entrepreneur statistics."
            )

        total_profiles = _extract_count(profiles_result)
        total_views = 0
        total_problems = 0
        return StatsResponse(total_users=total_users, total_profiles=total_profiles, total_views=total_views, total_problems=total_problems)
    except Exception as e:
        logger.error(f"Get stats error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve stats: {str(e)}")
