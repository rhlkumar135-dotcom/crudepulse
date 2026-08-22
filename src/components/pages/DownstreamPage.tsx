import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Droplet } from 'lucide-react'

interface RegionData {
  region: string
  gasoline: number
  diesel: number
  jet: number
  crackSpread: number
}

type RegionDataView = RegionData & { name: string }

interface DownstreamResponse {
  regions: RegionData[]
}

export function DownstreamPage() {
  const [data, setData] = useState<DownstreamResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/downstream')
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

  const regions = data?.regions ?? []
  const maxCrack = Math.max(...regions.map(r => Math.abs(r.crackSpread)), 1)

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-white/[0.03] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-white/[0.03] animate-pulse" />
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

  const products = [
    { key: 'gasoline', label: 'Gasoline', color: 'text-emerald' },
    { key: 'diesel', label: 'Diesel', color: 'text-amber' },
    { key: 'jet', label: 'Jet Fuel', color: 'text-cyan-400' },
  ] as const

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Droplet size={20} className="text-amber" />
          Downstream Products
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-amber to-transparent mt-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((r, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-white">{r.region}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {products.map(p => (
                <div key={p.key} className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">{p.label}</span>
                  <span className={cn('text-xs font-mono font-bold', p.color)}>
                    ${r[p.key].toFixed(2)}/gal
                  </span>
                </div>
              ))}

              <div className="border-t border-white/[0.04] pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-500">Crack Spread</span>
                  <span className={cn(
                    'text-xs font-mono font-bold',
                    r.crackSpread >= 0 ? 'text-emerald' : 'text-red'
                  )}>
                    {r.crackSpread >= 0 ? '+' : ''}{r.crackSpread.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      r.crackSpread >= 0 ? 'bg-emerald' : 'bg-red'
                    )}
                    style={{ width: `${(Math.abs(r.crackSpread) / maxCrack) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-2">
        <div className="text-[10px] text-zinc-600 tracking-[0.12em] uppercase font-mono">
          EIA Petroleum Pricing · Regional Product Benchmarks
        </div>
      </div>
    </div>
  )
}
