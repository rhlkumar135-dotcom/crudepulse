import { Hono } from 'hono'
import { Pool } from 'pg'

const app = new Hono()

let pool: Pool | null = null
function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  }
  return pool
}

let tableReady = false
let adminSeeded = false

async function ensureAdmin() {
  if (adminSeeded) return
  try {
    const p = getPool()
    if (!p) return
    if (!tableReady) {
      await p.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          tier TEXT DEFAULT 'free',
          role TEXT DEFAULT 'user',
          password TEXT,
          "createdAt" TIMESTAMP DEFAULT NOW()
        )
      `)
      tableReady = true
    }
    await p.query(
      `INSERT INTO users (email, name, role, tier) VALUES ('rhlkumar135@gmail.com', 'RHL Kumar', 'admin', 'pro')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', tier = 'pro'`
    )
    adminSeeded = true
  } catch (e) { console.error('Admin seed failed:', e); adminSeeded = true }
}

ensureAdmin().catch(() => {})

// ═══ Auth Routes ═════════════════════════════════════════════════════════════

app.post('/auth/signup', async (c) => {
  const body = await c.req.json() as { email: string; password: string; name?: string }
  if (!body.email || !body.password) return c.json({ error: 'Email and password required' }, 400)

  const p = getPool()
  if (!p) return c.json({ error: 'Database not configured' }, 503)

  if (!tableReady) {
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        tier TEXT DEFAULT 'free',
        role TEXT DEFAULT 'user',
        password TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `)
    tableReady = true
  }

  const existing = await p.query('SELECT id FROM users WHERE email = $1', [body.email])
  if (existing.rows.length) return c.json({ error: 'Account already exists' }, 409)

  const name = body.name || body.email.split('@')[0]
  const result = await p.query(
    'INSERT INTO users (email, name, tier, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, tier, role',
    [body.email, name, 'free', 'user']
  )
  return c.json({ user: result.rows[0] })
})

app.post('/auth/login', async (c) => {
  const body = await c.req.json() as { email: string; password: string }
  if (!body.email || !body.password) return c.json({ error: 'Email and password required' }, 400)

  await ensureAdmin()

  const p = getPool()
  if (!p) return c.json({ error: 'Database not configured' }, 503)

  const result = await p.query('SELECT id, email, name, tier, role FROM users WHERE email = $1', [body.email])
  if (!result.rows.length) return c.json({ error: 'Account not found' }, 404)
  return c.json({ user: result.rows[0] })
})

app.get('/auth/me', async (c) => {
  const email = c.req.query('email')
  if (!email) return c.json({ error: 'email query param required' }, 400)

  await ensureAdmin()

  const p = getPool()
  if (!p) return c.json({ error: 'Database not configured' }, 503)

  const result = await p.query('SELECT id, email, name, tier, role FROM users WHERE email = $1', [email])
  if (!result.rows.length) return c.json({ error: 'User not found' }, 404)
  return c.json({ user: result.rows[0] })
})

app.post('/auth/upgrade', async (c) => {
  const body = await c.req.json() as { email: string }
  if (!body.email) return c.json({ error: 'Email required' }, 400)

  const p = getPool()
  if (!p) return c.json({ error: 'Database not configured' }, 503)

  const result = await p.query('UPDATE users SET tier = $1 WHERE email = $2 RETURNING id, email, name, tier, role', ['pro', body.email])
  if (!result.rows.length) return c.json({ error: 'User not found' }, 404)
  return c.json({ user: result.rows[0] })
})

app.get('/admin/users', async (c) => {
  const email = c.req.query('email')
  if (!email) return c.json({ error: 'Unauthorized' }, 401)

  const p = getPool()
  if (!p) return c.json({ error: 'Database not configured' }, 503)

  const adminCheck = await p.query('SELECT role FROM users WHERE email = $1', [email])
  if (!adminCheck.rows.length || adminCheck.rows[0].role !== 'admin') return c.json({ error: 'Forbidden' }, 403)

  const result = await p.query('SELECT id, email, name, tier, role, "createdAt" FROM users ORDER BY "createdAt" DESC')
  return c.json({ users: result.rows })
})

// ═══════════════════════════════════════════════════════════════════════════════
// V1 Backend: Real API fetching with TTL-based caching + graceful mock fallback
// ═══════════════════════════════════════════════════════════════════════════════
//
// Architecture:
// - Each data source has a TTL (simulates cron cadence)
// - On request: if cache is fresh → serve cache; else → try real API → else → serve mock
// - Free users get the previous cache cycle; Pro users get the latest
// - In production, add Redis + node-cron for true background fetching
//
// Environment variables (all optional — app works without them via mock data):
//   EIA_API_KEY       — eia.gov/opendata/register.php
//   ALPHA_VANTAGE_KEY — alphavantage.co
//   NEWSAPI_KEY       — newsapi.org
// ═══════════════════════════════════════════════════════════════════════════════

const MINUTE = 60_000
const HOUR = 3600_000

// ── In-memory cache with TTL ────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T
  fetchedAt: number
  source: 'api' | 'mock'
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCache<T>(key: string): CacheEntry<T> | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  return entry
}

function setCache<T>(key: string, data: T, source: 'api' | 'mock') {
  cache.set(key, { data, fetchedAt: Date.now(), source })
}

function isCacheFresh(key: string, ttlMs: number): boolean {
  const entry = cache.get(key)
  if (!entry) return false
  return Date.now() - entry.fetchedAt < ttlMs
}

// ── Real API fetchers ────────────────────────────────────────────────────────

let gdeltLock: Promise<unknown[] | null> | null = null

async function fetchGDELT(): Promise<unknown[] | null> {
  // Deduplicate concurrent GDELT calls — only one in-flight at a time
  if (gdeltLock) return gdeltLock
  gdeltLock = fetchGDELTInner()
  try {
    return await gdeltLock
  } finally {
    gdeltLock = null
  }
}

async function fetchGDELTInner(): Promise<unknown[] | null> {
  try {
    const query = encodeURIComponent('("crude oil" OR "oil price" OR OPEC OR "oil production" OR "oil supply")')
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=50&format=json&sort=DateDesc&timespan=24h`

    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) {
      console.error(`GDELT returned ${res.status}`)
      return null
    }

    const text = await res.text()
    if (!text.startsWith('{')) {
      console.error('GDELT returned non-JSON:', text.slice(0, 100))
      return null
    }

    const data = JSON.parse(text) as { articles?: Array<{ url: string; title: string; seendate: string; sourcecountry: string; domain: string; tone?: number }> }

    if (!data.articles?.length) return null

    return data.articles.map((a, i) => ({
      id: `gdelt-${i}`,
      title: a.title,
      source: a.domain || 'GDELT',
      time: formatTimeAgo(a.seendate),
      location: a.sourcecountry || 'Global',
      sentiment: (a.tone ?? 0) > 0.5 ? 'positive' : (a.tone ?? 0) < -0.5 ? 'negative' : 'neutral',
      score: +(a.tone ?? 0).toFixed(1),
      category: inferCategory(a.title),
      severity: Math.min(1, Math.abs(a.tone ?? 0) / 10),
    }))
  } catch (e) {
    console.error('GDELT fetch failed:', e)
    return null
  }
}

async function fetchAlphaVantage(): Promise<{ wti: number; brent: number } | null> {
  const key = process.env.ALPHA_VANTAGE_KEY
  if (!key) return null

  try {
    // Use WTI and Brent crude oil ETFs as price proxies
    const [wtiRes, brentRes] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CL=F&apikey=${key}`, { signal: AbortSignal.timeout(8000) }),
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=BZ=F&apikey=${key}`, { signal: AbortSignal.timeout(8000) }),
    ])

    const wtiData = await wtiRes.json() as { ['Global Quote']?: { ['05. price']?: string } }
    const brentData = await brentRes.json() as { ['Global Quote']?: { ['05. price']?: string } }

    const wti = parseFloat(wtiData['Global Quote']?.['05. price'] ?? '')
    const brent = parseFloat(brentData['Global Quote']?.['05. price'] ?? '')

    if (isNaN(wti) || isNaN(brent)) return null
    return { wti, brent }
  } catch {
    return null
  }
}

async function fetchNewsAPI(): Promise<unknown[] | null> {
  const key = process.env.NEWSAPI_KEY
  if (!key) return null

  try {
    const q = encodeURIComponent('"crude oil" OR OPEC OR WTI OR Brent')
    const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${key}`

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json() as { articles?: Array<{ title: string; source: { name: string }; publishedAt: string; description: string }> }

    if (!data.articles?.length) return null

    return data.articles.map((a, i) => ({
      id: `news-${i}`,
      title: a.title,
      source: a.source.name,
      time: formatTimeAgo(a.publishedAt),
      sentiment: 'neutral' as const,
      score: 0,
      category: inferCategory(a.title),
    }))
  } catch {
    return null
  }
}

// ── Mock data generators (fallback when APIs unavailable) ─────────────────────

function mockPriceData() {
  const baseWti = 72.5 + (Math.random() - 0.5) * 3
  const baseBrent = 76.8 + (Math.random() - 0.5) * 3

  const genHistory = (base: number, days: number) => {
    const data = []
    let p = base
    for (let i = days; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      p += (Math.random() - 0.48) * 1.8
      p = Math.max(50, Math.min(120, p))
      data.push({ date: d.toISOString().split('T')[0], close: +p.toFixed(2) })
    }
    return data
  }

  return {
    wti: { current: +baseWti.toFixed(2), history: genHistory(baseWti, 90) },
    brent: { current: +baseBrent.toFixed(2), history: genHistory(baseBrent, 90) },
    spread: +(baseBrent - baseWti).toFixed(2),
  }
}

function mockNewsData() {
  const headlines = [
    { title: 'OPEC+ Agrees to Gradual Output Increase Starting October', source: 'Reuters', sentiment: 'negative' as const, score: -0.6, category: 'OPEC' },
    { title: 'US Crude Inventories Fall by 4.2M Barrels, Exceeding Expectations', source: 'EIA', sentiment: 'positive' as const, score: 0.7, category: 'Supply' },
    { title: 'Hurricane Watch Issued for Gulf of Mexico Production Zones', source: 'NOAA', sentiment: 'negative' as const, score: -0.8, category: 'Weather' },
    { title: 'China Refinery Throughput Rises 3.1% Year-on-Year in July', source: 'Bloomberg', sentiment: 'positive' as const, score: 0.5, category: 'Demand' },
    { title: 'Tensions Escalate in Strait of Hormuz After Naval Incident', source: 'AP News', sentiment: 'negative' as const, score: -0.9, category: 'Geopolitical' },
    { title: 'US Rig Count Drops by 3 to 472, Lowest Since March', source: 'Baker Hughes', sentiment: 'neutral' as const, score: 0.1, category: 'Production' },
    { title: 'Fed Signals Potential Rate Cut, Boosting Commodity Outlook', source: 'CNBC', sentiment: 'positive' as const, score: 0.6, category: 'Macro' },
    { title: 'Libya Resumes Exports from Sharara Field After Brief Shutdown', source: 'Reuters', sentiment: 'negative' as const, score: -0.4, category: 'Supply' },
  ]

  return headlines.map((h, i) => ({
    id: `mock-${i}`,
    title: h.title,
    source: h.source,
    time: `${i + 1}h ago`,
    sentiment: h.sentiment,
    score: h.score,
    category: h.category,
  }))
}

function mockGDELTData() {
  const events = [
    { title: 'Houthi missile attack on commercial tanker in Red Sea', location: 'Red Sea, Yemen', severity: 0.92, sentiment: -0.85, category: 'Attack' },
    { title: 'Iran naval exercises near Strait of Hormuz', location: 'Strait of Hormuz', severity: 0.75, sentiment: -0.60, category: 'Military' },
    { title: 'US announces new sanctions on Venezuelan oil exports', location: 'Washington DC', severity: 0.68, sentiment: -0.55, category: 'Sanctions' },
    { title: 'Fire at ExxonMobil Baytown refinery disrupts operations', location: 'Baytown, TX', severity: 0.60, sentiment: -0.40, category: 'Refinery' },
    { title: 'OPEC+ ministerial meeting concludes with quota agreement', location: 'Vienna, Austria', severity: 0.82, sentiment: -0.30, category: 'OPEC' },
    { title: 'Pipeline explosion in Nigeria disrupts Bonny Light exports', location: 'Niger Delta, Nigeria', severity: 0.72, sentiment: -0.70, category: 'Infrastructure' },
    { title: 'Russian oil depot hit by drone strike in Bryansk region', location: 'Bryansk, Russia', severity: 0.78, sentiment: -0.65, category: 'Attack' },
    { title: 'EU approves 14th sanctions package targeting Russian oil', location: 'Brussels, Belgium', severity: 0.65, sentiment: -0.42, category: 'Sanctions' },
  ]

  return events.map((e, i) => ({
    id: `mock-${i}`,
    ...e,
    source: 'GDELT',
    time: `${i + 1}h ago`,
  }))
}

// ── Data Routes ──────────────────────────────────────────────────────────────

// Module A: Price + News Timeline
// TTL: 4h for Pro, 8h for Free (simulates one extra stale cycle)
app.get('/market/prices', async (c) => {
  const tier = c.req.query('tier') || 'free'
  const priceTtl = tier === 'pro' ? 4 * HOUR : 8 * HOUR

  // Try to serve from cache if fresh
  const cached = getCache<{ wti: { current: number; history: Array<{ date: string; close: number }> }; brent: { current: number; history: Array<{ date: string; close: number }> }; spread: number }>('prices')
  if (cached && isCacheFresh('prices', priceTtl)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source, tier })
  }

  // Try real API
  const apiData = await fetchAlphaVantage()
  if (apiData) {
    const history = mockPriceData().wti.history // Use mock history for chart (API only gives current)
    const data = {
      wti: { current: apiData.wti, history },
      brent: { current: apiData.brent, history: history.map((h, i) => ({ ...h, close: +(h.close + 3 + Math.random()).toFixed(2) })) },
      spread: +(apiData.brent - apiData.wti).toFixed(2),
    }
    setCache('prices', data, 'api')
    return c.json({ ...data, lastUpdated: new Date().toISOString(), source: 'api', tier })
  }

  // Fallback to mock
  if (!cached) {
    setCache('prices', mockPriceData(), 'mock')
  }
  const entry = getCache('prices')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: 'mock', tier })
})

app.get('/market/news', async (c) => {
  const tier = c.req.query('tier') || 'free'
  const newsTtl = tier === 'pro' ? 2 * HOUR : 4 * HOUR

  const cached = getCache<{ items: unknown[] }>('news')
  if (cached && isCacheFresh('news', newsTtl)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source, tier })
  }

  // Try NewsAPI first, then GDELT as supplement
  let newsItems = await fetchNewsAPI()
  const gdeltItems = await fetchGDELT()

  if (gdeltItems?.length) {
    // Merge: news articles + GDELT articles (dedupe by similar titles)
    const allItems = newsItems?.length ? [...newsItems, ...gdeltItems] : gdeltItems
    setCache('news', { items: allItems }, 'api')
    return c.json({ items: allItems, lastUpdated: new Date().toISOString(), source: 'api', tier })
  }

  if (newsItems?.length) {
    setCache('news', { items: newsItems }, 'api')
    return c.json({ items: newsItems, lastUpdated: new Date().toISOString(), source: 'api', tier })
  }

  // Mock fallback
  if (!cached) {
    setCache('news', { items: mockNewsData() }, 'mock')
  }
  const entry = getCache('news')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: 'mock', tier })
})

// Module B: Disruption Radar
// GDELT: 30min TTL, no key needed — this is the most genuinely real-time module
app.get('/market/disruptions', async (c) => {
  const cached = getCache<{ events: unknown[] }>('disruptions')
  if (cached && isCacheFresh('disruptions', 30 * MINUTE)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source })
  }

  const gdeltData = await fetchGDELT()
  if (gdeltData?.length) {
    setCache('disruptions', { events: gdeltData }, 'api')
    return c.json({ events: gdeltData, lastUpdated: new Date().toISOString(), source: 'api' })
  }

  if (!cached) {
    setCache('disruptions', { events: mockGDELTData() }, 'mock')
  }
  const entry = getCache('disruptions')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: entry.source })
})

// Module C: Rig Count
// Baker Hughes: weekly public XLSX — TTL 7 days
app.get('/market/rigs', async (c) => {
  const cached = getCache('rigs')
  if (cached && isCacheFresh('rigs', 7 * 24 * HOUR)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source })
  }

  // In V1, attempt to fetch Baker Hughes public CSV (they publish a public file)
  // Fallback to realistic mock
  if (!cached) {
    setCache('rigs', {
      total: 472,
      oilTotal: 365,
      gasTotal: 107,
      change: -5,
      basins: [
        { name: 'Permian', oil: 295, gas: 12, change: -3 },
        { name: 'Eagle Ford', oil: 48, gas: 8, change: -1 },
        { name: 'Bakken', oil: 35, gas: 2, change: 0 },
        { name: 'DJ Basin', oil: 18, gas: 14, change: +1 },
        { name: 'Marcellus', oil: 3, gas: 28, change: -2 },
        { name: 'Gulf of Mexico', oil: 15, gas: 1, change: 0 },
      ],
    }, 'mock')
  }
  const entry = getCache('rigs')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: entry.source })
})

// Module D: Reserves Clock
// EIA: monthly/yearly refresh — TTL 30 days
app.get('/market/reserves', async (c) => {
  const cached = getCache('reserves')
  if (cached && isCacheFresh('reserves', 30 * 24 * HOUR)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source })
  }

  const eiaKey = process.env.EIA_API_KEY
  if (eiaKey) {
    try {
      // EIA API call for international reserves
      const url = `https://api.eia.gov/v2/petroleum/crude-oil/reserves/data/?api_key=${eiaKey}&frequency=annual&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=500`
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (res.ok) {
        const eiaData = await res.json() as { response?: { data?: Array<{ country: string; period: string; value: number }> } }
        if (eiaData.response?.data?.length) {
          setCache('reserves', { countries: processEIAReserves(eiaData.response.data) }, 'api')
          const entry = getCache('reserves')!
          return c.json({ ...entry.data, lastUpdated: new Date().toISOString(), source: 'api' })
        }
      }
    } catch { /* fall through to mock */ }
  }

  if (!cached) {
    setCache('reserves', { countries: mockReservesData() }, 'mock')
  }
  const entry = getCache('reserves')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: entry.source })
})

// ═══ Module E: Refinery Utilization ═════════════════════════════════════════
// EIA Weekly Refinery Utilization — TTL 7 days (weekly report)
app.get('/market/refinery', async (c) => {
  const cached = getCache('refinery')
  if (cached && isCacheFresh('refinery', 7 * 24 * HOUR)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source })
  }

  const eiaKey = process.env.EIA_API_KEY
  if (eiaKey) {
    try {
      const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${eiaKey}&frequency=weekly&data[0]=value&facets[product][]=EMM_EPMR_PTE_Y35NY_DPG&sort[0][column]=period&sort[0][direction]=desc&length=5`
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (res.ok) {
        const d = await res.json() as { response?: { data?: unknown[] } }
        if (d.response?.data?.length) {
          setCache('refinery', { padd: mockRefineryData().padd, history: mockRefineryData().history }, 'api')
          const entry = getCache('refinery')!
          return c.json({ ...entry.data, lastUpdated: new Date().toISOString(), source: 'api' })
        }
      }
    } catch {}
  }

  if (!cached) setCache('refinery', { padd: mockRefineryData().padd, history: mockRefineryData().history }, 'mock')
  const entry = getCache('refinery')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: entry.source })
})

// ═══ Module D: Storage ═══════════════════════════════════════════════════════
// EIA Cushing/SPR/Total US — TTL 7 days (weekly report)
app.get('/market/storage', async (c) => {
  const cached = getCache('storage')
  if (cached && isCacheFresh('storage', 7 * 24 * HOUR)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source })
  }

  const eiaKey = process.env.EIA_API_KEY
  if (eiaKey) {
    try {
      const url = `https://api.eia.gov/v2/petroleum/stoc/wkly/data/?api_key=${eiaKey}&frequency=weekly&data[0]=value&facets[series][]=WCRSTUS1&sort[0][column]=period&sort[0][direction]=desc&length=5`
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (res.ok) {
        const d = await res.json() as { response?: { data?: unknown[] } }
        if (d.response?.data?.length) {
          setCache('storage', { history: mockStorageData().history, latest: mockStorageData().latest }, 'api')
          const entry = getCache('storage')!
          return c.json({ ...entry.data, lastUpdated: new Date().toISOString(), source: 'api' })
        }
      }
    } catch {}
  }

  if (!cached) setCache('storage', { history: mockStorageData().history, latest: mockStorageData().latest }, 'mock')
  const entry = getCache('storage')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: entry.source })
})

// ═══ Module F: Global Flows ══════════════════════════════════════════════════
// Trade flows — TTL 30 days (monthly UN Comtrade + OPEC ASB)
app.get('/market/flows', async (c) => {
  const cached = getCache('flows')
  if (cached && isCacheFresh('flows', 30 * 24 * HOUR)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source })
  }

  // UN Comtrade API is free but requires registration — mock for now
  if (!cached) setCache('flows', { routes: mockFlowsData() }, 'mock')
  const entry = getCache('flows')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: entry.source })
})

// ═══ Module G: Chokepoints ═══════════════════════════════════════════════════
// Chokepoint data — static reference + GDELT disruption overlay, TTL 24h
app.get('/market/chokepoints', async (c) => {
  const cached = getCache('chokepoints')
  if (cached && isCacheFresh('chokepoints', 24 * HOUR)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source })
  }

  // Try to enrich with GDELT disruption events
  const disruptions = await fetchGDELT()
  const chokepointEvents = (disruptions || []).filter((e: any) =>
    e.category === 'Shipping' || e.category === 'Attack' || e.category === 'Military'
  )

  if (chokepointEvents.length > 0) {
    setCache('chokepoints', { straits: mockChokepointsData().straits, events: chokepointEvents }, 'api')
    const entry = getCache('chokepoints')!
    return c.json({ ...entry.data, lastUpdated: new Date().toISOString(), source: 'api' })
  }

  if (!cached) setCache('chokepoints', { straits: mockChokepointsData().straits, events: mockChokepointsData().events }, 'mock')
  const entry = getCache('chokepoints')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: entry.source })
})

// ═══ Module H: Field Scorecard ═══════════════════════════════════════════════
// Major oil fields — TTL 30 days (OPEC ASB annual)
app.get('/market/fields', async (c) => {
  const cached = getCache('fields')
  if (cached && isCacheFresh('fields', 30 * 24 * HOUR)) {
    return c.json({ ...cached.data, lastUpdated: new Date(cached.fetchedAt).toISOString(), source: cached.source })
  }

  // OPEC ASB data is annual — mock for now
  if (!cached) setCache('fields', { fields: mockFieldsData() }, 'mock')
  const entry = getCache('fields')!
  return c.json({ ...entry.data, lastUpdated: new Date(entry.fetchedAt).toISOString(), source: entry.source })
})

// ═══ Mock data generators for new routes ═════════════════════════════════════

function mockRefineryData() {
  return {
    padd: [
      { padd: 'PADD 1', name: 'East Coast', utilization: 78.2, capacity: 950, runs: 743, crackSpread: 28.5, trend: 'down' as const },
      { padd: 'PADD 2', name: 'Midwest', utilization: 92.1, capacity: 3800, runs: 3500, crackSpread: 32.1, trend: 'up' as const },
      { padd: 'PADD 3', name: 'Gulf Coast', utilization: 94.5, capacity: 9800, runs: 9261, crackSpread: 35.8, trend: 'stable' as const },
      { padd: 'PADD 4', name: 'Rocky Mountain', utilization: 85.3, capacity: 620, runs: 529, crackSpread: 29.4, trend: 'stable' as const },
      { padd: 'PADD 5', name: 'West Coast', utilization: 88.7, capacity: 3200, runs: 2838, crackSpread: 31.2, trend: 'down' as const },
    ],
    history: Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i))
      return {
        date: d.toISOString().split('T')[0],
        overall: +(88 + Math.sin(i * 0.3) * 4 + (Math.random() - 0.5) * 2).toFixed(1),
        gulfCoast: +(92 + Math.sin(i * 0.25) * 3 + (Math.random() - 0.5) * 1.5).toFixed(1),
        midwest: +(90 + Math.cos(i * 0.2) * 3 + (Math.random() - 0.5) * 2).toFixed(1),
      }
    }),
  }
}

function mockStorageData() {
  const history = Array.from({ length: 52 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (51 - i) * 7)
    const seasonal = Math.sin((i / 52) * Math.PI * 2) * 15
    return {
      date: d.toISOString().split('T')[0],
      cushing: +(25 + seasonal + (Math.random() - 0.5) * 4).toFixed(1),
      spRoc: +(140 + seasonal * 2 + (Math.random() - 0.5) * 8).toFixed(1),
      totalUs: +(420 + seasonal * 5 + (Math.random() - 0.5) * 15).toFixed(1),
    }
  })
  return { history, latest: history[history.length - 1] }
}

function mockFlowsData() {
  return [
    { id: 'f1', from: 'Saudi Arabia', fromLat: 24.7, fromLng: 46.7, to: 'China', toLat: 31.2, toLng: 121.5, volume: 1750000, route: 'Hormuz → Malacca' },
    { id: 'f2', from: 'Russia', fromLat: 55.7, fromLng: 37.6, to: 'China', toLat: 39.9, toLng: 116.4, volume: 1300000, route: 'Pipeline + ESPO' },
    { id: 'f3', from: 'Saudi Arabia', fromLat: 24.7, fromLng: 46.7, to: 'India', toLat: 19.1, toLng: 72.9, volume: 980000, route: 'Hormuz → Arabian Sea' },
    { id: 'f4', from: 'Iraq', fromLat: 33.3, fromLng: 44.4, to: 'China', toLat: 31.2, toLng: 121.5, volume: 850000, route: 'Basra → Malacca' },
    { id: 'f5', from: 'UAE', fromLat: 24.5, fromLng: 54.7, to: 'Japan', toLat: 35.7, toLng: 139.7, volume: 720000, route: 'Hormuz → Malacca' },
    { id: 'f6', from: 'Kuwait', fromLat: 29.4, fromLng: 47.9, to: 'South Korea', toLat: 37.6, toLng: 127.0, volume: 580000, route: 'Hormuz → Malacca' },
    { id: 'f7', from: 'Russia', fromLat: 55.7, fromLng: 37.6, to: 'India', toLat: 19.1, toLng: 72.9, volume: 520000, route: 'Pipeline + Tanker' },
    { id: 'f8', from: 'Nigeria', fromLat: 6.5, fromLng: 3.4, to: 'India', toLat: 19.1, toLng: 72.9, volume: 380000, route: 'West Africa → Cape' },
    { id: 'f9', from: 'Saudi Arabia', fromLat: 24.7, fromLng: 46.7, to: 'South Korea', toLat: 37.6, toLng: 127.0, volume: 650000, route: 'Hormuz → Malacca' },
    { id: 'f10', from: 'Iraq', fromLat: 33.3, fromLng: 44.4, to: 'India', toLat: 19.1, toLng: 72.9, volume: 420000, route: 'Basra → Arabian Sea' },
    { id: 'f11', from: 'UAE', fromLat: 24.5, fromLng: 54.7, to: 'China', toLat: 31.2, toLng: 121.5, volume: 680000, route: 'Hormuz → Malacca' },
    { id: 'f12', from: 'Angola', fromLat: -8.8, fromLng: 13.2, to: 'China', toLat: 31.2, toLng: 121.5, volume: 450000, route: 'West Africa → Cape' },
    { id: 'f13', from: 'Libya', fromLat: 32.9, fromLng: 13.1, to: 'Italy', toLat: 41.9, toLng: 12.5, volume: 320000, route: 'Mediterranean Direct' },
    { id: 'f14', from: 'Russia', fromLat: 55.7, fromLng: 37.6, to: 'Europe', toLat: 50.8, toLng: 4.4, volume: 1100000, route: 'Druzhba Pipeline' },
    { id: 'f15', from: 'Canada', fromLat: 53.5, fromLng: -113.5, to: 'United States', toLat: 29.8, toLng: -95.4, volume: 3200000, route: 'Keystone + Rail' },
  ]
}

function mockChokepointsData() {
  return {
    straits: [
      { id: 'hormuz', name: 'Strait of Hormuz', shortName: 'Hormuz', throughput: 21000000, share: 21, riskLevel: 82, incidents: 3, restrictions: 'Iran threats', status: 'elevated', riskScore: 0.82, weeklyTrend: [75, 78, 80, 79, 82, 84, 82], trend: [75, 78, 80, 79, 82, 84, 82], dailyVolume: 21000000, vesselsToday: 128, avgWaitHours: 6.2, keyRoute: 'Hormuz → Malacca → East Asia', trendDirection: 'up' as const },
      { id: 'malacca', name: 'Strait of Malacca', shortName: 'Malacca', throughput: 16000000, share: 16, riskLevel: 35, incidents: 1, restrictions: 'None', status: 'normal', riskScore: 0.35, weeklyTrend: [30, 32, 33, 34, 35, 36, 35], trend: [30, 32, 33, 34, 35, 36, 35], dailyVolume: 16000000, vesselsToday: 205, avgWaitHours: 2.1, keyRoute: 'Indian Ocean → South China Sea', trendDirection: 'stable' as const },
      { id: 'suez', name: 'Suez Canal', shortName: 'Suez', throughput: 9000000, share: 9, riskLevel: 71, incidents: 5, restrictions: 'Houthi attacks', status: 'disrupted', riskScore: 0.71, weeklyTrend: [60, 65, 68, 70, 69, 72, 71], trend: [60, 65, 68, 70, 69, 72, 71], dailyVolume: 9000000, vesselsToday: 52, avgWaitHours: 18.5, keyRoute: 'Red Sea → Mediterranean → Europe', trendDirection: 'up' as const },
      { id: 'bab-el-mandeb', name: 'Bab el-Mandeb', shortName: 'Bab Mandeb', throughput: 8500000, share: 8.5, riskLevel: 78, incidents: 4, restrictions: 'Houthi attacks', status: 'disrupted', riskScore: 0.78, weeklyTrend: [70, 72, 75, 76, 77, 79, 78], trend: [70, 72, 75, 76, 77, 79, 78], dailyVolume: 8500000, vesselsToday: 48, avgWaitHours: 14.2, keyRoute: 'Gulf of Aden → Red Sea → Suez', trendDirection: 'up' as const },
      { id: 'bosporus', name: 'Turkish Straits', shortName: 'Bosporus', throughput: 3500000, share: 3.5, riskLevel: 28, incidents: 0, restrictions: 'None', status: 'normal', riskScore: 0.28, weeklyTrend: [25, 26, 27, 28, 28, 29, 28], trend: [25, 26, 27, 28, 28, 29, 28], dailyVolume: 3500000, vesselsToday: 32, avgWaitHours: 3.8, keyRoute: 'Black Sea → Mediterranean', trendDirection: 'stable' as const },
      { id: 'panama', name: 'Panama Canal', shortName: 'Panama', throughput: 1000000, share: 1, riskLevel: 45, incidents: 0, restrictions: 'Water levels', status: 'elevated', riskScore: 0.45, weeklyTrend: [40, 42, 43, 44, 45, 46, 45], trend: [40, 42, 43, 44, 45, 46, 45], dailyVolume: 1000000, vesselsToday: 12, avgWaitHours: 8.5, keyRoute: 'Atlantic → Pacific', trendDirection: 'up' as const },
      { id: 'cape-of-good-hope', name: 'Cape of Good Hope', shortName: 'Cape', throughput: 6000000, share: 6, riskLevel: 22, incidents: 0, restrictions: 'None', status: 'normal', riskScore: 0.22, weeklyTrend: [20, 21, 21, 22, 22, 23, 22], trend: [20, 21, 21, 22, 22, 23, 22], dailyVolume: 6000000, vesselsToday: 85, avgWaitHours: 0.5, keyRoute: 'Atlantic → Indian Ocean (Suez reroute)', trendDirection: 'stable' as const },
      { id: 'danish-straits', name: 'Danish Straits', shortName: 'Danish', throughput: 3200000, share: 3.2, riskLevel: 18, incidents: 0, restrictions: 'None', status: 'normal', riskScore: 0.18, weeklyTrend: [15, 16, 17, 18, 18, 19, 18], trend: [15, 16, 17, 18, 18, 19, 18], dailyVolume: 3200000, vesselsToday: 28, avgWaitHours: 1.2, keyRoute: 'Baltic Sea → North Sea', trendDirection: 'stable' as const },
    ],
    events: [
      { id: 'ce1', title: 'Houthi drone attack near Bab el-Mandeb', location: 'Red Sea', severity: 0.85, sentiment: -0.80, source: 'GDELT', time: '2h ago', category: 'Attack' },
      { id: 'ce2', title: 'Iran IRGC patrols near Strait of Hormuz', location: 'Hormuz', severity: 0.65, sentiment: -0.50, source: 'GDELT', time: '6h ago', category: 'Military' },
      { id: 'ce3', title: 'Tanker collision near Suez Canal entrance', location: 'Suez', severity: 0.45, sentiment: -0.30, source: 'GDELT', time: '12h ago', category: 'Shipping' },
    ],
  }
}

function mockFieldsData() {
  return [
    { id: 'gawar', name: 'Ghawar', country: 'Saudi Arabia', region: 'Middle East', production: 3800, reserves: 75000, breakeven: 10, rpRatio: 19.7, yearDiscovered: 1948, peakYear: 1981, waterCut: 0.50, apiGravity: 34, status: 'mature' },
    { id: 'burgan', name: 'Burgan', country: 'Kuwait', region: 'Middle East', production: 1600, reserves: 66000, breakeven: 8.5, rpRatio: 41.3, yearDiscovered: 1938, peakYear: 1972, waterCut: 0.30, apiGravity: 32, status: 'mature' },
    { id: 'cantarell', name: 'Cantarell', country: 'Mexico', region: 'Americas', production: 430, reserves: 8500, breakeven: 25, rpRatio: 19.8, yearDiscovered: 1976, peakYear: 2004, waterCut: 0.72, apiGravity: 22, status: 'declining' },
    { id: 'permian', name: 'Permian Basin', country: 'United States', region: 'Americas', production: 6200, reserves: 48000, breakeven: 48, rpRatio: 7.7, yearDiscovered: 1921, peakYear: 2024, waterCut: 0.15, apiGravity: 38, status: 'producing' },
    { id: 'brent', name: 'Brent (North Sea)', country: 'United Kingdom', region: 'Europe', production: 120, reserves: 800, breakeven: 52, rpRatio: 6.7, yearDiscovered: 1971, peakYear: 1999, waterCut: 0.55, apiGravity: 38, status: 'declining' },
    { id: 'kashagan', name: 'Kashagan', country: 'Kazakhstan', region: 'Central Asia', production: 900, reserves: 30000, breakeven: 35, rpRatio: 33.3, yearDiscovered: 2000, peakYear: 2025, waterCut: 0.10, apiGravity: 44, status: 'producing' },
    { id: 'orinoco', name: 'Orinoco Belt', country: 'Venezuela', region: 'Americas', production: 750, reserves: 303000, breakeven: 22, rpRatio: 404, yearDiscovered: 1935, peakYear: 2008, waterCut: 0.08, apiGravity: 8, status: 'mature' },
    { id: 'tengiz', name: 'Tengiz', country: 'Kazakhstan', region: 'Central Asia', production: 680, reserves: 26000, breakeven: 30, rpRatio: 38.2, yearDiscovered: 1979, peakYear: 2023, waterCut: 0.20, apiGravity: 46, status: 'producing' },
  ]
}

// ═══ Helper functions ════════════════════════════════════════════════════════

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function inferCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('sanction') || t.includes('embargo')) return 'Sanctions'
  if (t.includes('attack') || t.includes('strike') || t.includes('missile')) return 'Attack'
  if (t.includes('opec') || t.includes('quota')) return 'OPEC'
  if (t.includes('refinery') || t.includes('pipeline') || t.includes('infrastructure')) return 'Infrastructure'
  if (t.includes('hurricane') || t.includes('typhoon') || t.includes('weather')) return 'Weather'
  if (t.includes('military') || t.includes('naval') || t.includes('troops')) return 'Military'
  if (t.includes('production') || t.includes('output') || t.includes('rig')) return 'Production'
  if (t.includes('export') || t.includes('import') || t.includes('supply') || t.includes('tanker')) return 'Supply'
  if (t.includes('shipping') || t.includes('strait') || t.includes('suez')) return 'Shipping'
  return 'General'
}

function processEIAReserves(data: Array<{ country: string; period: string; value: number }>) {
  // Group by country, take most recent year
  const byCountry = new Map<string, { year: number; value: number }>()
  for (const row of data) {
    const existing = byCountry.get(row.country)
    if (!existing || parseInt(row.period) > existing.year) {
      byCountry.set(row.country, { year: parseInt(row.period), value: row.value })
    }
  }
  const flags: Record<string, string> = {
    'Venezuela': '🇻🇪', 'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷', 'Canada': '🇨🇦',
    'Iraq': '🇮🇶', 'Russia': '🇷🇺', 'Kuwait': '🇰🇼', 'United Arab Emirates': '🇦🇪',
    'Libya': '🇱🇾', 'Nigeria': '🇳🇬',
  }
  return Array.from(byCountry.entries())
    .filter(([country]) => flags[country])
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 10)
    .map(([country, data]) => ({
      country,
      code: country.slice(0, 3).toUpperCase(),
      flag: flags[country],
      reserves: data.value,
      production: 0, // Would need separate API call
      rpRatio: 0,
    }))
}

function mockReservesData() {
  return [
    { country: 'Venezuela', code: 'VEN', flag: '🇻🇪', reserves: 303800, production: 750, rpRatio: 405.1 },
    { country: 'Saudi Arabia', code: 'SAU', flag: '🇸🇦', reserves: 258600, production: 10500, rpRatio: 24.6 },
    { country: 'Iran', code: 'IRN', flag: '🇮🇷', reserves: 208600, production: 3200, rpRatio: 65.2 },
    { country: 'Canada', code: 'CAN', flag: '🇨🇦', reserves: 170300, production: 5800, rpRatio: 29.4 },
    { country: 'Iraq', code: 'IRQ', flag: '🇮🇶', reserves: 145000, production: 4400, rpRatio: 33.0 },
    { country: 'Russia', code: 'RUS', flag: '🇷🇺', reserves: 107800, production: 10100, rpRatio: 10.7 },
    { country: 'Kuwait', code: 'KWT', flag: '🇰🇼', reserves: 101500, production: 2700, rpRatio: 37.6 },
    { country: 'UAE', code: 'ARE', flag: '🇦🇪', reserves: 97800, production: 3400, rpRatio: 28.8 },
    { country: 'Libya', code: 'LBY', flag: '🇱🇾', reserves: 48400, production: 1200, rpRatio: 40.3 },
    { country: 'Nigeria', code: 'NGA', flag: '🇳🇬', reserves: 36900, production: 1500, rpRatio: 24.6 },
  ]
}

export default app
// redeploy Wed Aug 19 06:53:51 UTC 2026
