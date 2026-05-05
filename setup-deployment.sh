#!/bin/bash

# Script untuk update environment variables setelah deployment

echo "🔧 Configuration Update Script"
echo "================================"
echo ""
echo "Setelah Anda deploy backend dan frontend, jalankan script ini untuk update konfigurasi."
echo ""

# Prompt for Backend URL
echo "1️⃣ Masukkan URL Backend Anda dari Replit:"
echo "   Contoh: https://container-backend.username.repl.co"
read -p "Backend URL: " BACKEND_URL

# Prompt for Frontend URL
echo ""
echo "2️⃣ Masukkan URL Frontend Anda dari Vercel:"
echo "   Contoh: https://container-management.vercel.app"
read -p "Frontend URL: " FRONTEND_URL

# Create .env file for frontend
echo ""
echo "📝 Membuat file .env.production untuk frontend..."
cat > frontend/.env.production << EOF
VITE_API_BASE_URL=${BACKEND_URL}/api/v1
EOF

echo "✅ File frontend/.env.production sudah dibuat!"
echo ""

# Create .env file for backend
echo "📝 Membuat file .env untuk backend..."
echo ""
echo "⚠️  PENTING: Masukkan Database Connection String dari Neon:"
echo "   Contoh: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
read -p "Database URL: " DATABASE_URL

cat > backend/.env << EOF
# Server
PORT=8001
NODE_ENV=production

# Database
DATABASE_URL=${DATABASE_URL}

# CORS
CORS_ORIGINS=${FRONTEND_URL},http://localhost:5173,http://localhost:4173

# OCR Service (optional - bisa dikosongkan jika tidak digunakan)
OCR_SERVICE_URL=http://localhost:8000
EOF

echo "✅ File backend/.env sudah dibuat!"
echo ""

echo "🎉 Konfigurasi selesai!"
echo ""
echo "📋 Langkah selanjutnya:"
echo ""
echo "UNTUK BACKEND (Replit):"
echo "1. Buka Replit → Tools → Secrets"
echo "2. Tambahkan environment variables:"
echo "   - DATABASE_URL: ${DATABASE_URL}"
echo "   - CORS_ORIGINS: ${FRONTEND_URL},http://localhost:5173"
echo "   - NODE_ENV: production"
echo "   - PORT: 8001"
echo ""
echo "UNTUK FRONTEND (Vercel):"
echo "1. Buka dashboard Vercel → Project Settings → Environment Variables"
echo "2. Tambahkan:"
echo "   - VITE_API_BASE_URL: ${BACKEND_URL}/api/v1"
echo "3. Redeploy project (Settings → Redeploy)"
echo ""
echo "✅ Setelah itu, aplikasi Anda siap digunakan!"
