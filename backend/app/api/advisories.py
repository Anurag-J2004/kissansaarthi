from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Advisory, DownscaledWeather, Crop, Panchayat
from ..schemas import AdvisoryOut
from .auth import get_current_user

router = APIRouter(prefix="/advisories", tags=["advisories"])

def generate_advisory_for_panchayat(db: Session, panchayat_id: str):
    weather = db.query(DownscaledWeather).filter(DownscaledWeather.panchayat_id == panchayat_id).order_by(DownscaledWeather.forecast_date.desc()).first()
    crops = db.query(Crop).all()
    
    if not weather:
        return []
        
    advisories = []
    
    for crop in crops:
        if weather.rainfall_mm > 40:
            risk = "HIGH"
            reason = f"Heavy rainfall expected ({weather.rainfall_mm}mm)"
            action = f"Avoid irrigation for {crop.name} and ensure field drainage."
        elif weather.temperature_c > 35:
            risk = "MODERATE"
            reason = f"High temperature detected ({weather.temperature_c}°C)"
            action = f"Consider light irrigation during evening hours for {crop.name}."
        elif weather.soil_moisture_estimate < 30 and weather.rainfall_mm < 5:
            risk = "MODERATE"
            reason = "Low soil moisture and dry spell."
            action = f"Irrigation required for {crop.name}."
        else:
            risk = "LOW"
            reason = "Favorable weather conditions."
            action = "Continue standard agricultural practices."

        adv = Advisory(
            panchayat_id=panchayat_id,
            crop_id=crop.id,
            risk_level=risk,
            reason=reason,
            recommended_action=action,
            valid_until=weather.forecast_date
        )
        db.add(adv)
        advisories.append(adv)
        
    db.commit()
    return advisories

@router.get("/panchayat/{panchayat_id}", response_model=List[AdvisoryOut])
def get_panchayat_advisories(panchayat_id: str, db: Session = Depends(get_db)):
    # Simple check if there are recent advisories, if not generate them.
    # In a real app this would run asynchronously after downscaling.
    existing = db.query(Advisory).filter(Advisory.panchayat_id == panchayat_id).all()
    if not existing:
        existing = generate_advisory_for_panchayat(db, panchayat_id)
    return existing
