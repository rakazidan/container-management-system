# ✅ Deployment Checklist

Gunakan checklist ini untuk memastikan deployment berjalan lancar.

---

## 📋 Pre-Deployment Checklist

### 1. Code Ready
- [ ] Backend berjalan normal di local (`uvicorn app.main:app --reload`)
- [ ] Frontend berjalan normal di local (`npm run dev`)
- [ ] Database migrations sudah dibuat
- [ ] Semua dependencies terinstall
- [ ] .gitignore sudah benar (jangan commit .env!)

### 2. Environment Variables Documented
- [ ] List semua env vars yang dibutuhkan
- [ ] Buat file `.env.example` untuk template
- [ ] Dokumentasikan di README

### 3. Git Repository
- [ ] Code sudah di-push ke GitHub/GitLab
- [ ] Branch `main` atau `master` ada
- [ ] File sensitif tidak ter-commit (.env, secrets, keys)

---

## 🗄️ Database Deployment Checklist

### Neon Setup
- [ ] Akun Neon sudah dibuat
- [ ] Project baru sudah dibuat
- [ ] Connection string sudah di-copy
- [ ] Connection string format: `postgresql://...?sslmode=require`
- [ ] SQL Editor bisa diakses

### Database Migrations
- [ ] `001_create_tables.sql` sudah dijalankan
- [ ] `002_seed_data.sql` sudah dijalankan
- [ ] `003_create_yard_config.sql` sudah dijalankan
- [ ] Verifikasi tables sudah terbuat (check di SQL Editor)
- [ ] Test query: `SELECT * FROM zones LIMIT 5;`

### Database Testing
- [ ] Connection berhasil dari local
- [ ] Data seed sudah masuk
- [ ] Queries berjalan normal

---

## 🔧 Backend Deployment Checklist

### Replit Setup
- [ ] Akun Replit sudah dibuat
- [ ] Repl baru sudah dibuat (Python, Public)
- [ ] Folder `backend` sudah di-upload
- [ ] File `.replit` sudah dibuat di root

### Environment Variables (Replit Secrets)
- [ ] `DATABASE_URL` = connection string dari Neon
- [ ] `CORS_ORIGINS` = URL frontend (update setelah frontend deploy)
- [ ] `NODE_ENV` = production
- [ ] `PORT` = 8001

### Backend Testing
- [ ] Klik "Run" dan tidak ada error
- [ ] Output muncul: "Uvicorn running on..."
- [ ] URL Replit sudah di-copy
- [ ] Test endpoint: `https://xxx.repl.co/docs` (Swagger UI muncul)
- [ ] Test API call: `https://xxx.repl.co/api/v1/dashboard/stats`

### Backend Verification
```bash
# Test dari terminal/PowerShell
curl https://your-backend.username.repl.co/api/v1/dashboard/stats

# Harusnya return JSON dengan stats
```

---

## 🎨 Frontend Deployment Checklist

### Vercel Setup
- [ ] Akun Vercel sudah dibuat (via GitHub)
- [ ] Project sudah di-import dari GitHub
- [ ] Root directory set ke `frontend`
- [ ] Framework auto-detected sebagai "Vite"

### Build Configuration
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Environment Variables (Vercel)
- [ ] `VITE_API_BASE_URL` = URL backend dari Replit + `/api/v1`
- [ ] Example: `https://container-backend.username.repl.co/api/v1`

### Frontend Testing
- [ ] Deployment berhasil (status: Ready)
- [ ] URL Vercel bisa diakses
- [ ] Homepage loading tanpa error
- [ ] Check browser console (F12) tidak ada error CORS

### Frontend Pages Testing
- [ ] Dashboard page loads
- [ ] Monitoring page loads
- [ ] GPS Tracking page loads
- [ ] Data muncul (tidak kosong/error)
- [ ] Navigation antar pages berfungsi

---

## 🔄 CORS Configuration Checklist

### Update Backend CORS
- [ ] Kembali ke Replit
- [ ] Edit Secrets → `CORS_ORIGINS`
- [ ] Tambahkan URL Vercel: `https://your-app.vercel.app,http://localhost:5173`
- [ ] Restart backend (Stop → Run)

### Test CORS
- [ ] Buka frontend di Vercel
- [ ] Open DevTools (F12) → Network tab
- [ ] Refresh page
- [ ] API calls berhasil (status 200, tidak ada CORS error)

---

## 🧪 End-to-End Testing Checklist

### API Integration Test
- [ ] Dashboard menampilkan stats yang benar
- [ ] Monitoring menampilkan zones
- [ ] Container search berfungsi
- [ ] GPS tracking menampilkan map
- [ ] No console errors

### Performance Test
- [ ] Page load < 3 detik
- [ ] API response time < 1 detik
- [ ] Images/assets loading properly

### Mobile Test
- [ ] Responsive di mobile browser
- [ ] Touch interactions berfungsi
- [ ] Layout tidak rusak

---

## 🎁 Post-Deployment (Optional)

### Keep-Alive Setup
- [ ] Daftar di https://uptimerobot.com
- [ ] Add monitor untuk backend URL
- [ ] Interval: 5 minutes
- [ ] Monitor status: Active

### Custom Domain (Optional)
- [ ] Beli domain atau gunakan gratis dari Freenom
- [ ] Tambahkan di Vercel Settings → Domains
- [ ] Update DNS records
- [ ] SSL certificate auto-generated

### Analytics (Optional)
- [ ] Setup Google Analytics
- [ ] Setup Vercel Analytics
- [ ] Track page views & events

---

## 🐛 Troubleshooting Checklist

Jika ada masalah, cek ini:

### Backend Issues
- [ ] Replit logs tidak ada error
- [ ] Database connection string benar
- [ ] Environment variables sudah set semua
- [ ] Port 8001 digunakan
- [ ] `/docs` endpoint accessible

### Frontend Issues
- [ ] Vercel build logs tidak ada error
- [ ] Environment variables sudah set
- [ ] API base URL benar (dengan `/api/v1`)
- [ ] CORS configured di backend
- [ ] Browser console tidak ada error

### Database Issues
- [ ] Connection string format benar
- [ ] `?sslmode=require` ada di akhir URL
- [ ] Migrations sudah dijalankan semua
- [ ] Tables exist (check di SQL Editor)

### CORS Issues
- [ ] Backend CORS_ORIGINS include frontend URL
- [ ] No trailing slash di URLs
- [ ] Protocol match (https vs http)
- [ ] Backend restarted setelah update CORS

---

## ✅ Final Verification

Sebelum declare "DONE", pastikan:

- [ ] Backend URL accessible dari browser
- [ ] Frontend URL accessible dari browser
- [ ] Data tampil di semua pages
- [ ] No errors di browser console
- [ ] API calls success (200 status)
- [ ] Mobile responsive
- [ ] Share URL ke teman untuk test dari device lain

---

## 🎉 Success Criteria

✅ Deployment berhasil jika:
1. Frontend bisa diakses dari URL Vercel
2. Backend bisa diakses dari URL Replit
3. Database terhubung dan data muncul
4. Semua pages berfungsi normal
5. Tidak ada error di console

---

## 📸 Screenshots untuk Dokumentasi

Ambil screenshot ini untuk dokumentasi:
- [ ] Neon dashboard (database stats)
- [ ] Replit running (backend logs)
- [ ] Vercel dashboard (deployment success)
- [ ] Frontend homepage
- [ ] API docs (Swagger UI)

---

**Selamat! Jika semua checklist tercentang, deployment Anda berhasil! 🚀**

Simpan checklist ini untuk referensi deployment berikutnya.
