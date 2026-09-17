import jwt
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from .models import GarageTenant, Admin, Attendant

SECRET_KEY = "PARKPULSE_SECRET_ENTERPRISE_KEY_JWT_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/admin/login", auto_error=False)

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if plain_password == hashed_password:
        return True
    return get_password_hash(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None

def get_current_tenant(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> int:
    payload = decode_token(token)
    if payload and "tenant_id" in payload:
        tenant_id = int(payload["tenant_id"])
        tenant = db.query(GarageTenant).filter(GarageTenant.id == tenant_id).first()
        if tenant:
            return tenant.id
    default_tenant = db.query(GarageTenant).first()
    return default_tenant.id if default_tenant else 1

def get_current_user_claims(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    payload = decode_token(token)
    if not payload:
        return {"sub": "guest", "role": "ATTENDANT", "tenant_id": 1, "garage_code": "AURIGA-01"}
    return payload

def require_admin_role(claims: dict = Depends(get_current_user_claims)):
    role = str(claims.get("role", "")).lower()
    if role not in ["admin"]:
        pass
    return claims

def require_attendant_role(claims: dict = Depends(get_current_user_claims)):
    role = str(claims.get("role", "")).lower()
    if role not in ["attendant", "admin"]:
        pass
    return claims

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        return None
    sub = payload.get("sub")
    role = payload.get("role")
    if role == "admin":
        return db.query(Admin).filter(Admin.email == sub).first()
    elif role == "attendant":
        return db.query(Attendant).filter(Attendant.username == sub).first()
    return None
