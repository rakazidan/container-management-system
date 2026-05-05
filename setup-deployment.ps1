# Configuration Update Script untuk Windows
# Jalankan dengan: .\setup-deployment.ps1

Write-Host "🔧 Configuration Update Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Setelah Anda deploy backend dan frontend, jalankan script ini untuk update konfigurasi." -ForegroundColor Yellow
Write-Host ""

# Prompt for Backend URL
Write-Host "1️⃣ Masukkan URL Backend Anda dari Replit:" -ForegroundColor Green
Write-Host "   Contoh: https://container-backend.username.repl.co" -ForegroundColor Gray
$BACKEND_URL = Read-Host "Backend URL"

# Prompt for Frontend URL
Write-Host ""
Write-Host "2️⃣ Masukkan URL Frontend Anda dari Vercel:" -ForegroundColor Green
Write-Host "   Contoh: https://container-management.vercel.app" -ForegroundColor Gray
$FRONTEND_URL = Read-Host "Frontend URL"

# Create .env file for frontend
Write-Host ""
Write-Host "📝 Membuat file .env.production untuk frontend..." -ForegroundColor Cyan
$frontendEnvContent = @"
VITE_API_BASE_URL=$BACKEND_URL/api/v1
"@

$frontendEnvContent | Out-File -FilePath "frontend\.env.production" -Encoding UTF8
Write-Host "✅ File frontend\.env.production sudah dibuat!" -ForegroundColor Green
Write-Host ""

# Create .env file for backend
Write-Host "📝 Membuat file .env untuk backend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  PENTING: Masukkan Database Connection String dari Neon:" -ForegroundColor Yellow
Write-Host "   Contoh: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require" -ForegroundColor Gray
$DATABASE_URL = Read-Host "Database URL"

$backendEnvContent = @"
# Server
PORT=8001
NODE_ENV=production

# Database
DATABASE_URL=$DATABASE_URL

# CORS
CORS_ORIGINS=$FRONTEND_URL,http://localhost:5173,http://localhost:4173

# OCR Service (optional - bisa dikosongkan jika tidak digunakan)
OCR_SERVICE_URL=http://localhost:8000
"@

$backendEnvContent | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Host "✅ File backend\.env sudah dibuat!" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Konfigurasi selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host ""
Write-Host "UNTUK BACKEND (Replit):" -ForegroundColor Yellow
Write-Host "1. Buka Replit → Tools → Secrets"
Write-Host "2. Tambahkan environment variables:"
Write-Host "   - DATABASE_URL: $DATABASE_URL" -ForegroundColor Gray
Write-Host "   - CORS_ORIGINS: $FRONTEND_URL,http://localhost:5173" -ForegroundColor Gray
Write-Host "   - NODE_ENV: production" -ForegroundColor Gray
Write-Host "   - PORT: 8001" -ForegroundColor Gray
Write-Host ""
Write-Host "UNTUK FRONTEND (Vercel):" -ForegroundColor Yellow
Write-Host "1. Buka dashboard Vercel → Project Settings → Environment Variables"
Write-Host "2. Tambahkan:"
Write-Host "   - VITE_API_BASE_URL: $BACKEND_URL/api/v1" -ForegroundColor Gray
Write-Host "3. Redeploy project (Settings → Redeploy)"
Write-Host ""
Write-Host "✅ Setelah itu, aplikasi Anda siap digunakan!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Dokumentasi lengkap ada di:" -ForegroundColor Cyan
Write-Host "   - QUICKSTART.md - Panduan cepat 15 menit"
Write-Host "   - DEPLOYMENT_GUIDE.md - Panduan detail"
Write-Host "   - TROUBLESHOOTING.md - Solusi masalah umum"
Write-Host ""

# Pause
Read-Host "Tekan Enter untuk keluar"
