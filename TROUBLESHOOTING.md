# 🆘 Troubleshooting Guide

Panduan lengkap untuk mengatasi masalah deployment yang umum terjadi.

---

## ❌ Error: Backend Cannot Connect to Database

### Symptoms:
```
asyncpg.exceptions.InvalidPasswordError
atau
could not connect to server
```

### Solutions:

1. **Check Connection String Format**
   ```
   ✅ Correct:
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   
   ❌ Wrong:
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname
   (missing ?sslmode=require)
   ```

2. **Verify in Replit Secrets**
   - Buka Tools → Secrets
   - Check `DATABASE_URL` tidak ada typo
   - Pastikan tidak ada spasi di awal/akhir
   - Restart backend setelah update

3. **Test Connection dari Local**
   ```bash
   # Install psql atau gunakan Python
   python -c "
   import asyncpg
   import asyncio
   
   async def test():
       conn = await asyncpg.connect('postgresql://...')
       print('Connected!')
       await conn.close()
   
   asyncio.run(test())
   "
   ```

4. **Check Neon Database Status**
   - Login ke Neon dashboard
   - Pastikan project status "Active"
   - Jika suspended, tunggu beberapa detik
   - Try connect lagi

---

## ❌ Error: CORS Policy Blocking Requests

### Symptoms:
```
Access to fetch at 'https://backend.repl.co' from origin 'https://app.vercel.app' 
has been blocked by CORS policy
```

### Solutions:

1. **Update Backend CORS_ORIGINS**
   - Di Replit → Tools → Secrets
   - Edit `CORS_ORIGINS`:
   ```
   https://your-app.vercel.app,http://localhost:5173,http://localhost:4173
   ```
   - **NO TRAILING SLASH!**
   - Restart backend (Stop → Run)

2. **Check Frontend API URL**
   - Di Vercel → Settings → Environment Variables
   - Check `VITE_API_BASE_URL`:
   ```
   ✅ Correct: https://backend.username.repl.co/api/v1
   ❌ Wrong: https://backend.username.repl.co/api/v1/
   ```
   - Redeploy jika perlu update

3. **Verify in Browser**
   - Open DevTools (F12)
   - Network tab
   - Look for OPTIONS request (preflight)
   - Should return 200, not 404/403

4. **Test CORS Manually**
   ```bash
   curl -X OPTIONS https://your-backend.repl.co/api/v1/zones \
     -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -v
   
   # Should see: Access-Control-Allow-Origin: ...
   ```

---

## ❌ Error: Replit App Keeps Sleeping

### Symptoms:
- App works initially
- After 15-60 minutes, API calls timeout
- Replit shows "Connecting..." atau "Waking up..."

### Solutions:

1. **Use UptimeRobot (Recommended)**
   - Daftar di https://uptimerobot.com (gratis)
   - Add New Monitor:
     - Type: HTTP(s)
     - URL: `https://your-backend.repl.co/api/v1/dashboard/stats`
     - Monitoring Interval: **5 minutes**
     - Alert Contacts: your email
   - Save
   - UptimeRobot akan ping setiap 5 menit → app tidak sleep

2. **Upgrade Replit Plan** (Paid)
   - Replit Hacker plan ($7/month)
   - Always-on Repls
   - No sleep timeout

3. **Switch ke PythonAnywhere**
   - Free tier PythonAnywhere always-on
   - Follow panduan di `ALTERNATIVE_PLATFORMS.md`

4. **Add Health Check Endpoint**
   Backend sudah punya, tapi bisa ditambahkan:
   ```python
   # app/main.py
   @app.get("/health")
   async def health_check():
       return {"status": "healthy"}
   ```

---

## ❌ Error: Vercel Build Failed

### Symptoms:
```
Error: Cannot find module 'xyz'
atau
Build failed with exit code 1
```

### Solutions:

1. **Check Build Logs**
   - Di Vercel dashboard → Deployments → klik deployment
   - Scroll ke "Build Logs"
   - Cari baris error terakhir

2. **Common Issues:**

   **Missing Dependencies:**
   ```bash
   # Di local, pastikan package.json updated
   cd frontend
   npm install
   npm run build  # Test locally
   ```

   **Wrong Build Command:**
   - Settings → Build & Development Settings
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`

   **TypeScript Errors:**
   ```bash
   # Fix TypeScript errors locally
   npm run lint
   npx tsc --noEmit
   ```

3. **Force Redeploy**
   - Deployments → (hamburger menu) → Redeploy
   - Check "Use existing build cache" → Uncheck
   - Redeploy

4. **Check Environment Variables**
   - Settings → Environment Variables
   - Pastikan `VITE_API_BASE_URL` ada
   - Format: `https://backend.repl.co/api/v1` (no trailing slash)

---

## ❌ Error: Frontend Shows Blank Page

### Symptoms:
- Vercel deployment success
- URL accessible tapi blank/white screen
- No content visible

### Solutions:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Console tab
   - Look for errors

2. **Common Issues:**

   **API URL Wrong:**
   ```
   Error: Failed to fetch
   ```
   - Check `VITE_API_BASE_URL` di Vercel
   - Redeploy setelah fix

   **Router Issues:**
   ```
   404 on sub-pages
   ```
   - Check `vercel.json` exists:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

   **Build Output Wrong:**
   - Check Vercel settings
   - Output Directory: `dist` (not `build` or `out`)

3. **Test Production Build Locally**
   ```bash
   cd frontend
   npm run build
   npm run preview
   # Open http://localhost:4173
   ```

4. **Clear Cache & Redeploy**
   - Vercel → Settings → Clear cache
   - Redeploy

---

## ❌ Error: Database Migrations Failed

### Symptoms:
```
relation "zones" does not exist
atau
column "xyz" does not exist
```

### Solutions:

1. **Check Tables Exist**
   - Login ke Neon dashboard
   - SQL Editor
   - Run:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   - Should see: zones, containers, shipping_agents, etc.

2. **Re-run Migrations Manually**
   - Open Neon SQL Editor
   - Copy-paste **ENTIRE** content dari:
     1. `backend/migrations/001_create_tables.sql` → Run
     2. Wait for success
     3. `backend/migrations/002_seed_data.sql` → Run
     4. Wait for success
     5. `backend/migrations/003_create_yard_config.sql` → Run

3. **Check Migration Order**
   - Migrations harus dijalankan berurutan!
   - Jangan skip 001 atau 002

4. **Drop & Recreate (Nuclear Option)**
   ```sql
   -- ⚠️ WARNING: This deletes ALL data!
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   
   -- Then re-run all migrations
   ```

---

## ❌ Error: API Returns 404

### Symptoms:
```
GET https://backend.repl.co/api/v1/zones → 404
```

### Solutions:

1. **Check URL Path**
   ```
   ✅ Correct: https://backend.repl.co/api/v1/zones
   ❌ Wrong: https://backend.repl.co/zones
   ```

2. **Check Backend Logs**
   - Di Replit, scroll logs
   - Look for route registration:
   ```
   INFO: Application startup complete
   INFO: Uvicorn running on http://0.0.0.0:8001
   ```

3. **Test via Swagger UI**
   - Buka: `https://backend.repl.co/docs`
   - Should see FastAPI Swagger UI
   - Try execute endpoint dari sana

4. **Check Router Registration**
   ```python
   # backend/app/main.py
   app.include_router(zones.router, prefix="/api/v1", tags=["zones"])
   ```

---

## ⚠️ Warning: Slow API Response

### Symptoms:
- API calls take > 3 seconds
- Frontend seems laggy

### Solutions:

1. **Check Database Connection Pool**
   - Neon free tier: max 100 connections
   - Pastikan tidak ada connection leak

2. **Add Caching**
   ```python
   # backend/app/routers/dashboard.py
   from functools import lru_cache
   
   @lru_cache(maxsize=1)
   @router.get("/stats")
   async def get_stats():
       # This will cache result
       ...
   ```

3. **Optimize Queries**
   - Check slow queries di Neon dashboard
   - Add indexes if needed:
   ```sql
   CREATE INDEX idx_containers_zone ON containers(zone_id);
   ```

4. **Check Replit Status**
   - Replit free tier shares resources
   - Peak hours (US evening) might be slower
   - Consider switching to PythonAnywhere

---

## 🔍 Debugging Tools

### Backend Debugging:
```python
# Tambahkan logging di backend
import logging
logging.basicConfig(level=logging.DEBUG)

# app/main.py
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response
```

### Frontend Debugging:
```typescript
// src/services/api.ts
console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// Add interceptor
const originalFetch = window.fetch;
window.fetch = (...args) => {
  console.log('Fetch:', args);
  return originalFetch(...args);
};
```

### Database Debugging:
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check table sizes
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public';
```

---

## 📞 Getting Help

Jika masih stuck:

1. **Collect Information:**
   - Screenshot error message
   - Backend logs dari Replit
   - Frontend console errors (F12)
   - Vercel build logs
   - Neon connection string (HIDE PASSWORD!)

2. **Check Official Docs:**
   - FastAPI: https://fastapi.tiangolo.com
   - Replit: https://docs.replit.com
   - Vercel: https://vercel.com/docs
   - Neon: https://neon.tech/docs

3. **Community Support:**
   - FastAPI Discord
   - Replit Forum
   - Stack Overflow

4. **Tanya Saya:**
   - Share error details
   - Share what you've tried
   - I'll help debug! 🚀

---

## ✅ Prevention Checklist

Untuk avoid issues di future deployments:

- [ ] Always test locally before deploy
- [ ] Use environment variable examples (.env.example)
- [ ] Document all setup steps
- [ ] Keep dependencies updated
- [ ] Monitor uptime dengan UptimeRobot
- [ ] Backup database regularly
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness

---

**Remember: Most issues are configuration problems, not code bugs!** 🐛

Take your time, check each step carefully, and you'll succeed! 💪
