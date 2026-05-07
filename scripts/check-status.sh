#!/bin/bash

echo "🔍 RAG Pipeline Status Check"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Frontend (3000)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend: Running on port 3000"
else
    echo -e "${RED}✗${NC} Frontend: NOT running on port 3000"
    echo "  Start with: cd frontend && npm run dev"
fi

# Check Backend (8000)
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend: Running on port 8000"
    # Test API
    if curl -s http://localhost:8000/docs >/dev/null 2>&1; then
        echo "  API is responding ✓"
    fi
else
    echo -e "${RED}✗${NC} Backend: NOT running on port 8000"
    echo "  Start with: ./scripts/start-backend-local.sh"
fi

# Check PostgreSQL (5432)
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL: Running on port 5432"
else
    echo -e "${RED}✗${NC} PostgreSQL: NOT running on port 5432"
fi

# Check Redis (6379)
if lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Redis: Running on port 6379"
else
    echo -e "${RED}✗${NC} Redis: NOT running on port 6379"
fi

echo ""
echo "============================"

# Overall status
FRONTEND=$(lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "1" || echo "0")
BACKEND=$(lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "1" || echo "0")
POSTGRES=$(lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "1" || echo "0")
REDIS=$(lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "1" || echo "0")

if [ "$FRONTEND" = "1" ] && [ "$BACKEND" = "1" ] && [ "$POSTGRES" = "1" ] && [ "$REDIS" = "1" ]; then
    echo -e "${GREEN}✓ All services running!${NC}"
    echo ""
    echo "Access the app:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
elif [ "$BACKEND" = "0" ]; then
    echo -e "${RED}⚠ Backend is not running!${NC}"
    echo ""
    echo "This causes 'Network Error' when uploading files."
    echo ""
    echo "Quick fix:"
    echo "  ./scripts/start-backend-local.sh"
else
    echo -e "${YELLOW}⚠ Some services are not running${NC}"
fi

echo ""
