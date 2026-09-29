#!/bin/bash
# ============================================================
# KisanMausam — Native App Launcher (no Docker)
# Uses: MariaDB + Valkey (Redis) + Python venv + npm
# ============================================================

cd "$(dirname "$0")"

# Load env vars
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "============================================="
echo "🌱 KisanMausam — Starting Services"
echo "============================================="

# -----------------------------------------------------------
# 1. Start MariaDB (if not running)
# -----------------------------------------------------------
if ! systemctl is-active --quiet mariadb; then
  echo "🚀 Starting MariaDB..."
  sudo systemctl start mariadb
  sleep 2
else
  echo "✅ MariaDB already running."
fi

# -----------------------------------------------------------
# 2. Start Valkey / Redis (if not running)
# -----------------------------------------------------------
if ! systemctl is-active --quiet valkey && ! systemctl is-active --quiet redis; then
  echo "🚀 Starting Valkey (Redis)..."
  sudo systemctl start valkey
else
  echo "✅ Valkey already running."
fi

# -----------------------------------------------------------
# 3. Start FastAPI Backend (native uvicorn)
# -----------------------------------------------------------
echo "⚙️  Starting FastAPI backend on http://localhost:8000 ..."
PYTHONPATH=backend \
  backend/.venv/bin/uvicorn app.main:app \
    --host 0.0.0.0 --port 8000 \
    --reload --reload-dir backend/app \
    --log-level info &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Give backend a moment to boot
sleep 2

# -----------------------------------------------------------
# 4. Start React Frontend (Vite dev server)
# -----------------------------------------------------------
echo "🌍 Starting React frontend on http://localhost:5173 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..
echo "   Frontend PID: $FRONTEND_PID"

# -----------------------------------------------------------
# Done
# -----------------------------------------------------------
echo ""
echo "============================================="
echo "✅ KisanMausam is running!"
echo "🌍 Frontend (React/Vite):  http://localhost:5173"
echo "⚙️  Backend (FastAPI):      http://localhost:8000"
echo "📚 Swagger API Docs:       http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."
echo "============================================="

# Graceful shutdown on Ctrl+C
trap "echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
