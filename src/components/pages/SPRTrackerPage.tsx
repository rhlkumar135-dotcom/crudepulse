import { Shield, TrendingDown, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'

interface SPRResponse {
  us: { latestMbbl: number; trend: string; trendDelta: number; history: Array<{ date: string; latestMbbl: number }> }
  ieaCountries: Array<{ country: string; capacityMbbl: number; currentMbbl: number; type: string; disclosure: string; status: string }>
  totalIeacReserveMbbl: number
  commentary: string
  lastUpdated: string
}

export function SPRTrackerPage() {
  const { data, loading } = useMarketData<SPRResponse>('/api/market/spr', 'free', 30_000)

  if (loading && !data) {
    return <PageLayout title="Strategic Petroleum Reserves Tracker" subtitle="US SPR levels · IEA country comparison"><div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading SPR data…</div></PageLayout>
  }

  return (
    <PageLayout title="Strategic Petroleum Reserves Tracker" subtitle="US SPR levels · IEA country comparison · Drawdown events" lastUpdated={data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : undefined}>
      <div className="space-y-4">
        {/* US SPR Level */}
        <ModuleCard icon={Shield} color="#00d4ff" title="US SPR Level" cadence="WEEKLY">
          <div className="mt-3 space-y-4">
            <div className="flex items-end gap-6">
              <div>
                <div className="text-3xl font-black text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                  {data?.us?.latestMbbl?.toFixed(0) ?? '—'}<span className="text-base text-[#94A3B8] ml-1">Mb</span>
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  Trend: {data?.us?.trend ?? '—'} · {(data?.us?.trendDelta ?? 0) > 0 ? '+' : ''}{data?.us?.trendDelta ?? 0} Mb
                </div>
              </div>
            </div>

            {/* Trend line */}
            {data?.us?.history && data.us.history.length > 0 && (
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.us.history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sprGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                    <XAxis dataKey="date" tick={{ fill: '#4a4a5a', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }} tickLine={false} />
                    <YAxis tick={{ fill: '#4a4a5a', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1a2a3a', borderRadius: 4, fontSize: 11 }} />
                    <Area type="monotone" dataKey="latestMbbl" stroke="#00d4ff" strokeWidth={2} fill="url(#sprGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </ModuleCard>

        {/* Country Comparison */}
        <ModuleCard icon={Shield} color="#ff00ff" title="IEA Country SPR Comparison" cadence="MONTHLY">
          <div className="mt-2 space-y-2">
            {(data?.ieaCountries ?? []).map((c: any) => (
              <div key={c.country} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[11px] font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{c.country}</span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">{c.currentMbbl?.toLocaleString()} Mb</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.capacityMbbl > 0 ? (c.currentMbbl / c.capacityMbbl) * 100 : 0}%`, backgroundColor: '#ff00ff' }} />
                  </div>
                  <div className="text-[9px] text-[#94A3B8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    {c.disclosure || c.type} · {c.status}
                  </div>
                </div>
              </div>
            ))}
            <div className="text-[10px] text-[#94A3B8] bg-[#0d1117] border border-white/[0.05] rounded p-3 mt-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              Total IEA reported reserves: {data?.totalIeacReserveMbbl?.toLocaleString() ?? '—'} Mb
            </div>
          </div>
        </ModuleCard>

        {/* Commentary */}
        {data?.commentary && (
          <div className="text-[10px] text-[#94A3B8] bg-[#0d1117] border border-white/[0.05] rounded p-3" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            {data.commentary}
          </div>
        )}

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            EIA Weekly Petroleum Status Report · IEA Emergency Stocks · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
