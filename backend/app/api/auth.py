from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional
import os

from ..database import get_db
from ..models import User

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkisan-saarthikey2026")
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)

# ── Pydantic schemas ───────────────────────────────────────
class RegisterRequest(BaseModel):
    name:           str
    email:          str
    password:       str
    phone:          Optional[str] = None
    role:           str = "FARMER"
    district:       Optional[str] = None
    block:          Optional[str] = None
    panchayat_name: Optional[str] = None
    language:       str = "en"

class LoginRequest(BaseModel):
    email:    str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type:   str
    user: dict

# ── Helpers ────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user: User) -> str:
    payload = {
        "sub":   user.email,
        "role":  user.role,
        "name":  user.name,
        "exp":   datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def user_to_dict(u: User) -> dict:
    return {
        "id":             u.id,
        "name":           u.name,
        "email":          u.email,
        "phone":          u.phone,
        "role":           u.role,
        "district":       u.district,
        "block":          u.block,
        "panchayat_name": u.panchayat_name,
        "language":       u.language,
        "sms_alerts":     u.sms_alerts,
    }

# ── Endpoints ──────────────────────────────────────────────
@router.post("/register", response_model=TokenOut)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=req.name, email=req.email,
        phone=req.phone, role=req.role,
        hashed_password=hash_password(req.password),
        district=req.district, block=req.block,
        panchayat_name=req.panchayat_name,
        language=req.language, sms_alerts=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"access_token": create_token(user), "token_type": "bearer", "user": user_to_dict(user)}

@router.post("/login", response_model=TokenOut)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_token(user), "token_type": "bearer", "user": user_to_dict(user)}

# OAuth2 form-compatible token endpoint (for Swagger)
@router.post("/token")
def token_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    return {"access_token": create_token(user), "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_dict(current_user)
