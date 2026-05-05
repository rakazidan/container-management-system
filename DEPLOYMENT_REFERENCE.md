# 🎯 Deployment Quick Reference

## Platform URLs

### Database (Neon)
- Dashboard: https://console.neon.tech
- Docs: https://neon.tech/docs/get-started-with-neon/signing-up

### Backend (Replit)
- Dashboard: https://replit.com/~
- Docs: https://docs.replit.com/hosting/deployments/about-deployments

### Frontend (Vercel)
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs

---

## Essential Commands

### Backend (Local)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend (Local)
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations (Neon SQL Editor)
```sql
-- Run in order:
-- 1. backend/migrations/001_create_tables.sql
-- 2. backend/migrations/002_seed_data.sql
-- 3. backend/migrations/003_create_yard_config.sql
```

---

## Environment Variables

### Backend (.env atau Replit Secrets)
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
NODE_ENV=production
PORT=8001
```

### Frontend (Vercel Environment Variables)
```bash
VITE_API_BASE_URL=https://your-backend.username.repl.co/api/v1
```

---

## Testing Endpoints

### Health Check
```bash
curl https://your-backend.username.repl.co/health
```

### Dashboard Stats
```bash
curl https://your-backend.username.repl.co/api/v1/dashboard/stats
```

### List Zones
```bash
curl https://your-backend.username.repl.co/api/v1/zones
```

### API Documentation
```
https://your-backend.username.repl.co/docs
```

---

## Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| CORS Error | Update `CORS_ORIGINS` in backend, restart |
| Database Connection Failed | Check `?sslmode=require` in DATABASE_URL |
| Replit App Sleeping | Setup UptimeRobot ping every 5 min |
| Vercel Build Failed | Check build logs, verify env vars |
| 404 on API Calls | Verify VITE_API_BASE_URL ends with `/api/v1` |

---

## Support Contacts

- **Neon Support**: support@neon.tech
- **Replit Support**: https://replit.com/support
- **Vercel Support**: https://vercel.com/support

---

## Backup & Restore

### Backup Database
```bash
# From Neon SQL Editor
pg_dump $DATABASE_URL > backup.sql
```

### Restore Database
```bash
# Upload backup.sql to Neon SQL Editor and run
psql $DATABASE_URL < backup.sql
```

---

## Monitoring

### UptimeRobot Setup
1. Sign up at https://uptimerobot.com
2. Add Monitor:
   - URL: `https://your-backend.username.repl.co/api/v1/dashboard/stats`
   - Interval: 5 minutes
   - Type: HTTP(s)

### Check Logs
- **Replit**: View console in Replit editor
- **Vercel**: Deployments → (click deployment) → View Logs
- **Neon**: Monitoring tab in dashboard

---

## Cost Breakdown

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Neon | Free | $0 | 512MB RAM, 3GB storage |
| Replit | Free | $0 | Unlimited public projects (sleep after idle) |
| Vercel | Free | $0 | 100GB bandwidth, unlimited projects |
| **Total** | | **$0/month** | Perfect for MVPs & portfolios |

---

## Upgrade Paths (If Needed)

### When to Upgrade?

**Database (Neon)**
- Free: 512MB RAM, 3GB storage
- Upgrade when: > 100k rows or > 2GB data
- Cost: ~$19/month for Pro

**Backend (Replit)**
- Free: Public projects, sleep after idle
- Upgrade when: Need always-on or private code
- Cost: $7/month for Hacker plan

**Frontend (Vercel)**
- Free: 100GB bandwidth
- Upgrade when: > 100GB/month traffic
- Cost: $20/month for Pro

**Alternative Free Options:**
- Backend: PythonAnywhere (always-on, 1 app free)
- Frontend: Netlify (same limits as Vercel)
- Database: Supabase (500MB free)

---

## Next Steps After Deployment

1. ✅ Setup custom domain (optional)
2. ✅ Configure UptimeRobot for backend
3. ✅ Add Google Analytics (optional)
4. ✅ Setup automated backups
5. ✅ Monitor error logs daily
6. ✅ Test on mobile devices
7. ✅ Share with users and collect feedback

---

**Documentation Files:**
- `QUICKSTART.md` - 15 min quick start guide
- `DEPLOYMENT_GUIDE.md` - Detailed step-by-step
- `DEPLOYMENT_CHECKLIST.md` - Verification checklist
- `TROUBLESHOOTING.md` - Debug common issues
- `ALTERNATIVE_PLATFORMS.md` - Other free platforms

**Happy Deploying! 🚀**
