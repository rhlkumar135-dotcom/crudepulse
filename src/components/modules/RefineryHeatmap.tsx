import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { refineryData, refineryHistory } from '@/lib/mock-data/refinery'
import { CountUp } from '../CountUp'

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
      <div className="text-[8px] text-text-dim font-mono mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[9px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.stroke }} />
          <span className="text-text-dim">{p.name}</span>
          <span className="font-medium text-text-bright">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export function RefineryHeatmap() {
  return (
    <div className="space-y-3">
      {/* PADD Heatmap Tiles */}
      <div className="grid grid-cols-5 gap-1">
        {refineryData.map(r => {
          const intensity = (r.utilization - 70) / 30
          const bg = `rgba(245, 166, 35, ${(intensity * 0.25 + 0.03).toFixed(2)})`
          const t = trendArrow[r.trend]
          return (
            <div key={r.padd} className="rounded-lg p-2 text-center border border-white/[0.03] hover:border-white/[0.08] transition-colors cursor-default"
              style={{ backgroundColor: bg }}>
              <div className="text-[7px] text-text-dim/50 font-mono mb-0.5">{r.padd}</div>
              <div className="text-[13px] font-bold font-mono tabular-nums" style={{ color: paddColors[r.padd] }}>
                <CountUp value={r.utilization} decimals={1} suffix="%" />
              </div>
              <div className="text-[7px] text-text-dim/50 truncate">{r.name}</div>
              <div className="text-[8px] mt-0.5" style={{ color: t.color }}>{t.icon}</div>
            </div>
          )
        })}
      </div>

      {/* Capacity + Crack Spread */}
      <div className="grid grid-cols-5 gap-1">
        {refineryData.map(r => (
          <div key={r.padd} className="text-center py-1">
            <div className="text-[9px] font-mono text-amber tabular-nums">
              <CountUp value={r.capacity} /> KBPD
            </div>
            <div className="text-[8px] text-text-dim/50 font-mono">
              Crack ${r.crackSpread.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {/* 30-day trend */}
      <div>
        <div className="text-[9px] font-mono text-text-dim tracking-wider mb-1">30-DAY UTILIZATION TREND</div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={refineryHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#141A22" />
              <XAxis dataKey="date" tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={6} stroke="#141A22" />
              <YAxis domain={[80, 100]} tick={{ fontSize: 7 }} tickLine={false} axisLine={false} width={25} stroke="#141A22" />
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
