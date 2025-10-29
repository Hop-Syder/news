from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Literal, Optional
from datetime import datetime


class ContactMessageCreate(BaseModel):
    """Schema for creating contact message"""

    model_config = ConfigDict(extra="ignore")

    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=500)
    message: str = Field(..., min_length=1)


class ContactMessage(ContactMessageCreate):
    """Complete contact message schema"""

    model_config = ConfigDict(extra="ignore")

    id: str
    status: Literal["new", "read", "replied"] = "new"
    created_at: datetime


class StatsResponse(BaseModel):
    """Application statistics schema"""

    model_config = ConfigDict(extra="ignore")

    total_users: int
    total_profiles: int
    total_views: int
    total_problems: int
