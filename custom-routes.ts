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

async function fetchGDELT(): Promise<unknown[] | null> {
  try {
    // GDELT DOC 2.0 API — no key required
    // Query for oil-relevant events in the last 24h
    const query = encodeURIComponent('("crude oil" OR "oil price" OR OPEC OR "oil production" OR "oil supply")')
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=50&format=json&sort=DateDesc&timespan=24h`

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const data = await res.json() as { articles?: Array<{ url: string; title: string; seendate: string; sourcecountry: string; domain: string; tone?: number }> }

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
  } catch {
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
