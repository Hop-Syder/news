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
        users_result = supabase.table('user_profiles').select('id', count='exact').execute()
        total_users = users_result.count if hasattr(users_result, 'count') else 0
        profiles_result = supabase.table('entrepreneurs').select('id', count='exact').execute()
        total_profiles = profiles_result.count if hasattr(profiles_result, 'count') else 0
        total_views = 0
        total_problems = 0
        return StatsResponse(total_users=total_users, total_profiles=total_profiles, total_views=total_views, total_problems=total_problems)
    except Exception as e:
        logger.error(f"Get stats error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve stats: {str(e)}")
