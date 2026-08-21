import { Ship, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface FreightRoute {
  id: string
  name: string
  from: string
  to: string
  vessel_type: string
  rate_usd_mt: number
  rate_ws: number
  change_pct: number
  chokepoint_risk: 'high' | 'medium' | 'low' | 'none'
  chokepoints: string[]
  distance_nm: number
}

interface FreightResponse {
  routes: FreightRoute[]
  baltic_index: number
  baltic_change: number
  data_note: string
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
        <div className="flex items-center gap-2 bg-[#1a1000] border border-[#F5A623]/20 rounded p-3">
          <AlertCircle size={13} className="text-[#F5A623] shrink-0" />
          <span className="text-[10px] text-[#F5A623]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            {data?.data_note ?? 'Data availability may be limited. Baltic Exchange rates are commercially licensed; displayed data is derived from public disclosures and news.'}
          </span>
        </div>

        {/* Baltic Index */}
        <ModuleCard icon={Ship} color="#00d4ff" title="Baltic Exchange Index" cadence="DAILY" tag="LIMITED">
          <div className="flex items-end gap-6 mt-3">
            <div>
              <div className="text-4xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                {data?.baltic_index?.toLocaleString() ?? '—'}
              </div>
              <div className="text-[10px] text-[#94A3B8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                Baltic Dirty Tanker Index (BDTI)
              </div>
            </div>
            {data?.baltic_change !== undefined && (
              <div className={cn('flex items-center gap-1 text-sm font-bold mb-1', data.baltic_change >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]')}>
                {data.baltic_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {data.baltic_change >= 0 ? '+' : ''}{data.baltic_change.toFixed(1)}%
              </div>
            )}
          </div>
        </ModuleCard>

        {/* Route Cards */}
        <ModuleCard icon={Ship} color="#ff00ff" title="Freight Route Rates" cadence="DAILY" tag="DERIVED · LIMITED">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {routes.map(r => (
              <div key={r.id} className={cn(
                'border rounded p-4 space-y-3 transition-colors',
                r.chokepoint_risk === 'high' ? 'bg-[#1a0a10] border-[#ff3366]/20' : 'bg-[#0d1117] border-white/[0.05]'
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{r.name}</div>
                    <div className="text-[9px] text-[#94A3B8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {r.from} → {r.to} · {r.distance_nm.toLocaleString()} nm · {r.vessel_type}
                    </div>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-2"
                    style={{ color: RISK_COLOR[r.chokepoint_risk], backgroundColor: RISK_COLOR[r.chokepoint_risk] + '18', fontFamily: 'Share Tech Mono, monospace' }}>
                    {RISK_LABEL[r.chokepoint_risk]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Rate (USD/mt)</div>
                    <div className="text-sm font-bold text-[#00d4ff]" style={{ fontFamily: 'Orbitron, monospace' }}>
                      ${r.rate_usd_mt.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Worldscale</div>
                    <div className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                      WS {r.rate_ws.toFixed(0)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={cn('text-[10px] font-bold', r.change_pct >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]')}>
                    {r.change_pct >= 0 ? '▲' : '▼'} {Math.abs(r.change_pct).toFixed(1)}% vs prev week
                  </div>
                  {r.chokepoints.length > 0 && (
                    <div className="text-[9px] text-[#F5A623]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      via {r.chokepoints.join(', ')}
                    </div>
                  )}
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
