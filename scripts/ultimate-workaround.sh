#!/bin/bash

echo "🚀 Ultimate Workaround - Using System Python"
echo "============================================="
echo ""

# Check prerequisites
echo "Checking Ocean infrastructure..."

if ! nc -z localhost 5432 2>/dev/null; then
    echo "❌ PostgreSQL not accessible"
    exit 1
fi

if ! nc -z localhost 6379 2>/dev/null; then
    echo "❌ Redis not accessible"
    exit 1
fi

echo "✓ PostgreSQL accessible"
echo "✓ Redis accessible"
echo ""

# Try to use system Python3 with --user flag
echo "Attempting to install packages with --user flag..."
echo "(This bypasses venv and installs to ~/.local)"
echo ""

pip3 install --user fastapi==0.109.0 uvicorn[standard]==0.27.0 sqlalchemy==2.0.25 \
  psycopg2-binary==2.9.9 redis==5.0.1 celery==5.3.6 pydantic==2.5.3 \
  pydantic-settings==2.1.0 python-dotenv==1.0.0 2>&1 | grep -E "(Successfully|Requirement|ERROR)" | head -20

echo ""
echo "Checking if packages are now available..."

python3 -c "import fastapi, uvicorn, sqlalchemy" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Core packages available!"
    echo ""
    echo "Starting backend..."
    echo ""
    
    export DATABASE_URL="postgresql://rag_user:rag_password@localhost:5432/rag_db"
    export REDIS_URL="redis://localhost:6379/0"
    export $(cat .env | grep -v '^#' | xargs)
    
    cd backend
    python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "❌ Packages still not available"
    echo ""
    echo "Your system has severe network/DNS restrictions."
    echo ""
    echo "Options:"
    echo "1. Contact your network administrator"
    echo "2. Check VPN/proxy settings"
    echo "3. Try from a different network"
    echo "4. Use pre-built Docker images (if available)"
fi
