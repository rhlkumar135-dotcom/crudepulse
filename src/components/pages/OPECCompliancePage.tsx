import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, AlertCircle, AlertTriangle } from 'lucide-react'

interface OPECMember {
  country: string
  quotaBpd: number
  actualBpd: number
  compliance: number
}

interface OPECResponse {
  members: OPECMember[]
}

export function OPECCompliancePage() {
  const [data, setData] = useState<OPECResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/opec')
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

  const members = data?.members ?? []
  const overproducers = members.filter(m => m.compliance < 100)
  const underproducers = members.filter(m => m.compliance > 100)

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

  const totalQuota = members.reduce((s, m) => s + m.quotaBpd, 0)
  const totalActual = members.reduce((s, m) => s + m.actualBpd, 0)
  const groupCompliance = totalQuota > 0 ? (totalActual / totalQuota) * 100 : 0

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target size={20} className="text-amber" />
          OPEC+ Compliance
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-amber to-transparent mt-1" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Group Compliance', value: `${groupCompliance.toFixed(1)}%`, color: groupCompliance >= 100 ? 'text-emerald' : 'text-amber' },
          { label: 'Total Quota', value: `${(totalQuota / 1000).toFixed(0)}K`, color: 'text-cyan-400' },
          { label: 'Total Actual', value: `${(totalActual / 1000).toFixed(0)}K`, color: 'text-white' },
          { label: 'Overproducers', value: `${overproducers.length}`, color: overproducers.length > 0 ? 'text-red' : 'text-emerald' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
            <div className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider mb-1">{label}</div>
            <div className={cn('text-lg font-bold font-mono', color)}>{value}</div>
          </div>
        ))}
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Country', 'Quota (bpd)', 'Actual (bpd)', 'Compliance'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[9px] text-zinc-600 uppercase tracking-wider font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => {
                  const isOver = m.compliance < 100
                  const isUnder = m.compliance > 100
                  return (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-medium text-white">{m.country}</span>
                        {isOver && (
                          <Badge className="ml-2 text-[7px] font-mono px-1 py-0 bg-red/10 text-red border-red/20">
                            OVER
                          </Badge>
                        )}
                        {isUnder && m.compliance > 100 && (
                          <Badge className="ml-2 text-[7px] font-mono px-1 py-0 bg-emerald/10 text-emerald border-emerald/20">
                            UNDER
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400">{m.quotaBpd.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-white">{m.actualBpd.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-[11px] font-bold',
                            isOver ? 'text-red' : isUnder ? 'text-emerald' : 'text-white'
                          )}>
                            {m.compliance.toFixed(1)}%
                          </span>
                          <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                isOver ? 'bg-red' : isUnder ? 'bg-emerald' : 'bg-white'
                              )}
                              style={{ width: `${Math.min(100, m.compliance)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {overproducers.length > 0 && (
        <Card className="bg-red/[0.04] border-red/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-red flex items-center gap-2">
              <AlertTriangle size={14} />
              Overproducers (Compliance &lt; 100%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {overproducers.map(m => (
                <span key={m.country} className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-red/10 text-red">
                  {m.country} ({m.compliance.toFixed(1)}%)
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
