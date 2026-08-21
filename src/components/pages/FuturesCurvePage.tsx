import { TrendingUp, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface FuturesContract {
  expiry: string
  price: number
  open_interest: number
  volume: number
}

interface CurveHistory {
  date: string
  shape: 'Contango' | 'Backwardation' | 'Flat'
  spread: number
}

interface FuturesResponse {
  curve: Array<{ month: string; wtiPrice: number; brentPrice: number; spread: number }>
  shape: string
  shapeMagnitude: number
  shapeExplanation: string
  frontMonthSpread: number
  frontMonthWti: number
  frontMonthBrent: number
  lastUpdated: string
}

const SHAPE_CONFIG = {
  Contango: {
    color: '#ff3366',
    description: 'Futures prices are higher than spot — markets expect prices to rise, or there is a cost of carry (storage costs). Suggests bearish near-term sentiment.',
  },
  Backwardation: {
    color: '#00ff88',
    description: 'Futures prices are below spot — markets expect prices to fall, or there is a supply shortage now. Suggests bullish near-term sentiment.',
  },
  Flat: {
    color: '#94A3B8',
    description: 'Futures prices roughly equal spot — market sees no strong directional pressure. Balanced supply/demand expectations.',
  },
}

export function FuturesCurvePage() {
  const { data, loading } = useMarketData<FuturesResponse>('/api/market/futures', 'free', 30_000)

  if (loading && !data) {
    return (
      <PageLayout title="Futures Curve Viewer" subtitle="Contango · Backwardation · Settlement prices">
        <div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading futures data…</div>
      </PageLayout>
    )
  }

  const shapeKey = (data?.shape ?? 'flat').charAt(0).toUpperCase() + (data?.shape ?? 'flat').slice(1) as keyof typeof SHAPE_CONFIG
  const shapeConfig = SHAPE_CONFIG[shapeKey] || SHAPE_CONFIG.Flat

  return (
    <PageLayout title="Futures Curve Viewer" subtitle="Contango · Backwardation · Settlement prices · CME">
      <div className="space-y-4">

        {/* Shape indicator */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Curve Shape', value: data?.shape ?? '—', color: shapeConfig.color },
            { label: 'Front Month (WTI)', value: data?.frontMonthWti ? `$${data.frontMonthWti.toFixed(2)}` : '—', color: '#00d4ff' },
            { label: 'Spread (WTI)', value: data?.frontMonthSpread !== undefined ? `${data.frontMonthSpread > 0 ? '+' : ''}$${data.frontMonthSpread.toFixed(2)}` : '—', color: (data?.frontMonthSpread ?? 0) > 0 ? '#ff3366' : '#00ff88' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0d1117] border border-white/[0.06] rounded p-4 text-center">
              <div className="text-[10px] text-[#94A3B8] mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{label}</div>
              <div className="text-xl font-black" style={{ fontFamily: 'Orbitron, monospace', color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Curve explanation */}
        <div className="flex items-start gap-2 rounded p-3 border"
          style={{ backgroundColor: shapeConfig.color + '10', borderColor: shapeConfig.color + '25' }}>
          <Info size={13} style={{ color: shapeConfig.color }} className="shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-bold" style={{ color: shapeConfig.color, fontFamily: 'Orbitron, monospace' }}>
              {data?.shape ?? 'FLAT'}
            </span>
            <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              {shapeConfig.description}
            </p>
          </div>
        </div>

        {/* Futures Curve Chart */}
        <ModuleCard icon={TrendingUp} color="#00d4ff" title="Futures Curve" cadence="DAILY" tag="CME Settlement Prices">
          {data?.curve && data.curve.length > 0 ? (
            <div style={{ height: 220 }} className="mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.curve} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                  <XAxis dataKey="month" tick={{ fill: '#4a4a5a', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }} tickLine={false} />
                  <YAxis tick={{ fill: '#4a4a5a', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }} tickLine={false} axisLine={false}
                    domain={['auto', 'auto']} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid #1a2a3a', borderRadius: 4, fontSize: 11 }}
                    labelStyle={{ color: '#94A3B8', fontFamily: 'Share Tech Mono, monospace' }}
                    formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === 'wtiPrice' ? 'WTI' : 'Brent']}
                  />
                  {data.frontMonthWti !== undefined && (
                    <ReferenceLine y={data.frontMonthWti} stroke="#F5A623" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Spot', fill: '#F5A623', fontSize: 9 }} />
                  )}
                  <Line type="monotone" dataKey="wtiPrice" stroke="#00d4ff" strokeWidth={2.5} dot={{ fill: '#00d4ff', r: 3 }} name="WTI" />
                  <Line type="monotone" dataKey="brentPrice" stroke="#ff3366" strokeWidth={2} dot={{ fill: '#ff3366', r: 2 }} name="Brent" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-8 text-center text-[#94A3B8] text-sm font-mono">No curve data available.</div>
          )}
        </ModuleCard>

        {/* Shape explanation */}
        <div className="text-[10px] text-[#94A3B8] bg-[#0d1117] border border-white/[0.05] rounded p-3"
          style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          {data?.shapeExplanation ?? 'No shape data available.'}
        </div>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            CME NYMEX settlement · Yahoo Finance futures data · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
