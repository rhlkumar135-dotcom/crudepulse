# CrudePulse — V3 Addendum: Middle East Cross-Market Correlation Engine + Multi-Page Portal Architecture

This addendum does two things: (1) defines a new V3 module analyzing correlation between Middle East events and global oil, currency, and stock markets, and (2) restructures the portal so V1, V2, and V3 each live on their own dedicated page rather than one continuously-growing single page.

---

# PART D — V3: MIDDLE EAST ↔ GLOBAL MARKETS CORRELATION ENGINE

## D.1 Purpose
Quantify and visualize how Middle East-originating events (conflict, sanctions, OPEC+ decisions, chokepoint incidents) correlate with: (a) global crude oil benchmarks, (b) currency markets, (c) global stock indices. This turns the existing Disruption Radar (Module 6) from "here's what happened" into "here's what happened and here's what moved because of it, everywhere."

## D.2 Data Sources

| Signal | Source | Notes |
|---|---|---|
| Middle East event volume/tone | GDELT DOC 2.0 (already integrated, Module 6) | Filter by region (Saudi Arabia, Iran, Iraq, UAE, Yemen, Israel, etc.) rather than global |
| Oil benchmarks | Alpha Vantage (already integrated, Module 9) | WTI, Brent |
| Currency pairs | Alpha Vantage FX endpoints (free tier, same key as price data) or FRED | USD Index (DXY, already in Module 14), EUR/USD, JPY/USD as global risk-sentiment proxies. Note: Gulf currencies (SAR, AED) are USD-pegged and will show near-zero independent variance — exclude them as correlation targets and note why, don't silently omit. Track EGP and TRY instead — both are non-pegged, regionally proximate, and genuinely responsive to Middle East risk events. |
| Global stock indices | FRED (has some index series) or Alpha Vantage global quote endpoints | S&P 500, FTSE 100, Nikkei 225 as global-risk proxies; Tadawul (Saudi exchange) if a free feed can be found — flag as best-effort since Gulf exchange free data is limited, fall back to regional oil-major stocks (e.g., Aramco where quoted) if the index itself isn't accessible free |

## D.3 Functional Requirements

| ID | Requirement |
|---|---|
| FR-27 | System shall compute a Middle East-specific event/tone score (subset of Module 6's GDELT pipeline, filtered to the region) refreshed on the same 30-min cadence as Module 6. |
| FR-28 | System shall compute rolling correlation coefficients between the Middle East event score and: WTI/Brent price, USD Index, EUR/USD, EGP/USD, TRY/USD, and at minimum S&P 500 and FTSE 100. |
| FR-29 | System shall visualize these correlations as a correlation matrix/heatmap (rows = markets, columns = rolling time windows e.g. 7d/30d/90d), color-coded by correlation strength and direction. |
| FR-30 | System shall surface a plain-English callout when any correlation crosses a defined threshold (reusing the correlation-callout mechanism already specified for V2, FR-15), e.g. "Middle East disruption tone has shown a strong inverse correlation with S&P 500 over the last 7 days." |
| FR-31 | System shall tag Gulf-pegged currencies as excluded-by-design in the UI (not simply absent), with a one-line explanation, to avoid the false impression of an incomplete feature. |
| FR-32 | System shall allow the user to click any individual Middle East event marker (from Module 6) and see a mini before/after snapshot of the tracked markets in the following 24–72 hours. |
| FR-33 | Correlation coefficients displayed shall be labeled with sample size/window length — correlation on thin data (e.g., a single event) shall be visually distinguished (e.g., grayed out / "insufficient data") from correlation computed on a statistically meaningful window, to avoid misleading users with noisy short-window correlations. |

## D.4 Technical Notes
- This is a statistical layer, not ML — rolling Pearson correlation coefficients over fixed windows, computed server-side on stored history (same anomaly-detection infra pattern already specified for V2, NFR-4/FR-16). No new ML infrastructure needed.
- Requires currency and equity index time series to be added to the existing Postgres schema and cron pipeline (extend the Module 14 FRED integration rather than building a separate pipeline).
- Correlation ≠ causation — every callout (FR-30) should be phrased descriptively ("X and Y have moved together") not causally ("X caused Y"), and a brief methodology note should be available (tooltip/info icon) so the feature doesn't overstate what it's showing.

## D.5 Tier Placement
Pro-tier feature — it's a synthesis layer on top of already-gated V2 modules (Disruption Radar, Price+News, Cross-Commodity Panel), consistent with how V2 gates its intelligence layer.

## D.6 Priority
Build after V2's core 12 modules and intelligence layer are live, since this explicitly reuses Module 6 (GDELT), Module 9 (price), and Module 14 (FRED/cross-commodity) infrastructure — building it earlier would mean building against modules that don't exist yet.

---

# PART E — MULTI-PAGE PORTAL ARCHITECTURE (applies retroactively to V1, V2, and V3)

## E.1 Requirement Change
The portal shifts from a single continuously-growing scrolling dashboard to **three distinct pages**, one per version, navigable via a persistent top-level nav:

- **`/v1`** — the 4-module precise MVP (Price+News, Disruption Radar list, Rig Count, Reserves Clock)
- **`/v2`** — the full 12-module dashboard + cross-module intelligence layer (Market Pulse, digests, correlations, anomalies, reliability tags, overlay mode, drill-down) + Copernicus modules
- **`/v3`** — the Middle East ↔ Global Markets Correlation Engine

## E.2 Why Multi-Page (Not Tabs on One Page)
- Each version has materially different load profiles (V2's map/geo tooling is heavy; V1 is intentionally light) — separate pages let each route code-split and lazy-load independently rather than V1 visitors paying V2's Mapbox/Deck.gl bundle cost.
- It gives you a natural way to keep V1 live and stable as a lightweight "free tour" page even after V2 ships, rather than deprecating it — useful for onboarding, SEO, and as a fallback if V2 has issues.
- It matches how you're already building this — sequential, versioned stages — so the product structure mirrors the build structure instead of fighting it.

## E.3 Functional Requirements

| ID | Requirement |
|---|---|
| FR-34 | Portal shall present a persistent top-level navigation allowing switching between V1, V2, and V3 pages at any time. |
| FR-35 | Each page shall be independently routed (`/v1`, `/v2`, `/v3`) and independently code-split — navigating to one shall not load the JS/assets of the others. |
| FR-36 | Authentication and subscription tier state shall be shared globally across all three pages (single Supabase session, single Stripe entitlement check) — a Pro subscriber's access applies on every page, no separate login per version. |
| FR-37 | Free-tier users shall be able to view V1 in full (as already specified) and see V2/V3 in a locked-preview state consistent with the existing blur/CTA pattern (FR-25), rather than being blocked from navigating to those pages entirely. |
| FR-38 | A landing/home page (`/`) shall briefly explain the three tiers of the product (quick tour / full dashboard / correlation engine) and route users into whichever they choose — this becomes the new top-level entry point, replacing the single dashboard as the default route. |

## E.4 Build Sequencing Impact
This is a routing/IA change, not a rebuild — V1 and V2's component work already specified is reused as-is, just mounted under `/v1` and `/v2` routes instead of one page. Implement the multi-page shell (E.3) at the start of V2 development (since that's when a second page first exists), and add the `/v3` route when V3 is built per Part D's priority (§D.6).

---

# PART F — UPDATED WHOLE-PRODUCT SUMMARY (V1 + V2 + V3)

| Page | Modules | Tier Gating | Status |
|---|---|---|---|
| `/v1` | 4 (Price+News, Disruption Radar list, Rig Count, Reserves Clock) | Free (3 modules) + Pro (freshness on Module A) | Build first, ~3 weeks |
| `/v2` | 12 (V1's 4 upgraded + 6 original + 2 Copernicus) + intelligence layer (Market Pulse, digests, correlations, anomalies, reliability tags, overlay, drill-down) | Free (V1's 4, throttled) + Pro (everything) | Build after V1 validated |
| `/v3` | 1 (Middle East ↔ Global Markets Correlation Engine) | Pro only | Build after V2's Modules 6/9/14 are live |

Full product at end of V3: 13 modules across 3 dedicated pages, a shared auth/subscription layer, 2 live tiers (Free, Pro), Copernicus satellite integration, and a statistical (non-ML) cross-market correlation capability — with Phase 2's further 9 modules, 3D globe/visual polish, Sentinel-1/3 spill tracking, and Team/Enterprise tiers still explicitly ahead, not part of this scope.
