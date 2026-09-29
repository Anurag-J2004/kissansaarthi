from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import WeatherForecast, DownscaledWeather, Panchayat
from ..schemas import WeatherForecastOut, DownscaledWeatherOut, DownscaleRequest
from ..ml.downscaling import run_spatial_downscaling
from .auth import get_current_user

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/block/{block_id}", response_model=List[WeatherForecastOut])
def get_block_weather(block_id: str, db: Session = Depends(get_db)):
    return db.query(WeatherForecast).filter(WeatherForecast.block_id == block_id).all()

@router.get("/panchayat/{panchayat_id}", response_model=List[DownscaledWeatherOut])
def get_panchayat_weather(panchayat_id: str, db: Session = Depends(get_db)):
    return db.query(DownscaledWeather).filter(DownscaledWeather.panchayat_id == panchayat_id).all()

@router.post("/downscale", response_model=List[DownscaledWeatherOut])
def trigger_downscaling(req: DownscaleRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        date_obj = datetime.strptime(req.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    results = run_spatial_downscaling(db, req.block_id, date_obj)
    if not results:
        raise HTTPException(status_code=404, detail="No block forecast found for this date")
    return results
