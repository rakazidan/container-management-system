#!/bin/bash

# Container Management System - Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect docker-compose command (v1 vs v2)
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: Docker Compose not found!"
    echo "Please install Docker Compose first."
    exit 1
fi

echo "ℹ️  Using: $DOCKER_COMPOSE"

# Stop and remove existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
$DOCKER_COMPOSE down 2>/dev/null || true

# Remove old images (optional - uncomment if you want to clean old builds)
# docker image prune -f

# Build and start containers
echo -e "${BLUE}Building Docker image...${NC}"
$DOCKER_COMPOSE build --no-cache

echo -e "${BLUE}Starting containers...${NC}"
$DOCKER_COMPOSE up -d

# Wait for container to be healthy
echo -e "${BLUE}Waiting for application to be ready...${NC}"
sleep 5

# Check if container is running
if [ "$(docker ps -q -f name=container-management-frontend)" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR-EC2-IP")
    echo -e "${GREEN}Application is running at: http://$PUBLIC_IP${NC}"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: $DOCKER_COMPOSE logs -f"
    echo "  - Stop app: $DOCKER_COMPOSE down"
    echo "  - Restart: $DOCKER_COMPOSE restart"
else
    echo "❌ Deployment failed. Check logs with: $DOCKER_COMPOSE logs"
    exit 1
fi
