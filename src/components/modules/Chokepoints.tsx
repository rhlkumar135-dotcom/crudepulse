import { useState } from 'react'
import { Anchor, Ship, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { useMarketData } from '@/lib/useMarketData'
import { CountUp } from '../CountUp'

interface Chokepoint { id: string; name: string; throughput: number; share: number; riskLevel: number; incidents: number; restrictions: string; status: string; riskScore: number; trend: number[] }

function riskColor(score: number): string {
  if (score >= 0.7) return '#EF4444'
  if (score >= 0.4) return '#F5A623'
  return '#2DD4BF'
}

function riskLabel(score: number): string {
  if (score >= 0.7) return 'HIGH'
  if (score >= 0.4) return 'MED'
  return 'LOW'
}

export function ChokepointsMonitor() {
  const { data } = useMarketData<{ straits: Chokepoint[] }>('/api/market/chokepoints')
  const chokepoints = data?.straits || []
  const [selected, setSelected] = useState<Chokepoint | null>(null)
  const sorted = [...chokepoints].sort((a: Chokepoint, b: Chokepoint) => b.riskScore - a.riskScore)

  return (
    <div className="space-y-3">
      {/* Top 4 risk gauges */}
      <div className="grid grid-cols-4 gap-1.5">
        {sorted.slice(0, 4).map(cp => {
          const isActive = selected?.id === cp.id
          const color = riskColor(cp.riskScore)
          return (
            <div
              key={cp.id}
              onClick={() => setSelected(isActive ? null : cp)}
              className={`rounded-lg p-2.5 text-center cursor-pointer transition-all border ${
                isActive
                  ? 'bg-amber/[0.04] border-amber/15'
                  : 'bg-white/[0.015] border-transparent hover:bg-white/[0.03] hover:border-white/5'
              }`}
            >
              <div className="relative w-12 h-12 mx-auto mb-1.5">
                <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#141A22" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${cp.riskScore * 125.6} 125.6`}
                    style={{ filter: `drop-shadow(0 0 3px ${color}30)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-bold font-mono" style={{ color }}>{riskLabel(cp.riskScore)}</span>
                </div>
              </div>
              <div className="text-[10px] font-semibold text-text">{cp.shortName}</div>
              <div className="text-[8px] text-text-dim font-mono mt-0.5">
                <CountUp value={(cp.dailyVolume / 1000000)} decimals={1} />M
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom 4 — compact */}
      <div className="grid grid-cols-4 gap-1">
        {sorted.slice(4).map(cp => {
          const color = riskColor(cp.riskScore)
          return (
            <div
              key={cp.id}
              onClick={() => setSelected(selected?.id === cp.id ? null : cp)}
              className="rounded-lg p-2 text-center cursor-pointer transition-all hover:bg-white/[0.02] border border-transparent hover:border-white/5"
            >
              <div className="relative w-8 h-8 mx-auto mb-1">
                <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#141A22" strokeWidth="3" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${cp.riskScore * 125.6} 125.6`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[7px] font-bold font-mono" style={{ color }}>{(cp.riskScore * 10).toFixed(1)}</span>
                </div>
              </div>
              <div className="text-[8px] font-medium text-text truncate">{cp.shortName}</div>
            </div>
          )
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2.5">
            <Anchor size={13} className="text-amber" />
            <span className="text-[13px] font-semibold text-text-bright">{selected.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border"
              style={{
                backgroundColor: riskColor(selected.riskScore) + '10',
                color: riskColor(selected.riskScore),
                borderColor: riskColor(selected.riskScore) + '20',
              }}>
              RISK {(selected.riskScore * 10).toFixed(1)}/10
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <StatBlock icon={<Anchor size={9} />} label="Volume" value={`${(selected.dailyVolume / 1000000).toFixed(1)}M`} unit="bbl/d" color="text-amber" />
            <StatBlock icon={<Ship size={9} />} label="Vessels" value={String(selected.vesselsToday)} unit="today" color="text-teal" />
            <StatBlock icon={<Clock size={9} />} label="Avg Wait" value={`${selected.avgWaitHours}`} unit="hours" color="text-text" />
            <StatBlock
              icon={<TrendingUp size={9} />}
              label="Trend"
              value={selected.trend === 'up' ? 'Rising' : selected.trend === 'down' ? 'Falling' : 'Stable'}
              unit=""
              color={selected.trend === 'up' ? 'text-red' : selected.trend === 'down' ? 'text-teal' : 'text-text-dim'}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.04]">
            <span className="text-[8px] text-text-dim/50 font-mono">ROUTE</span>
            <ArrowRight size={8} className="text-text-dim/30" />
            <span className="text-[9px] text-text-dim font-mono">{selected.keyRoute}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBlock({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit: string; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-text-dim/40">{icon}</span>
        <span className="text-[7px] text-text-dim/50 font-mono tracking-wider">{label}</span>
      </div>
      <div className={`text-[11px] font-bold font-mono ${color}`}>{value}</div>
      {unit && <div className="text-[7px] text-text-dim/40 font-mono">{unit}</div>}
    </div>
  )
}
