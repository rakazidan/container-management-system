# 🚀 Panduan Deployment Gratis (Tanpa Kartu Kredit)

## 📋 Platform yang Digunakan

| Komponen | Platform | Limit Gratis |
|----------|----------|--------------|
| **Database** | Neon | PostgreSQL 512MB + 3GB storage |
| **Backend** | Replit | Unlimited public projects |
| **Frontend** | Vercel | Unlimited projects, 100GB bandwidth |

---

## 1️⃣ DATABASE - Deploy ke Neon

### Langkah-langkah:

1. **Daftar di Neon**
   - Buka https://neon.tech
   - Klik "Sign Up" → pilih "Continue with GitHub" atau "Continue with Google"
   - Tidak perlu kartu kredit!

2. **Buat Database**
   - Klik "Create Project"
   - Project Name: `container-management`
   - PostgreSQL Version: pilih `16` (latest)
   - Region: pilih yang terdekat (Singapore)
   - Klik "Create Project"

3. **Dapatkan Connection String**
   - Setelah project dibuat, klik "Connection string"
   - Copy connection string yang terlihat seperti:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
   - **SIMPAN INI** - akan digunakan di backend!

4. **Setup Database Schema**
   - Di dashboard Neon, klik "SQL Editor"
   - Copy-paste isi file `backend/migrations/001_create_tables.sql`
   - Klik "Run"
   - Kemudian copy-paste `002_seed_data.sql` → Run
   - Kemudian copy-paste `003_create_yard_config.sql` → Run

✅ **Database selesai!**

---

## 2️⃣ BACKEND - Deploy ke Replit

### Langkah-langkah:

1. **Daftar di Replit**
   - Buka https://replit.com
   - Klik "Sign Up" → pilih "Continue with GitHub" atau "Continue with Google"
   - Gratis tanpa kartu kredit!

2. **Buat Repl Baru**
   - Klik tombol "+ Create" atau "+ Create Repl"
   - Template: pilih "Python"
   - Title: `container-backend`
   - Visibility: **Public** (agar gratis selamanya)
   - Klik "Create Repl"

3. **Upload File Backend**
   - Di Replit, klik icon "Upload file" atau drag & drop folder `backend` ke Replit
   - Pastikan struktur folder:
   ```
   backend/
   ├── app/
   ├── migrations/
   ├── requirements.txt
   ├── run.py
   └── .env
   ```

4. **Setup Environment Variables**
   - Klik icon 🔒 "Secrets" di sidebar kiri (atau Tools → Secrets)
   - Tambahkan environment variables berikut:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (paste connection string dari Neon) |
   | `CORS_ORIGINS` | `https://your-vercel-app.vercel.app` (akan diupdate nanti) |
   | `NODE_ENV` | `production` |
   | `PORT` | `8001` |

5. **Konfigurasi Replit**
   - Edit file `.replit` di root, isi dengan:
   ```toml
   run = "cd backend && python run.py"
   
   [nix]
   channel = "stable-22_11"
   
   [deployment]
   run = ["sh", "-c", "cd backend && python run.py"]
   ```

6. **Install Dependencies & Run**
   - Klik tombol "Run" di atas
   - Replit akan otomatis install dependencies dari `requirements.txt`
   - Tunggu sampai muncul output: `Uvicorn running on http://0.0.0.0:8001`

7. **Dapatkan URL Backend**
   - Setelah running, Replit akan generate URL seperti:
   ```
   https://container-backend.username.repl.co
   ```
   - **SIMPAN URL INI** - akan digunakan di frontend!
   - Test dengan buka: `https://container-backend.username.repl.co/docs`

✅ **Backend selesai!**

---

## 3️⃣ FRONTEND - Deploy ke Vercel

### Langkah-langkah:

1. **Push ke GitHub (jika belum)**
   - Buat repository baru di GitHub
   - Push project Anda:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/container-management.git
   git push -u origin main
   ```

2. **Daftar di Vercel**
   - Buka https://vercel.com
   - Klik "Sign Up" → pilih "Continue with GitHub"
   - Authorize Vercel untuk akses GitHub Anda
   - Gratis tanpa kartu kredit!

3. **Import Project**
   - Di dashboard Vercel, klik "Add New" → "Project"
   - Pilih repository `container-management`
   - Klik "Import"

4. **Configure Project**
   - Framework Preset: Vercel akan auto-detect **Vite**
   - Root Directory: klik "Edit" → pilih `frontend`
   - Build Command: `npm run build` (sudah default)
   - Output Directory: `dist` (sudah default)

5. **Environment Variables**
   - Klik "Environment Variables"
   - Tambahkan:
   
   | Name | Value |
   |------|-------|
   | `VITE_API_BASE_URL` | (paste URL backend dari Replit) |
   
   Example: `https://container-backend.username.repl.co`

6. **Deploy**
   - Klik "Deploy"
   - Tunggu 2-3 menit
   - Setelah selesai, Anda akan dapat URL seperti:
   ```
   https://container-management-username.vercel.app
   ```

7. **Update CORS di Backend**
   - Kembali ke Replit
   - Edit Secrets → `CORS_ORIGINS`
   - Tambahkan URL Vercel Anda:
   ```
   https://container-management-username.vercel.app,http://localhost:5173
   ```
   - Restart backend (klik Stop lalu Run lagi)

✅ **Frontend selesai!**

---

## 4️⃣ Update API Configuration

Update file `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export const api = {
  baseURL: API_BASE_URL,
  // ... rest of your code
};
```

---

## ✅ Verifikasi Deployment

### Test Backend:
```bash
# Test health check
curl https://container-backend.username.repl.co/api/v1/dashboard/stats

# Test docs
# Buka di browser: https://container-backend.username.repl.co/docs
```

### Test Frontend:
1. Buka URL Vercel Anda di browser
2. Navigasi ke halaman Dashboard
3. Pastikan data muncul (artinya frontend berhasil connect ke backend)
4. Test halaman Monitoring dan GPS Tracking

---

## 🎯 Alternatif Platform (Jika Ada Masalah)

### Alternatif 1: Database
- **Supabase** (https://supabase.com)
  - Gratis 500MB PostgreSQL
  - Sign up dengan GitHub
  - Buat project baru
  - Copy connection string dari Settings → Database

### Alternatif 2: Backend
- **PythonAnywhere** (https://www.pythonanywhere.com)
  - Gratis 1 web app
  - Support FastAPI dengan setup manual
  - Tutorial lengkap: https://help.pythonanywhere.com/pages/FastAPIWebApp/

### Alternatif 3: Frontend
- **Netlify** (https://netlify.com)
  - Gratis unlimited projects
  - Hampir sama dengan Vercel
  - Drag & drop folder `dist` setelah build

---

## 🔧 Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan DATABASE_URL sudah benar di Replit Secrets
- Pastikan ada `?sslmode=require` di akhir connection string
- Check logs di Replit console

### Frontend tidak bisa fetch data
- Pastikan CORS_ORIGINS di backend sudah include URL Vercel
- Check Network tab di browser DevTools
- Pastikan VITE_API_BASE_URL sudah benar

### Replit app mati setelah beberapa menit
- Replit free tier akan sleep setelah tidak ada activity
- Solusi: gunakan UptimeRobot (https://uptimerobot.com) untuk ping setiap 5 menit (gratis)
- Atau upgrade ke PythonAnywhere yang always-on

---

## 📝 Catatan Penting

1. **Replit Free Tier Limitations:**
   - App akan sleep setelah 1 jam tidak ada traffic
   - Gunakan UptimeRobot untuk keep-alive
   - Atau gunakan PythonAnywhere sebagai alternatif

2. **Neon Free Tier Limitations:**
   - 512MB RAM
   - 3GB storage
   - Project akan suspend setelah 7 hari tidak ada activity
   - Cukup untuk development dan testing

3. **Vercel Free Tier Limitations:**
   - 100GB bandwidth per bulan
   - Unlimited projects
   - Tidak ada batasan waktu

4. **Backup Rutin:**
   - Export database dari Neon secara berkala
   - Simpan backup di GitHub atau Google Drive

---

## 🎉 Selesai!

Sekarang aplikasi Anda sudah live di internet dan bisa diakses dari mana saja!

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.username.repl.co
- **Database**: Neon (managed PostgreSQL)
- **Total Biaya**: Rp 0,- (100% GRATIS)

Jika ada pertanyaan atau kendala, silakan tanya! 🚀
