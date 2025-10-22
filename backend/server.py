from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Body, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, validator
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import base64
import re
from firebase_config import verify_firebase_token


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'nexus_connect')]

# Create the main app without a prefix
app = FastAPI(title="Nexus Connect API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET_KEY = os.environ.get('SECRET_KEY', 'nexus-connect-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ========== MODELS ==========

# User Models
class UserBase(BaseModel):
    email: EmailStr
    
class UserCreate(UserBase):
    password: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    googleId: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    hasProfile: bool = False

class UserResponse(BaseModel):
    id: str
    email: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    hasProfile: bool = False
    
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Entrepreneur Models
class PortfolioItem(BaseModel):
    type: Literal["image", "link"]
    value: str

class EntrepreneurBase(BaseModel):
    profileType: Literal["entreprise", "freelance", "pme", "artisan", "ONG", "cabinet", "organisation", "autre"]
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    companyName: Optional[str] = None
    activityName: Optional[str] = None
    description: str = Field(..., max_length=200)
    tags: List[str] = Field(default_factory=list, max_items=5)
    phone: str
    whatsapp: str
    email: EmailStr
    location: str  # Country code
    city: str
    website: Optional[str] = None
    portfolio: List[PortfolioItem] = Field(default_factory=list)
    
    @validator('tags')
    def validate_tags(cls, v):
        if len(v) > 5:
            raise ValueError('Maximum 5 tags allowed')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        if len(v) > 200:
            raise ValueError('Description must be 200 characters or less')
        return v

class EntrepreneurCreate(EntrepreneurBase):
    logo: Optional[str] = None  # Base64 or URL

class Entrepreneur(EntrepreneurBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    logo: Optional[str] = None
    rating: float = 0.0
    reviewCount: int = 0
    isPremium: bool = False
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EntrepreneurPublic(BaseModel):
    """Public view without sensitive contact info"""
    id: str
    profileType: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    companyName: Optional[str] = None
    activityName: Optional[str] = None
    logo: Optional[str] = None
    description: str
    tags: List[str]
    location: str
    city: str
    website: Optional[str] = None
    portfolio: List[PortfolioItem] = []
    rating: float
    reviewCount: int
    isPremium: bool
    createdAt: datetime
    # Contact info hidden - requires API call

class EntrepreneurContactInfo(BaseModel):
    phone: str
    whatsapp: str
    email: str


# Contact Message Models
class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactMessage(ContactMessageCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["new", "read", "replied"] = "new"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Stats Model
class Stats(BaseModel):
    totalUsers: int
    totalProfiles: int
    totalViews: int
    totalProblems: int


# ========== HELPER FUNCTIONS ==========

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    
    # Convert ISO string to datetime if needed
    if isinstance(user.get('createdAt'), str):
        user['createdAt'] = datetime.fromisoformat(user['createdAt'])
    
    return User(**user)


# ========== AUTH ROUTES ==========

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        firstName=user_data.firstName,
        lastName=user_data.lastName
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hashed_password
    user_dict['createdAt'] = user_dict['createdAt'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            firstName=user.firstName,
            lastName=user.lastName,
            hasProfile=user.hasProfile
        )
    )

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create token
    access_token = create_access_token(
        data={"sub": user['id']},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            firstName=user.get('firstName'),
            lastName=user.get('lastName'),
            hasProfile=user.get('hasProfile', False)
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        firstName=current_user.firstName,
        lastName=current_user.lastName,
        hasProfile=current_user.hasProfile
    )


# ========== ENTREPRENEUR ROUTES ==========

@api_router.post("/entrepreneurs", response_model=Entrepreneur)
async def create_entrepreneur(
    entrepreneur_data: EntrepreneurCreate,
    current_user: User = Depends(get_current_user)
):
    # Check if user already has a profile
    existing = await db.entrepreneurs.find_one({"userId": current_user.id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a profile"
        )
    
    # Create entrepreneur profile
    entrepreneur = Entrepreneur(
        userId=current_user.id,
        **entrepreneur_data.model_dump()
    )
    
    entrepreneur_dict = entrepreneur.model_dump()
    entrepreneur_dict['createdAt'] = entrepreneur_dict['createdAt'].isoformat()
    entrepreneur_dict['updatedAt'] = entrepreneur_dict['updatedAt'].isoformat()
    
    await db.entrepreneurs.insert_one(entrepreneur_dict)
    
    # Update user hasProfile flag
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"hasProfile": True}}
    )
    
    return entrepreneur

@api_router.get("/entrepreneurs", response_model=List[EntrepreneurPublic])
async def get_entrepreneurs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    city: Optional[str] = None,
    profileType: Optional[str] = None,
    tags: Optional[str] = None,  # Comma-separated
    minRating: Optional[float] = None,
    sort: Optional[str] = "createdAt",  # createdAt, rating, relevance
    limit: int = 50,
    skip: int = 0
):
    query = {}
    
    # Build query filters
    if search:
        query["$or"] = [
            {"firstName": {"$regex": search, "$options": "i"}},
            {"lastName": {"$regex": search, "$options": "i"}},
            {"companyName": {"$regex": search, "$options": "i"}},
            {"activityName": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    
    if location:
        query["location"] = location
    
    if city:
        query["city"] = city
    
    if profileType:
        query["profileType"] = profileType
    
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    if minRating:
        query["rating"] = {"$gte": minRating}
    
    # Sort
    sort_field = "createdAt"
    sort_direction = -1
    if sort == "rating":
        sort_field = "rating"
    elif sort == "relevance" and search:
        sort_field = "rating"  # Can improve with text search score
    
    entrepreneurs = await db.entrepreneurs.find(
        query, 
        {"_id": 0, "phone": 0, "whatsapp": 0, "email": 0}  # Hide contact info
    ).sort(sort_field, sort_direction).skip(skip).limit(limit).to_list(limit)
    
    # Convert ISO strings to datetime
    for ent in entrepreneurs:
        if isinstance(ent.get('createdAt'), str):
            ent['createdAt'] = datetime.fromisoformat(ent['createdAt'])
        if isinstance(ent.get('updatedAt'), str):
            ent['updatedAt'] = datetime.fromisoformat(ent['updatedAt'])
    
    return entrepreneurs

@api_router.get("/entrepreneurs/{entrepreneur_id}", response_model=EntrepreneurPublic)
async def get_entrepreneur(entrepreneur_id: str):
    entrepreneur = await db.entrepreneurs.find_one(
        {"id": entrepreneur_id},
        {"_id": 0, "phone": 0, "whatsapp": 0, "email": 0}
    )
    
    if not entrepreneur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrepreneur not found"
        )
    
    # Convert ISO strings to datetime
    if isinstance(entrepreneur.get('createdAt'), str):
        entrepreneur['createdAt'] = datetime.fromisoformat(entrepreneur['createdAt'])
    if isinstance(entrepreneur.get('updatedAt'), str):
        entrepreneur['updatedAt'] = datetime.fromisoformat(entrepreneur['updatedAt'])
    
    return entrepreneur

@api_router.get("/entrepreneurs/{entrepreneur_id}/contact", response_model=EntrepreneurContactInfo)
async def get_entrepreneur_contact(entrepreneur_id: str):
    """Protected endpoint - returns contact info (anti-scraping)"""
    entrepreneur = await db.entrepreneurs.find_one(
        {"id": entrepreneur_id},
        {"_id": 0, "phone": 1, "whatsapp": 1, "email": 1}
    )
    
    if not entrepreneur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrepreneur not found"
        )
    
    return EntrepreneurContactInfo(
        phone=entrepreneur['phone'],
        whatsapp=entrepreneur['whatsapp'],
        email=entrepreneur['email']
    )

@api_router.get("/entrepreneurs/user/me", response_model=Entrepreneur)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's entrepreneur profile"""
    entrepreneur = await db.entrepreneurs.find_one(
        {"userId": current_user.id},
        {"_id": 0}
    )
    
    if not entrepreneur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Convert ISO strings to datetime
    if isinstance(entrepreneur.get('createdAt'), str):
        entrepreneur['createdAt'] = datetime.fromisoformat(entrepreneur['createdAt'])
    if isinstance(entrepreneur.get('updatedAt'), str):
        entrepreneur['updatedAt'] = datetime.fromisoformat(entrepreneur['updatedAt'])
    
    return entrepreneur

@api_router.put("/entrepreneurs/{entrepreneur_id}", response_model=Entrepreneur)
async def update_entrepreneur(
    entrepreneur_id: str,
    entrepreneur_data: EntrepreneurCreate,
    current_user: User = Depends(get_current_user)
):
    # Check ownership
    existing = await db.entrepreneurs.find_one({"id": entrepreneur_id})
    if not existing or existing['userId'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this profile"
        )
    
    # Update
    update_data = entrepreneur_data.model_dump()
    update_data['updatedAt'] = datetime.now(timezone.utc).isoformat()
    
    await db.entrepreneurs.update_one(
        {"id": entrepreneur_id},
        {"$set": update_data}
    )
    
    # Get updated profile
    updated = await db.entrepreneurs.find_one({"id": entrepreneur_id}, {"_id": 0})
    
    # Convert ISO strings to datetime
    if isinstance(updated.get('createdAt'), str):
        updated['createdAt'] = datetime.fromisoformat(updated['createdAt'])
    if isinstance(updated.get('updatedAt'), str):
        updated['updatedAt'] = datetime.fromisoformat(updated['updatedAt'])
    
    return updated


# ========== CONTACT ROUTES ==========

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message_data: ContactMessageCreate):
    message = ContactMessage(**message_data.model_dump())
    
    message_dict = message.model_dump()
    message_dict['createdAt'] = message_dict['createdAt'].isoformat()
    
    await db.contact_messages.insert_one(message_dict)
    
    return message


# ========== STATS ROUTES ==========

@api_router.get("/stats", response_model=Stats)
async def get_stats():
    total_users = await db.users.count_documents({})
    total_profiles = await db.entrepreneurs.count_documents({})
    # Views can be tracked with a separate collection or counter
    total_views = 0  # Placeholder
    total_problems = 0  # Placeholder
    
    return Stats(
        totalUsers=total_users,
        totalProfiles=total_profiles,
        totalViews=total_views,
        totalProblems=total_problems
    )


# ========== ROOT ROUTE ==========

@api_router.get("/")
async def root():
    return {
        "message": "Nexus Connect API",
        "version": "1.0.0",
        "status": "operational"
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()