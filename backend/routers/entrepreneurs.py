from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from models.entrepreneur import (
    EntrepreneurCreate,
    EntrepreneurUpdate,
    EntrepreneurPublic,
    EntrepreneurFull,
    EntrepreneurContactInfo,
    EntrepreneurStatusUpdate,
)
from services.supabase_client import get_supabase_admin
from dependencies import get_current_user
from supabase import Client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/entrepreneurs", tags=["Entrepreneurs"])

LOCKED_FIELDS = {"first_name", "last_name", "company_name", "email", "phone"}
VALID_STATUSES = {"draft", "published", "deactivated"}


def _sanitize_profile(data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not data:
        return data
    sanitized = dict(data)
    sanitized.setdefault("status", "draft")
    if sanitized.get("tags") is None:
        sanitized["tags"] = []
    return sanitized


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
            search_query = supabase.table('entrepreneurs') \
                .select('id') \
                .eq('status', 'published') \
                .or_(f"first_name.ilike.%{search}%,last_name.ilike.%{search}%,company_name.ilike.%{search}%,activity_name.ilike.%{search}%,description.ilike.%{search}%") \
                .execute()
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
        return [_sanitize_profile(item) for item in result.data]
    except Exception as e:
        logger.error(f"List entrepreneurs error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve entrepreneurs: {str(e)}")


@router.get("/me", response_model=EntrepreneurFull)
async def get_my_profile(current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        result = supabase.table('entrepreneurs').select('*').eq('user_id', current_user['id']).single().execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur profile not found")

        return _sanitize_profile(result.data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get my profile error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve profile: {str(e)}")


@router.post("/me", response_model=EntrepreneurFull, status_code=status.HTTP_201_CREATED)
async def create_my_profile(entrepreneur_data: EntrepreneurCreate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        existing = supabase.table('entrepreneurs').select('id').eq('user_id', current_user['id']).execute()
        if existing.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vous avez déjà un profil. Utilisez PUT pour le modifier.")

        payload = entrepreneur_data.model_dump(exclude_none=True)
        payload.update({
            "user_id": current_user['id'],
            "status": "draft",
            "first_saved_at": datetime.now(timezone.utc).isoformat()
        })

        result = supabase.table('entrepreneurs').insert(payload).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Impossible de créer le profil")

        # Mettre à jour le flag sur user_profiles
        supabase.table('user_profiles').update({'has_profile': True}).eq('user_id', current_user['id']).execute()

        return _sanitize_profile(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create my profile error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create profile: {str(e)}")


@router.put("/me", response_model=EntrepreneurFull)
async def update_my_profile(entrepreneur_data: EntrepreneurUpdate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        update_payload = entrepreneur_data.model_dump(exclude_none=True)

        # Protection supplémentaire si jamais un champ verrouillé arrive...
        locked_updates = LOCKED_FIELDS.intersection(update_payload.keys())
        if locked_updates:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Champs non modifiables: {', '.join(sorted(locked_updates))}")

        if not update_payload:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aucune donnée à mettre à jour")

        result = supabase.table('entrepreneurs') \
            .update(update_payload) \
            .eq('user_id', current_user['id']) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil introuvable")

        return _sanitize_profile(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update my profile error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update profile: {str(e)}")


@router.patch("/me/status")
async def update_my_status(status_payload: EntrepreneurStatusUpdate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        target_status = status_payload.status
        if target_status not in VALID_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Statut invalide")

        result = supabase.table('entrepreneurs') \
            .update({"status": target_status}) \
            .eq('user_id', current_user['id']) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil introuvable")

        message = {
            "draft": "Profil enregistré en brouillon.",
            "published": "Profil publié !",
            "deactivated": "Profil désactivé."
        }[target_status]

        return {"status": target_status, "message": message}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update status error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update status: {str(e)}")


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_profile(current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        existing = supabase.table('entrepreneurs').select('id').eq('user_id', current_user['id']).single().execute()
        if not existing.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur profile not found")

        supabase.table('entrepreneurs').delete().eq('user_id', current_user['id']).execute()
        supabase.table('user_profiles').update({'has_profile': False}).eq('user_id', current_user['id']).execute()
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete my profile error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete profile: {str(e)}")


@router.get("/{entrepreneur_id}", response_model=EntrepreneurPublic)
async def get_entrepreneur(entrepreneur_id: str, supabase: Client = Depends(get_supabase_admin)):
    try:
        result = supabase.table('entrepreneurs_public').select('*').eq('id', entrepreneur_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur non trouvé")
        return _sanitize_profile(result.data)
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
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrepreneur non trouvé")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get entrepreneur contact error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve contact info: {str(e)}")


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
