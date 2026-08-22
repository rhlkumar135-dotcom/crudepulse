import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, AlertCircle } from 'lucide-react'

interface Sanction {
  country: string
  regime: string
  since: string
  affectedBpd: number
  description: string
  status: string
}

interface SanctionsResponse {
  sanctions: Sanction[]
}

function isRecentlyAdded(since: string): boolean {
  try {
    const d = new Date(since)
    const now = new Date()
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 365
  } catch {
    return false
  }
}

function statusStyle(status: string) {
  const s = status.toLowerCase()
  if (s.includes('active') || s.includes('full')) {
    return { color: 'text-red', bg: 'bg-red/10', border: 'border-red/20' }
  }
  if (s.includes('partial') || s.includes('limited')) {
    return { color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/20' }
  }
  return { color: 'text-zinc-400', bg: 'bg-white/[0.06]', border: 'border-white/[0.08]' }
}

export function SanctionsPage() {
  const [data, setData] = useState<SanctionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/sanctions')
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

  const sanctions = data?.sanctions ?? []
  const totalAffected = sanctions.reduce((s, x) => s + x.affectedBpd, 0)

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-white/[0.03] animate-pulse" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert size={20} className="text-red" />
            Oil Sanctions Tracker
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-red to-transparent mt-1" />
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-2 text-center">
          <div className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider">Total Affected</div>
          <div className="text-sm font-mono font-bold text-red">{(totalAffected / 1000).toFixed(0)}K bpd</div>
        </div>
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Country', 'Regime', 'Since', 'Affected BPD', 'Status', 'Description'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[9px] text-zinc-600 uppercase tracking-wider font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sanctions.map((s, i) => {
                  const ss = statusStyle(s.status)
                  const recent = isRecentlyAdded(s.since)
                  return (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-white">{s.country}</span>
                          {recent && (
                            <Badge className="text-[7px] font-mono px-1 py-0 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                              NEW
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 text-[10px]">{s.regime}</td>
                      <td className="py-2.5 px-3 text-zinc-500 text-[10px]">{s.since}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-bold text-white">
                          {s.affectedBpd.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-zinc-600 ml-0.5">bpd</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge className={cn('text-[8px] font-mono px-1.5 py-0', ss.bg, ss.color, ss.border)}>
                          {s.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-zinc-500 max-w-[200px] truncate">
                        {s.description}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
