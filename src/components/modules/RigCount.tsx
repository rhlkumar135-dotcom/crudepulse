import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, CartesianGrid } from 'recharts'
import { currentRigs, rigHistory, totalRigs, totalOilRigs, totalGasRigs, totalChange } from '@/lib/mock-data/rigs'
import { CountUp } from '../CountUp'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/30">
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[9px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color || p.stroke }} />
          <span className="text-text-dim">{p.name}</span>
          <span className="font-medium text-text-bright">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function RigCountChart() {
  const basinData = currentRigs.map(r => ({
    name: r.basin, oil: r.oilRigs, gas: r.gasRigs, change: r.totalChange,
  }))

  const timelineData = rigHistory.map(r => ({
    date: r.week.slice(5), total: r.total, oil: r.oil, wti: r.wtiPrice,
  }))

  return (
    <div className="space-y-3">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        <KpiCard label="TOTAL" value={totalRigs} change={totalChange} color="text-text-bright" />
        <KpiCard label="OIL" value={totalOilRigs} change={totalChange} color="text-amber" pct={((totalOilRigs / totalRigs) * 100).toFixed(0) + '%'} />
        <KpiCard label="GAS" value={totalGasRigs} color="text-teal" pct={((totalGasRigs / totalRigs) * 100).toFixed(0) + '%'} />
      </div>

      {/* Basin bars */}
      <div>
        <div className="text-[9px] font-mono text-text-dim tracking-wider mb-1">RIGS BY BASIN</div>
        <div className="h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={basinData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <XAxis type="number" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} stroke="#141A22" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} width={72} stroke="#141A22" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="oil" stackId="a" fill="#F5A623" radius={[0, 0, 0, 0]} name="Oil" opacity={0.85} />
              <Bar dataKey="gas" stackId="a" fill="#2DD4BF" radius={[0, 3, 3, 0]} name="Gas" opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 52-week trend */}
      <div>
        <div className="text-[9px] font-mono text-text-dim tracking-wider mb-1">52-WEEK RIGS vs WTI</div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#141A22" />
              <XAxis dataKey="date" tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={7} stroke="#141A22" />
              <YAxis yAxisId="rigs" tick={{ fontSize: 7 }} tickLine={false} axisLine={false} width={30} stroke="#141A22" />
              <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 7 }} tickLine={false} axisLine={false} width={30} stroke="#141A22" />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="rigs" dataKey="oil" fill="#F5A623" opacity={0.4} name="Rigs" />
              <Line yAxisId="price" type="monotone" dataKey="wti" stroke="#EF4444" strokeWidth={1} dot={false} name="WTI ($)" strokeDasharray="0" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, change, color, pct }: { label: string; value: number; change?: number; color: string; pct?: string }) {
  return (
    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
      <div className="text-[8px] text-text-dim font-mono tracking-wider mb-0.5">{label}</div>
      <div className={`text-base font-bold font-mono tabular-nums ${color}`}>
        <CountUp value={value} />
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        {change !== undefined && (
          <span className={`text-[8px] font-mono ${change >= 0 ? 'text-teal' : 'text-red'}`}>
            {change >= 0 ? '+' : ''}{change}
          </span>
        )}
        {pct && <span className="text-[8px] text-text-dim/50 font-mono">{pct}</span>}
      </div>
    </div>
  )
}
