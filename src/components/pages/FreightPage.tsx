import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Ship, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface FreightRoute {
  name: string
  rate: number
  trend: string
}

interface FreightResponse {
  balticIndex: number
  routes: FreightRoute[]
  note: string
}

export function FreightPage() {
  const [data, setData] = useState<FreightResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/freight')
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Failed to load')
        setData(body)
      } catch (e: any) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  const routes = data?.routes ?? []

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-white/[0.03] animate-pulse" />
        <div className="h-28 rounded-xl bg-white/[0.03] animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
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

  function TrendIcon({ trend }: { trend: string }) {
    const t = trend.toLowerCase()
    if (t === 'up' || t === 'rising' || t === 'increasing') {
      return <TrendingUp size={16} className="text-emerald" />
    }
    if (t === 'down' || t === 'falling' || t === 'decreasing') {
      return <TrendingDown size={16} className="text-red" />
    }
    return <Minus size={16} className="text-zinc-500" />
  }

  function trendColor(trend: string) {
    const t = trend.toLowerCase()
    if (t === 'up' || t === 'rising' || t === 'increasing') return 'text-emerald'
    if (t === 'down' || t === 'falling' || t === 'decreasing') return 'text-red'
    return 'text-zinc-500'
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Ship size={20} className="text-cyan" />
          Freight Tracker
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-cyan to-transparent mt-1" />
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-6">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-2">
            Baltic Dirty Tanker Index
          </div>
          <div className="text-4xl font-bold text-white font-mono">
            {data?.balticIndex?.toLocaleString() ?? '—'}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">
            Points
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {routes.map((r, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs font-mono font-medium text-white">{r.name}</div>
                <TrendIcon trend={r.trend} />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-sm font-mono font-bold text-white">${r.rate.toLocaleString()}</span>
                <span className={cn('text-[10px] font-mono', trendColor(r.trend))}>
                  {r.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.note && (
        <div className="flex items-start gap-2 bg-amber-500/[0.06] border border-amber/20 rounded-lg p-3">
          <AlertCircle size={13} className="text-amber shrink-0 mt-0.5" />
          <span className="text-[10px] font-mono text-amber leading-relaxed">{data.note}</span>
        </div>
      )}

      <div className="text-center py-2">
        <div className="text-[10px] text-zinc-600 tracking-[0.12em] uppercase font-mono">
          Baltic Exchange · EIA Shipping Analysis
        </div>
      </div>
    </div>
  )
}
