#!/bin/bash

echo "🚀 Testing Enterprise Knowledge Assistant Setup"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "1. Checking Backend API..."
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is running${NC}"
else
    echo -e "${RED}✗ Backend API is not accessible${NC}"
    echo "  Start it with: docker-compose up backend"
    exit 1
fi

# Check if frontend is running
echo ""
echo "2. Checking Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠ Frontend is not running${NC}"
    echo "  Start it with: cd frontend && npm run dev"
    echo "  Or: docker-compose up frontend"
fi

# Test health endpoints
echo ""
echo "3. Testing API Endpoints..."

# Test metrics endpoint
if curl -s http://localhost:8000/metrics/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Metrics endpoint works${NC}"
else
    echo -e "${RED}✗ Metrics endpoint failed${NC}"
fi

# Test documents endpoint
if curl -s http://localhost:8000/documents/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Documents endpoint works${NC}"
else
    echo -e "${RED}✗ Documents endpoint failed${NC}"
fi

echo ""
echo "================================================"
echo "✅ Setup verification complete!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
