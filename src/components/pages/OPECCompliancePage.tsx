import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface Member { country: string; quota: number; actual: number; group: string; compliance: number; overproduced: boolean; delta: number }

export default function OPECCompliancePage() {
  const [data, setData] = useState<{ members: Member[]; totalQuota: number; totalActual: number; overproducers: Member[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/opec')
        const body = await res.json()
        setData(body)
      } catch {}
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 300000)
    return () => clearInterval(iv)
  }, [])

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
  if (!data) return null

  const overallCompliance = Math.round((data.totalQuota / data.totalActual) * 100)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">OPEC+ Compliance</h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-amber to-transparent mt-1" />
        </div>
        <Badge className="bg-amber/10 text-amber border-amber/20">MONTHLY</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-bg-card border-border p-4">
          <div className="text-[10px] font-mono text-muted mb-1">TOTAL QUOTA</div>
          <div className="text-lg font-mono font-bold text-text-bright">{(data.totalQuota / 1000).toFixed(1)}M bbl/d</div>
        </Card>
        <Card className="bg-bg-card border-border p-4">
          <div className="text-[10px] font-mono text-muted mb-1">TOTAL ACTUAL</div>
          <div className="text-lg font-mono font-bold text-text-bright">{(data.totalActual / 1000).toFixed(1)}M bbl/d</div>
        </Card>
        <Card className="bg-bg-card border-border p-4">
          <div className="text-[10px] font-mono text-muted mb-1">OVERALL COMPLIANCE</div>
          <div className={`text-lg font-mono font-bold ${overallCompliance >= 100 ? 'text-green-400' : 'text-red'}`}>{overallCompliance}%</div>
        </Card>
      </div>

      {data.overproducers.length > 0 && (
        <Card className="bg-red/[0.04] border-red/15 p-3">
          <div className="flex items-center gap-2 text-red text-sm font-mono">
            <AlertTriangle size={14} />
            OVERPRODUCERS: {data.overproducers.map(m => `${m.country} (+${m.delta}K)`).join(', ')}
          </div>
        </Card>
      )}

      <Card className="bg-bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="p-3 text-left">Country</th>
                <th className="p-3 text-left">Group</th>
                <th className="p-3 text-right">Quota (K bbl/d)</th>
                <th className="p-3 text-right">Actual (K bbl/d)</th>
                <th className="p-3 text-right">Compliance</th>
                <th className="p-3 text-left">Quota vs Actual</th>
              </tr>
            </thead>
            <tbody>
              {data.members.map(m => (
                <tr key={m.country} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="p-3 text-text-bright font-medium">{m.country}</td>
                  <td className="p-3"><Badge className={m.group === 'OPEC' ? 'bg-amber/10 text-amber border-amber/20' : 'bg-cyan/10 text-cyan border-cyan/20'}>{m.group}</Badge></td>
                  <td className="p-3 text-right text-muted">{m.quota.toLocaleString()}</td>
                  <td className="p-3 text-right text-text-bright">{m.actual.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <span className={m.compliance >= 100 ? 'text-green-400' : m.compliance >= 95 ? 'text-amber' : 'text-red'}>
                      {m.compliance}%
                    </span>
                  </td>
                  <td className="p-3 w-40">
                    <div className="flex items-center gap-1">
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(100, (m.actual / m.quota) * 100)}%`,
                          backgroundColor: m.overproduced ? '#ef4444' : '#00D4AA',
                        }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
