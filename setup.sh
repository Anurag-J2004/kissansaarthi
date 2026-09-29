#!/bin/bash
# ============================================================
# KisanMausam — First-Time Setup Script (Arch Linux / native)
# Uses: MariaDB + Valkey (Redis) + Python venv + npm
# Run once before starting the app for the first time.
# ============================================================

set -e
cd "$(dirname "$0")"

echo "============================================="
echo "🌱 KisanMausam — First-Time Setup"
echo "============================================="

# -----------------------------------------------------------
# 1. Start MariaDB
# -----------------------------------------------------------
echo "🚀 Starting MariaDB..."
sudo systemctl start mariadb
sleep 2
echo "✅ MariaDB running."

# -----------------------------------------------------------
# 2. Create database and user
# -----------------------------------------------------------
echo "🗄️  Creating database and user..."
sudo mariadb -u root <<SQL
CREATE DATABASE IF NOT EXISTS kisanmausam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'kisanuser'@'localhost' IDENTIFIED BY 'kisanpass';
GRANT ALL PRIVILEGES ON kisanmausam.* TO 'kisanuser'@'localhost';
FLUSH PRIVILEGES;
SQL
echo "✅ Database 'kisanmausam' ready."

# -----------------------------------------------------------
# 3. Start Valkey (Redis-compatible)
# -----------------------------------------------------------
echo "🚀 Starting Valkey (Redis)..."
sudo systemctl start valkey
echo "✅ Valkey ready."

# -----------------------------------------------------------
# 4. Create Python virtual environment
# -----------------------------------------------------------
echo "🐍 Setting up Python virtual environment..."
python3 -m venv backend/.venv
backend/.venv/bin/pip install --upgrade pip --quiet
backend/.venv/bin/pip install \
  fastapi uvicorn sqlalchemy pymysql cryptography \
  redis pydantic pydantic-settings \
  python-jose passlib bcrypt python-multipart \
  scikit-learn pandas numpy joblib \
  twilio firebase-admin \
  --quiet
echo "✅ Python venv ready."

# -----------------------------------------------------------
# 5. Write .env file
# -----------------------------------------------------------
cat > .env <<EOF
DATABASE_URL=mysql+pymysql://kisanuser:kisanpass@localhost:3306/kisanmausam
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=supersecretkisanmausamkey2026
DEMO_PASSWORD=demo123

# --- Fill these in when you have real API keys ---
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
TWILIO_ACCOUNT_SID=mock_sid
TWILIO_AUTH_TOKEN=mock_token
TWILIO_PHONE_NUMBER=+1234567890
FIREBASE_CREDENTIALS_PATH=
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
EOF
echo "✅ .env file written."

# -----------------------------------------------------------
# 6. Train the ML model
# -----------------------------------------------------------
echo "🤖 Training Scikit-Learn downscaling model..."
PYTHONPATH=backend backend/.venv/bin/python backend/app/ml/train_model.py
echo "✅ model.pkl saved."

# -----------------------------------------------------------
# 7. Seed the database
# -----------------------------------------------------------
echo "📥 Seeding demo data..."
DATABASE_URL=mysql+pymysql://kisanuser:kisanpass@localhost:3306/kisanmausam \
  PYTHONPATH=backend backend/.venv/bin/python backend/seed_demo_data.py
echo "✅ Database seeded."

# -----------------------------------------------------------
# 8. Install frontend packages
# -----------------------------------------------------------
echo "📦 Installing frontend npm packages..."
cd frontend && npm install --silent
cd ..
echo "✅ Frontend packages installed."

echo ""
echo "============================================="
echo "✅ Setup complete! Now run: ./startapp.sh"
echo "============================================="
