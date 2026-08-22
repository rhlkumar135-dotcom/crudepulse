import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface Major {
  ticker: string
  name: string
  country: string
  revenue: number
  employees: number
  stockPrice: number
  change: number
}

interface MajorsResponse {
  majors: Major[]
}

function formatRevenue(val: number): string {
  if (val >= 1_000_000_000_000) return `$${(val / 1_000_000_000_000).toFixed(1)}T`
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  return `$${val.toLocaleString()}`
}

function formatEmployees(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return val.toLocaleString()
}

export function MajorsPage() {
  const [data, setData] = useState<MajorsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/majors')
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

  const majors = data?.majors ?? []

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-white/[0.03] animate-pulse" />
          <div className="h-4 w-36 rounded bg-white/[0.03] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-white/[0.03] animate-pulse" />
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

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building2 size={20} className="text-amber" />
          Oil Majors
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-amber to-transparent mt-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {majors.map(m => {
          const isPositive = m.change >= 0
          return (
            <Card key={m.ticker} className="bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-mono text-white">{m.name}</CardTitle>
                    <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{m.country}</div>
                  </div>
                  <Badge className="text-[9px] font-mono px-2 py-0 bg-white/[0.06] text-zinc-400 border-white/[0.08]">
                    {m.ticker}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">Revenue</span>
                  <span className="text-sm font-mono font-bold text-white">{formatRevenue(m.revenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">Employees</span>
                  <span className="text-xs font-mono text-zinc-400">{formatEmployees(m.employees)}</span>
                </div>
                <div className="border-t border-white/[0.04] pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-white">${m.stockPrice.toFixed(2)}</span>
                    <div className={cn(
                      'flex items-center gap-1 text-xs font-mono font-bold',
                      isPositive ? 'text-emerald' : 'text-red'
                    )}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isPositive ? '+' : ''}{m.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
