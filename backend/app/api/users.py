from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from ..database import get_db
from ..models import User, UserCrop
from .auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

# ── Schemas ────────────────────────────────────────────────
class ProfileUpdate(BaseModel):
    name:           Optional[str] = None
    phone:          Optional[str] = None
    district:       Optional[str] = None
    block:          Optional[str] = None
    panchayat_name: Optional[str] = None
    language:       Optional[str] = None
    sms_alerts:     Optional[bool] = None

class CropIn(BaseModel):
    crop_name:   str
    sowing_date: Optional[str] = None   # ISO date string
    area_acres:  Optional[float] = None
    variety:     Optional[str] = None

class CropOut(BaseModel):
    id:          str
    crop_name:   str
    sowing_date: Optional[datetime]
    area_acres:  Optional[float]
    variety:     Optional[str]
    class Config: from_attributes = True

# ── Endpoints ──────────────────────────────────────────────
@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id, "name": current_user.name,
        "email": current_user.email, "phone": current_user.phone,
        "role": current_user.role, "district": current_user.district,
        "block": current_user.block, "panchayat_name": current_user.panchayat_name,
        "language": current_user.language, "sms_alerts": current_user.sms_alerts,
    }

@router.patch("/me")
def update_profile(update: ProfileUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "user": {
        "id": current_user.id, "name": current_user.name,
        "district": current_user.district, "block": current_user.block,
        "panchayat_name": current_user.panchayat_name,
        "language": current_user.language, "sms_alerts": current_user.sms_alerts,
    }}

# ── Crops ──────────────────────────────────────────────────
@router.get("/me/crops", response_model=List[CropOut])
def get_my_crops(db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    return db.query(UserCrop).filter(UserCrop.user_id == current_user.id).all()

@router.post("/me/crops", response_model=CropOut)
def add_crop(crop: CropIn, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    sowing = None
    if crop.sowing_date:
        try: sowing = datetime.fromisoformat(crop.sowing_date)
        except: pass

    uc = UserCrop(user_id=current_user.id, crop_name=crop.crop_name,
                  sowing_date=sowing, area_acres=crop.area_acres, variety=crop.variety)
    db.add(uc)
    db.commit()
    db.refresh(uc)
    return uc

@router.delete("/me/crops/{crop_id}")
def delete_crop(crop_id: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    uc = db.query(UserCrop).filter(UserCrop.id == crop_id, UserCrop.user_id == current_user.id).first()
    if not uc:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(uc)
    db.commit()
    return {"message": "Crop removed"}
