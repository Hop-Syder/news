import firebase_admin
from firebase_admin import credentials, auth
import os
import json

# Initialize Firebase Admin from environment variable for cloud deployment
firebase_admin_json_str = os.getenv("FIREBASE_ADMIN_JSON")
if firebase_admin_json_str:
    try:
        firebase_admin_json = json.loads(firebase_admin_json_str)
        cred = credentials.Certificate(firebase_admin_json)
    except json.JSONDecodeError as e:
        raise ValueError(f"Error decoding FIREBASE_ADMIN_JSON: {e}")
else:
    # Fallback for local development if the file exists
    from pathlib import Path
    ROOT_DIR = Path(__file__).parent
    local_creds_path = ROOT_DIR / 'firebase-admin.json'
    if local_creds_path.exists():
        cred = credentials.Certificate(str(local_creds_path))
    else:
        raise ValueError("FIREBASE_ADMIN_JSON environment variable not set and firebase-admin.json file not found.")

try:
    firebase_app = firebase_admin.get_app()
except ValueError:
    firebase_app = firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token: str):
    """Verify Firebase ID token and return decoded token"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise Exception(f"Token verification failed: {str(e)}")
