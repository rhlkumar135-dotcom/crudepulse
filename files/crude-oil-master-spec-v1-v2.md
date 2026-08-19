# CrudePulse — Master Build Spec (V1 → V2 → Phase 2)
### Complete specification for an AI coding agent: precise MVP, full vision, and stretch roadmap

This is the single source of truth. It defines three sequential build stages:
- **V1 (Precise MVP)** — 4 modules, ships in ~3 weeks, single Pro tier, no map/3D tooling.
- **V2 (Full Vision)** — all 10 original modules, tiered subscriptions, real mapping/geo tooling.
- **Phase 2 (Stretch)** — 9 additional modules + visual polish, built only after V2 is validated.

Build strictly in this order. Do not start V2 modules until V1's definition of done (§3.7) is met. Do not start Phase 2 until V2's tiering (§5) is live with real paying users.

---

# PART 1 — SHARED FOUNDATIONS (apply to all stages)

## 1.1 Product Vision
CrudePulse is a real-time global crude oil intelligence dashboard fusing free public energy, shipping, satellite, news, and financial data into one visually striking dashboard. It answers: where is oil, how much, moving where, at what price, why is it moving, and how long will it last.

Target user: energy analysts, traders, journalists, students — people who want a Bloomberg-Terminal-style oil view without an enterprise budget. The market gap is real: incumbents (S&P Global, Vortexa, Energy Intelligence) sell this exact data category at enterprise prices (often five to six figures per year); nothing exists at a $25–35/mo prosumer price point.

## 1.2 Data Realism & "Live" Honesty (non-negotiable across every stage)
Free public data ranges from 15-min-refresh (GDELT) to annual (reserves). Every module, in every stage, must show a cadence badge and "last updated" timestamp rather than implying literal real-time streaming everywhere:
- `🟢 LIVE` (sub-hourly) · `🟡 DAILY` · `🔵 WEEKLY` · `⚪ PERIODIC` (monthly/quarterly/annual)
This honesty is a trust-building design feature, not a caveat to hide.

## 1.3 Fixed Tech Stack (all stages build on this — do not fragment the stack later)
- **Frontend**: React + Vite, TailwindCSS, react-query (data fetching/caching)
- **Charts**: Recharts (v1 baseline) → add D3 for custom viz in V2
- **Maps/Geo**: none in V1 → Mapbox GL JS / Deck.gl introduced in V2 → optional 3D globe (Three.js/Cesium) in Phase 2
- **Animation**: Framer Motion, light use in V1 (count-ups, fades) → fuller use in V2/Phase 2 (scroll-triggered, arcs)
- **Backend**: Node.js + Express, node-cron for scheduled pulls
- **Cache**: in-memory or Redis (V1 can use in-memory; move to Redis once multi-instance in V2)
- **DB**: PostgreSQL — persist historical snapshots from day one since most free APIs only return current values
- **Auth + Billing**: Supabase Auth (free tier) + Stripe Checkout/Customer Portal + webhook listener
- **Hosting**: Vercel (frontend) + Railway (backend + Postgres) — both free/cheap starter tiers

## 1.4 Full API Source Table (every source used across all stages)

| Source | Used By | Free Tier Limit | Signup |
|---|---|---|---|
| EIA Open Data | Reserves, storage, production, refinery, STEO | 5,000 req/hr | eia.gov/opendata/register.php |
| GDELT DOC 2.0 | Disruption radar | No key, public, ~15min refresh | gdeltproject.org/data.html |
| Baker Hughes | Rig count | No key, public weekly XLSX | rigcount.bakerhughes.com |
| Alpha Vantage | Price data | 25 req/day | alphavantage.co |
| NewsAPI | News feed | 100 req/day (dev tier) | newsapi.org |
| FRED | Crack spread, cross-commodity (DXY/gold/gas) | Generous, free key | fred.stlouisfed.org/docs/api |
| World Bank | Commodity/reserve context | No key, public | worldbank.org/en/research/commodity-markets |
| USGS | Reserve assessments | No key, public datasets | usgs.gov/programs/energy-resources-program |
| UN Comtrade | Bilateral trade flows | Free tier w/ key | comtradeapi.un.org |
| AISHub / MarineTraffic | Chokepoint vessel density | Limited free/non-commercial | aishub.net/api |
| Copernicus / Sentinel Hub | Satellite storage reference | Free tier w/ quota | sentinel-hub.com |
| OPEC public reports | Supply-demand simulator baseline | Free, no API (manual/table scrape) | opec.org/opec_web/en/data_graphs/40.htm |
| NASA VIIRS Nightfire | Flare/emissions tracker (Phase 2) | Free | eogdata.mines.edu/products/vnf |
| OFAC Sanctions List | Dark fleet tracker (Phase 2) | Free, public | sanctionslist.ofac.treas.gov |

---

# PART 2 — V1: PRECISE MVP (build first, ~3 weeks)

## 2.1 Scope
Four modules only. No maps, no 3D, no simulator, no computer vision. The goal is a genuinely real (not mocked), genuinely useful, demoable product as fast as possible.

**V1 Modules:**
1. **Price + News Timeline** — WTI/Brent price chart synced to a live news feed.
2. **Disruption Radar (list view)** — GDELT-powered ranked list/bar chart of oil-relevant events by region, with spike detection. No map yet.
3. **Rig Count Tracker** — weekly Baker Hughes rig count vs. price, bar+line chart.
4. **Reserves Longevity Clock** — radial "years remaining" gauges for top 10 producing countries.

## 2.2 Module Specs

### A — Price + News Timeline
- Price: Alpha Vantage, pulled every 4h via cron, stored in Postgres. Never called per-request.
- News: NewsAPI, query `"crude oil" OR OPEC OR WTI OR Brent`, pulled every 2h via cron.
- UI: Recharts line/candlestick chart + scrollable synced headline list.
- Tier gating: Free = previous cron batch (stale by one extra cycle); Pro = latest batch.

### B — Disruption Radar (list view)
- GDELT DOC 2.0, pulled every 30 min via cron (no key needed).
- UI: ranked bar list of regions by 24h event volume + tone score, "spike" badge if volume >2x the 7-day average.
- This is the most genuinely real-time module in V1 — prioritize its cron reliability first.

### C — Rig Count Tracker
- Baker Hughes weekly XLSX, parsed via `xlsx` npm package, cron'd every Friday.
- UI: grouped bar chart by basin + price line overlay (reuse Module A's stored data).

### D — Reserves Longevity Clock
- EIA Open Data API, reserves ÷ production per top-10 country, refreshed monthly.
- UI: 10 radial gauge cards, green→red color gradient by years remaining.

## 2.3 V1 Monetization (single tier — proof of willingness-to-pay)
- **Free**: Modules B, C, D fully available. Module A shown one cron-cycle stale.
- **Pro ($25/mo, Stripe Checkout)**: Module A shown with the freshest cron batch. That is the entire V1 paywall — deliberately simple to build and to explain.
- No Team/Enterprise, no usage metering, no API licensing in V1.

## 2.4 V1 Build Timeline
- **Week 1**: Backend skeleton, Postgres schema, cron jobs for EIA/GDELT/Baker Hughes (do Alpha Vantage/NewsAPI last to conserve rate-limited quota during dev).
- **Week 2**: Frontend skeleton, Modules B/C/D wired to live backend data, Supabase Auth wired.
- **Week 3**: Module A integrated with careful quota-respecting scheduling, Stripe Checkout + entitlement gating, cadence badges everywhere, deploy.

## 2.5 V1 Definition of Done
A logged-out visitor sees 3 genuinely updating modules; a logged-in Pro subscriber sees a 4th module with fresher data; every module is honest about its own cadence; nothing is mocked or faked.

---

# PART 3 — V2: FULL VISION (all 10 original modules + full tiering)

Build V2 only after V1 is live and its definition of done is met. V2 upgrades the V1 modules where relevant (B gains a real map) and adds 6 new modules plus full subscription tiering.

## 3.1 Design System (introduced in V2)
- Palette: `#0B0E14` bg, `#121826` card bg, `#F5A623` amber (primary), `#2DD4BF` teal (supply/positive), `#EF4444` red (disruption/negative), `#94A3B8` muted text.
- Typography: geometric sans for headings (e.g. Space Grotesk), tabular monospace for live numbers (e.g. IBM Plex Mono).
- Motion: count-up/down on every live value change, pulsing "LIVE" dot beside WebSocket-fed metrics, fade-transitions on map layer refresh.
- Layout: bento-grid, hero modules (Flow Map + Chokepoints) full-width at top, remaining modules in a 2–3 column grid, each expandable to a full-screen modal.
- Global header: live price ticker, per-source last-updated timestamps, a data-health indicator (green/yellow/red per API: live/cached/stale).

## 3.2 Full Module Set (V1's 4 + 6 new)

**Module 1 — Global Flow Sankey / Flow Map** *(new)*
- Data: EIA International Energy Data API (trade flows), UN Comtrade (HS code 2709).
- Viz: D3-sankey + Deck.gl `ArcLayer` on a world map; arc thickness = volume.
- Cadence: monthly/weekly — labeled "as of [month]," not faked as live. Scope to top 15 bilateral flows.

**Module 2 — Chokepoint Congestion Monitor** *(new)*
- Data: EIA World Oil Transit Chokepoints report + AISHub/MarineTraffic free-tier AIS (limited) as the live layer, with GDELT keyword-filtered risk score as fallback/supplement.
- Viz: world map with pulsing risk gauges at Hormuz, Malacca, Suez, Bab-el-Mandeb, Danish Straits, Bosporus, Panama, Cape of Good Hope.

**Module 3 — Storage vs. Satellite Reference** *(new, deliberately descoped)*
- Data: EIA Weekly Petroleum Status Report (`PET.WCRSTUS1.W`) as primary chart; Sentinel-2/Sentinel Hub imagery of Cushing, OK as a periodically-refreshed **visual reference panel**, not an automated CV cross-check (that's Phase 2+ level effort).

**Module 4 — Field-by-Field Comparative Scorecard** *(new)*
- Data: EIA international stats, USGS World Petroleum Assessment, World Bank commodity data.
- Viz: card grid with radar chart per field (Permian, Ghawar, North Sea/Brent, Bakken, Kashagan, Orinoco Belt — hardcode this list for V2, dynamic discovery is later).

**Module 5 — Rig Count Tracker** *(carried over from V1, unchanged)*

**Module 6 — Disruption Radar** *(upgraded from V1's list view)*
- Same GDELT pipeline, now rendered as a Mapbox heatmap layer instead of a list; list view remains as a fallback/accessible view.

**Module 7 — Supply-Demand Balance Simulator** *(new)*
- Data: OPEC Monthly Report tables, EIA Short-Term Energy Outlook API.
- Viz: stacked area chart with interactive sliders (e.g. "OPEC+ cuts 1M bbl/d") recomputing a projected balance line client-side via simple linear arithmetic (no ML).
- Depends on Modules 1 and 8 data existing first.

**Module 8 — Refinery Utilization Heatmap** *(new)*
- Data: EIA weekly refinery utilization (`PET.WPULEUS3.W`), FRED crack-spread proxies.
- Viz: PADD-region choropleth tiles colored by utilization %, crack-spread sparkline overlay.

**Module 9 — Price + News Timeline** *(carried over from V1, upgraded)*
- Same pipeline; add TradingView lightweight-charts (free/open-source) for proper candlesticks.

**Module 10 — Reserves Longevity Clock** *(carried over from V1, unchanged)*

## 3.3 V2 Subscription Tiers

| Tier | Price | Included |
|---|---|---|
| **Free** | $0 | Modules 5, 6, 9, 10 (the V1 four) at throttled/cached cadence (4–6h delay), 30-day history, no export, no alerts |
| **Pro** | $25–35/mo | All 10 modules, true per-module cadence, custom alerts, CSV/PNG export, full stored history |
| **Team** | $99–149/mo (5 seats) | Everything in Pro + shared workspaces, saved views, read-only API access to your normalized dataset, priority refresh queue |
| **Enterprise / API License** | Custom, from ~$500–2,000/mo | Full API access, white-label/embed rights, SLA, dedicated support |

**V2 build scope**: implement Free + Pro fully. Build Team/Enterprise infrastructure only after Pro shows retention — do not build multi-seat or white-label speculatively.

## 3.4 Backend Requirements for Tiering
- Entitlement middleware on every route checking `req.user.tier` before serving full-resolution vs. cached data.
- Usage metering table (Postgres) for future usage-based Team/Enterprise pricing.
- Locked-module UI: blurred/preview state with upgrade CTA — a deliberate conversion surface, not just a hidden module.

## 3.5 V2 Build Priority Order
1. Auth + entitlement scaffolding (extend from V1's single-tier gate to the full tier model) — do this before adding new modules so everything from here is gated correctly.
2. Module 1 (Flow Sankey) and Module 2 (Chokepoints) — hero visuals, introduce Mapbox/Deck.gl tooling here.
3. Module 4 (Field scorecards) and Module 8 (Refinery heatmap).
4. Module 7 (Simulator) — after 1 and 8's data exists.
5. Module 3 (Storage vs. satellite reference) — last, deliberately scoped down.
6. Upgrade Module 6 from list to map view once Mapbox tooling is proven from step 2.

## 3.6 V2 Explicit Out-of-Scope
- No true live AIS vessel tracking (free tiers insufficient) — chokepoint risk uses GDELT proxy as primary real-time signal.
- No computer-vision tank-level estimation.
- No predictive ML forecasting anywhere (Module 7 is deterministic arithmetic).
- No mobile-native app — responsive web only.

---

# PART 4 — PHASE 2: STRETCH FEATURES (build only after V2 is validated with paying users)

## 4.1 New Modules

**Module 11 — AI-Generated Daily Brief**: LLM summarization of Module 9's price move + Module 6's top disruption events into a 3–5 sentence analyst note. Cache once/day server-side. Pro-tier feature.

**Module 12 — Flare & Emissions Tracker**: NASA VIIRS Nightfire satellite flaring data, heatmap layer toggle on the Module 1/2 map. ESG angle, genuine differentiator.

**Module 13 — Dark Fleet / Sanctions-Evasion Tanker Tracker**: OFAC sanctions list cross-referenced against AIS ship-to-ship transfer patterns (reuse Module 2's AIS source). V1 of this feature: flag sanctioned-vessel-name mentions in GDELT news rather than full pattern-detection. Present as informational/journalistic framing.

**Module 14 — Cross-Commodity Correlation Panel**: FRED-sourced USD index, gold, natural gas overlaid against oil (reuses Module 8's FRED integration).

**Module 15 — Watchlists & Threshold Alerts**: user-pinned fields/countries/chokepoints, email/push notification on threshold breach. Requires notification infra (Resend/SendGrid free tier or web push). **Highest-leverage retention feature — build first within Phase 2.**

**Module 16 — OPEC+ Meeting Countdown & Scenario Tracker**: manually-maintained OPEC meeting calendar + GDELT pre-meeting sentiment gauge.

**Module 17 — Historical Event Explorer**: curated "on this day" content (1973 embargo, 2020 negative WTI pricing, etc.) — no live API dependency, strong SEO/shareability.

**Module 18 — Embeddable Widgets**: brandable iframe/JS-embed of the price+disruption ticker for bloggers/newsletters — free distribution channel, treat as a growth feature.

**Module 19 — Audio Daily Briefing**: TTS rendering of Module 11's brief (ElevenLabs free tier or browser-native Web Speech API for zero-cost v1).

## 4.2 Visual Upgrades
- **3D rotating globe hero**: replace Module 1's flat map with Mapbox GL Globe or Three.js/Cesium — highest-impact single visual upgrade, do first.
- **Scroll-triggered data storytelling**: numbers count up, arcs draw themselves, charts animate on scroll (Framer Motion + Intersection Observer).
- **Ambient background motion**: subtle particle/gradient-mesh shader behind the header (`ogl` or `vanta.js`).
- **Optional sound design**: soft tick/pulse on live price updates, toggleable.
- **Micro-interactions**: hover-to-reveal source/timestamp, card tilt-on-hover, blur-to-reveal on locked modules.
- **Signature-moment philosophy**: invest disproportionately in 1–2 standout visuals (the globe, the chokepoint pulse map) rather than spreading polish evenly across 19 modules.

## 4.3 Phase 2 Priority Order
1. Watchlists & Alerts (Module 15) — retention/monetization leverage.
2. 3D Globe hero + scroll animation — visual differentiation.
3. AI Daily Brief (Module 11) — cheap, reuses existing data.
4. Cross-Commodity Panel (Module 14) — cheap, reuses existing FRED integration.
5. Embeddable Widgets (Module 18) — growth/distribution.
6. Flare Tracker (12), Historical Explorer (17), Audio Briefing (19) — polish.
7. Dark Fleet Tracker (13), OPEC+ Scenario Tracker (16) — highest complexity/sensitivity, last.

## 4.4 Phase 2 Explicit Out-of-Scope
- No Team/Enterprise multi-seat or white-label build until Pro shows sustained retention through V2 and into Phase 2.
- No full AIS-based pattern-detection system for dark fleet tracking (GDELT-mention proxy only).

---

# PART 5 — MONETIZATION SUMMARY ACROSS STAGES

| Stage | Tiers Live | What's Paywalled |
|---|---|---|
| V1 | Free + Pro ($25/mo) | Freshness of Module A (price+news) only |
| V2 | Free + Pro ($25–35/mo) | 6 of 10 modules + alerts/export/history, gated by entitlement middleware |
| Phase 2 | Free + Pro (+ Team/Enterprise if validated) | Watchlists/alerts, AI brief, API access, white-label |

This is intentionally a slow reveal: prove people will pay for *fresher data on one module* (V1) before building the full tiered product (V2), before building growth/retention features on top (Phase 2).
