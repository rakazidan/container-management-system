# Quick Start Guide - Deploy ke Production

## 🚀 Ringkasan Cepat

Aplikasi Container Management System ini akan di-deploy ke:
- **Database**: Neon (PostgreSQL gratis)
- **Backend**: Replit (Python/FastAPI gratis)
- **Frontend**: Vercel (React/Vite gratis)

**Total Biaya: Rp 0,- (100% GRATIS tanpa kartu kredit)**

---

## ⚡ Step-by-Step (15 Menit)

### 1. Setup Database (5 menit)

1. Buka https://neon.tech → Sign up dengan GitHub
2. Create Project → nama: `container-management`
3. Copy connection string (terlihat seperti):
   ```
   postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
4. Di Neon SQL Editor, jalankan migrations:
   - Copy isi `backend/migrations/001_create_tables.sql` → Run
   - Copy isi `backend/migrations/002_seed_data.sql` → Run  
   - Copy isi `backend/migrations/003_create_yard_config.sql` → Run

✅ Database siap!

---

### 2. Setup Backend (5 menit)

1. Buka https://replit.com → Sign up dengan GitHub
2. Create Repl → Template: Python → Title: `container-backend` → Public
3. Upload/drag folder `backend` ke Replit
4. Klik Tools → Secrets, tambahkan:
   ```
   DATABASE_URL = <paste connection string dari Neon>
   CORS_ORIGINS = http://localhost:5173,https://your-app.vercel.app
   NODE_ENV = production
   PORT = 8001
   ```
5. Create file `.replit` di root:
   ```toml
   run = "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8001"
   ```
6. Klik tombol **Run** → tunggu sampai muncul "Uvicorn running..."
7. Copy URL yang muncul (contoh: `https://container-backend.username.repl.co`)

✅ Backend siap!

---

### 3. Setup Frontend (5 menit)

1. Push code ke GitHub (jika belum):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/container-management.git
   git push -u origin main
   ```

2. Buka https://vercel.com → Sign up dengan GitHub
3. New Project → Import repository `container-management`
4. Configure:
   - Root Directory: `frontend`
   - Framework: Vite (auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Environment Variables → tambahkan:
   ```
   VITE_API_BASE_URL = <paste URL backend dari Replit>/api/v1
   ```
   Contoh: `https://container-backend.username.repl.co/api/v1`
6. Klik **Deploy** → tunggu 2-3 menit

✅ Frontend siap!

---

### 4. Update CORS Backend

1. Kembali ke Replit
2. Edit Secrets → `CORS_ORIGINS` → tambahkan URL Vercel:
   ```
   https://your-app.vercel.app,http://localhost:5173
   ```
3. Restart backend (Stop → Run)

✅ Selesai!

---

## 🧪 Testing

### Test Backend:
Buka di browser:
```
https://your-backend.username.repl.co/docs
```
Harusnya muncul FastAPI Swagger UI

### Test Frontend:
Buka URL Vercel Anda:
```
https://your-app.vercel.app
```
- Cek Dashboard → harusnya muncul stats
- Cek Monitoring → harusnya muncul zones
- Cek GPS Tracking → harusnya muncul map

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend error connecting to DB | Pastikan DATABASE_URL ada `?sslmode=require` di akhir |
| Frontend tidak bisa fetch data | Check CORS_ORIGINS include URL Vercel |
| Replit app sleep/mati | Normal untuk free tier. Gunakan UptimeRobot.com untuk ping tiap 5 menit |
| Build error di Vercel | Check logs, biasanya missing env vars |

---

## 📞 Support

Jika ada masalah:
1. Check browser console (F12) untuk error
2. Check Replit logs untuk backend error
3. Check Vercel deployment logs untuk frontend error

---

## 🎁 Bonus: Keep Backend Always On

Backend Replit akan sleep setelah tidak ada activity. Untuk keep-alive:

1. Daftar di https://uptimerobot.com (gratis)
2. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.username.repl.co/api/v1/dashboard/stats`
   - Monitoring Interval: 5 minutes
3. Save

Sekarang backend akan selalu on! 🚀

---

## 📚 Link Berguna

- Neon Dashboard: https://console.neon.tech
- Replit Dashboard: https://replit.com/~
- Vercel Dashboard: https://vercel.com/dashboard
- UptimeRobot Dashboard: https://uptimerobot.com/dashboard

---

**Selamat! Aplikasi Anda sudah live dan bisa diakses dari mana saja! 🎉**
