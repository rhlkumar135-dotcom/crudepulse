import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useMarketData } from '@/lib/useMarketData'
import { CountUp } from '../CountUp'

interface RefineryData { padd: string; name: string; utilization: number; capacity: number; runs: number; trend: string }
interface RefineryResponse { padd: RefineryData[]; history: Array<{ date: string; overall: number; gulfCoast: number; midwest: number }>; news?: Array<{ title: string; source: string; time: string }>; inputs?: number; lastUpdated?: string; source?: string }

const paddColors: Record<string, string> = {
  'PADD 1': '#38BDF8', 'PADD 2': '#2DD4BF', 'PADD 3': '#F5A623', 'PADD 4': '#A78BFA', 'PADD 5': '#F472B6',
}

const trendArrow: Record<string, { icon: string; color: string }> = {
  up: { icon: '▲', color: '#2DD4BF' },
  down: { icon: '▼', color: '#EF4444' },
  stable: { icon: '—', color: '#6B7A90' },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/30">
      <div className="text-[10px] text-text-dim font-mono mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.stroke }} />
          <span className="text-text-dim">{p.name}</span>
          <span className="font-medium text-text-bright">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export function RefineryHeatmap() {
  const { data } = useMarketData<RefineryResponse>('/api/market/refinery', 'free', 300_000)
  const refineryData = data?.padd || []
  const refineryHistory = data?.history || []

  return (
    <div className="space-y-3">
      {/* PADD Heatmap Tiles */}
      <div className="grid grid-cols-5 gap-1">
        {refineryData.map((r: RefineryData) => {
          const intensity = (r.utilization - 70) / 30
          const bg = `rgba(245, 166, 35, ${(intensity * 0.25 + 0.03).toFixed(2)})`
          const t = trendArrow[r.trend]
          return (
            <div key={r.padd} className="rounded-lg p-2 text-center border border-white/[0.03] hover:border-white/[0.08] transition-colors cursor-default"
              style={{ backgroundColor: bg }}>
              <div className="text-[10px] text-text-dim/50 font-mono mb-0.5">{r.padd}</div>
              <div className="text-[13px] font-bold font-mono tabular-nums" style={{ color: paddColors[r.padd] }}>
                <CountUp value={r.utilization} decimals={1} suffix="%" />
              </div>
              <div className="text-[10px] text-text-dim/50 truncate">{r.name}</div>
              <div className="text-[10px] mt-0.5" style={{ color: t.color }}>{t.icon}</div>
            </div>
          )
        })}
      </div>

      {/* Capacity + Crack Spread */}
      <div className="grid grid-cols-5 gap-1">
        {refineryData.map(r => (
          <div key={r.padd} className="text-center py-1">
            <div className="text-[11px] font-mono text-amber tabular-nums">
              <CountUp value={r.capacity} /> KBPD
            </div>
            <div className="text-[10px] text-text-dim/50 font-mono">
              Runs <CountUp value={r.runs} /> KBPD
            </div>
          </div>
        ))}
      </div>

      {/* 30-day trend */}
      <div>
        <div className="text-[11px] font-mono text-text-dim tracking-wider mb-1">30-DAY UTILIZATION TREND</div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={refineryHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#141A22" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={6} stroke="#141A22" />
              <YAxis domain={[80, 100]} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={25} stroke="#141A22" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="overall" stroke="#F5A623" fill="#F5A623" fillOpacity={0.08} strokeWidth={1.5} dot={false} name="Overall" />
              <Area type="monotone" dataKey="gulfCoast" stroke="#2DD4BF" fill="none" strokeWidth={0.8} strokeDasharray="3 2" dot={false} name="Gulf Coast" />
              <Area type="monotone" dataKey="midwest" stroke="#38BDF8" fill="none" strokeWidth={0.8} strokeDasharray="3 2" dot={false} name="Midwest" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
