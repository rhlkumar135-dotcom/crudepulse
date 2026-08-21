import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, CartesianGrid } from 'recharts'
import { useMarketData } from '@/lib/useMarketData'
import { CountUp } from '../CountUp'

interface RigData { basin: string; oilRigs: number; gasRigs: number; totalChange: number }
interface RigWeek { date: string; total: number; oil: number; gas: number; change?: number }
interface RigResponse { total: number; oilTotal: number; gasTotal: number; change: number; basins: RigData[]; history?: RigWeek[]; news?: Array<{ title: string; source: string; time: string }> }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/30">
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color || p.stroke }} />
          <span className="text-text-dim">{p.name}</span>
          <span className="font-medium text-text-bright">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function RigCountChart() {
  const { data } = useMarketData<RigResponse>('/api/market/rigs')
  const currentRigs = data?.basins || []
  const totalRigs = data?.total || 0
  const totalOilRigs = data?.oilTotal || 0
  const totalGasRigs = data?.gasTotal || 0
  const totalChange = data?.change || 0

  const basinData = currentRigs.map(r => ({
    name: r.basin, oil: r.oilRigs, gas: r.gasRigs, change: r.totalChange,
  }))

  const timelineData = (data?.history || []).map(r => ({
    date: (r.date || '').slice(5), total: r.total, oil: r.oil,
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
        <div className="text-[11px] font-mono text-text-dim tracking-wider mb-1">RIGS BY BASIN</div>
        <div className="h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={basinData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} stroke="#141A22" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} width={72} stroke="#141A22" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="oil" stackId="a" fill="#F5A623" radius={[0, 0, 0, 0]} name="Oil" opacity={0.85} />
              <Bar dataKey="gas" stackId="a" fill="#2DD4BF" radius={[0, 3, 3, 0]} name="Gas" opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 52-week trend */}
      <div>
        <div className="text-[11px] font-mono text-text-dim tracking-wider mb-1">52-WEEK RIGS vs WTI</div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#141A22" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={7} stroke="#141A22" />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={30} stroke="#141A22" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="oil" fill="#F5A623" opacity={0.6} name="Oil Rigs" radius={[2, 2, 0, 0]} />
              <Bar dataKey="total" fill="#2DD4BF" opacity={0.3} name="Total Rigs" radius={[2, 2, 0, 0]} />
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
      <div className="text-[10px] text-text-dim font-mono tracking-wider mb-0.5">{label}</div>
      <div className={`text-base font-bold font-mono tabular-nums ${color}`}>
        <CountUp value={value} />
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        {change !== undefined && (
          <span className={`text-[10px] font-mono ${change >= 0 ? 'text-teal' : 'text-red'}`}>
            {change >= 0 ? '+' : ''}{change}
          </span>
        )}
        {pct && <span className="text-[10px] text-text-dim/50 font-mono">{pct}</span>}
      </div>
    </div>
  )
}
