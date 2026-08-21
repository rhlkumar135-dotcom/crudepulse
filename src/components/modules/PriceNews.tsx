import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Newspaper, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useMarketData } from '@/lib/useMarketData'
import { CountUp } from '../CountUp'

interface PricePoint { date: string; close: number }
interface PriceResponse { wti: { current: number; history: PricePoint[] }; brent: { current: number; history: PricePoint[] }; spread: number }
interface NewsItem { id: string; title: string; source: string; time: string; sentiment: string; score: number; category: string }
interface NewsResponse { items: NewsItem[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-lg px-3 py-2 shadow-xl shadow-black/30">
      <div className="text-[9px] text-text-dim font-mono mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.stroke }} />
          <span className="text-text-dim">{p.name}</span>
          <span className="font-semibold text-text-bright">${p.value?.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

export function PriceNewsChart() {
  const { data: priceData } = useMarketData<PriceResponse>('/api/market/prices')
  const { data: newsData } = useMarketData<NewsResponse>('/api/market/news')
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null)

  const wtiHistory = (priceData?.wti?.history || []).filter((p: any) => p && typeof p.close === 'number')
  const brentHistory = (priceData?.brent?.history || []).filter((p: any) => p && typeof p.close === 'number')
  const mockNews = newsData?.items || []

  if (wtiHistory.length < 2 || brentHistory.length < 2) {
    return (
      <div className="flex items-center justify-center h-[200px] text-text-dim text-[11px] font-mono">
        Loading market data...
      </div>
    )
  }

  const lastWti = wtiHistory[wtiHistory.length - 1]
  const prevWti = wtiHistory[wtiHistory.length - 2]
  const lastBrent = brentHistory[brentHistory.length - 1]
  const prevBrent = brentHistory[brentHistory.length - 2]

  const chartData = wtiHistory.slice(-90).map((d: PricePoint, i: number) => ({
    ...d,
    brent: brentHistory[brentHistory.length - 90 + i]?.close ?? 0,
  }))

  const relatedNews = hoveredPrice !== null
    ? mockNews.filter((n: NewsItem) => Math.abs(72 - hoveredPrice) < 3).slice(0, 4)
    : mockNews.slice(0, 4)

  return (
    <div className="space-y-3">
      {/* Price stats row */}
      <div className="grid grid-cols-3 gap-3">
        <PriceStat label="WTI CRUDE" value={lastWti.close} prev={prevWti.close} prefix="$" highlight />
        <PriceStat label="BRENT CRUDE" value={lastBrent.close} prev={prevBrent.close} prefix="$" />
        <PriceStat label="WTI-BRENT SPREAD" value={lastBrent.close - lastWti.close} prev={prevBrent.close - prevWti.close} prefix="$" />
      </div>

      {/* Chart */}
      <div className="h-[180px] -ml-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} onMouseMove={(e) => {
            if (e?.activePayload?.[0]) setHoveredPrice(e.activePayload[0].payload?.close)
          }} onMouseLeave={() => setHoveredPrice(null)}>
            <defs>
              <linearGradient id="wtiGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5A623" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#F5A623" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="brentGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={17} stroke="#141A22" />
            <YAxis tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={38} stroke="#141A22" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="close" stroke="#F5A623" fill="url(#wtiGrad2)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#F5A623', stroke: '#0F1318', strokeWidth: 2 }} name="WTI" />
            <Area type="monotone" dataKey="brent" stroke="#2DD4BF" fill="url(#brentGrad2)" strokeWidth={1} dot={false} activeDot={{ r: 2.5, fill: '#2DD4BF', stroke: '#0F1318', strokeWidth: 2 }} name="Brent" />
            {hoveredPrice && <ReferenceLine y={hoveredPrice} stroke="#F5A62320" strokeDasharray="3 3" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* News section */}
      <div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-text-dim tracking-wider mb-2">
          <Newspaper size={9} className="opacity-50" />
          HEADLINES
          <div className="flex-1" />
          <span className="text-amber/40 text-[8px]">hover chart to filter</span>
        </div>
        <div className="space-y-0">
          {relatedNews.map(n => (
            <NewsRow key={n.id} item={n} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PriceStat({ label, value, prev, prefix, highlight }: { label: string; value: number; prev: number; prefix: string; highlight?: boolean }) {
  const change = value - prev
  const pct = ((change / prev) * 100)
  const isUp = change > 0.005
  const isDown = change < -0.005

  return (
    <div className={`p-2.5 rounded-lg ${highlight ? 'bg-amber/[0.04] border border-amber/10' : 'bg-white/[0.02] border border-transparent'}`}>
      <div className="text-[8px] text-text-dim font-mono tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-lg font-bold font-mono tabular-nums ${highlight ? 'text-amber' : 'text-text-bright'}`}>
          <CountUp value={value} decimals={2} prefix={prefix} />
        </span>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        {isUp ? <ArrowUpRight size={9} className="text-teal" /> : isDown ? <ArrowDownRight size={9} className="text-red" /> : null}
        <span className={`text-[9px] font-mono ${isUp ? 'text-teal' : isDown ? 'text-red' : 'text-text-dim'}`}>
          {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
        </span>
      </div>
    </div>
  )
}

function NewsRow({ item }: { item: NewsItem }) {
  const sentimentBg = item.sentiment === 'positive' ? 'bg-teal/[0.06]' : item.sentiment === 'negative' ? 'bg-red/[0.06]' : 'bg-white/[0.02]'
  const sentimentBorder = item.sentiment === 'positive' ? 'border-teal/10' : item.sentiment === 'negative' ? 'border-red/10' : 'border-white/5'
  const sentimentText = item.sentiment === 'positive' ? 'text-teal' : item.sentiment === 'negative' ? 'text-red' : 'text-text-dim'

  return (
    <div className={`flex items-start gap-2.5 p-2 rounded-lg ${sentimentBg} border ${sentimentBorder} hover:brightness-110 transition-all cursor-pointer`}>
      <span className={`mt-1.5 w-[5px] h-[5px] rounded-full shrink-0 ${
        item.sentiment === 'positive' ? 'bg-teal' : item.sentiment === 'negative' ? 'bg-red' : 'bg-text-dim'
      }`} />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] leading-snug text-text line-clamp-1">{item.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[8px] text-text-dim/60 font-mono">{item.source}</span>
          <span className="text-[8px] text-border">·</span>
          <span className="text-[8px] text-text-dim/60 font-mono">{item.time}</span>
          <div className="flex-1" />
          <span className={`text-[9px] font-mono font-medium ${sentimentText}`}>
            {item.score > 0 ? '+' : ''}{item.score.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
