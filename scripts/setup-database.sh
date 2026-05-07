#!/bin/bash

echo "🔧 Setting up RAG Database in Existing PostgreSQL"
echo "=================================================="
echo ""

# Check if PostgreSQL is accessible
if ! nc -z localhost 5432 2>/dev/null; then
    echo "❌ PostgreSQL not accessible on port 5432"
    exit 1
fi

echo "Creating RAG database and user..."
echo ""

# Connect to existing PostgreSQL and create our database/user
docker exec -it postgres-db psql -U omniful -d omniful << 'EOF'
-- Create user if not exists
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'rag_user') THEN
      CREATE USER rag_user WITH PASSWORD 'rag_password';
   END IF;
END
$$;

-- Create database if not exists
SELECT 'CREATE DATABASE rag_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rag_db')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rag_db TO rag_user;

\c rag_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rag_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rag_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rag_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rag_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rag_user;

\q
EOF

echo ""
echo "✓ Database setup complete!"
echo ""
echo "Database credentials:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: rag_db"
echo "  User: rag_user"
echo "  Password: rag_password"
echo ""
echo "Now run: ./scripts/start-backend-local.sh"
