from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response"""
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    has_profile: bool = False


class UserProfile(BaseModel):
    """Schema for user profile"""
    id: str
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    has_profile: bool = False
    created_at: datetime
    updated_at: datetime


class AuthResponse(BaseModel):
    """Schema for authentication response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    expires_at: Optional[str] = None
