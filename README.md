# KisanMausam — Panchayat-Level Agro-Meteorological Intelligence Platform
## Problem Statement: SIH26074

---

## Tech Stack

| Category         | Technologies |
|------------------|--------------|
| **Frontend**     | React.js, Tailwind CSS, i18next (EN/HI/MR), Vite |
| **Backend**      | Python, FastAPI, SQLAlchemy ORM |
| **Database**     | PostgreSQL |
| **Cache**        | Redis / Valkey |
| **AI / ML**      | Scikit-learn, Pandas, NumPy, Jupyter |
| **Security**     | JWT, OAuth 2.0 (Firebase) |
| **Cloud**        | AWS / Vercel / Google Cloud / Docker-ready |
| **Services**     | Firebase Auth, Twilio SMS, Google Maps API |

---

## Prerequisites

Ensure these are installed on your Arch Linux system:
- `postgresql` — run `sudo pacman -S postgresql`
- `valkey` (Redis-compatible) — run `sudo pacman -S valkey`
- `python3`, `node`, `npm` — already on your system

---

## First-Time Setup (run once)

```bash
chmod +x setup.sh startapp.sh
./setup.sh
```

This will:
1. Install and initialise PostgreSQL
2. Create the `kisanmausam` database and user
3. Start Valkey (Redis)
4. Create a Python virtual environment in `backend/.venv`
5. Install all Python dependencies (FastAPI, SQLAlchemy, Scikit-Learn, etc.)
6. Train the ML downscaling model and save `model.pkl`
7. Seed the database with demo panchayats and weather data
8. Install frontend npm packages

---

## Start the App (every time after setup)

```bash
./startapp.sh
```

| Service          | URL                           |
|------------------|-------------------------------|
| Frontend (Vite)  | http://localhost:5173         |
| Backend (FastAPI)| http://localhost:8000         |
| Swagger Docs     | http://localhost:8000/docs    |

Press **Ctrl+C** to stop all services cleanly.

---

## Configuration (`.env` file)

```
DATABASE_URL=postgresql://kisanuser:kisanpass@localhost:5432/kisanmausam
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=supersecretkisanmausamkey2026
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
TWILIO_ACCOUNT_SID=YOUR_SID
TWILIO_AUTH_TOKEN=YOUR_TOKEN
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

---

## Project Structure

```
sih2/
├── backend/
│   ├── app/
│   │   ├── api/         # FastAPI routers (auth, weather, advisories, geo)
│   │   ├── core/        # Redis cache module
│   │   ├── ml/          # Scikit-Learn downscaling engine + training script
│   │   ├── services/    # Twilio SMS service
│   │   ├── models.py    # SQLAlchemy ORM models
│   │   ├── database.py  # PostgreSQL connection
│   │   └── main.py      # FastAPI app entrypoint
│   ├── notebooks/       # Jupyter notebooks for ML exploration
│   ├── seed_demo_data.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── maps/        # Google Maps component
│   │   ├── pages/       # LandingPage, FarmerDashboard, OfficerDashboard
│   │   ├── services/    # Axios API layer
│   │   └── i18n.ts      # Translations (EN/HI/MR)
│   └── package.json
├── setup.sh             # First-time setup (run once)
└── startapp.sh          # Start all services natively
```
