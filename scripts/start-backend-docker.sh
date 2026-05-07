#!/bin/bash

echo "🚀 Starting RAG Backend (Docker with Existing DB)"
echo "=================================================="
echo ""

# Check if PostgreSQL port is accessible
if ! nc -z localhost 5432 2>/dev/null; then
    echo "❌ PostgreSQL not accessible on port 5432"
    echo "   Make sure your postgres-db container is running:"
    echo "   docker start postgres-db"
    exit 1
fi

# Check if Redis port is accessible
if ! nc -z localhost 6379 2>/dev/null; then
    echo "❌ Redis not accessible on port 6379"
    echo "   Make sure your redis container is running:"
    echo "   docker start redis"
    exit 1
fi

echo "✓ PostgreSQL detected on port 5432"
echo "✓ Redis detected on port 6379"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

echo "Starting backend and celery worker in Docker..."
echo "They will connect to your existing PostgreSQL and Redis"
echo ""

# Use the alternative docker-compose file
docker compose -f docker-compose-local-db.yml up backend celery_worker

echo ""
echo "Backend stopped."
