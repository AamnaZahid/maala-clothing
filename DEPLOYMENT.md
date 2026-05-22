# COMPLETE FREE DEPLOYMENT GUIDE — Maala Clothing

**Total Monthly Cost: PKR 0**

| Service   | Provider      | Cost                          |
|-----------|---------------|-------------------------------|
| Frontend  | GitHub Pages  | Free forever, no credit card  |
| Domain    | is-a.dev      | Free subdomain                |
| Backend   | Render.com    | Free 750 hrs/month            |
| Database  | Supabase      | Free PostgreSQL 500MB         |
| Images    | Cloudinary    | Free 25GB                     |
| WhatsApp  | CallMeBot     | Free forever                  |
| Keep-alive| UptimeRobot   | Free forever                  |

Suggested domain: **maalaclothing.is-a.dev**

---

## STEP 1 — DATABASE: Supabase

1. Go to [supabase.com](https://supabase.com) → sign up with GitHub (no credit card)
2. Click **New Project**
   - Name: `maala-clothing-db`
   - Database password: create a strong password and **save it**
   - Region: **Southeast Asia (Singapore)** — closest to Pakistan
3. Go to: **Project Settings → Database → Connection String → URI**
4. Copy the URI:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
5. Save as `DATABASE_URL` for Step 2

The backend includes a `@Scheduled` keep-alive that pings the DB every 6 hours to prevent Supabase from pausing.

---

## STEP 2 — BACKEND: Render.com

1. Push this project to a GitHub repository
2. Go to [render.com](https://render.com) → sign up with GitHub
3. Click **New → Web Service** → connect your repo
4. Settings:

   | Field          | Value                                      |
   |----------------|--------------------------------------------|
   | Name           | `maala-clothing-backend`                   |
   | Root Directory | `backend`                                  |
   | Runtime        | Java                                       |
   | Build Command  | `mvn clean package -DskipTests`            |
   | Start Command  | `java -Xmx400m -jar target/*.jar`          |
   | Plan           | Free                                       |

5. Environment variables:

   | Key                    | Value                                      |
   |------------------------|--------------------------------------------|
   | `SPRING_PROFILES_ACTIVE` | `prod`                                   |
   | `DATABASE_URL`         | Supabase URI from Step 1                   |
   | `JWT_SECRET`           | Random 64+ character string                |
   | `CLOUDINARY_CLOUD_NAME`| From Step 4                                |
   | `CLOUDINARY_API_KEY`   | From Step 4                                |
   | `CLOUDINARY_API_SECRET`| From Step 4                                |
   | `CALLMEBOT_PHONE`      | `923094094776`                             |
   | `CALLMEBOT_API_KEY`    | From Step 5                                |
   | `FRONTEND_URL`         | `https://maalaclothing.is-a.dev`           |
   | `APP_BASE_URL`         | Your Render service URL (e.g. `https://maala-clothing-backend.onrender.com`) |
   | `APP_ADMIN_EMAIL`      | Your admin login email (first deploy only) |
   | `APP_ADMIN_PASSWORD`   | Strong admin password (first deploy only)  |

6. Click **Create Web Service** — wait 5–10 minutes
7. Backend URL: `https://maala-clothing-backend.onrender.com`

---

## STEP 3 — FRONTEND: GitHub Pages

### Part A — Deploy

1. In `frontend/.env.production`, set:
   ```
   VITE_API_BASE_URL=https://maala-clothing-backend.onrender.com
   ```

2. From the `frontend` folder:
   ```bash
   npm install
   npm install --save-dev gh-pages
   npm run deploy
   ```

3. GitHub repo → **Settings → Pages**
   - Source: Deploy from branch
   - Branch: `gh-pages` / root

### Part B — Free domain (maalaclothing.is-a.dev)

1. Check availability at [is-a.dev](https://is-a.dev)
2. Fork [github.com/is-a-dev/register](https://github.com/is-a-dev/register)
3. Add `domains/maalaclothing.json`:
   ```json
   {
     "owner": {
       "username": "your-github-username",
       "email": "your-email@example.com"
     },
     "records": {
       "CNAME": "your-github-username.github.io"
     }
   }
   ```
4. Open a Pull Request and wait for merge (24–48 hours)
5. GitHub Pages → **Custom Domain** → `maalaclothing.is-a.dev` → Enforce HTTPS

---

## STEP 4 — IMAGES: Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (no credit card)
2. Copy from Dashboard: Cloud Name, API Key, API Secret
3. Add to Render environment variables (Step 2)

---

## STEP 5 — WHATSAPP ALERTS: CallMeBot

Your order notification number: **03094094776** (API format: **923094094776**)

1. On your phone, save contact: **CallMeBot** — `+34 644 13 14 42`
2. Send this exact WhatsApp message to that number:
   ```
   I allow callmebot.com
   ```
3. You'll receive an API key within 1–2 minutes
4. In Admin Panel → **Settings → WhatsApp & Notifications**:
   - WhatsApp number: `923094094776`
   - Paste API key → **Send Test WhatsApp**
5. Also add `CALLMEBOT_API_KEY` to Render env vars

Every new order sends an instant WhatsApp alert to **03094094776**.

---

## STEP 6 — KEEP EVERYTHING AWAKE: UptimeRobot

1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. **Add New Monitor**:
   - Type: HTTP(s)
   - URL: `https://maala-clothing-backend.onrender.com/api/health`
   - Interval: 5 minutes
3. This prevents Render cold starts and keeps Supabase active

---

## STEP 7 — FIRST TIME SETUP

1. Visit `https://maalaclothing.is-a.dev/login`
2. Login: `admin@shop.com` / `Admin@1234` → **change password immediately**
3. **Settings → Shop Info**: confirm shop name "Maala Clothing", upload logo
4. **Settings → Payment Accounts**: add EasyPaisa `03094094776`, JazzCash, bank details
5. **Settings → WhatsApp**: verify CallMeBot setup
6. **Categories**: add Lawn Suits, Kurtas, etc.
7. **Products**: upload photos and set prices
8. Share: `https://maalaclothing.is-a.dev`

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Backend won't start on Render | Check Render logs; verify `DATABASE_URL` and `JWT_SECRET` |
| Supabase paused | Restore project in Supabase dashboard; verify UptimeRobot |
| is-a.dev not working | DNS takes 24–48h; verify GitHub Pages custom domain |
| No WhatsApp alerts | Re-check API key; number must be `923094094776` (no + or spaces) |
| Images not uploading | Verify Cloudinary credentials in Render |
| Blank page on refresh | Ensure `frontend/public/404.html` and `index.html` redirect script exist |

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend && mvn spring-boot:run

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Shop: `http://localhost:5173` | API: `http://localhost:8080`
