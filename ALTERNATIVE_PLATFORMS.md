# 🔄 Platform Alternatif untuk Deployment Gratis

Jika Replit atau Vercel bermasalah, berikut alternatif platform gratis tanpa kartu kredit:

---

## 📊 Perbandingan Platform

| Platform | Komponen | Gratis? | Kartu Kredit? | Limit | Rekomendasi |
|----------|----------|---------|---------------|-------|-------------|
| **Neon** | Database | ✅ Yes | ❌ No | 512MB, 3GB storage | ⭐⭐⭐⭐⭐ |
| **Supabase** | Database | ✅ Yes | ❌ No | 500MB, 1GB storage | ⭐⭐⭐⭐ |
| **Replit** | Backend | ✅ Yes | ❌ No | Unlimited (public) | ⭐⭐⭐⭐⭐ |
| **PythonAnywhere** | Backend | ✅ Yes | ❌ No | 1 web app | ⭐⭐⭐⭐ |
| **Vercel** | Frontend | ✅ Yes | ❌ No | 100GB bandwidth | ⭐⭐⭐⭐⭐ |
| **Netlify** | Frontend | ✅ Yes | ❌ No | 100GB bandwidth | ⭐⭐⭐⭐⭐ |
| **Railway** | Full Stack | ❌ Expired | ✅ Yes | $5 free credit | ⭐⭐ |
| **Heroku** | Full Stack | ❌ No Free | ✅ Yes | - | ❌ |
| **Render** | Full Stack | ⚠️ Limited | ✅ Yes | Sleep after 15min | ⭐⭐ |

---

## 1️⃣ Database Alternatif

### Option A: Supabase (PostgreSQL)

**Pros:**
- 500MB database gratis
- Built-in auth & storage
- Real-time subscriptions
- Dashboard yang bagus

**Cons:**
- Sedikit lebih lambat dari Neon
- Storage lebih kecil (1GB vs 3GB)

**Setup:**
1. Daftar di https://supabase.com
2. Create new project
3. Copy connection string dari Settings → Database
4. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

---

### Option B: ElephantSQL (PostgreSQL)

**Pros:**
- 20MB gratis (cukup untuk testing)
- Sangat stabil
- Support bagus

**Cons:**
- Storage sangat terbatas (20MB)
- Hanya 5 concurrent connections

**Setup:**
1. Daftar di https://www.elephantsql.com
2. Create New Instance → Tiny Turtle (Free)
3. Copy URL dari Details

⚠️ **Tidak direkomendasikan** karena storage terlalu kecil untuk production.

---

### Option C: Aiven (PostgreSQL)

**Pros:**
- 1GB storage gratis
- Trial 30 hari tanpa CC
- Production-ready

**Cons:**
- Perlu verifikasi email & phone
- Hanya 1 service free

**Setup:**
1. Daftar di https://aiven.io
2. Create service → PostgreSQL
3. Pilih free tier
4. Copy connection string

---

## 2️⃣ Backend Alternatif

### Option A: PythonAnywhere (Recommended)

**Pros:**
- Gratis 1 web app
- Always-on (tidak sleep)
- Support FastAPI official
- Bash console tersedia

**Cons:**
- Setup sedikit lebih ribet
- Perlu manual setup WSGI

**Setup Lengkap:**

1. **Daftar di PythonAnywhere**
   - https://www.pythonanywhere.com
   - Sign up → pilih Beginner account (Free)

2. **Upload Code**
   - Buka "Files" tab
   - Upload folder `backend` atau clone dari GitHub:
   ```bash
   git clone https://github.com/username/container-management.git
   ```

3. **Setup Virtual Environment**
   - Buka "Consoles" → Start new Bash console
   ```bash
   cd container-management/backend
   python3.10 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure Web App**
   - Buka "Web" tab → Add a new web app
   - Framework: Manual configuration
   - Python version: 3.10
   - Source code: `/home/username/container-management/backend`
   - Working directory: `/home/username/container-management/backend`

5. **Edit WSGI Configuration**
   - Klik link WSGI configuration file
   - Hapus semua, ganti dengan:
   ```python
   import sys
   import os
   
   path = '/home/username/container-management/backend'
   if path not in sys.path:
       sys.path.append(path)
   
   os.environ['DATABASE_URL'] = 'postgresql://...'  # dari Neon
   os.environ['CORS_ORIGINS'] = 'https://your-app.vercel.app'
   os.environ['NODE_ENV'] = 'production'
   
   from app.main import app as application
   ```

6. **Reload Web App**
   - Klik tombol "Reload" di Web tab
   - URL: `https://username.pythonanywhere.com`

---

### Option B: Glitch (Node.js/Python)

**Pros:**
- Gratis unlimited projects
- Auto-deploy dari GitHub
- Web IDE built-in

**Cons:**
- App sleep setelah 5 menit
- Perlu "boost" dari pengunjung

**Setup:**
1. Daftar di https://glitch.com
2. New Project → Import from GitHub
3. Paste URL repo Anda
4. Edit `.env` file dengan secrets
5. Klik "Show" untuk lihat app

---

### Option C: Deta Space (Python)

**Pros:**
- Gratis unlimited apps
- Support FastAPI native
- Tidak sleep

**Cons:**
- Perlu install Deta CLI
- Dokumentasi kurang lengkap

**Setup:**
1. Install Deta CLI:
   ```bash
   curl -fsSL https://get.deta.dev/cli.sh | sh
   ```
2. Login:
   ```bash
   deta login
   ```
3. Deploy:
   ```bash
   cd backend
   deta new --python
   deta deploy
   ```

---

## 3️⃣ Frontend Alternatif

### Option A: Netlify (Recommended)

**Pros:**
- Sama powerful dengan Vercel
- 100GB bandwidth gratis
- Auto-deploy dari Git

**Cons:**
- Dashboard sedikit lebih lambat

**Setup:**
1. Daftar di https://netlify.com
2. Import project dari GitHub
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
4. Environment variables:
   - `VITE_API_BASE_URL`: URL backend Anda

---

### Option B: Cloudflare Pages

**Pros:**
- Unlimited bandwidth & requests
- CDN sangat cepat
- Gratis custom domain

**Cons:**
- Setup sedikit berbeda
- Perlu Cloudflare account

**Setup:**
1. Daftar di https://pages.cloudflare.com
2. Connect to Git → pilih repo
3. Framework preset: Vite
4. Build command: `cd frontend && npm run build`
5. Build output: `frontend/dist`

---

### Option C: GitHub Pages (Static Only)

**Pros:**
- 100% gratis
- Langsung dari GitHub repo
- Unlimited bandwidth

**Cons:**
- Hanya static files (no server-side rendering)
- Perlu manual build & push

**Setup:**
1. Build locally:
   ```bash
   cd frontend
   npm run build
   ```
2. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```
3. Add to package.json:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
4. Deploy:
   ```bash
   npm run deploy
   ```
5. Enable GitHub Pages di repo settings

---

## 🎯 Kombinasi Rekomendasi

### Untuk Development/Testing (Paling Mudah):
```
Database: Neon
Backend: Replit
Frontend: Vercel
⏱️ Setup time: 15 menit
💰 Biaya: Rp 0,-
```

### Untuk Production/Serious Use (Always On):
```
Database: Supabase
Backend: PythonAnywhere
Frontend: Netlify
⏱️ Setup time: 30 menit
💰 Biaya: Rp 0,-
```

### Untuk Portfolio/Demo (Fastest):
```
Database: Neon
Backend: Deta Space
Frontend: Cloudflare Pages
⏱️ Setup time: 20 menit
💰 Biaya: Rp 0,-
```

---

## 🆘 Jika Semua Platform Bermasalah

### Plan B: Self-Hosting Lokal + Ngrok

Jika semua platform cloud bermasalah, Anda bisa expose local server:

1. **Install Ngrok**
   - Download dari https://ngrok.com (gratis)
   - Sign up, copy authtoken

2. **Run Backend Locally**
   ```bash
   cd backend
   uvicorn app.main:app --port 8001
   ```

3. **Expose dengan Ngrok**
   ```bash
   ngrok http 8001
   ```
   Copy URL yang muncul (contoh: `https://abc123.ngrok.io`)

4. **Deploy Frontend ke Vercel**
   - Set `VITE_API_BASE_URL` ke URL ngrok

⚠️ **Catatan:** PC Anda harus selalu nyala agar backend bisa diakses!

---

## 📞 Support

Jika masih bingung, tanya saja! Saya akan bantu troubleshoot. 🚀
