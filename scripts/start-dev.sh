#!/bin/bash

echo "🚀 Starting Enterprise Knowledge Assistant"
echo "=========================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Check if .env exists
if [ ! -f "${REPO_ROOT}/.env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Create one from .env.example with your API keys"
    echo ""
fi

echo "1️⃣  Starting backend services (Docker)..."
echo "   - PostgreSQL"
echo "   - Redis"
echo "   - FastAPI Backend"
echo "   - Celery Worker"
echo ""

# Start backend services in background
docker compose -f "${REPO_ROOT}/docker-compose.yml" up -d backend postgres redis celery_worker

echo "⏳ Waiting for backend to be ready..."
sleep 5

# Check if backend is up
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
else
    echo "⚠️  Backend may still be starting up..."
fi

echo ""
echo "2️⃣  Starting frontend (Local Development)..."
echo ""

# Start frontend in foreground
cd "${REPO_ROOT}/frontend" && npm run dev
