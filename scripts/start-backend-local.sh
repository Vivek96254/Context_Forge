#!/bin/bash

echo "🚀 Starting RAG Backend (Local Mode)"
echo "===================================="
echo ""

# Check if PostgreSQL port is accessible (regardless of how it's running)
if nc -z localhost 5432 2>/dev/null; then
    echo "✓ PostgreSQL detected on port 5432"
else
    echo "❌ PostgreSQL not accessible on port 5432"
    echo "   Start PostgreSQL first"
    exit 1
fi

# Check if Redis port is accessible
if nc -z localhost 6379 2>/dev/null; then
    echo "✓ Redis detected on port 6379"
else
    echo "❌ Redis not accessible on port 6379"
    echo "   Start Redis first"
    exit 1
fi

echo ""
echo "Setting up environment..."

# Ensure .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Export environment variables
export DATABASE_URL="postgresql://rag_user:rag_password@localhost:5432/rag_db"
export REDIS_URL="redis://localhost:6379/0"
export $(cat .env | grep -v '^#' | xargs)

echo "✓ Environment loaded"
echo ""

# Install dependencies using system pip or user pip
echo "Installing dependencies..."
echo "(This may take a few minutes on first run)"
echo ""

# Try to install with pip3 (user install if needed)
pip3 install -r requirements.txt --user --upgrade 2>&1 | grep -E "(Successfully|Requirement already|ERROR)" || true

echo ""
echo "✓ Dependencies installation attempted"
echo ""

# Create database if it doesn't exist
echo "Setting up database..."
PGPASSWORD=rag_password psql -h localhost -U rag_user -d postgres -c "CREATE DATABASE rag_db;" 2>/dev/null || echo "  Database already exists"

# Run migrations
echo "Running migrations..."
python3 -c "
import sys
sys.path.insert(0, 'backend')
from app.db.base import Base
from app.db.session import engine
Base.metadata.create_all(bind=engine)
print('✓ Database tables created')
" || echo "⚠️  Could not create tables, will retry when backend starts"

echo ""
echo "🚀 Starting FastAPI backend..."
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
