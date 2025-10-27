from fastapi import APIRouter, HTTPException, Depends, Query, status, Response
from typing import List, Optional, Any, Dict
from models.entrepreneur import (
    EntrepreneurCreate,
    EntrepreneurUpdate,
    EntrepreneurPublic,
    EntrepreneurFull,
    EntrepreneurContactInfo,
    EntrepreneurDraftPayload,
    EntrepreneurDraftResponse
)
from services.supabase_client import get_supabase_admin
from dependencies import get_current_user
from supabase import Client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/entrepreneurs", tags=["Entrepreneurs"])

MISSING_IS_ACTIVE_MSG = (
    "Le schéma Supabase ne contient pas la colonne 'is_active'. "
    "Merci d'appliquer la dernière migration (voir SUPABASE_SETUP.md)."
)

FALLBACK_PROFILE_COLUMNS = [
    'id', 'user_id', 'profile_type', 'first_name', 'last_name',
    'company_name', 'activity_name', 'logo_url', 'description',
    'tags', 'phone', 'whatsapp', 'email', 'website',
    'country_code', 'city', 'portfolio', 'rating',
    'review_count', 'is_premium', 'premium_until',
    'created_at', 'updated_at'
]


def _error_message(error: Any) -> str:
    if error is None:
        return ""
    if isinstance(error, dict):
        return str(error.get("message") or error)
    message = getattr(error, "message", None)
    if message:
        return str(message)
    return str(error)


def _is_missing_is_active_error(error: Any) -> bool:
    message = _error_message(error).lower()
    return "is_active" in message and ("column" in message or "does not exist" in message or "missing" in message)


def _sanitize_profile_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    sanitized = dict(data)
    sanitized.setdefault("is_active", True)
    return sanitized


@router.get("/draft", response_model=EntrepreneurDraftResponse)
async def get_entrepreneur_draft(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    try:
        result = supabase.table('entrepreneur_drafts') \
            .select('form_data, current_step, updated_at') \
            .eq('user_id', current_user['id']) \
            .execute()

        if result.data:
            draft = result.data[0]
            return {
                "form_data": draft.get('form_data', {}),
                "current_step": draft.get('current_step', 1),
                "updated_at": draft.get('updated_at')
            }

        return {"form_data": {}, "current_step": 1, "updated_at": None}
    except Exception as e:
        logger.error(f"Get entrepreneur draft error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load entrepreneur draft"
        )


@router.put("/draft", response_model=EntrepreneurDraftResponse)
async def save_entrepreneur_draft(
    draft: EntrepreneurDraftPayload,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    try:
        payload = {
            "user_id": current_user['id'],
            "form_data": draft.form_data,
            "current_step": draft.current_step
        }

        result = supabase.table('entrepreneur_drafts') \
            .upsert(payload, returning='representation') \
            .execute()

        if result.data:
            saved = result.data[0]
            return {
                "form_data": saved.get('form_data', {}),
                "current_step": saved.get('current_step', draft.current_step),
                "updated_at": saved.get('updated_at')
            }

        return {"form_data": draft.form_data, "current_step": draft.current_step, "updated_at": None}
    except Exception as e:
        logger.error(f"Save entrepreneur draft error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save entrepreneur draft"
        )


@router.delete("/draft", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entrepreneur_draft(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    try:
        supabase.table('entrepreneur_drafts') \
            .delete() \
            .eq('user_id', current_user['id']) \
            .execute()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        logger.error(f"Delete entrepreneur draft error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete entrepreneur draft"
        )


@router.post("", response_model=EntrepreneurFull, status_code=status.HTTP_201_CREATED)
async def create_entrepreneur(entrepreneur_data: EntrepreneurCreate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        existing = supabase.table('entrepreneurs').select('id').eq('user_id', current_user['id']).execute()
        if existing.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already has an entrepreneur profile")
        entrepreneur_dict = entrepreneur_data.model_dump(exclude_none=True)
        entrepreneur_dict['user_id'] = current_user['id']
        if entrepreneur_dict.get('is_active') is None:
            entrepreneur_dict['is_active'] = True

        result = supabase.table('entrepreneurs').insert(entrepreneur_dict).execute()
        error = getattr(result, 'error', None)

        if error and _is_missing_is_active_error(error):
            logger.warning("'is_active' column missing while creating entrepreneur. Falling back without the flag.")
            entrepreneur_dict.pop('is_active', None)
            result = supabase.table('entrepreneurs').insert(entrepreneur_dict).execute()
            error = getattr(result, 'error', None)

        if error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=_error_message(error) or "Failed to create entrepreneur profile"
            )

        if not result.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create entrepreneur profile")

        supabase.table('user_profiles').update({'has_profile': True}).eq('user_id', current_user['id']).execute()
        return _sanitize_profile_payload(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create entrepreneur error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create profile: {str(e)}")


@router.get("", response_model=List[EntrepreneurPublic])
async def list_entrepreneurs(search: Optional[str] = Query(None), country_code: Optional[str] = Query(None), city: Optional[str] = Query(None), profile_type: Optional[str] = Query(None), tags: Optional[str] = Query(None), min_rating: Optional[float] = Query(None, ge=0, le=5), sort_by: str = Query("created_at"), sort_order: str = Query("desc"), limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0), supabase: Client = Depends(get_supabase_admin)):
    try:
        query = supabase.table('entrepreneurs_public').select('*')
        if country_code:
            query = query.eq('country_code', country_code.upper())
        if city:
            query = query.ilike('city', f'%{city}%')
        if profile_type:
            query = query.eq('profile_type', profile_type)
        if min_rating:
            query = query.gte('rating', min_rating)
        if tags:
            tag_list = [t.strip() for t in tags.split(',')]
            query = query.contains('tags', tag_list)
        if search:
            search_query = supabase.table('entrepreneurs').select('id').or_(f"first_name.ilike.%{search}%,last_name.ilike.%{search}%,company_name.ilike.%{search}%,activity_name.ilike.%{search}%,description.ilike.%{search}%").execute()
            if search_query.data:
                matching_ids = [item['id'] for item in search_query.data]
                query = query.in_('id', matching_ids)
            else:
                return []
        ascending = (sort_order.lower() == "asc")
        if sort_by == "rating":
            query = query.order('rating', desc=not ascending)
        else:
            query = query.order('created_at', desc=not ascending)
        query = query.range(offset, offset + limit - 1)
        result = query.execute()
        if not result.data:
            return []
        return [_sanitize_profile_payload(item) for item in result.data]
    except Exception as e:
        logger.error(f"List entrepreneurs error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve entrepreneurs: {str(e)}")


@router.get("/me", response_model=EntrepreneurFull)
async def get_my_profile(current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        result = supabase.table('entrepreneurs').select('*').eq('user_id', current_user['id']).single().execute()
        error = getattr(result, 'error', None)

        if error and _is_missing_is_active_error(error):
            logger.warning("'is_active' column missing while fetching entrepreneur. Falling back without the flag.")
            fallback_select = ','.join(FALLBACK_PROFILE_COLUMNS)
            result = supabase.table('entrepreneurs').select(fallback_select).eq('user_id', current_user['id']).single().execute()
            error = getattr(result, 'error', None)
            if error:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=_error_message(error) or "Failed to retrieve profile"
                )
            if not result.data:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur profile not found")
            return _sanitize_profile_payload(result.data)

        if error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=_error_message(error) or "Failed to retrieve profile"
            )

        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur profile not found")

        return _sanitize_profile_payload(result.data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get my profile error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve profile: {str(e)}")


@router.get("/{entrepreneur_id}", response_model=EntrepreneurPublic)
async def get_entrepreneur(entrepreneur_id: str, supabase: Client = Depends(get_supabase_admin)):
    try:
        result = supabase.table('entrepreneurs_public').select('*').eq('id', entrepreneur_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur not found")
        return _sanitize_profile_payload(result.data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get entrepreneur error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve entrepreneur: {str(e)}")


@router.get("/{entrepreneur_id}/contact", response_model=EntrepreneurContactInfo)
async def get_entrepreneur_contact(entrepreneur_id: str, supabase: Client = Depends(get_supabase_admin)):
    try:
        result = supabase.rpc('get_entrepreneur_contacts', {'entrepreneur_id': entrepreneur_id}).execute()
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get entrepreneur contact error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve contact info: {str(e)}")


@router.put("/{entrepreneur_id}", response_model=EntrepreneurFull)
async def update_entrepreneur(entrepreneur_id: str, entrepreneur_data: EntrepreneurUpdate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        existing = supabase.table('entrepreneurs').select('user_id').eq('id', entrepreneur_id).single().execute()
        if not existing.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur profile not found")
        if existing.data['user_id'] != current_user['id']:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this profile")
        update_dict = entrepreneur_data.model_dump(exclude_unset=True)
        if not update_dict:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
        result = supabase.table('entrepreneurs').update(update_dict).eq('id', entrepreneur_id).execute()
        error = getattr(result, 'error', None)

        if error and _is_missing_is_active_error(error):
            logger.warning("'is_active' column missing while updating entrepreneur profile.")
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=MISSING_IS_ACTIVE_MSG)

        if error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=_error_message(error) or "Failed to update profile"
            )

        if not result.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update profile")

        return _sanitize_profile_payload(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update entrepreneur error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update profile: {str(e)}")


@router.delete("/{entrepreneur_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entrepreneur(entrepreneur_id: str, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        existing = supabase.table('entrepreneurs').select('user_id').eq('id', entrepreneur_id).single().execute()
        if not existing.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur profile not found")
        if existing.data['user_id'] != current_user['id']:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this profile")
        supabase.table('entrepreneurs').delete().eq('id', entrepreneur_id).execute()
        supabase.table('user_profiles').update({'has_profile': False}).eq('user_id', current_user['id']).execute()
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete entrepreneur error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete profile: {str(e)}")
