#!/bin/bash

# Container Management System - Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Stop and remove existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Remove old images (optional - uncomment if you want to clean old builds)
# docker image prune -f

# Build and start containers
echo -e "${BLUE}Building Docker image...${NC}"
docker-compose build --no-cache

echo -e "${BLUE}Starting containers...${NC}"
docker-compose up -d

# Wait for container to be healthy
echo -e "${BLUE}Waiting for application to be ready...${NC}"
sleep 5

# Check if container is running
if [ "$(docker ps -q -f name=container-management-frontend)" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}Application is running at: http://$(curl -s ifconfig.me)${NC}"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop app: docker-compose down"
    echo "  - Restart: docker-compose restart"
else
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi
