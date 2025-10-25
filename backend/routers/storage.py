from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from services.supabase_client import get_supabase_admin
from dependencies import get_current_user
from supabase import Client
import logging
import uuid
from typing import Dict

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/storage", tags=["Storage"])


@router.post("/upload-logo", response_model=Dict[str, str])
async def upload_logo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}")
        max_size = 5 * 1024 * 1024
        contents = await file.read()
        if len(contents) > max_size:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File size exceeds 5 MB limit")
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
        unique_filename = f"{current_user['id']}/{uuid.uuid4()}.{file_ext}"
        result = supabase.storage.from_('logos').upload(path=unique_filename, file=contents, file_options={"content-type": file.content_type})
        if not result:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload file")
        public_url = supabase.storage.from_('logos').get_public_url(unique_filename)
        return {"url": public_url, "filename": unique_filename, "message": "Logo uploaded successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload logo error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload logo: {str(e)}")


@router.delete("/delete-logo/{filename}")
async def delete_logo(filename: str, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase_admin)):
    try:
        if not filename.startswith(f"{current_user['id']}/"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this file")
        result = supabase.storage.from_('logos').remove([filename])
        return {"message": "Logo deleted successfully", "filename": filename}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete logo error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete logo: {str(e)}")
