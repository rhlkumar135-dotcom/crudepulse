import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface FuturesPoint {
  month: string
  price: number
}

interface FuturesResponse {
  wti: FuturesPoint[]
  brent: FuturesPoint[]
}

function analyzeShape(wti: FuturesPoint[]): string {
  if (wti.length < 2) return 'flat'
  const first = wti[0].price
  const last = wti[wti.length - 1].price
  const diff = last - first
  if (diff > 1) return 'contango'
  if (diff < -1) return 'backwardation'
  return 'flat'
}

export function FuturesCurvePage() {
  const [data, setData] = useState<FuturesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/futures')
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Failed to load')
        setData(body)
      } catch (e: any) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [])

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-white/[0.03] animate-pulse" />
        <div className="h-80 rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle size={16} className="text-red shrink-0" />
          <span className="text-sm font-mono text-red">{error}</span>
        </div>
      </div>
    )
  }

  const wti = data?.wti ?? []
  const brent = data?.brent ?? []

  const merged = wti.map((w, i) => ({
    month: w.month,
    WTI: w.price,
    Brent: brent[i]?.price ?? 0,
  }))

  const shape = analyzeShape(wti)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Futures Curve
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-amber to-transparent mt-1" />
        </div>
        <Badge
          className={cn(
            'text-[10px] font-mono px-2 py-0.5',
            shape === 'contango'
              ? 'bg-emerald/10 text-emerald border-emerald/20'
              : shape === 'backwardation'
                ? 'bg-red/10 text-red border-red/20'
                : 'bg-white/[0.06] text-zinc-400 border-white/[0.08]'
          )}
        >
          {shape === 'contango' ? <TrendingUp size={10} className="mr-1" /> : shape === 'backwardation' ? <TrendingDown size={10} className="mr-1" /> : null}
          {shape.toUpperCase()}
        </Badge>
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-zinc-400">
            WTI vs Brent Forward Curve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={merged}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'IBM Plex Mono, monospace' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'IBM Plex Mono, monospace' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
              />
              <Line type="monotone" dataKey="WTI" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Brent" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
            Curve Shape Analysis
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {shape === 'contango'
              ? 'Contango: Front-month prices are cheaper than later months. This typically indicates an expected supply surplus, high storage costs, or carry arbitrage opportunities. Traders may profit by buying spot and selling futures (carry trade).'
              : shape === 'backwardation'
                ? 'Backwardation: Front-month prices are more expensive than later months. This signals tight current supply, strong near-term demand, or expected production cuts. The market is willing to pay a premium for immediate delivery.'
                : 'Flat curve: Spot and futures prices are closely aligned, suggesting balanced supply-demand expectations over the forward period with no strong directional signal.'}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {merged.map(m => (
          <div key={m.month} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
            <span className="text-[10px] font-mono text-zinc-500">{m.month}</span>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-amber">${m.WTI}</span>
              <span className="text-xs font-mono text-cyan-400">${m.Brent}</span>
              <span className={cn('text-[10px] font-mono', m.Brent - m.WTI > 0 ? 'text-emerald' : 'text-red')}>
                {(m.Brent - m.WTI) > 0 ? '+' : ''}{(m.Brent - m.WTI).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
