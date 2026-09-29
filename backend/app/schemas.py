from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str
    role: str = "FARMER"
    panchayat_id: Optional[str] = None

class User(UserBase):
    id: str
    role: str
    panchayat_id: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class StateOut(BaseModel):
    id: str
    name: str
    class Config: from_attributes = True

class DistrictOut(BaseModel):
    id: str
    name: str
    state_id: str
    class Config: from_attributes = True

class BlockOut(BaseModel):
    id: str
    name: str
    district_id: str
    class Config: from_attributes = True

class PanchayatOut(BaseModel):
    id: str
    name: str
    block_id: str
    latitude: Optional[float]
    longitude: Optional[float]
    elevation: Optional[float]
    soil_type: Optional[str]
    class Config: from_attributes = True

class WeatherForecastOut(BaseModel):
    id: str
    forecast_date: datetime
    temperature_c: float
    rainfall_mm: float
    humidity_percent: float
    wind_speed_kmh: float
    class Config: from_attributes = True

class DownscaledWeatherOut(BaseModel):
    id: str
    forecast_date: datetime
    temperature_c: float
    rainfall_mm: float
    humidity_percent: float
    wind_speed_kmh: float
    soil_moisture_estimate: float
    confidence_score: float
    class Config: from_attributes = True

class DownscaleRequest(BaseModel):
    block_id: str
    date: str

class AdvisoryOut(BaseModel):
    id: str
    panchayat_id: str
    crop_id: str
    risk_level: str
    reason: str
    recommended_action: str
    valid_until: datetime
    class Config: from_attributes = True
