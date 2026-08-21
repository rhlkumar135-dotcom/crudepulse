// Free data fetchers — no API keys needed
// Sources: Yahoo Finance, FRED CSV, Google News RSS, EIA HTML scraping

// ===== YAHOO FINANCE =====
export interface YahooChartResponse {
  chart?: { result?: YahooChartResult[] }
}

export interface YahooChartResult {
  meta: { symbol: string; regularMarketPrice: number; previousClose?: number; currency?: string }
  timestamp?: number[]
  indicators?: { quote?: Array<{ close?: (number | null)[]; open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[] }> }
}

export async function fetchYahooQuote(symbol: string): Promise<{ price: number; prevClose: number } | null> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const d = await res.json() as YahooChartResponse
    const meta = d.chart?.result?.[0]?.meta
    if (!meta?.regularMarketPrice) return null
    return { price: +meta.regularMarketPrice.toFixed(2), prevClose: +(meta.previousClose || meta.regularMarketPrice).toFixed(2) }
  } catch { return null }
}

export async function fetchYahooHistory(symbol: string, range = '1y', interval = '1d'): Promise<Array<{ date: string; close: number }>> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const d = await res.json() as YahooChartResponse
    const result = d.chart?.result?.[0]
    if (!result?.timestamp) return []
    const closes = result.indicators?.quote?.[0]?.close || []
    return result.timestamp.map((t, i) => ({
      date: new Date(t * 1000).toISOString().split('T')[0],
      close: +(closes[i] ?? 0).toFixed(2),
    })).filter(h => h.close > 0)
  } catch { return [] }
}

// ===== FRED CSV =====
export async function fetchFREDSeries(seriesId: string, startDate = '2020-01-01'): Promise<Array<{ date: string; value: number }>> {
  try {
    const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}&cosd=${startDate}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const csv = await res.text()
    const lines = csv.trim().split('\n')
    return lines.slice(1).map(line => {
      const [date, value] = line.split(',')
      return { date, value: parseFloat(value) }
    }).filter(d => !isNaN(d.value) && d.value !== 0)
  } catch { return [] }
}

// ===== GOOGLE NEWS RSS =====
export async function fetchGoogleNewsRSS(query: string, maxRecords = 25): Promise<Array<{ title: string; source: string; pubDate: string; link?: string }>> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    const items: Array<{ title: string; source: string; pubDate: string; link?: string }> = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
    for (const match of itemMatches) {
      const itemXml = match[1]
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                    itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const source = itemXml.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || 'Google News'
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      if (title) items.push({ title, source, pubDate, link })
    }
    return items.slice(0, maxRecords)
  } catch { return [] }
}

// ===== EIA HTML SCRAPING =====
export async function fetchEIAHTML(url: string): Promise<number[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const html = await res.text()
    const tdMatches = html.match(/<td[^>]*>([\d,.]+)<\/td>/g)
    if (!tdMatches) return []
    return tdMatches
      .map(t => parseFloat(t.replace(/<[^>]+>/g, '').replace(/,/g, '')))
      .filter(v => !isNaN(v))
  } catch { return [] }
}

// ===== HELPERS =====
export function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  if (isNaN(then)) return dateStr
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function inferLocation(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('hormuz') || t.includes('iran')) return 'Strait of Hormuz'
  if (t.includes('suez') || t.includes('red sea') || t.includes('houthi') || t.includes('yemen')) return 'Red Sea / Suez'
  if (t.includes('saudi')) return 'Saudi Arabia'
  if (t.includes('russia') || t.includes('putin')) return 'Russia'
  if (t.includes('china')) return 'China'
  if (t.includes('nigeria') || t.includes('niger delta')) return 'Nigeria'
  if (t.includes('libya')) return 'Libya'
  if (t.includes('iraq') || t.includes('basra')) return 'Iraq'
  if (t.includes('venezuela')) return 'Venezuela'
  if (t.includes('gulf of mexico') || t.includes('texas') || t.includes('houston')) return 'US Gulf Coast'
  if (t.includes('europe') || t.includes('eu ')) return 'Europe'
  if (t.includes('india')) return 'India'
  if (t.includes('opec')) return 'Vienna, Austria'
  return 'Global'
}

export function inferCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('sanction') || t.includes('embargo')) return 'Sanctions'
  if (t.includes('attack') || t.includes('military') || t.includes('war') || t.includes('missile') || t.includes('drone')) return 'Military'
  if (t.includes('pipeline') || t.includes('tanker') || t.includes('shipping') || t.includes('strait')) return 'Supply Chain'
  if (t.includes('opec') || t.includes('production cut') || t.includes('output')) return 'OPEC Policy'
  if (t.includes('price') || t.includes('crude') || t.includes('brent') || t.includes('wti')) return 'Price Action'
  if (t.includes('hurricane') || t.includes('storm') || t.includes('weather')) return 'Weather'
  if (t.includes('spill') || t.includes('leak') || t.includes('environment')) return 'Environment'
  if (t.includes('demand') || t.includes('consumption') || t.includes('gdp')) return 'Demand'
  if (t.includes('inventor') || t.includes('stockpile') || t.includes('storage')) return 'Inventory'
  return 'Market'
}
