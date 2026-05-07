#!/bin/bash

echo "🔧 Fix Docker DNS Configuration"
echo "================================"
echo ""
echo "This will configure Docker to use Google and Cloudflare DNS servers."
echo "This should fix the 'Temporary failure resolving deb.debian.org' error."
echo ""
echo "You will need sudo access."
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Backup existing config
if [ -f /etc/docker/daemon.json ]; then
    echo "Backing up existing config..."
    sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup
fi

# Create new config
echo "Creating Docker DNS configuration..."
echo '{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}' | sudo tee /etc/docker/daemon.json

echo ""
echo "✓ Configuration written"
echo ""
echo "Restarting Docker..."
sudo systemctl restart docker

echo ""
echo "Waiting for Docker to start..."
sleep 5

echo ""
echo "✓ Docker restarted"
echo ""
echo "Testing Docker DNS..."
docker run --rm alpine ping -c 2 google.com

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Docker DNS is now working!"
    echo ""
    echo "Now you can build the backend:"
    echo "  cd /home/vivekkumar/Desktop/RAG_Pipeline"
    echo "  docker compose build backend"
    echo "  ./scripts/setup-database.sh"
    echo "  ./scripts/start-backend-docker.sh"
else
    echo ""
    echo "⚠️  Docker DNS still has issues"
    echo "Try restarting your computer, then run the build again."
fi
