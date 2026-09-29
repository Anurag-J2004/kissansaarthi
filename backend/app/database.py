import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Supports both MariaDB (local) and PostgreSQL (Render/Railway/Supabase)
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://kisanuser:kisanpass@localhost:3306/kisan-saarthi")

# Railway/Render give postgres:// URLs — SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Choose driver based on URL scheme
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
