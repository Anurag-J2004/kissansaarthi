from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base

from .api import auth, geography, weather, advisories, users

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kisan Saarthi API",
    description="Backend for Panchayat-Level Agro-Meteorological Intelligence Platform",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",           # Vercel frontend
        "https://kisan-saarthi.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(geography.router, prefix="/api/v1")
app.include_router(weather.router, prefix="/api/v1")
app.include_router(advisories.router, prefix="/api/v1")
