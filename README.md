# CrudePulse — Real-Time Crude Oil Intelligence Dashboard

A Bloomberg-style real-time crude oil market intelligence dashboard with 4 core modules, admin panel, and tiered subscription system.

## Modules (V1)

| Module | Cadence | Source | Free/Pro |
|---|---|---|---|
| **Price & News Timeline** | 🟢 LIVE | Alpha Vantage · NewsAPI · GDELT | Free (stale) / Pro (fresh) |
| **Disruption Radar** | 🟢 LIVE | GDELT (no key needed) | All tiers |
| **Rig Count Tracker** | 🔵 WEEKLY | Baker Hughes | All tiers |
| **Reserves Clock** | ⚪ PERIODIC | EIA · USGS | All tiers |

## Quick Start (Local Development)

```bash
# 1. Install dependencies
bun install

# 2. Generate Prisma client + database
bun run generate

# 3. Start development (runs both server + frontend)
bun run dev:full

# 4. Open http://localhost:5173
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Required? | Where to get |
|---|---|---|
| `DATABASE_URL` | Yes (default SQLite works) | Auto-generated |
| `ALPHA_VANTAGE_KEY` | Optional | [alphavantage.co](https://www.alphavantage.co/support/#api-key) |
| `NEWSAPI_KEY` | Optional | [newsapi.org](https://newsapi.org/register) |
| `EIA_API_KEY` | Optional | [eia.gov](https://www.eia.gov/opendata/register.php) |

Without API keys, the app serves realistic mock data. With keys, it fetches real data and caches per source.

## Deploy to Railway (Recommended)

Railway hosts both the frontend and backend in one service.

### Step 1: Push to GitHub
```bash
git init
git add -A
git commit -m "CrudePulse V1"
git remote add origin https://github.com/YOUR_USERNAME/crudepulse.git
git push -u origin main
```

### Step 2: Create Railway Account
Go to [railway.app](https://railway.app) and sign up with GitHub.

### Step 3: Deploy
1. Click **"New Project"** → **"Deploy from GitHub Repo"**
2. Select your `crudepulse` repository
3. Railway auto-detects the Dockerfile and deploys

### Step 4: Add Database
1. In Railway dashboard → your project → **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-generates `DATABASE_URL` and links it

### Step 5: Set Environment Variables
In Railway → your service → **"Variables"** tab:
```
DATABASE_URL=<auto-filled by PostgreSQL addon>
ALPHA_VANTAGE_KEY=your_key_here
NEWSAPI_KEY=your_key_here
EIA_API_KEY=your_key_here
```

### Step 6: Custom Domain
1. Railway → your service → **"Settings"** → **"Networking"** → **"Custom Domain"**
2. Enter your domain (e.g. `crudepulse.io`)
3. Railway gives you DNS records — add them to your domain registrar:
   - **Type A** → Railway's IP address
   - **Type CNAME** → `railway.app`
4. SSL certificate auto-provisions (usually 1-2 minutes)

### Step 7: Seed Admin Account
After first deploy, your admin account (`rhlkumar135@gmail.com`) auto-seeds on first login. Just visit your domain and sign in with that email.

## Deploy to Vercel + Railway (Split)

For maximum performance, deploy frontend on Vercel (CDN) and backend on Railway:

### Frontend (Vercel)
1. Push to GitHub
2. [vercel.com](https://vercel.com) → Import repository
3. Framework: Vite
4. Build command: `bun run build`
5. Output dir: `dist`
6. Add environment variable: `VITE_API_URL=https://your-railway-app.up.railway.app`

### Backend (Railway)
1. Same as Steps 1-5 above
2. Set `APP_URL` to your Vercel URL

### Connect Custom Domain
1. Add domain to Vercel (Settings → Domains)
2. Vercel gives you CNAME record → add to your DNS
3. SSL is automatic

## Accessing the Database

### SQLite (local dev)
```bash
sqlite3 prisma/dev.db "SELECT * FROM users;"
```

### PostgreSQL (production via Railway)
```bash
# Via Railway CLI
railway connect postgres

# SQL prompt
SELECT * FROM users;
```

### Admin API
```bash
# View all users (requires admin email)
curl "https://yourdomain.com/api/admin/users?email=rhlkumar135@gmail.com"
```

### Prisma Studio (visual DB browser)
```bash
bun run db:studio
# Opens http://localhost:5555
```

## Admin Account

- **Email:** `rhlkumar135@gmail.com`
- **Role:** admin (auto-seeded, permanent)
- **Tier:** pro (full access)

Sign in with this email + any password → admin badge appears in header → click to see user management panel.

## Architecture

```
Frontend (React + Vite + Tailwind)
  ↓ fetch('/api/...')
Backend (Hono + SQLite/PostgreSQL)
  ↓ try real API → fallback to mock
External APIs (GDELT, EIA, Alpha Vantage, NewsAPI, Baker Hughes)
```

## License

Apache-2.0
