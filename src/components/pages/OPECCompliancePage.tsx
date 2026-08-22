import { Target, AlertTriangle } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface OPECResponse {
  members: Array<{ name: string; code: string; quotaBpd: number; actualBpd: number; compliancePct: number; trend: string }>
  overallCompliance: number
  totalQuotaBpd: number
  totalActualBpd: number
  surplusDeficitBpd: number
  overproducers: string[]
  news: Array<{ title: string; source: string; time: string }>
  commentary: string
  lastUpdated: string
}

export function OPECCompliancePage() {
  const { data, loading } = useMarketData<OPECResponse>('/api/market/opec', 'free', 30_000)

  if (loading && !data) {
    return <PageLayout title="OPEC+ Quota Compliance" subtitle="Production quotas · Compliance tracking"><div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading OPEC data…</div></PageLayout>
  }

  const members = data?.members ?? []
  const compliant = members.filter(m => m.compliancePct >= 100).length

  return (
    <PageLayout title="OPEC+ Quota Compliance" subtitle="Production quotas · Compliance tracking · Monthly" lastUpdated={data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : undefined}>
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Group Compliance', value: `${data?.overallCompliance?.toFixed(1) ?? '—'}%`, color: (data?.overallCompliance ?? 0) >= 100 ? '#00ff88' : '#F5A623' },
            { label: 'Total Quota', value: data?.totalQuotaBpd ? `${(data.totalQuotaBpd / 1_000).toFixed(0)}K` : '—', color: '#00d4ff' },
            { label: 'Total Actual', value: data?.totalActualBpd ? `${(data.totalActualBpd / 1_000).toFixed(0)}K` : '—', color: '#ff00ff' },
            { label: 'Fully Compliant', value: `${compliant}/${members.length}`, color: '#00ff88' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0d1117] border border-white/[0.06] rounded p-3 text-center">
              <div className="text-[9px] text-[#94A3B8] mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{label}</div>
              <div className="text-lg font-black" style={{ fontFamily: 'Orbitron, monospace', color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Members Table */}
        <ModuleCard icon={Target} color="#ff00ff" title="Member Compliance" cadence="MONTHLY" tag="OPEC Monthly Oil Market Report">
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-[11px]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Member', 'Quota (kbpd)', 'Actual (kbpd)', 'Compliance', 'Trend'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[9px] text-[#4a4a5a] uppercase tracking-wider font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.name} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2 px-2 text-white font-bold" style={{ fontFamily: 'Orbitron, monospace', fontSize: 10 }}>{m.name}</td>
                    <td className="py-2 px-2 text-[#00d4ff]">{m.quotaBpd?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-white">{m.actualBpd?.toLocaleString()}</td>
                    <td className="py-2 px-2">
                      <span className={cn('font-bold', m.compliancePct >= 100 ? 'text-[#00ff88]' : m.compliancePct >= 90 ? 'text-[#F5A623]' : 'text-[#ff3366]')}>
                        {m.compliancePct?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-1 text-[9px] text-[#94A3B8]">{m.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModuleCard>

        {/* Overproducers */}
        {data?.overproducers && data.overproducers.length > 0 && (
          <ModuleCard icon={AlertTriangle} color="#ff3366" title="Persistent Overproducers" cadence="MONTHLY">
            <div className="mt-2 flex flex-wrap gap-2">
              {data.overproducers.map(name => (
                <span key={name} className="text-[10px] font-bold px-2 py-1 rounded bg-[#ff3366]/15 text-[#ff3366]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  {name}
                </span>
              ))}
            </div>
          </ModuleCard>
        )}

        {/* News */}
        {data?.news && data.news.length > 0 && (
          <div className="space-y-1">
            <div className="text-[9px] text-[#4a4a5a] uppercase tracking-wider" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Latest OPEC News</div>
            {data.news.slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded bg-white/[0.015]">
                <div className="text-[10px] text-white/80 leading-snug line-clamp-1">{n.title}</div>
                <div className="text-[9px] text-[#94A3B8] shrink-0">{n.time}</div>
              </div>
            ))}
          </div>
        )}

        {data?.commentary && (
          <div className="text-[10px] text-[#94A3B8] bg-[#0d1117] border border-white/[0.05] rounded p-3" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            {data.commentary}
          </div>
        )}

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            OPEC Monthly Oil Market Report · EIA International Energy Statistics · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
