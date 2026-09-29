import os
import random
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base, User, State, District, Block, Panchayat, WeatherForecast, Crop, Advisory

# Force database URL for script
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://kisanuser:kisanpass@localhost:3306/kisan-saarthi")
print(f"Connecting to database: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    db = SessionLocal()
    
    # 1. Create Tables
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # Check if data exists
    if db.query(State).first():
        print("Data already seeded. Skipping.")
        return

    # 2. Create Geography Hierarchy
    print("Seeding geography...")
    maharashtra = State(name="Maharashtra")
    db.add(maharashtra)
    db.commit()

    pune_dist = District(name="Pune", state_id=maharashtra.id)
    db.add(pune_dist)
    db.commit()

    haveli_block = Block(name="Haveli", district_id=pune_dist.id)
    db.add(haveli_block)
    db.commit()

    # Create 10 Panchayats in Haveli block
    panchayats_data = [
        {"name": "Uruli Kanchan", "lat": 18.4900, "lng": 74.0500},
        {"name": "Kunjirwadi", "lat": 18.5100, "lng": 74.0100},
        {"name": "Theur", "lat": 18.5200, "lng": 74.0400},
        {"name": "Naigaon", "lat": 18.5300, "lng": 74.0600},
        {"name": "Kolawadi", "lat": 18.5400, "lng": 74.0700},
        {"name": "Alandi Mhatobachi", "lat": 18.4800, "lng": 74.0300},
        {"name": "Sortapwadi", "lat": 18.4700, "lng": 74.0400},
        {"name": "Bori Bhadak", "lat": 18.4600, "lng": 74.0500},
        {"name": "Khamgaon Tek", "lat": 18.4500, "lng": 74.0600},
        {"name": "Shindawane", "lat": 18.4400, "lng": 74.0700},
    ]

    panchayat_objs = []
    for p in panchayats_data:
        obj = Panchayat(
            name=p["name"],
            block_id=haveli_block.id,
            latitude=p["lat"],
            longitude=p["lng"],
            elevation=random.randint(550, 650),
            soil_type=random.choice(["Black Cotton", "Red", "Alluvial"])
        )
        db.add(obj)
        panchayat_objs.append(obj)
    
    db.commit()

    # 3. Create Crops
    print("Seeding crops...")
    soybean = Crop(name="Soybean", description="Kharif crop, requires well-drained soil.")
    wheat = Crop(name="Wheat", description="Rabi crop, requires cool climate.")
    db.add_all([soybean, wheat])
    db.commit()

    # 4. Create Users
    print("Seeding users...")
    demo_password = os.getenv("DEMO_PASSWORD", "demo123")
    hashed_pw = get_password_hash(demo_password)

    users = [
        User(email="farmer@example.com", name="Ramesh Farmer", hashed_password=hashed_pw, role="FARMER", panchayat_id=panchayat_objs[0].id),
        User(email="officer@example.com", name="Priya Officer", hashed_password=hashed_pw, role="OFFICER"),
        User(email="admin@example.com", name="Admin System", hashed_password=hashed_pw, role="ADMIN"),
        User(email="operator@example.com", name="Data Operator", hashed_password=hashed_pw, role="OPERATOR"),
    ]
    db.add_all(users)
    db.commit()

    # 5. Create Block-Level Weather Forecasts
    print("Seeding weather forecasts...")
    base_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    for i in range(7):
        forecast_date = base_date + timedelta(days=i)
        forecast = WeatherForecast(
            block_id=haveli_block.id,
            forecast_date=forecast_date,
            temperature_c=round(random.uniform(25.0, 35.0), 1),
            rainfall_mm=round(random.uniform(0.0, 50.0), 1) if random.random() > 0.5 else 0.0,
            humidity_percent=round(random.uniform(40.0, 80.0), 1),
            wind_speed_kmh=round(random.uniform(5.0, 20.0), 1)
        )
        db.add(forecast)
    db.commit()

    print("Demo data seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
