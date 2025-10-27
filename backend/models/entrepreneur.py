from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime


class PortfolioItem(BaseModel):
    """Portfolio item schema"""
    type: Literal["image", "link"]
    value: str


class EntrepreneurBase(BaseModel):
    """Base entrepreneur schema"""
    profile_type: Literal[
        "entreprise", "freelance", "pme", "artisan", 
        "ONG", "cabinet", "organisation", "autre"
    ]
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    company_name: Optional[str] = Field(None, max_length=200)
    activity_name: Optional[str] = Field(None, max_length=200)
    description: str = Field(..., min_length=1, max_length=200)
    tags: List[str] = Field(default_factory=list, max_length=5)
    phone: str = Field(..., min_length=1, max_length=50)
    whatsapp: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    country_code: str = Field(..., min_length=2, max_length=2)
    city: str = Field(..., min_length=1, max_length=100)
    website: Optional[str] = Field(None, max_length=500)
    portfolio: List[PortfolioItem] = Field(default_factory=list)
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if len(v) > 5:
            raise ValueError('Maximum 5 tags allowed')
        return v
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if len(v) > 200:
            raise ValueError('Description must be 200 characters or less')
        return v


class EntrepreneurCreate(EntrepreneurBase):
    """Schema for creating entrepreneur profile"""
    logo_url: Optional[str] = None
    is_active: Optional[bool] = True


class EntrepreneurUpdate(BaseModel):
    """Schema for updating entrepreneur profile (all fields optional)"""
    profile_type: Optional[Literal[
        "entreprise", "freelance", "pme", "artisan", 
        "ONG", "cabinet", "organisation", "autre"
    ]] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    company_name: Optional[str] = Field(None, max_length=200)
    activity_name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    tags: Optional[List[str]] = Field(None, max_length=5)
    phone: Optional[str] = Field(None, min_length=1, max_length=50)
    whatsapp: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    website: Optional[str] = Field(None, max_length=500)
    portfolio: Optional[List[PortfolioItem]] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None


class EntrepreneurPublic(BaseModel):
    """Public entrepreneur profile (without sensitive contact info)"""
    id: str
    profile_type: str
    first_name: str
    last_name: str
    company_name: Optional[str] = None
    activity_name: Optional[str] = None
    logo_url: Optional[str] = None
    description: str
    tags: List[str]
    country_code: str
    city: str
    website: Optional[str] = None
    portfolio: List[PortfolioItem] = []
    rating: float
    review_count: int
    is_premium: bool
    is_active: Optional[bool] = True
    created_at: datetime
    updated_at: datetime


class EntrepreneurFull(EntrepreneurPublic):
    """Full entrepreneur profile (with all contact info)"""
    user_id: str
    phone: str
    whatsapp: str
    email: str
    premium_until: Optional[datetime] = None


class EntrepreneurContactInfo(BaseModel):
    """Contact information schema (protected)"""
    phone: str
    whatsapp: str
    email: str


class EntrepreneurListResponse(BaseModel):
    """Response for entrepreneur list"""
    data: List[EntrepreneurPublic]
    count: int
    page: int
    page_size: int


class EntrepreneurDraftPayload(BaseModel):
    """Payload for saving entrepreneur draft progress"""
    form_data: Dict[str, Any]
    current_step: int = 1


class EntrepreneurDraftResponse(EntrepreneurDraftPayload):
    """Response model for entrepreneur draft"""
    updated_at: Optional[datetime] = None
