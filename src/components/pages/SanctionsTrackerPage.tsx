import { ShieldAlert, Clock, ExternalLink, CheckCircle } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface SanctionsEntry {
  id: string
  country: string
  entity: string
  type: string
  dateEnacted: string
  scope: string
  status: 'Active' | 'Partially Lifted' | 'Under Review'
  source: string
  recentlyAdded: boolean
}

interface SanctionsResponse {
  sanctions: SanctionsEntry[]
  activeSanctions: number
  recentlyAdded: number
  news: Array<{ title: string; source: string; time: string }>
  lastUpdated: string
}

const STATUS_COLOR = { 'Active': '#ff3366', 'Partially Lifted': '#F5A623', 'Under Review': '#00d4ff' }

export function SanctionsTrackerPage() {
  const { data, loading } = useMarketData<SanctionsResponse>('/api/market/sanctions', 'free', 30_000)
  const entries = data?.sanctions ?? []

  if (loading && !entries.length) {
    return <PageLayout title="Sanctions & Trade Restrictions" subtitle="OFAC · EU Sanctions · Active regimes"><div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading sanctions data…</div></PageLayout>
  }

  return (
    <PageLayout title="Sanctions & Trade Restrictions" subtitle="OFAC · EU Sanctions Map · Active oil-related regimes">
      <div className="space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Regimes', value: String(data?.activeSanctions ?? 0), color: '#ff3366' },
            { label: 'Recently Added (7d)', value: String(data?.recentlyAdded ?? 0), color: '#F5A623' },
            { label: 'Sources', value: 'OFAC + EU', color: '#00d4ff' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0d1117] border border-white/[0.06] rounded p-3 text-center">
              <div className="text-[9px] text-[#94A3B8] mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{label}</div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Orbitron, monospace', color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Sanctions Table */}
        <ModuleCard icon={ShieldAlert} color="#ff3366" title="Active Oil Sanctions" cadence="CHECKED DAILY" tag="OFAC + EU Sanctions Map">
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-[11px]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Country / Entity', 'Type', 'Date Enacted', 'Scope', 'Status', 'Source', ''].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[9px] text-[#4a4a5a] uppercase tracking-wider font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className={cn('border-b border-white/[0.03] hover:bg-white/[0.02]', e.recentlyAdded && 'bg-[#1a1000]')}>
                    <td className="py-2 px-2">
                      <div className="text-white font-bold" style={{ fontFamily: 'Orbitron, monospace', fontSize: 10 }}>{e.country}</div>
                      {e.entity !== e.country && (
                        <div className="text-[9px] text-[#94A3B8]">{e.entity}</div>
                      )}
                    </td>
                    <td className="py-2 px-2 text-[#94A3B8]">{e.type}</td>
                    <td className="py-2 px-2 text-[#94A3B8]">{e.dateEnacted}</td>
                    <td className="py-2 px-2 text-white/70 max-w-[200px] text-[10px] leading-snug">{e.scope}</td>
                    <td className="py-2 px-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ color: STATUS_COLOR[e.status], backgroundColor: STATUS_COLOR[e.status] + '18' }}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-[#94A3B8]">{e.source}</td>
                    <td className="py-2 px-1">
                      {e.recentlyAdded && (
                        <span className="flex items-center gap-0.5 text-[8px] text-[#F5A623] font-bold">
                          <Clock size={9} /> NEW
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModuleCard>

        {/* News */}
        {data?.news && data.news.length > 0 && (
          <div className="space-y-1">
            <div className="text-[9px] text-[#4a4a5a] uppercase tracking-wider" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Latest Sanctions News</div>
            {data.news.slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/[0.015]">
                <CheckCircle size={10} className="text-[#ff3366] shrink-0" />
                <div className="text-[10px] text-white/80 leading-snug line-clamp-1 flex-1">{n.title}</div>
                <div className="text-[9px] text-[#94A3B8] shrink-0">{n.time}</div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            OFAC Sanctions List · EU Sanctions Map · Google News RSS · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
