CrudePulse — 10 New Tabs: Detailed Requirements, Navigation Update & Data Source Cadence
Merged with the Landing/Signup/Live-Value Animation specification
This document adds 10 new oil-domain pages to the portal, updates the top-level navigation to accommodate the expanded tab count, and applies the live-value flash-animation requirement (§4 of the prior document, FR-117–FR-121) to every live number introduced here. It also gives an honest cadence assessment per tab — see §0 before the per-tab sections, since "per second" live data is not actually achievable from free public oil sources, and the product's own data-honesty principle requires saying so rather than implying otherwise.
0. Cadence Honesty Note (read first)
No free, public, legal source provides genuine per-second oil market data — real intraday tick-level feeds are commercial products (Bloomberg, Refinitiv, exchange direct feeds) that cost real money. Free-tier APIs (Alpha Vantage, etc.) offer either delayed quotes (typically 15-min delayed) or daily/settlement-level data, and are additionally rate-limited (25 req/day on Alpha Vantage's free tier, as already established elsewhere in this spec).
What this document does instead: for each tab, it states the fastest genuinely available free cadence, applies the existing cadence-badge system (🟢 LIVE sub-hourly / 🟡 DAILY / 🔵 WEEKLY / ⚪ PERIODIC) honestly, and never claims per-second or continuous-live where the underlying source doesn't support it. Where a tab's data is closer to per-minute (e.g., delayed stock quotes on oil majors), that's stated explicitly as "delayed, cached, refreshed every N minutes" — not "live."
1. Navigation & Layout Update
With 5 existing pages (/v1, /v2, /v3, /v4, /news) plus 10 new pages, the top-level nav grows to 15 entries — the existing simple horizontal nav bar no longer fits comfortably, especially on smaller viewports.
1.1 Functional Requirements
ID
Requirement
FR-122
Top-level navigation shall widen its container to accommodate up to 15 tab entries on large viewports (desktop), increasing max-width proportionally rather than compressing tab labels to illegibility.
FR-123
On medium/smaller viewports where 15 tabs cannot fit legibly even at reduced padding, navigation shall group related tabs under category dropdowns rather than shrinking text further — suggested grouping: Core (/v1, /v2, /v3, /v4), Markets & Finance (Oil Majors, Futures Curve, Freight/Shipping, Downstream Products), Supply & Infrastructure (Crude Grades, SPR Tracker, Refinery Directory, Pipeline Map), Policy & Risk (OPEC+ Compliance, Sanctions Tracker), Discover (/news).
FR-124
Each category dropdown shall be keyboard-navigable and clearly labeled, consistent with existing accessibility requirements (NFR-26).
FR-125
On mobile viewports, navigation shall collapse to a hamburger/drawer menu preserving the same category grouping from FR-123, rather than a horizontally scrolling single-row tab strip (which becomes unusable at 15 items on a phone width).
FR-126
Tab width within any given row/group shall size to content (not fixed-width truncation) up to a reasonable max, so labels like "Global Refinery Directory" remain fully readable rather than clipped with ellipsis.
2. Tab: Crude Grades & Quality Explorer (/grades)
2.1 Purpose
Explains why crude prices differ between benchmarks — API gravity, sulfur content, and other quality specs across WTI, Brent, Dubai, Urals, Oman, and other traded grades — turning an often-confusing pricing gap into an understood one.
2.2 Functional Requirements
ID
Requirement
FR-127
System shall display a comparison table/card grid of at least 8 major traded crude grades with API gravity, sulfur %, and a plain-language "light/heavy, sweet/sour" classification.
FR-128
System shall show each grade's current price alongside its quality specs, so users can see quality-adjusted price differences directly (e.g., why Brent trades at a premium/discount to WTI).
FR-129
Grade-to-grade comparison shall support a selectable overlay (pick any 2–4 grades to compare side-by-side).
2.3 Data Sources & Cadence
Source
Data
Cadence
Access
EIA Open Data
Grade-specific price series where available (WTI, Brent, others)
🟡 Daily
eia.gov/opendata
Published grade specification references (industry-standard API gravity/sulfur tables)
Static quality specs
⚪ Periodic (annual review, specs rarely change)
Public refiner/industry references — compile once, update rarely
Honest cadence: quality specs are reference data (⚪ Periodic); price differentials update daily (🟡). No genuine sub-daily source exists for this tab.
3. Tab: Oil Majors Financial Snapshot (/majors)
3.1 Purpose
Earnings, market cap, and upstream/downstream revenue split for major public oil companies (ExxonMobil, Shell, BP, Chevron, TotalEnergies, ConocoPhillips, and Aramco where public data exists).
3.2 Functional Requirements
ID
Requirement
FR-130
System shall display current market cap, latest quarterly revenue/earnings, and stock price for each tracked major, refreshed per §3.3's cadence.
FR-131
System shall show a simple upstream vs. downstream revenue split per company where disclosed in filings.
FR-132
Stock price figures shall be explicitly labeled as delayed (per §0), never presented as live tick data.
FR-133
Every price/financial figure on this page shall apply the live-value flash animation (merged requirement, see §12) when its cached value changes between refreshes.
3.3 Data Sources & Cadence
Source
Data
Cadence
Access
SEC EDGAR (free, no key)
Quarterly filings — revenue, earnings, segment breakdown
🔵 Weekly poll for new filings (filings themselves are quarterly events)
sec.gov/edgar
Alpha Vantage (already integrated)
Stock price (delayed)
🟡 Cached/refreshed every 4h, consistent with existing rate-limit-respecting cron design — genuinely NOT per-minute given the 25 req/day cap shared across the whole product
alphavantage.co
Honest cadence: this tab cannot be faster than the product's existing Alpha Vantage quota allows. If per-minute stock quotes are genuinely wanted, that requires a paid market-data provider — flagged here as an explicit non-free gap, not silently worked around.
4. Tab: Strategic Petroleum Reserves Tracker (/spr)
4.1 Purpose
US SPR levels plus other major countries' strategic reserves where publicly reported (China, Japan, South Korea, EU member states via IEA reporting obligations).
4.2 Functional Requirements
ID
Requirement
FR-134
System shall display current US SPR level (barrels) with historical trend chart.
FR-135
System shall display reserve levels for other IEA member countries where publicly disclosed, noting explicitly which countries do not publish this data (e.g., China's SPR levels are not officially disclosed — this shall be stated, not silently omitted as if no data exists).
FR-136
System shall show SPR draws/releases as annotated events on the trend chart (e.g., "released X million barrels, [date], [stated reason]").
4.3 Data Sources & Cadence
Source
Data
Cadence
Access
EIA Open Data (Weekly Petroleum Status Report)
US SPR level
🔵 Weekly
eia.gov/opendata
IEA member country reporting (public summary data)
Non-US reserve levels where disclosed
⚪ Periodic (varies by country, often monthly/quarterly)
iea.org (public reports; note IEA's full database is subscription, but summary/member reporting is publicly referenced)
Honest cadence: this is inherently a slow-moving dataset — weekly at best for the US, slower elsewhere. No faster free source exists because governments simply don't report this more often.
5. Tab: Global Refinery Directory (/refineries)
5.1 Purpose
Searchable, facility-level database: capacity, complexity, owner, location, and crude slate per refinery — the drill-down complement to the existing Refinery Utilization Heatmap (which shows regional aggregates, not individual facilities).
5.2 Functional Requirements
ID
Requirement
FR-137
System shall provide a searchable/filterable directory of major global refineries with capacity (bbl/day), complexity index where available, owner/operator, and location.
FR-138
Each refinery entry shall link to its location on the map (reusing existing map tooling from V2), and cross-link to the Satellite Intelligence Layer's facility watchlist where the refinery is already monitored there.
FR-139
System shall clearly label this dataset's refresh cadence as annual/periodic — it must NOT be presented alongside faster-cadence tabs without a distinct, less-urgent visual treatment (e.g., no "LIVE" badge anywhere on this page).
5.3 Data Sources & Cadence
Source
Data
Cadence
Access
EIA Refinery Capacity Report
US refinery-level capacity/ownership
⚪ Periodic (annual report)
eia.gov/petroleum/refinerycapacity
International refinery data (public disclosures, company reports)
Non-US refinery specs
⚪ Periodic, compiled/maintained manually — no single free live API covers this globally
Compiled from public company/government disclosures
Honest cadence: this is reference data by nature — refineries don't change capacity daily. Weekly/live badges do not apply here at all.
6. Tab: Pipeline Network Map (/pipelines)
6.1 Purpose
Major crude/product pipelines globally — capacity, ownership, and recent outages — the physical-infrastructure complement to the existing trade-flow Sankey map (which shows commercial flows, not physical routes).
6.2 Functional Requirements
ID
Requirement
FR-140
System shall display major pipelines as routed lines on a map, with capacity and ownership shown on click/hover.
FR-141
System shall overlay recent outage/incident flags on affected pipeline segments, sourced from the existing GDELT disruption pipeline (reusing Module 6's infrastructure, filtered for pipeline-related keywords) rather than building a separate news integration.
FR-142
Pipeline capacity/ownership data shall be labeled periodic; outage flags shall carry the faster GDELT-derived cadence badge (🟢, ~15–30 min) since they reuse that existing live pipeline.
6.3 Data Sources & Cadence
Source
Data
Cadence
Access
EIA pipeline data (US)
US pipeline capacity/routes
⚪ Periodic
eia.gov
Public pipeline operator disclosures
International major pipelines
⚪ Periodic, manually compiled
Various public operator/government sources
GDELT (already integrated)
Outage/incident detection
🟢 ~15–30 min (reused from existing Module 6 pipeline)
gdeltproject.org
Honest cadence: the physical network data is static/periodic; only the outage-flag layer is genuinely fast, and that's because it's reusing an already-fast source, not because pipeline data itself updates quickly.
7. Tab: Tanker Freight & Shipping Cost Tracker (/freight)
7.1 Purpose
Freight rate trends (Baltic Dirty Tanker Index-style) connecting chokepoint congestion (already tracked in V2's Module 2) to actual shipping cost impact.
7.2 Functional Requirements
ID
Requirement
FR-143
System shall display freight rate trend charts for major tanker routes, updated per §7.3's cadence.
FR-144
System shall show a correlation callout (reusing the existing correlation-callout mechanism, FR-15) between chokepoint risk score (Module 2) and freight rate movement, where a meaningful relationship is statistically present.
7.3 Data Sources & Cadence
Source
Data
Cadence
Access
Baltic Exchange
Freight index summary data (limited free tier — full index data is subscription; free/public summaries are less granular)
🔵 Daily (best available free granularity)
balticexchange.com (verify current free-data terms; full index history typically requires a paid subscription)
EIA shipping/transport commentary
Contextual shipping cost narrative
⚪ Periodic
eia.gov
Honest cadence and gap disclosure: this is the one tab where the free data landscape is genuinely thin — the Baltic Exchange's full index is a paid product; only limited public summaries are free. This tab should launch with a clear "data availability may be limited" note rather than promising a rich free feed that may not actually be sustainable — worth validating actual current Baltic Exchange free-tier terms before committing to this tab's full scope.
8. Tab: Futures Curve / Contango-Backwardation Viewer (/futures)
8.1 Purpose
Shows the forward price curve shape (contango vs. backwardation), which reveals storage economics and market expectations — a materially different signal than spot price alone.
8.2 Functional Requirements
ID
Requirement
FR-145
System shall display the current futures curve (price by contract month) for WTI and Brent.
FR-146
System shall label the curve shape (contango/backwardation/flat) with a plain-language one-line explanation of what that shape typically implies.
FR-147
System shall show curve shape history over the last 30 days (reusing the product's standard rolling retention window) so users can see whether the market structure is shifting.
8.3 Data Sources & Cadence
Source
Data
Cadence
Access
Alpha Vantage / CME public settlement data
Futures settlement prices by contract month
🟡 Daily (settlement-based — genuinely NOT intraday-live on free tiers)
alphavantage.co, cmegroup.com (public settlement data, not live feed)
Honest cadence: futures curves on free data are settlement-based (once/day), not continuously live — stated plainly rather than implying a live-updating curve.
9. Tab: OPEC+ Quota Compliance Tracker (/opec-compliance)
9.1 Purpose
Each OPEC+ member's agreed production quota vs. actual production over time — a recurring, genuinely newsworthy data story not covered elsewhere in the product.
9.2 Functional Requirements
ID
Requirement
FR-148
System shall display each OPEC+ member's current quota alongside actual production, with a compliance percentage.
FR-149
System shall show compliance trend over time (rolling chart), highlighting members with sustained over/under-production.
FR-150
System shall cross-link to the existing Supply-Demand Simulator (Module 7) so compliance data can feed into simulator scenarios rather than existing as an isolated dataset.
9.3 Data Sources & Cadence
Source
Data
Cadence
Access
OPEC Monthly Oil Market Report
Quotas, member statements
⚪ Periodic (monthly)
opec.org/opec_web/en/data_graphs/40.htm
EIA International Energy Statistics
Actual country-level production
🟡 Monthly (matches OPEC's own report cadence closely)
eia.gov/opendata
Honest cadence: this is inherently a monthly-cadence dataset because that's how often OPEC itself reports — no faster free source exists or would be meaningful (production isn't measured/reported more granularly).
10. Tab: Downstream Product Prices (/downstream)
10.1 Purpose
Gasoline, diesel, jet fuel, and heating oil prices — connects upstream crude price moves to what consumers actually experience, and pairs naturally with the earlier-proposed "My Barrel Impact" personal calculator idea.
10.2 Functional Requirements
ID
Requirement
FR-151
System shall display current regional average prices for gasoline, diesel, jet fuel, and heating oil (US regions via EIA; other regions where free data exists).
FR-152
System shall show a synced chart comparing crude price movement against downstream product price movement over the same period, making the lag/pass-through relationship visible.
FR-153
System shall clearly label the geographic scope of each price series (e.g., "US Gulf Coast average," "US national average") since downstream prices vary significantly by region and a single "global" number would be misleading.
10.3 Data Sources & Cadence
Source
Data
Cadence
Access
EIA Gasoline & Diesel Retail Prices
US regional retail prices
🔵 Weekly
eia.gov/petroleum/gasdiesel
EIA Jet Fuel / Heating Oil series
US wholesale/retail prices
🔵 Weekly
eia.gov/opendata
Honest cadence: EIA's retail price surveys are weekly by design — this is the genuine ceiling for free downstream price data, not a limitation of this product's implementation.
11. Tab: Sanctions & Trade Restrictions Tracker (/sanctions)
11.1 Purpose
A running list of active oil-related sanctions by country/entity — the legal/policy complement to the Dark Fleet Tracker's vessel-behavior signal.
11.2 Functional Requirements
ID
Requirement
FR-154
System shall display currently active oil-related sanctions with country/entity, date enacted, and a plain-language scope summary.
FR-155
System shall cross-reference sanctioned entities against the Dark Fleet Tracker's vessel data where a named vessel or operator overlaps (reusing existing OFAC integration already specified for that module, rather than duplicating it).
FR-156
System shall poll for newly added sanctions entries and surface a "recently added" indicator for entries added within the last 7 days.
11.3 Data Sources & Cadence
Source
Data
Cadence
Access
OFAC Sanctions List
US sanctions
🟡 Daily poll for updates (list itself updates irregularly, as issued — daily poll catches new entries promptly)
sanctionslist.ofac.treas.gov
EU Sanctions Map
EU sanctions
🟡 Daily poll
sanctionsmap.eu (public data)
Honest cadence: sanctions are issued irregularly (not on a fixed schedule), so "daily poll" means "checked daily for whatever changed," not "updates daily" — an important distinction to preserve in the UI's cadence badge (should read something like "checked daily" rather than a generic "DAILY" badge that implies the underlying reality changes daily).
12. Merged Requirement: Live-Value Animation Applies to All 10 New Tabs
Per the prior document's §4 (FR-117–FR-121), every live/cached numeric value across the product must play the brief directional flash animation on change. This is explicitly extended to every new tab in this document:
ID
Requirement
FR-157
Every numeric value across all 10 new tabs (prices, quotas, compliance %, reserve levels, freight rates, capacity figures) shall apply the existing flash-on-change animation (FR-117–FR-121) when its underlying cached value changes between refreshes — no new tab is exempt from this requirement.
FR-158
Given several of these tabs have genuinely slow (weekly/monthly/periodic) cadence, the flash animation will naturally fire far less often on these pages than on /v1's price ticker — this is correct and expected behavior, not a bug; the animation should never be artificially triggered on an unchanged value just to appear "more live" than the data actually is (this would directly violate the product's core data-honesty principle).
13. Summary Table — All 10 New Tabs
Tab
Route
Fastest Genuine Cadence
Primary Free Source
Crude Grades & Quality Explorer
/grades
Daily (price), Periodic (specs)
EIA
Oil Majors Financial Snapshot
/majors
4h cached (price), Weekly (filings)
SEC EDGAR, Alpha Vantage
Strategic Petroleum Reserves Tracker
/spr
Weekly
EIA
Global Refinery Directory
/refineries
Periodic (annual)
EIA Refinery Capacity Report
Pipeline Network Map
/pipelines
Periodic (network), ~15–30min (outage flags via GDELT)
EIA, GDELT
Tanker Freight & Shipping Cost Tracker
/freight
Daily (limited free granularity — gap flagged)
Baltic Exchange (public summary only)
Futures Curve Viewer
/futures
Daily (settlement-based)
Alpha Vantage, CME public settlement
OPEC+ Quota Compliance Tracker
/opec-compliance
Monthly
OPEC, EIA
Downstream Product Prices
/downstream
Weekly
EIA
Sanctions & Trade Restrictions Tracker
/sanctions
Daily poll (irregular underlying updates)
OFAC, EU Sanctions Map
No tab in this set achieves true per-second or continuous-live data — this is a structural fact of free public oil-market data, not a shortfall in this specification. The fastest genuinely live layer in the entire product remains V4's satellite/GDELT infrastructure (5–15 min) and V1's WebSocket-pushed price/news modules — these 10 new tabs are intentionally the product's slower, deeper reference layer, and are badged accordingly rather than being misrepresented as faster than they are.