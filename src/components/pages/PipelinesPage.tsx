import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Route, AlertCircle, AlertTriangle, Construction } from 'lucide-react'

interface Pipeline {
  id: string
  name: string
  from: string
  to: string
  capacity: number
  status: string
  lat: number
  lng: number
}

interface Outage {
  pipeline: string
  reason: string
}

interface PipelinesResponse {
  pipelines: Pipeline[]
  outages: Outage[]
}

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  active: { color: 'text-emerald', bg: 'bg-emerald/10', border: 'border-emerald/20' },
  cancelled: { color: 'text-red', bg: 'bg-red/10', border: 'border-red/20' },
  maintenance: { color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/20' },
}

function getStatusStyle(status: string) {
  return STATUS_STYLE[status.toLowerCase()] ?? { color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' }
}

export function PipelinesPage() {
  const [data, setData] = useState<PipelinesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/pipelines')
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

  const pipelines = data?.pipelines ?? []
  const outages = data?.outages ?? []
  const maxCapacity = Math.max(...pipelines.map(p => p.capacity), 1)

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-white/[0.03] animate-pulse" />
        <div className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
        <div className="h-96 rounded-xl bg-white/[0.03] animate-pulse" />
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

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Route size={20} className="text-emerald" />
          Pipelines
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-emerald to-transparent mt-1" />
      </div>

      {outages.length > 0 && (
        <Card className="bg-red-500/[0.04] border-red/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-red flex items-center gap-2">
              <AlertTriangle size={14} />
              Active Outages ({outages.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {outages.map((o, i) => (
              <div key={i} className="flex items-center gap-3 bg-red/5 border border-red/10 rounded-lg px-3 py-2">
                <div className="text-[11px] font-mono font-medium text-white">{o.pipeline}</div>
                <div className="text-[10px] font-mono text-red">{o.reason}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-zinc-400">
            Pipeline Directory ({pipelines.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {pipelines.map(p => {
            const ss = getStatusStyle(p.status)
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.04]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-medium text-white truncate">{p.name}</span>
                    <Badge className={cn('text-[8px] font-mono px-1.5 py-0', ss.bg, ss.color, ss.border)}>
                      {p.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-600 mt-0.5">
                    {p.from} → {p.to}
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">{p.capacity.toLocaleString()} bpd</span>
                  <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        p.status.toLowerCase() === 'active' ? 'bg-emerald' : p.status.toLowerCase() === 'maintenance' ? 'bg-amber' : 'bg-red'
                      )}
                      style={{ width: `${(p.capacity / maxCapacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
