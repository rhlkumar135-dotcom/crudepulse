A new portal page: comprehensive, image-rich, interactive news displayed on a live world map
1. Purpose
A dedicated page (/news) presenting all recent oil-relevant news as an interactive, geotagged, image-rich experience — not a plain headline list. Users see a live world map with pins where news is happening, and can browse the same content as a rich scrollable feed. This is the most visually engaging "discovery" surface in the product — designed for browsing, not just monitoring.
2. Core Design Concept
Split view: interactive world map (left/top) + scrollable article feed (right/bottom), synced — hovering/clicking a map pin scrolls the feed to that article and vice versa.
Map pins are geotagged automatically (see §4 — GDELT does this natively), clustered when zoomed out, colored by topic category (disruption = red, price/market = amber, policy/OPEC = blue, environmental = green, infrastructure = purple).
Article cards show: image (when available), headline, one-line AI-generated summary (reuse the LLM pattern from the Daily Brief feature), source + timestamp, region tag, and a "read more" link out to the original source (never reproduce full article text — link out, consistent with copyright practice).
Filters: by region, topic category, recency (last 24h/7d/30d), and source.
Live updating: new pins/cards animate in as fresh data arrives, with a "X new stories" toast rather than jarring auto-scroll.
3. Detailed Pin System
3.1 Pin Anatomy & Sizing
Pins are not uniform — size scales with a computed Importance Score, a transparent (non-ML) weighted formula: (mention_volume_last_1h × 0.4) + (|GDELT_tone_score| × 0.35) + (recency_decay_factor × 0.25). Higher score = larger pin. This means a minor regional mention renders small; a major disruption event renders large and impossible to miss — the map self-prioritizes without the user needing to filter.
Pin shape: circular base with a colored ring (category color, §3.2) and a solid fill whose opacity reflects recency (fully opaque <1h old, fading to 60% opacity as it approaches 24h, further fading toward the 30-day retention edge).
3.2 Pin Color Coding (category)
Category
Color
Hex
Example Events
Disruption/Conflict
Red
#EF4444
Attacks, strikes, chokepoint incidents, sanctions enforcement
Price/Market Move
Amber
#F5A623
Major price swings, trading news, futures activity
Policy/OPEC
Blue
#3B82F6
OPEC+ decisions, government policy, regulatory action
Environmental/Spill
Green
#2DD4BF
Spill candidates (linking to the Satellite layer's spill detection), emissions events, environmental policy
Infrastructure
Purple
#A78BFA
Pipeline/refinery construction, capacity changes, new discoveries
This palette must remain colorblind-considerate: pair every color with a distinct pin icon/shape (not color alone) — e.g., a flame glyph for disruption, a dollar glyph for price, a gavel glyph for policy, a droplet glyph for environmental, a wrench glyph for infrastructure — so category is legible without relying on color perception alone.
3.3 Pin Interaction States
State
Trigger
Behavior
Default
Idle on map
Static pin at computed size/color/opacity
Hover
Mouse hover (desktop)
Lightweight preview tooltip: headline + thumbnail + timestamp, no full card
Active/Selected
Click/tap
Map flies-to and centers on pin, full article card expands in the synced feed panel, pin gets a highlighted outline ring
New-Arrival
Story surfaced in the last 10 minutes
Pulsing animation (expanding ring, 2–3 second loop) + a small "Breaking" badge; pulse automatically stops after 10 minutes, reverting to default state
Clustered
Multiple pins within proximity at current zoom level
Renders as a single cluster bubble showing a count (e.g., "12"); cluster color reflects the dominant category among its members; clicking a cluster zooms in to break it apart, never opens a card directly
Related/Threaded
Multiple articles covering the same underlying story (see §3.5)
Pin shows a small stacked-card icon indicator; clicking opens a threaded view showing all related sources under one story headline instead of duplicate pins
3.4 Interactive Legend
Persistent overlay panel (top-left or collapsible corner drawer) showing all 5 category swatches with icon + label + live count of currently-visible pins in that category.
Legend is clickable/toggleable — clicking a category dims/hides that category's pins on both map and feed, letting users isolate (e.g.) only Disruption events. Multi-select (toggle several on/off independently), not radio-button single-select.
A "reset filters" control restores all categories.
Legend also displays the current view mode toggle (Pins vs. Heatmap, §3.6) and the active recency window (24h/7d/30d) as part of the same panel, so all view-state controls live in one predictable place rather than scattered across the UI.
3.5 Story Threading & Deduplication
Articles covering the same underlying event (common with wire-service stories picked up by many outlets) are grouped server-side into a single Story object with a story_id, using the lightweight similarity heuristic already specified (headline similarity + time window + topic tag — no heavyweight ML).
The map shows one pin per story, not one per article. The expanded card shows the primary (first-published or highest-authority) source plus a "+N more sources" expandable list.
This is what keeps the map readable during a major event that generates 30+ articles in an hour, rather than becoming an unreadable pile of duplicate pins.
3.6 Alternate View: Density Heatmap Mode
Toggle (in the legend panel) switches pin view to a smooth heatmap layer showing news density by region rather than individual pins — useful for spotting macro patterns ("a lot is happening in the Gulf right now") at a glance, especially at low zoom levels where individual pins would be too small to read.
Heatmap intensity uses the same Importance Score aggregated by geographic cell, not raw article count alone (so one major story outweighs ten trivial mentions).
3.7 Timeline Scrubber
A horizontal scrubber below the map lets users drag back through the last 30 days (matching the product's existing rolling retention window) — dragging replays pins appearing in their original chronological sequence, turning the map into a rewindable news history rather than only a live snapshot.
A "Live" toggle/button snaps back to real-time mode from any scrubbed position.
This reuses the same underlying stored history that the Satellite layer and Time Machine concept already depend on — no new data pipeline, just a new UI over existing retained data.
3.8 Region Quick-Jump & Search
Preset chips (Middle East, North America, Europe, Asia-Pacific, Global) instantly fly the map camera to that region's bounding box.
A search bar filters both map pins and the feed by keyword, company name, or country — matching against story headlines/summaries and region tags, live-updating results as the user types (debounced).
3.9 Trending Ticker
A slim horizontal ticker strip above or below the map surfaces the top 5 topics by mention-velocity (rate of increase in GDELT mentions over the last hour vs. the prior hour) — e.g., "▲ Hormuz mentions +340% this hour." Clicking a ticker item filters the map/feed to that topic.
3.10 Bookmarking & Sharing
Logged-in users (any tier) can bookmark individual stories to a personal reading list, accessible from their account area.
Each story supports one-click shareable image card generation — this reuses the Market Moment card generator already specified elsewhere in the product, applied here to any individual news story rather than only auto-triggered digest moments.
3.11 Optional Sound Cue
An optional, off-by-default toggle plays a subtle audio "ping" when a new Breaking pin arrives — consistent with (and reusable from) the ambient sonification concept elsewhere in the product, but scoped here to a simple discrete notification sound rather than continuous generative audio.
4. Data Sources
Source
What It Provides
Cadence
Access
Key Required
GDELT GEO 2.0 API
Automatically geotagged news events (lat/lon per article) — this is what makes the map genuinely interactive without you building your own geocoding pipeline
~15 min
https://blog.gdeltproject.org/gdelt-geo-2-0-api-debuts/
Free, no key
GDELT DOC 2.0 API
Article metadata including a sharingimage field (article's associated image URL where available), tone score, topic
~15 min
https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
Free, no key
NewsAPI (already integrated)
Higher-quality headline/image pairs (urlToImage field) for top-volume stories
Cached, 2–4h per existing rate-limit design
https://newsapi.org/
Free tier, 100 req/day
Google News RSS
Free supplementary feed diversity beyond NewsAPI's daily cap, no key needed — query via https://news.google.com/rss/search?q=<query>
Near-real-time
Public RSS, no signup
None
Reuters Energy RSS / oilprice.com RSS / EIA blog RSS
Curated, oil-industry-specific feeds as a higher-signal supplementary source
Varies, several/day
Public RSS endpoints (verify current URLs at each publisher, subject to change)
None
Wikimedia Commons
Free, appropriately-licensed fallback imagery for topic categories when no article image exists (e.g., a generic labeled "refinery," "tanker," "OPEC meeting" stock image)
N/A (static library)
https://commons.wikimedia.org/
None, but must respect individual image licenses (most CC-BY/CC-BY-SA — attribution required)
Image-handling requirement (important): when an article has no native image, the system may show a topic-appropriate stock image from Wikimedia Commons only if clearly labeled as generic/illustrative ("Representative image" badge) — never presented as if it depicts the actual event. This avoids misleading users into thinking a stock photo is real footage of a specific incident.
5. Functional Requirements
5.1 Core Map & Feed
ID
Requirement
FR-77
System shall display a world map with pins for all oil-relevant news events geotagged via GDELT GEO 2.0, refreshed every 15 minutes.
FR-78
Map pins shall be color-coded and icon-coded by topic category (§3.2) and clustered at low zoom levels to avoid visual overload.
FR-79
System shall display a synchronized scrollable article feed alongside the map; selecting a pin or feed item highlights/scrolls the corresponding counterpart.
FR-80
Each article card shall display an image where available (via GDELT sharingimage or NewsAPI urlToImage), a one-line AI-generated summary, source, timestamp, and region tag.
FR-81
System shall never reproduce full article text — cards link out to the original source for full reading.
FR-82
When no native article image exists, system shall optionally display a clearly-labeled generic/illustrative stock image (Wikimedia Commons, properly attributed) rather than a blank card — labeling must make clear the image is representative, not the actual event.
FR-83
System shall support filtering by region, topic category, recency window (24h/7d/30d), and source.
FR-84
New stories arriving after initial page load shall be indicated via a non-disruptive "X new stories" toast/badge rather than automatically re-sorting or scrolling the user's current view.
FR-85
System shall deduplicate near-identical stories covered by multiple outlets into a single Story object per §3.5, rather than showing duplicate pins/cards.
5.2 Pin Behavior & Sizing
ID
Requirement
FR-86
System shall compute an Importance Score per story using the formula in §3.1 and scale pin size accordingly; the formula and its weights shall be documented/visible to the user (e.g., via an info tooltip) rather than presented as an opaque black-box ranking.
FR-87
Pin fill opacity shall decay with story age per §3.1's schedule, giving the map a visual "freshness" gradient without requiring the user to check timestamps individually.
FR-88
New-arrival pins shall pulse for exactly 10 minutes from first surfacing, then revert permanently to default state — pulsing shall not re-trigger on subsequent unrelated updates to the same story.
FR-89
Cluster bubbles shall display an accurate live count and shall recompute/redraw as the user zooms, never showing a stale count from a previous zoom level.
5.3 Legend & View Controls
ID
Requirement
FR-90
The legend panel shall show all 5 categories with icon, color swatch, label, and a live count of currently-visible pins in that category, updating as filters/zoom change.
FR-91
Clicking a legend category shall toggle (not replace) that category's visibility on both map and feed simultaneously — multiple categories may be independently toggled off at once.
FR-92
A single "reset filters" control shall restore all categories and the default recency window in one action.
FR-93
The Pins/Heatmap view toggle (§3.6) shall live within the same legend panel as category filters, not as a separate disconnected control.
FR-94
Heatmap mode intensity shall be computed from aggregated Importance Score per geographic cell, not raw pin count, consistent with §3.6.
5.4 Timeline, Search & Navigation
ID
Requirement
FR-95
The timeline scrubber shall allow dragging across the full 30-day retention window, replaying pin arrivals in true chronological sequence at the scrubbed position.
FR-96
A "Live" control shall be persistently visible while scrubbed to a past position, allowing one-click return to real-time mode.
FR-97
Region quick-jump chips shall animate the map camera (smooth fly-to, not an instant jump cut) to each preset region's bounding box.
FR-98
The search bar shall filter map and feed simultaneously against story headlines, summaries, and region/entity tags, with debounced live results as the user types.
5.5 Trending, Bookmarking & Sharing
ID
Requirement
FR-99
The trending ticker shall rank topics by mention-velocity (current-hour vs. prior-hour GDELT mention rate), refreshed every 15 minutes alongside the core pin data.
FR-100
Clicking a trending ticker item shall apply it as a live filter to both map and feed, consistent with the search/filter behavior in §5.4.
FR-101
Logged-in users on any tier shall be able to bookmark a story to a personal reading list, persisted to their account.
FR-102
Each story shall support one-click shareable image card generation, reusing the existing Market Moment card generator rather than a separate rendering pipeline.
FR-103
The optional Breaking-pin sound cue shall default to off and persist the user's on/off preference across sessions.
6. Non-Functional Requirements
ID
Requirement
NFR-20
GDELT GEO/DOC polling shall run as a shared cron job (15 min) feeding both the existing Disruption Radar module and this new News Atlas page — avoid duplicate GDELT integrations.
NFR-21
AI-generated summaries (FR-80) shall be cached per-story (generate once, reuse), not regenerated per page view, to control LLM API cost.
NFR-22
Map rendering shall lazy-load/code-split independently (per the existing multi-page architecture pattern) so this page's map tooling doesn't affect load time elsewhere in the product.
NFR-23
Deduplication (FR-85) shall use a simple similarity heuristic (headline text similarity + same time window + same topic tag) — not a heavyweight ML dedup system, consistent with the product's general no-unnecessary-ML principle.
NFR-24
Pin clustering and rendering shall remain performant with at least several hundred concurrent story pins on screen — use viewport-based rendering/virtualization for the feed list and standard map-library clustering (not custom-built) for the map layer.
NFR-25
The category color palette shall be paired with distinct icons/shapes (§3.2) so the map remains legible for colorblind users without relying on color alone.
NFR-26
Map and legend controls shall be keyboard-navigable and screen-reader labeled (pin categories, counts, and selected-story state announced), consistent with general accessibility practice.
NFR-27
On mobile viewports, the split map/feed view shall stack (map on top, feed below, or a swipeable toggle) rather than compressing both into an unusably small side-by-side layout.
NFR-28
Timeline scrubbing (FR-95) shall query pre-aggregated/cached historical data rather than re-querying GDELT live for past windows, since GDELT's live endpoint is not intended for this access pattern.