from fastapi import APIRouter, HTTPException, Depends, status
from models.user import UserCreate, UserLogin, UserResponse, AuthResponse
from services.supabase_client import get_supabase_admin
from dependencies import get_current_user
from supabase import Client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Register a new user with email and password
    
    - Creates user in Supabase Auth
    - Automatically creates user_profile (via trigger)
    - Returns access token and user data
    """
    try:
        # Register user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User registration failed"
            )
        
        # Check if user profile was created (by trigger)
        profile_response = supabase.table('user_profiles')\
            .select('*')\
            .eq('user_id', auth_response.user.id)\
            .single()\
            .execute()
        
        # Return auth response
        return AuthResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            user=UserResponse(
                id=auth_response.user.id,
                email=auth_response.user.email,
                first_name=profile_response.data.get('first_name') if profile_response.data else user_data.first_name,
                last_name=profile_response.data.get('last_name') if profile_response.data else user_data.last_name,
                has_profile=profile_response.data.get('has_profile', False) if profile_response.data else False
            ),
            expires_at=str(auth_response.session.expires_at) if auth_response.session else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        
        # Check for duplicate email
        if "already registered" in str(e).lower() or "duplicate" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    user_data: UserLogin,
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Login with email and password
    
    - Authenticates with Supabase Auth
    - Returns access token and user data
    """
    try:
        # Login with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Get user profile
        profile_response = supabase.table('user_profiles')\
            .select('*')\
            .eq('user_id', auth_response.user.id)\
            .single()\
            .execute()
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            user=UserResponse(
                id=auth_response.user.id,
                email=auth_response.user.email,
                first_name=profile_response.data.get('first_name') if profile_response.data else None,
                last_name=profile_response.data.get('last_name') if profile_response.data else None,
                has_profile=profile_response.data.get('has_profile', False) if profile_response.data else False
            ),
            expires_at=str(auth_response.session.expires_at) if auth_response.session else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        
        # Handle invalid credentials
        if "invalid" in str(e).lower() or "credentials" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user
    
    Requires: Bearer token in Authorization header
    """
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        first_name=current_user.get('first_name'),
        last_name=current_user.get('last_name'),
        has_profile=current_user.get('has_profile', False)
    )


@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Logout current user
    
    Note: With JWT, this is primarily client-side (remove token)
    Server can optionally revoke the token
    """
    try:
        # Supabase handles token revocation internally
        return {"message": "Logout successful"}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        # Even if server logout fails, client should remove token
        return {"message": "Logout completed (client-side)"}


@router.post("/refresh")
async def refresh_token(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Refresh access token
    
    Note: Supabase handles token refresh automatically on the client
    This endpoint is for manual refresh if needed
    """
    try:
        # Get new session
        session = supabase.auth.refresh_session()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token refresh failed"
            )
        
        return {
            "access_token": session.access_token,
            "token_type": "bearer",
            "expires_at": str(session.expires_at)
        }
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )
