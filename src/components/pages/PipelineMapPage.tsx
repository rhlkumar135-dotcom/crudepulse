import { Route, AlertTriangle, CheckCircle } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface OutageFlag {
  title: string
  source: string
  time: string
  severity: 'high' | 'medium' | 'low'
}

interface Pipeline {
  name: string
  from: string
  to: string
  capacityBpd: number
  owner: string
  status: string
  lengthKm: number
  latlngs?: [number, number][]
  outages?: OutageFlag[]
}

interface PipelineResponse {
  pipelines: Pipeline[]
  totalCapacityBpd: number
  outageNews: Array<{ title: string; source: string; time: string; severity: string }>
  count: number
  lastUpdated: string
}

const STATUS_COLOR = { Operational: '#00ff88', Partial: '#F5A623', Offline: '#ff3366' }
const SEV_COLOR = { high: '#ff3366', medium: '#F5A623', low: '#94A3B8' }

export function PipelineMapPage() {
  const { data, loading } = useMarketData<PipelineResponse>('/api/market/pipelines', 'free', 30_000)
  const pipelines = data?.pipelines ?? []

  if (loading && !pipelines.length) {
    return (
      <PageLayout title="Pipeline Network Map" subtitle="Capacity · Route · Owner · Outage flags">
        <div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading pipeline data…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Pipeline Network Map" subtitle="Capacity · Route · Owner · GDELT outage detection">
      <div className="space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Capacity', value: data?.totalCapacityBpd ? `${(data.totalCapacityBpd / 1_000_000).toFixed(1)}M bpd` : '—', color: '#00ff88' },
            { label: 'Pipelines Tracked', value: String(pipelines.length), color: '#00d4ff' },
            { label: 'Active Outages', value: String(data?.outageNews?.length ?? 0), color: (data?.outageNews?.length ?? 0) > 0 ? '#ff3366' : '#00ff88' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0d1117] border border-white/[0.06] rounded p-4 text-center">
              <div className="text-[10px] text-[#94A3B8] mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{label}</div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Orbitron, monospace', color }}>{value}</div>
            </div>
          ))}
        </div>

        <ModuleCard icon={Route} color="#00d4ff" title="Pipeline Network" cadence="LIVE" tag="GDELT outage flags · EIA reference">
          <div className="mt-2 space-y-3">
            {pipelines.map((p, i) => (
              <div key={i} className={cn(
                'border rounded p-4 transition-colors',
                (p.outages ?? []).length > 0 ? 'bg-[#1a0a10] border-[#ff3366]/20' : 'bg-[#0d1117] border-white/[0.05]'
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[12px] font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{p.name}</div>
                    <div className="text-[10px] text-[#94A3B8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {p.from} → {p.to} · {p.lengthKm.toLocaleString()} km
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[p.status] }} />
                    <span className="text-[10px] font-bold" style={{ color: STATUS_COLOR[p.status], fontFamily: 'Share Tech Mono, monospace' }}>
                      {p.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 text-[10px] text-[#94A3B8] mb-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  <span>Owner: <span className="text-white">{p.owner}</span></span>
                  <span>Cap: <span className="text-[#00d4ff] font-bold">{p.capacityBpd?.toLocaleString()} bpd</span></span>
                </div>

                {(p.outages ?? []).length > 0 && (
                  <div className="space-y-1.5 mt-2 pt-2 border-t border-[#ff3366]/15">
                    <div className="text-[9px] text-[#ff3366]/70 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle size={9} /> {(p.outages ?? []).length} outage flag{(p.outages ?? []).length > 1 ? 's' : ''} detected
                    </div>
                    {(p.outages ?? []).map((o, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: SEV_COLOR[o.severity] }} />
                        <div>
                          <span className="text-[10px] text-white leading-snug">{o.title}</span>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-[9px] text-[#94A3B8]">{o.source}</span>
                            <span className="text-[9px]" style={{ color: SEV_COLOR[o.severity] }}>{o.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(p.outages ?? []).length === 0 && (
                  <div className="flex items-center gap-1 text-[9px] text-[#00ff88]/60" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    <CheckCircle size={9} /> No outages detected in GDELT 24h scan
                  </div>
                )}
              </div>
            ))}
          </div>
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            EIA Pipeline Network · GDELT 2.0 real-time outage detection · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
