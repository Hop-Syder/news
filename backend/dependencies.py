from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from services.supabase_client import get_supabase_admin
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_admin)
) -> Dict:
    """
    Dependency to get current authenticated user
    Verifies Supabase JWT token and returns user data
    """
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(credentials.credentials)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user profile from database
        profile_response = supabase.table('user_profiles')\
            .select('*')\
            .eq('user_id', user_response.user.id)\
            .single()\
            .execute()
        
        if not profile_response.data:
            # Profile should exist (created by trigger), but handle edge case
            logger.warning(f"User profile not found for user_id: {user_response.user.id}")
            profile_data = {
                'id': None,
                'first_name': None,
                'last_name': None,
                'has_profile': False
            }
        else:
            profile_data = profile_response.data
        
        # Return combined user data
        return {
            'id': user_response.user.id,
            'email': user_response.user.email,
            'first_name': profile_data.get('first_name'),
            'last_name': profile_data.get('last_name'),
            'has_profile': profile_data.get('has_profile', False),
            'profile_id': profile_data.get('id')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    supabase: Client = Depends(get_supabase_admin)
) -> Optional[Dict]:
    """
    Optional authentication - returns None if no token provided
    Useful for endpoints that work for both authenticated and anonymous users
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, supabase)
    except HTTPException:
        return None
