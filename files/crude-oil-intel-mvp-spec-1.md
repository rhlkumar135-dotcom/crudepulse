# CrudePulse — Real-Time Global Crude Oil Intelligence Dashboard
### MVP Specification for AI Coding Agent

---

## 1. Product Vision

CrudePulse is a single-page, real-time web dashboard that fuses public/free energy, shipping, satellite, news, and financial data into one visually striking "mission control" for crude oil markets. It answers, at a glance: **where is oil, how much, moving where, at what price, why is it moving, and how long will it last.**

Target user: energy analysts, traders, journalists, students — anyone who wants a Bloomberg-Terminal-style oil view without a Bloomberg subscription.

Design language: dark-mode "command center" aesthetic — deep navy/charcoal background, amber/teal/red accent palette (oil-rig warning colors), glassmorphic cards, animated data transitions, live-updating badges ("LIVE" pulse dot), map-first layout.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  10 Modules as independent, lazy-loaded dashboard cards   │
└───────────────────────┬───────────────────────────────────┘
                         │ REST/GraphQL
┌───────────────────────┴───────────────────────────────────┐
│              BACKEND-FOR-FRONTEND (Node/Express)           │
│  - API aggregation layer                                   │
│  - Caching (Redis, TTL per source refresh rate)             │
│  - Rate-limit shielding for free-tier APIs                  │
│  - Cron jobs (node-cron) to pre-fetch & normalize data       │
│  - WebSocket layer for push updates to frontend              │
└───────────────────────┬───────────────────────────────────┘
                         │
┌───────────────────────┴───────────────────────────────────┐
│                    EXTERNAL FREE APIs                       │
│  EIA · GDELT · FRED · World Bank · Baker Hughes · AIS ·      │
│  NewsAPI · Copernicus · Alpha Vantage · USGS                 │
└───────────────────────────────────────────────────────────┘
```

**Why a backend proxy layer is mandatory (not optional):**
- Free APIs have strict rate limits (e.g., EIA: 5,000 req/hr per key; NewsAPI free: 100 req/day). A backend cache prevents blowing through limits when many users load the page.
- CORS: several sources (GDELT, EIA) don't support direct browser calls reliably.
- API keys must never be exposed client-side.
- Normalizing wildly different data shapes (CSV, JSON, XML, satellite tiles) into one clean internal schema belongs server-side.

**Recommended stack:**
- Frontend: React + Vite, TailwindCSS, Framer Motion (animations), Recharts + D3 (custom viz), Mapbox GL JS or Deck.gl (geo layers), react-query for data fetching/caching.
- Backend: Node.js + Express (or Fastify), Redis for caching, node-cron for scheduled pulls, Socket.IO for live push.
- DB: PostgreSQL (store historical snapshots for trend lines — free APIs often only give "current" or short lookback, so persist your own history from day 1).
- Hosting: Vercel/Netlify (frontend) + Railway/Render (backend, free tiers available).

---

## 3. Global Design System

- **Palette**: `#0B0E14` (bg), `#121826` (card bg), `#F5A623` (crude amber — primary accent), `#2DD4BF` (teal — supply/positive), `#EF4444` (red — disruption/negative), `#94A3B8` (muted text).
- **Typography**: Display headings in a geometric sans (e.g., "Space Grotesk"); data/numbers in a tabular monospace (e.g., "IBM Plex Mono") for alignment of live-updating figures.
- **Motion**: every live value uses a count-up/count-down animation on change (Framer Motion `useSpring`); a pulsing "LIVE" dot (CSS keyframe) sits beside any WebSocket-fed metric; map layers fade-transition on data refresh, never hard-jump.
- **Layout**: bento-grid dashboard, 12-column responsive grid. Module 1 (Global Flow) and Module 2 (Chokepoints) are the "hero" — full width, top of page. Remaining 8 modules in a 2–3 column grid below, each expandable to full-screen modal on click.
- **Global header bar**: live WTI & Brent price ticker, last-updated timestamp per data source (critical for trust — free APIs update at different cadences), and a "data health" indicator (green/yellow/red per API showing if it's live, cached, or stale/down).

---

## 4. Module-by-Module Specification

### Module 1 — Global Flow Sankey / Flow Map
**Purpose**: Visualize crude movement between producing and consuming regions.
**Data sources**:
- EIA International Energy Data API — petroleum trade flows: `https://www.eia.gov/opendata/` (free API key, register at `https://www.eia.gov/opendata/register.php`)
- UN Comtrade API (crude oil HS code 2709) — `https://comtradeapi.un.org/` (free tier, key required)
**Visualization**: Animated Sankey diagram (D3-sankey) overlaid on a world map using Deck.gl `ArcLayer` for flow arcs, arc thickness = volume, color = direction/region.
**Refresh cadence**: EIA monthly/weekly series → cache 24h; show "as of [month]" label since this is not truly real-time (be transparent about this in UI — don't fake real-time on inherently monthly data).
**MVP scope**: Top 15 bilateral trade flows only, not full matrix.

### Module 2 — Chokepoint Congestion Monitor
**Purpose**: Real-time risk/congestion at the 8 major oil transit chokepoints (Hormuz, Malacca, Suez, Bab-el-Mandeb, Danish Straits, Bosporus, Panama, Cape of Good Hope).
**Data sources**:
- EIA "World Oil Transit Chokepoints" report data — `https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints`
- AISHub free AIS feed — `https://www.aishub.net/api` (free, requires sharing your own AIS receiver data OR use limited free access) — alternative: MarineTraffic free density tiles (limited, non-commercial) `https://www.marinetraffic.com/en/ais-api-services`
- Fallback if AIS access is restricted: use GDELT (Module 6) filtered for chokepoint keywords as a proxy risk signal.
**Visualization**: World map with pulsing radial "risk gauges" at each strait; click to expand a vessel-density mini-chart.
**MVP scope**: Static chokepoint volume data (EIA) + GDELT-derived "risk score" (news mention frequency/sentiment in last 72h) as the realtime layer, since true AIS live tracking free tiers are limited.

### Module 3 — Storage vs. Satellite Cross-Check
**Purpose**: Compare official inventory reports against independent visual estimates.
**Data sources**:
- EIA Weekly Petroleum Status Report — `https://www.eia.gov/petroleum/supply/weekly/` (API series `PET.WCRSTUS1.W` for Cushing/US crude stocks)
- Copernicus Sentinel-2 imagery — `https://dataspace.copernicus.eu/` (free, requires registration; use Sentinel Hub free tier `https://www.sentinel-hub.com/`)
**MVP scope**: This is the hardest module — floating-roof tank shadow analysis is a real computer-vision task. For MVP, **descope to**: show EIA official storage numbers as the primary chart, and embed a static/periodically-refreshed Sentinel-2 image snapshot of Cushing, OK as a "visual verification" panel (no CV analysis in v1). Label clearly as "visual reference," not an automated cross-check, until a v2 CV pipeline is built.

### Module 4 — Field-by-Field Comparative Scorecard
**Purpose**: Compare major oil fields on production, reserves, breakeven cost, R/P ratio.
**Data sources**:
- EIA International Energy Statistics (country/field-level production) — `https://www.eia.gov/opendata/`
- USGS World Petroleum Assessment — `https://www.usgs.gov/programs/energy-resources-program` (reserve estimates, static datasets, downloadable)
- World Bank Commodity Markets data — `https://www.worldbank.org/en/research/commodity-markets` (free CSV/API)
**Visualization**: Card grid with radar/spider chart per field (Permian, Ghawar, North Sea/Brent, Bakken, Kashagan, Orinoco Belt); sortable comparison table.
**MVP scope**: Hardcode initial field list (6–8 major fields) with quarterly-refreshed data; fully dynamic field discovery is v2.

### Module 5 — Rig Count Leading Indicator
**Purpose**: Weekly US/global rig count as a leading production indicator vs. price.
**Data sources**:
- Baker Hughes Rig Count — `https://rigcount.bakerhughes.com/` (free weekly XLSX/CSV download, no API but scriptable fetch of the public file)
**Visualization**: Animated bar-chart race by basin (Framer Motion + Recharts), synced timeline scrubber against a WTI price line below.
**Refresh cadence**: Weekly (Baker Hughes publishes Fridays) — cron job to re-download and parse XLSX weekly.

### Module 6 — Geopolitical Disruption Radar
**Purpose**: Real-time global news-driven event heatmap for oil-relevant disruptions.
**Data sources**:
- GDELT Project (free, real-time, updates every 15 min) — `https://www.gdeltproject.org/data.html` and API docs `https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/`
**Visualization**: World heatmap (Mapbox heatmap layer) filtered by oil-related keywords (sanctions, pipeline, tanker, OPEC, strike, attack, refinery); severity = GDELT tone score; auto-correlate spikes with Module 9's price timeline.
**MVP scope**: This is your most genuinely "real-time" module — prioritize building this well; it's the emotional core of "astonishing real-time" feel.

### Module 7 — Supply-Demand Balance Simulator
**Purpose**: Interactive what-if simulator for market balance.
**Data sources**:
- OPEC Monthly Oil Market Report (public PDF/data tables) — `https://www.opec.org/opec_web/en/data_graphs/40.htm`
- IEA Oil Market Report (free summary data) — `https://www.iea.org/reports/oil-market-report-*` (full report often paywalled; free monthly highlights available)
- EIA Short-Term Energy Outlook API — `https://www.eia.gov/opendata/` (series under STEO)
**Visualization**: Stacked area chart (supply vs demand) with interactive sliders (e.g., "OPEC+ cuts 1M bbl/d") that recompute a projected balance line client-side.
**MVP scope**: Simulation logic is simple linear arithmetic on top of EIA STEO baseline — no ML needed for v1.

### Module 8 — Refinery Utilization Heatmap
**Purpose**: Regional refinery run-rates vs. crack spread.
**Data sources**:
- EIA Weekly Refinery Utilization — series `PET.WPULEUS3.W` via EIA Open Data API
- FRED (Federal Reserve Economic Data) for crack spread proxies (diesel/gasoline/crude futures) — `https://fred.stlouisfed.org/docs/api/fred/` (free API key)
**Visualization**: Choropleth/tile heatmap by PADD region (US) with color intensity = utilization %, overlaid with crack-spread trend sparkline.

### Module 9 — Price + News Timeline Sync
**Purpose**: Correlate price moves with news events on one scrollable timeline.
**Data sources**:
- Alpha Vantage (free tier, WTI/Brent proxies via commodities or energy ETF tickers) — `https://www.alphavantage.co/documentation/` (free API key, 25 req/day limit — cache aggressively)
- Alternative/supplement: Yahoo Finance unofficial endpoints via `yfinance`-style scraping (no key, less stable) or Twelve Data free tier `https://twelvedata.com/`
- NewsAPI — `https://newsapi.org/` (free dev tier: 100 req/day, cache heavily) filtered for "crude oil OR OPEC OR WTI OR Brent"
**Visualization**: Candlestick chart (Recharts/TradingView lightweight-charts, free open-source) with a synced ticker tape below; hovering a candle highlights concurrent headlines.
**MVP scope**: Given tight free-tier limits (25–100 req/day), fetch once every few hours server-side and serve all users from cache — do not call these APIs per-user-request.

### Module 10 — Reserves-to-Production Longevity Clock
**Purpose**: "Doomsday clock" style — years of reserves remaining per country at current production rate.
**Data sources**:
- EIA International Reserves data — `https://www.eia.gov/opendata/`
- BP Statistical Review-style public reserve figures (BP discontinued its own report in 2023; use EIA + USGS as the durable free replacement) — `https://www.eia.gov/international/data/world`
**Visualization**: Radial "clock" gauges per top-10 producing country, needle position = years remaining (reserves ÷ production); color gradient green→red as years decrease.
**Refresh cadence**: Annual data — this is explicitly a slow-changing module; present as such, don't fake live updates.

---

## 5. Subscription & Monetization Model (Built Into the MVP)

Monetization is not a v2 afterthought — the tier system should be architected into the backend from day one (auth, entitlement checks, and rate/refresh gating), even if the MVP only ships one paid tier.

### 5.1 Tier Structure

| Tier | Price | What's Included |
|---|---|---|
| **Free** | $0 | Modules 5, 6, 9, 10 only (rig count, disruption radar, price+news, reserves clock). Data refreshed on a delay (4–6h cache instead of live). No alerts, no export, no historical lookback beyond 30 days. Watermarked/branded charts. |
| **Pro** | $25–35/mo | All 10 modules unlocked. Real-time refresh at each module's true cadence (per the LIVE/DAILY/WEEKLY badges in §5 data-honesty system). Custom alerts (e.g., "notify me if Hormuz risk score spikes"). CSV/PNG export. Full historical charts (as far back as your own DB has been recording). |
| **Team** | $99–149/mo (up to 5 seats) | Everything in Pro + shared workspaces, saved dashboard views, API access (read-only, rate-limited to your own normalized dataset — not raw pass-through of upstream free APIs, to stay within their ToS), priority data-refresh queue. |
| **Enterprise / API License** | Custom (starts ~$500–2,000/mo) | Full API access to the normalized dataset, white-label/embed rights for specific modules, SLA on uptime, dedicated support. Targets trading newsletters, fintech apps, boutique consultancies who don't want to build their own aggregation layer. |

**Why this structure**: it mirrors how the free-API constraint actually works — free users get the modules with generous public rate limits (GDELT, Baker Hughes, EIA) at a throttled cadence; paid users get the modules gated by the *tightest* free-tier limits (NewsAPI, Alpha Vantage, Sentinel Hub) at true real-time cadence, since those are the calls that cost you (in caching infra and eventual paid-tier upgrades to the upstream APIs themselves) to serve fast and fresh.

### 5.2 Backend Requirements to Support Tiers (build these into the MVP, not bolted on later)

- **Auth**: lightweight email/OAuth signup (Clerk, Auth0, or Supabase Auth — all have free tiers) — required even in MVP so tier-gating has something to hang off of.
- **Entitlement middleware**: every API route checks `req.user.tier` before returning full-resolution data; free-tier requests get the same endpoint but a coarser cache layer (e.g., serve the 6-hour-old cached snapshot instead of the 5-minute one).
- **Billing**: Stripe (free to integrate, only takes a cut of revenue) — Checkout + Customer Portal for self-serve upgrade/downgrade/cancel, webhook listener to flip `user.tier` on payment events.
- **Usage metering table** (Postgres): log per-user API calls if you later want usage-based Team/Enterprise pricing rather than flat seats.
- **Module lock UI**: on the frontend, locked modules render blurred/preview state with an upgrade CTA — this itself is a conversion surface, so design it deliberately rather than just hiding the module.

### 5.3 MVP Monetization Scope

For the actual MVP build, implement:
1. Auth + Stripe Checkout for a single Pro tier (skip Team/Enterprise until you have Pro traction).
2. Entitlement middleware gating modules 1–4, 7, 8 behind Pro; 5, 6, 9, 10 free.
3. Refresh-cadence throttling by tier (free = cached/delayed, Pro = true cadence per module).
4. A pricing page + upgrade CTA in the locked-module UI.

Team and Enterprise/API-license tiers are validated *after* Pro shows retention — don't build multi-seat or white-label infrastructure speculatively.

---

## 6. Data Realism & "Live" Honesty (Critical for Credibility)

Not all 10 modules can be truly real-time — free public energy data ranges from 15-min-refresh (GDELT) to annual (reserves). The MVP must **visually differentiate data cadence** rather than pretend everything is live:
- Badge system per module: `🟢 LIVE` (sub-hourly), `🟡 DAILY`, `🔵 WEEKLY`, `⚪ PERIODIC` (monthly/quarterly/annual).
- Every card shows "Last updated: [timestamp]" and "Source: [name, linked]."
This honesty is itself a design feature — it builds trust and is genuinely more "astonishing" than a dashboard that fakes real-time on stale data.

---

## 7. API Key Summary Table

| Source | Free Tier Limit | Signup |
|---|---|---|
| EIA Open Data | 5,000 req/hr | eia.gov/opendata/register.php |
| GDELT | No key needed, public | gdeltproject.org/data.html |
| FRED | Generous, free key | fred.stlouisfed.org/docs/api |
| World Bank | No key, public | worldbank.org/en/research/commodity-markets |
| Baker Hughes | No key, public file download | rigcount.bakerhughes.com |
| Alpha Vantage | 25 req/day | alphavantage.co |
| NewsAPI | 100 req/day (dev) | newsapi.org |
| Copernicus/Sentinel Hub | Free tier w/ quota | sentinel-hub.com |
| UN Comtrade | Free tier w/ key | comtradeapi.un.org |
| USGS | No key, public datasets | usgs.gov/programs/energy-resources-program |

---

## 8. MVP Build Priority (for the AI agent)

Build in this order — each phase is independently demoable:
1. **Skeleton**: Layout, design system, header ticker, module card shells with mock data.
2. **Auth + entitlement scaffolding**: Signup/login, Stripe Checkout for the single Pro tier, entitlement middleware, and locked-module UI (per §5.3) — build this alongside the skeleton, not after modules exist, so every module built from here on is gated correctly from the start.
3. **Module 9** (Price + News) and **Module 6** (GDELT disruption radar) — highest "wow," most genuinely real-time, moderate complexity.
4. **Module 5** (Rig count) and **Module 10** (Reserves clock) — simple, static-ish, easy wins.
5. **Module 4** (Field scorecards) and **Module 8** (Refinery heatmap) — medium complexity, EIA-driven.
6. **Module 1** (Flow Sankey) and **Module 2** (Chokepoints) — hero visuals, higher mapping complexity, build once map tooling is proven.
7. **Module 7** (Simulator) — depends on Module 1/8 data being in place.
8. **Module 3** (Storage vs satellite) — descoped in MVP to a labeled visual reference panel; full CV cross-check is explicitly v2.

## 9. Explicit Out-of-Scope for MVP (call out to avoid scope creep)
- No user accounts/auth.
- No true AIS live vessel tracking (free tiers insufficient) — chokepoint risk uses GDELT proxy instead.
- No computer-vision tank-level estimation — visual reference only.
- No mobile-native app — responsive web only.
- No predictive ML forecasting — Module 7 simulator is deterministic arithmetic, not ML.
- No Team (multi-seat) or Enterprise/API-license tiers in MVP — ship single Free + Pro tiers first; build multi-seat/white-label infra only after Pro shows retention (see §5.3).
