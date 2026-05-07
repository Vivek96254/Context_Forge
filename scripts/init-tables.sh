#!/bin/bash

echo "🔧 Initializing RAG Database Tables"
echo "===================================="
echo ""

# Create users table and default user
docker exec postgres-db psql -U rag_user -d rag_db << 'EOF'
-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    role VARCHAR DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert default user for development
INSERT INTO users (id, email, username, hashed_password, full_name, role, is_active)
VALUES (1, 'admin@example.com', 'admin', 'hashed_password_placeholder', 'Admin User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Ensure sequence is correct
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

-- Show what we created
\echo ''
\echo 'Tables created:'
\dt
\echo ''
\echo 'Users:'
SELECT id, username, email, role FROM users;
EOF

echo ""
echo "✅ Database tables initialized!"
echo ""
echo "Default user:"
echo "  Username: admin"
echo "  Email: admin@example.com"
echo ""
