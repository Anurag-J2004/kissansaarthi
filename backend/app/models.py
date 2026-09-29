"""Add user_crops table and phone/location fields to User"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id              = Column(String(36), primary_key=True, default=generate_uuid)
    email           = Column(String(100), unique=True, index=True)
    phone           = Column(String(20), nullable=True)
    hashed_password = Column(String(255))
    role            = Column(String(50))  # FARMER, OFFICER, ADMIN, OPERATOR
    name            = Column(String(100))
    panchayat_id    = Column(String(36), ForeignKey("panchayats.id"), nullable=True)
    district        = Column(String(100), nullable=True)
    block           = Column(String(100), nullable=True)
    panchayat_name  = Column(String(100), nullable=True)
    language        = Column(String(10), default="en")
    sms_alerts      = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    user_crops = relationship("UserCrop", back_populates="user", cascade="all, delete-orphan")

class UserCrop(Base):
    __tablename__ = "user_crops"
    id          = Column(String(36), primary_key=True, default=generate_uuid)
    user_id     = Column(String(36), ForeignKey("users.id"), index=True)
    crop_name   = Column(String(100))
    sowing_date = Column(DateTime, nullable=True)
    area_acres  = Column(Float, nullable=True)
    variety     = Column(String(100), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="user_crops")

class State(Base):
    __tablename__ = "states"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), index=True)
    districts = relationship("District", back_populates="state")

class District(Base):
    __tablename__ = "districts"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), index=True)
    state_id = Column(String(36), ForeignKey("states.id"))
    state = relationship("State", back_populates="districts")
    blocks = relationship("Block", back_populates="district")

class Block(Base):
    __tablename__ = "blocks"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), index=True)
    district_id = Column(String(36), ForeignKey("districts.id"))
    district = relationship("District", back_populates="blocks")
    panchayats = relationship("Panchayat", back_populates="block")

class Panchayat(Base):
    __tablename__ = "panchayats"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), index=True)
    block_id = Column(String(36), ForeignKey("blocks.id"))
    block = relationship("Block", back_populates="panchayats")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    elevation = Column(Float, nullable=True)
    soil_type = Column(String(100), nullable=True)

class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    block_id = Column(String(36), ForeignKey("blocks.id"), index=True)
    forecast_date = Column(DateTime, index=True)
    temperature_c = Column(Float)
    rainfall_mm = Column(Float)
    humidity_percent = Column(Float)
    wind_speed_kmh = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class DownscaledWeather(Base):
    __tablename__ = "downscaled_weather"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    panchayat_id = Column(String(36), ForeignKey("panchayats.id"), index=True)
    forecast_date = Column(DateTime, index=True)
    temperature_c = Column(Float)
    rainfall_mm = Column(Float)
    humidity_percent = Column(Float)
    wind_speed_kmh = Column(Float)
    soil_moisture_estimate = Column(Float)
    confidence_score = Column(Float)
    model_version = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

class Crop(Base):
    __tablename__ = "crops"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100))
    description = Column(Text)

class Advisory(Base):
    __tablename__ = "advisories"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    panchayat_id = Column(String(36), ForeignKey("panchayats.id"), index=True)
    crop_id = Column(String(36), ForeignKey("crops.id"))
    risk_level = Column(String(20))
    reason = Column(String(255))
    recommended_action = Column(Text)
    valid_until = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
