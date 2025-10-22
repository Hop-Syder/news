import firebase_admin
from firebase_admin import credentials, auth
from pathlib import Path

# Initialize Firebase Admin
ROOT_DIR = Path(__file__).parent
cred = credentials.Certificate(str(ROOT_DIR / 'firebase-admin.json'))

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
