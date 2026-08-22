import { useState } from 'react'
import { Factory, Search, Filter } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface Refinery {
  name: string
  country: string
  capacityBpd: number
  complexityIndex: number
  owner: string
  status: string
  lat: number
  lng: number
}

interface RefineriesResponse {
  refineries: Refinery[]
  lastUpdated: string
}

const STATUS_COLOR: Record<string, string> = {
  'Operational': '#00ff88',
  'Shutdown': '#ff3366',
  'Under Construction': '#F5A623',
  'Maintenance': '#ff9500',
}

const COMPLEXITY_LABEL = (n: number) => n >= 12 ? 'Very High' : n >= 9 ? 'High' : n >= 6 ? 'Medium' : 'Low'

const REGION_MAP: Record<string, string> = {
  'US': 'Americas', 'Canada': 'Americas', 'Brazil': 'Americas', 'Mexico': 'Americas', 'Argentina': 'Americas',
  'China': 'Asia Pacific', 'India': 'Asia Pacific', 'Japan': 'Asia Pacific', 'South Korea': 'Asia Pacific', 'Singapore': 'Asia Pacific', 'Taiwan': 'Asia Pacific', 'Thailand': 'Asia Pacific',
  'Saudi Arabia': 'Middle East', 'UAE': 'Middle East', 'Kuwait': 'Middle East', 'Qatar': 'Middle East', 'Oman': 'Middle East', 'Iraq': 'Middle East', 'Iran': 'Middle East',
  'Germany': 'Europe', 'Netherlands': 'Europe', 'Belgium': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'France': 'Europe', 'UK': 'Europe', 'Poland': 'Europe', 'Norway': 'Europe', 'Russia': 'Europe',
  'Nigeria': 'Africa', 'Egypt': 'Africa', 'Algeria': 'Africa', 'Libya': 'Africa', 'South Africa': 'Africa',
}
const getRegion = (country: string) => REGION_MAP[country] || 'Other'

export function RefineryDirectoryPage() {
  const { data, loading } = useMarketData<RefineriesResponse>('/api/market/refineries-dir', 'free', 30_000)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [regionFilter, setRegionFilter] = useState<string>('All')

  const refineries = data?.refineries ?? []
  const regions = ['All', 'Americas', 'Asia Pacific', 'Middle East', 'Europe', 'Africa', 'Other']
  const statuses = ['All', 'Operational', 'Shutdown', 'Under Construction', 'Maintenance']

  const filtered = refineries.filter(r =>
    (search === '' || r.name.toLowerCase().includes(search.toLowerCase()) || r.country.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || r.status === statusFilter) &&
    (regionFilter === 'All' || getRegion(r.country) === regionFilter)
  )

  if (loading && !refineries.length) {
    return (
      <PageLayout title="Global Refinery Directory" subtitle="Capacity · Complexity · Owner · Status">
        <div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading refinery data…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Global Refinery Directory" subtitle="Capacity · Complexity · Owner · Status">
      <div className="space-y-4">
        <ModuleCard icon={Factory} color="#94A3B8" title="Refinery Directory" cadence="PERIODIC">

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-3 mb-3">
            <div className="flex items-center gap-2 bg-[#0d1117] border border-white/[0.06] rounded px-2 py-1 flex-1 min-w-[180px]">
              <Search size={12} className="text-[#94A3B8] shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, country, owner…"
                className="bg-transparent text-[11px] text-white placeholder-[#4a4a5a] outline-none w-full"
                style={{ fontFamily: 'Share Tech Mono, monospace' }}
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter size={11} className="text-[#94A3B8]" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#0d1117] border border-white/[0.06] rounded px-2 py-1 text-[11px] text-[#94A3B8] outline-none"
                style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
                className="bg-[#0d1117] border border-white/[0.06] rounded px-2 py-1 text-[11px] text-[#94A3B8] outline-none"
                style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Name', 'Country', 'Capacity (bpd)', 'Complexity', 'Owner', 'Status'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[9px] text-[#4a4a5a] uppercase tracking-wider font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 px-2 text-white font-bold" style={{ fontFamily: 'Orbitron, monospace', fontSize: 10 }}>{r.name}</td>
                    <td className="py-2 px-2 text-[#94A3B8]">{r.country}</td>
                    <td className="py-2 px-2 text-[#00d4ff] font-bold">{r.capacityBpd.toLocaleString()}</td>
                    <td className="py-2 px-2">
                      <span className="text-white">{r.complexityIndex.toFixed(1)}</span>
                      <span className="text-[#94A3B8] ml-1">({COMPLEXITY_LABEL(r.complexityIndex)})</span>
                    </td>
                    <td className="py-2 px-2 text-[#94A3B8]">{r.owner}</td>
                    <td className="py-2 px-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                        style={{ color: STATUS_COLOR[r.status] ?? '#94A3B8', backgroundColor: (STATUS_COLOR[r.status] ?? '#94A3B8') + '18' }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-8 text-center text-[#94A3B8] text-sm font-mono">No refineries match the current filters.</div>
            )}
          </div>
          <div className="mt-2 text-[9px] text-[#4a4a5a]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Showing {filtered.length} of {refineries.length} refineries
          </div>
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            EIA Refinery Capacity Report · Oil &amp; Gas Journal Annual Survey · Annual reference data
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
