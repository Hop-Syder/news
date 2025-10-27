from fastapi import APIRouter, HTTPException, Depends, status
from models.contact import ContactMessageCreate, ContactMessage, StatsResponse
from services.supabase_client import get_supabase_admin
from supabase import Client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/contact", tags=["Contact"])


def _error_message(error) -> str:
    if not error:
        return ""
    if isinstance(error, dict):
        return str(error.get("message") or error.get("hint") or error)
    message = getattr(error, "message", None)
    return str(message or error)


def _extract_count(result) -> int:
    if hasattr(result, "count") and result.count is not None:
        return result.count
    data = getattr(result, "data", None)
    if isinstance(data, list):
        return len(data)
    return 0


def _supports_is_active(result) -> bool:
    error = getattr(result, "error", None)
    if not error:
        return True
    message = _error_message(error).lower()
    return "is_active" not in message or all(word not in message for word in ("column", "does not exist", "missing"))


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
        # Utilisateurs inscrits = lignes dans user_profiles
        users_result = supabase.table('user_profiles').select('id', head=True, count='exact').execute()
        if getattr(users_result, "error", None):
            logger.warning(f"user count error: {_error_message(users_result.error)}")
        total_users = _extract_count(users_result)

        # Profils publiés = entrepreneurs actifs (fallback si colonne absente)
        published_result = supabase.table('entrepreneurs').select('id', head=True, count='exact').eq('is_active', True).execute()
        if not _supports_is_active(published_result):
            logger.warning("Column 'is_active' not found. Falling back to total entrepreneurs count.")
            published_result = supabase.table('entrepreneurs').select('id', head=True, count='exact').execute()

        if getattr(published_result, "error", None):
            message = _error_message(published_result.error)
            logger.error(f"Entrepreneur count error: {message}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve entrepreneur statistics.")

        total_profiles = _extract_count(published_result)

        return StatsResponse(
            total_users=total_users,
            total_profiles=total_profiles,
            total_views=0,
            total_problems=0
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get stats error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve stats: {str(e)}")
