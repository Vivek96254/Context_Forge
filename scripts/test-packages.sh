#!/bin/bash

echo "🔍 Quick Backend Test"
echo "===================="
echo ""

cd /home/vivekkumar/Desktop/RAG_Pipeline/backend 2>/dev/null || {
    echo "❌ Backend directory not found"
    exit 1
}

echo "Testing if Python packages are installed..."
python3 -c "import fastapi, uvicorn, sqlalchemy, redis, celery" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! All packages found!"
    echo ""
    echo "You can start the backend now. Run:"
    echo ""
    echo "  cd /home/vivekkumar/Desktop/RAG_Pipeline"
    echo "  ./scripts/setup-database.sh  # Run once"
    echo ""
    echo "Then run this to start backend:"
    echo ""
    echo "  export DATABASE_URL=\"postgresql://rag_user:rag_password@localhost:5432/rag_db\""
    echo "  export REDIS_URL=\"redis://localhost:6379/0\""
    echo "  export CEREBRAS_API_KEY=\"<your_cerebras_api_key>\""
    echo "  export LLM_PROVIDER=\"cerebras\""
    echo "  cd backend"
    echo "  python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    echo ""
else
    echo ""
    echo "❌ Packages NOT found."
    echo ""
    echo "You need to install Python packages first."
    echo "But your system has DNS issues preventing installation."
    echo ""
    echo "Fix DNS for Docker:"
    echo "  sudo mkdir -p /etc/docker"
    echo "  echo '{\"dns\": [\"8.8.8.8\", \"8.8.4.4\"]}' | sudo tee /etc/docker/daemon.json"
    echo "  sudo systemctl restart docker"
    echo ""
    echo "Then try building again:"
    echo "  docker compose build backend"
    echo ""
fi
