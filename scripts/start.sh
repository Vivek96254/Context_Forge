#!/bin/bash

echo "🚀 Starting RAG Pipeline"
echo "======================="
echo ""

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Initialize database tables (creates users table if needed)
echo "🗄️  Initializing database tables..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

"${SCRIPT_DIR}/init-tables.sh" > /dev/null 2>&1

# Start backend in Docker (detached)
echo "🔧 Starting backend services in Docker..."
docker compose -f "${REPO_ROOT}/docker-compose-local-db.yml" up -d backend celery_worker

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start. Check logs:"
        echo "   docker compose -f docker-compose-local-db.yml logs backend"
        exit 1
    fi
    sleep 1
done

# Start frontend in current terminal
echo ""
echo "🌐 Starting frontend on http://localhost:3000"
echo ""
echo "Services:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd frontend && npm run dev
