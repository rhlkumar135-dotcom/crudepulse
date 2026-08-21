CrudePulse — V4: Satellite & Earth-Observation Intelligence Layer
Detailed Requirements & Genuine Free, Fast Data Sources
Versioning note: this document promotes the Satellite Intelligence Layer to V4. The previously-specced "creative/extraordinary" feature set (Scenario Simulator, Time Machine, Sonification, Flyover, Bull/Bear Debate, Market Moment Cards) should be treated as V5 going forward, since it was the prior V4 — flag this to whoever's tracking the roadmap so the two documents don't collide on the same version number.
1. V4 Purpose & Positioning
V4 is CrudePulse's fastest-refreshing, most genuinely "live" layer. Where V1–V3 top out at 30-minute (GDELT) or hourly cadence, V4 introduces sub-hourly and near-real-time signals for the first time — thermal incident detection, dark-vessel activity, and emissions readings — while explicitly documenting every source's true latency so nothing is oversold as faster than it is.
2. Data Sources Ranked by Genuine Latency (fastest first)
This ranking matters more here than in any prior version — V4's entire value proposition is speed, so sources must be evaluated honestly on actual refresh rate, not nominal "real-time" marketing language.
Rank
Source
True Latency
What It Detects
Coverage Limit
1
NOAA GOES-16/17/18
5–15 min (new full-disk scan)
Thermal hotspots (fires, explosions, major flares)
Geostationary — Americas, Atlantic, Pacific only; does NOT cover Middle East/Asia (see §3 gap note)
2
NASA FIRMS (VIIRS/MODIS feed)
~3 hours from satellite pass to public availability
Global thermal anomaly detection
Global, but polar-orbiting — several passes/day per location, not continuous
3
Global Fishing Watch
Near-real-time (AIS-gap events surface within hours)
Dark vessel activity, AIS gaps, ship-to-ship transfers
Global, marine only
4
OpenAQ
Real-time to ~1h (station-dependent)
Ground-level NO2/SO2
Only where physical ground stations exist — sparse in Gulf states, better in Europe/US
5
Copernicus Sentinel-5P
Daily (1 pass/day per location)
Methane, NO2, SO2 columns
Global
6
VIIRS Nightfire
Nightly
Gas flare detection
Global
7
Copernicus Marine Service / CAMS
Daily/forecast cycles
Ocean current, atmospheric dispersion
Global
8
Copernicus Sentinel-1 (SAR)
~6 days (variable, faster over priority areas)
Oil spill dark-signature
Global
9
Copernicus Sentinel-2 (Optical)
~5 days, cloud-permitting
Facility/storage visual reference
Global
10
Landsat 8/9
16 days
Secondary optical pass
Global
Key honesty point for the UI: only ranks 1–3 qualify as genuinely "fast" in a way a user would recognize as near-real-time. Ranks 4–10 are valuable but must never be badged the same way as ranks 1–3 — this is the core of the data-honesty requirement below (§4, FR-72).
3. Coverage Gap Note: GOES vs. Middle East
GOES satellites are geostationary over the Americas/Atlantic/Pacific — they do not see the Middle East, which is the single most disruption-relevant oil region in the product. This is a genuine, unavoidable gap with free data:
Partial mitigation: Japan's Himawari-8/9 (geostationary over Asia-Pacific) and EUMETSAT's Meteosat (geostationary over Europe/Africa/Middle East) are the equivalent free geostationary sources that do cover the Middle East and Indian Ocean. Both publish free, open data.
Meteosat Second/Third Generation — EUMETSAT free data portal: https://www.eumetsat.int/eumetsat-data-centre (free registration) — 15-minute full-disk scans, covers the Middle East, Suez, and the Red Sea/Bab-el-Mandeb chokepoint directly.
Himawari-8/9 — free via NOAA's public S3 mirror: https://registry.opendata.aws/noaa-himawari/ — 10-minute scans, covers Malacca Strait and East Asian refining hubs.
Requirement: V4 must use Meteosat for Middle East/African facilities and chokepoints, Himawari for Asia-Pacific facilities, and GOES for Americas facilities — a three-satellite geostationary handoff, not GOES alone, to actually achieve near-real-time coverage of the regions that matter most to this product (Hormuz, Suez, Bab-el-Mandeb are Meteosat's territory, not GOES').
This closes what would otherwise be the most damaging gap in a product whose whole premise is Middle East-inclusive oil intelligence.
4. Detailed Functional Requirements
4.1 Thermal Incident Detection
ID
Requirement
FR-63
System shall maintain a geofenced watchlist of major oil/gas facilities (refineries, export terminals, major fields, chokepoints), each tagged with the correct geostationary source (GOES / Meteosat / Himawari) based on longitude.
FR-64
System shall poll GOES, Meteosat, and Himawari public data feeds at their native scan interval (5–15 min) for thermal anomalies within a configurable radius (default 5km) of each watchlisted facility.
FR-65
System shall cross-check any GOES/Meteosat/Himawari thermal flag against NASA FIRMS' next available pass for the same location to reduce false positives (geostationary thermal sensors have coarser resolution and are prone to false triggers from sun glint, wildfires, or unrelated industrial heat).
FR-66
A thermal anomaly shall only surface as a user-facing "incident alert" after either (a) FIRMS cross-confirmation, or (b) the geostationary signal persists across 2+ consecutive scans (10–30 min) — single-scan geostationary flags alone are not sufficient confidence for an alert, only for an internal "candidate" state.
FR-67
Confirmed incident alerts shall support optional push/email notification for Pro-tier users who have the affected facility/region on a watchlist (reuses Phase 2's alerting infrastructure).
4.2 Emissions & Flare Monitoring
ID
Requirement
FR-68
System shall pull daily Sentinel-5P methane/NO2/SO2 readings and nightly VIIRS Nightfire flare detections for the same facility watchlist, cross-referencing both for agreement/divergence (per the existing gap-analysis requirement).
FR-69
System shall pull OpenAQ ground-station readings within a configurable radius (default 25km, since ground stations are sparser than satellite grid) of each facility where a station exists, and explicitly mark facilities with no nearby ground station as "no ground-truth available" rather than omitting the field silently.
FR-70
System shall display a rolling 30-day trend chart per facility for methane/NO2/SO2, flare-detection frequency, and ground-station readings where available, on one combined view per facility.
4.3 Dark Vessel & Chokepoint Activity
ID
Requirement
FR-71
System shall integrate Global Fishing Watch's AIS-gap and ship-to-ship transfer detection as a live overlay on the existing Chokepoint Monitor, refreshed at Global Fishing Watch's native update interval.
FR-72
Every displayed data point across all V4 sources shall carry an explicit, source-specific cadence badge reflecting its true latency per §2's ranking (e.g., "GOES · ~10min," "Sentinel-5P · daily," "OpenAQ · station-dependent") — no source may borrow another's badge or imply faster refresh than it delivers.
4.4 Spill Detection & Drift
ID
Requirement
FR-73
Upon a Sentinel-1 spill candidate flag, system shall query Copernicus Marine Service current/wave data and CAMS (for any surface-level atmospheric transport relevant to volatile fractions) to render a projected drift path/timeframe overlay.
FR-74
Spill candidate flags shall remain labeled "candidate — unconfirmed" until either manual review or a corroborating signal (e.g., a nearby AIS gap from Global Fishing Watch coinciding with the spill window) raises confidence — the system shall never auto-upgrade a candidate to "confirmed" without a corroborating cross-source signal.
4.5 Data Retention & Historical View
ID
Requirement
FR-75
All V4 source data shall be retained on a rolling 30-day window per facility/region, queryable as a trend view.
FR-76
Data older than 30 days shall be summarized (daily/weekly aggregates) rather than dropped entirely, preserving long-term trend capability without unbounded storage growth.
5. Non-Functional Requirements
ID
Requirement
NFR-15
GOES/Meteosat/Himawari polling (5–15 min cadence) shall run as dedicated, independent cron jobs per satellite — a failure or rate-limit issue on one geostationary source shall not block the others.
NFR-16
System shall respect each source's actual rate/usage limits: EUMETSAT and NOAA's public S3 buckets have no hard key-based rate limit but do have fair-use expectations — implement client-side request throttling and caching regardless, since polling every facility every scan cycle across 3 satellites at scale is nontrivial data volume.
NFR-17
False-positive handling (FR-65/66) shall be logged and periodically reviewed — if a given facility location generates a high false-positive rate (e.g., due to a nearby non-oil heat source), the system shall support an admin-adjustable geofence/sensitivity override for that location.
NFR-18
System shall clearly distinguish, in both API responses and UI, between "confirmed," "candidate/unconfirmed," and "no data available" states for every incident-type signal — these three states must never be visually or textually conflated.
NFR-19
Given the genuinely higher data volume of V4 (5–15 min polling across 3 geostationary sources × a facility watchlist), storage and query design shall be load-tested before production rollout — this is a materially different data scale than V1–V3's hourly-or-slower cadences.
6. Complete Data Source Reference (V4 only)
Source
Latency
What It Adds
Access
Key Required
NOAA GOES-16/17/18
5–15 min
Thermal hotspots, Americas/Atlantic/Pacific
registry.opendata.aws/noaa-goes
Free, no key, public S3
EUMETSAT Meteosat
~15 min
Thermal hotspots, Europe/Africa/Middle East
eumetsat.int/eumetsat-data-centre
Free registration
NOAA/JMA Himawari-8/9
~10 min
Thermal hotspots, Asia-Pacific
registry.opendata.aws/noaa-himawari
Free, no key, public S3
NASA FIRMS
~3h
Global thermal anomaly cross-confirmation
firms.modaps.eosdis.nasa.gov/api
Free, no key for basic use
Global Fishing Watch
Near-real-time
Dark vessel/AIS-gap/ship-to-ship transfer detection
globalfishingwatch.org/our-apis
Free API key
OpenAQ
Real-time to ~1h
Ground-truth NO2/SO2
openaq.org
Free, no key for basic tier
Copernicus Sentinel-5P
Daily
Methane/NO2/SO2 columns
dataspace.copernicus.eu
Free registration
NOAA/NASA VIIRS Nightfire
Nightly
Gas flare detection
eogdata.mines.edu/products/vnf
Free
Copernicus Marine Service
Daily/forecast
Ocean current/drift modeling
marine.copernicus.eu
Free registration
Copernicus Atmosphere Monitoring Service (CAMS)
Multiple/day
Atmospheric dispersion forecast
atmosphere.copernicus.eu
Free registration
Copernicus Sentinel-1 (SAR)
~6 days
Oil spill dark-signature detection
dataspace.copernicus.eu, sentinel-hub.com
Free registration
Copernicus Sentinel-2 (Optical)
~5 days, cloud-permitting
Facility/storage visual reference
dataspace.copernicus.eu, sentinel-hub.com
Free registration
NASA/USGS Landsat 8/9
16 days
Secondary optical pass, cloud-gap fill
earthexplorer.usgs.gov
Free registration
13 sources total, zero paid tiers required, genuine latency honestly documented for each — including the one unavoidable structural gap (GOES not covering the Middle East) and its actual fix (Meteosat), rather than leaving that gap unaddressed.