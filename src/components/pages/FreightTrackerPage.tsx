import { Ship, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface FreightRoute {
  route: string
  description: string
  origin: string
  destination: string
  vesselType: string
  wsRate: number
  change: string
  duration: number
}

interface FreightResponse {
  routes: FreightRoute[]
  balticIndex: number
  news: Array<{ title: string; source: string; time: string }>
  summary: string
  lastUpdated: string
}

const RISK_COLOR = { high: '#ff3366', medium: '#F5A623', low: '#F5A623', none: '#00ff88' }
const RISK_LABEL = { high: 'HIGH RISK', medium: 'MEDIUM', low: 'WATCH', none: 'CLEAR' }

export function FreightTrackerPage() {
  const { data, loading } = useMarketData<FreightResponse>('/api/market/freight', 'free', 30_000)
  const routes = data?.routes ?? []

  if (loading && !routes.length) {
    return (
      <PageLayout title="Tanker Freight & Shipping Costs" subtitle="Baltic Index · Route rates · Chokepoint risk correlation">
        <div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading freight data…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Tanker Freight & Shipping Costs" subtitle="Baltic Index · Route rates · Chokepoint risk correlation">
      <div className="space-y-4">

        {/* Data availability note */}
        {data?.summary && (
          <div className="flex items-center gap-2 bg-[#1a1000] border border-[#F5A623]/20 rounded p-3">
            <AlertCircle size={13} className="text-[#F5A623] shrink-0" />
            <span className="text-[10px] text-[#F5A623]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              {data.summary}
            </span>
          </div>
        )}

        {/* Baltic Index */}
        <ModuleCard icon={Ship} color="#00d4ff" title="Baltic Exchange Index" cadence="DAILY" tag="LIMITED">
          <div className="flex items-end gap-6 mt-3">
            <div>
              <div className="text-4xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                {data?.balticIndex?.toLocaleString() ?? '—'}
              </div>
              <div className="text-[10px] text-[#94A3B8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                Baltic Dirty Tanker Index (BDTI)
              </div>
            </div>
          </div>
        </ModuleCard>

        {/* Route Cards */}
        <ModuleCard icon={Ship} color="#ff00ff" title="Freight Route Rates" cadence="DAILY" tag="DERIVED · LIMITED">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {routes.map((r, i) => (
              <div key={i} className="bg-[#0d1117] border border-white/[0.05] rounded p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{r.description}</div>
                    <div className="text-[9px] text-[#94A3B8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {r.origin} → {r.destination} · {r.vesselType}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Worldscale Rate</div>
                    <div className="text-sm font-bold text-[#00d4ff]" style={{ fontFamily: 'Orbitron, monospace' }}>
                      WS {r.wsRate}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Change</div>
                    <div className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                      {r.change}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    Duration: {r.duration} days
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: '#94A3B8', backgroundColor: '#94A3B818', fontFamily: 'Share Tech Mono, monospace' }}>
                    {r.route}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Baltic Exchange indices (public) · EIA shipping analysis · 30s refresh · Data availability may be limited
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
