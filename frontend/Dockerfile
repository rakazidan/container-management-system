# Build stage
# Auto-detects ARM64 (t4g) or AMD64 (t2) based on host architecture
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# URL backend Railway (di-bake oleh Vite saat build)
ARG VITE_API_BASE_URL=https://container-management-system-production.up.railway.app/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source code
COPY . .

# Build production app
RUN npm run build

# Production stage
# Auto-detects ARM64 (t4g) or AMD64 (t2) based on host architecture
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
