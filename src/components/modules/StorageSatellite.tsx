import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Camera } from 'lucide-react'
import { useMarketData } from '@/lib/useMarketData'
import { CountUp } from '../CountUp'

interface StoragePoint { date: string; cushing: number; spRoc: number; totalUs: number }
interface StorageResponse { history: StoragePoint[]; latest: StoragePoint }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/30">
      <div className="text-[10px] text-text-dim font-mono mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.stroke }} />
          <span className="text-text-dim">{p.name}</span>
          <span className="font-medium text-text-bright">{p.value}M</span>
        </div>
      ))}
    </div>
  )
}

export function StorageSatellite() {
  const { data: apiData } = useMarketData<StorageResponse>('/api/market/storage')
  const storageHistory = apiData?.history || []
  const latestStorage = apiData?.latest || { cushing: 0, spRoc: 0, totalUs: 0 }
  const chartData = storageHistory.map(d => ({
    date: d.date.slice(5), cushing: d.cushing, spRoc: d.spRoc, totalUs: d.totalUs,
  }))

  return (
    <div className="space-y-3">
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-2">
        <StorageKpi label="CUSHING, OK" value={latestStorage.cushing} color="text-amber" sub="Cushing Hub (WTI delivery)" />
        <StorageKpi label="SPR + ROC" value={latestStorage.spRoc} color="text-teal" sub="Strategic + Reserve Stock" />
        <StorageKpi label="TOTAL US" value={latestStorage.totalUs} color="text-text-bright" sub="All commercial + SPR" />
      </div>

      {/* Chart */}
      <div>
        <div className="text-[11px] font-mono text-text-dim tracking-wider mb-1">US CRUDE STOCKS · 52 WEEKS (MMbbl)</div>
        <div className="h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#141A22" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={7} stroke="#141A22" />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={30} stroke="#141A22" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="totalUs" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.06} strokeWidth={1} dot={false} name="Total US" />
              <Area type="monotone" dataKey="spRoc" stroke="#2DD4BF" fill="#2DD4BF" fillOpacity={0.06} strokeWidth={1} dot={false} name="SPR + ROC" />
              <Area type="monotone" dataKey="cushing" stroke="#F5A623" fill="#F5A623" fillOpacity={0.1} strokeWidth={1.5} dot={false} name="Cushing" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Satellite panel */}
      <div className="p-3 rounded-lg bg-white/[0.015] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-2">
          <Camera size={12} className="text-teal/70" />
          <span className="text-[11px] font-semibold text-text">Satellite Reference — Cushing, OK</span>
        </div>
        <div className="h-[80px] rounded-lg border border-white/[0.04] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0D111720, #0F131820)' }}>
          <div className="text-center">
            <div className="text-xl mb-0.5">🛰️</div>
            <div className="text-[11px] text-text-dim font-mono">Sentinel-2 · Aug 15, 2026 · 45 km²</div>
            <div className="text-[10px] text-amber/50 mt-0.5 font-mono">Visual reference only — CV analysis in v2</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StorageKpi({ label, value, color, sub }: { label: string; value: number; color: string; sub: string }) {
  return (
    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
      <div className="text-[10px] text-text-dim/50 font-mono tracking-wider mb-0.5">{label}</div>
      <div className={`text-base font-bold font-mono tabular-nums ${color}`}>
        <CountUp value={value} decimals={1} suffix="M" />
      </div>
      <div className="text-[10px] text-text-dim/40 font-mono">{sub}</div>
    </div>
  )
}
