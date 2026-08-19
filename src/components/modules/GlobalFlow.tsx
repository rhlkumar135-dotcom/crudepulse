import { useState } from 'react'
import { tradeFlows, type TradeFlow } from '@/lib/mock-data/flows'

const regionColors: Record<string, string> = {
  'Middle East': '#F5A623', 'North America': '#2DD4BF', 'Russia & CIS': '#EF4444',
  'West Africa': '#A78BFA', 'South America': '#F472B6', 'Asia Pacific': '#38BDF8',
  'Europe': '#34D399', 'Other': '#6B7A90',
}

function getRegion(from: string): string {
  if (from.includes('Saudi') || from.includes('Iraq') || from.includes('UAE') || from.includes('Kuwait') || from.includes('Iran')) return 'Middle East'
  if (from.includes('United States') || from.includes('Canada') || from.includes('Mexico')) return 'North America'
  if (from.includes('Russia')) return 'Russia & CIS'
  if (from.includes('Nigeria') || from.includes('Angola')) return 'West Africa'
  if (from.includes('Brazil') || from.includes('Venezuela')) return 'South America'
  if (from.includes('China') || from.includes('Japan') || from.includes('Korea') || from.includes('India')) return 'Asia Pacific'
  if (from.includes('Europe')) return 'Europe'
  return 'Other'
}

export function GlobalFlowMap() {
  const [selected, setSelected] = useState<TradeFlow | null>(null)
  const top15 = [...tradeFlows].sort((a, b) => b.volume - a.volume)
  const maxVol = top15[0]?.volume || 1
  const totalVol = top15.reduce((s, f) => s + f.volume, 0)

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.entries(regionColors).filter(([k]) => k !== 'Other').map(([region, color]) => (
          <div key={region} className="flex items-center gap-1">
            <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[8px] text-text-dim font-mono">{region}</span>
          </div>
        ))}
        <div className="flex-1" />
        <span className="text-[8px] text-text-dim font-mono">{(totalVol / 1000000).toFixed(0)}M total bbl/d</span>
      </div>

      {/* SVG Map */}
      <div className="relative h-[190px] rounded-lg overflow-hidden border border-white/[0.03]"
        style={{ background: 'linear-gradient(135deg, #0D1117, #0F1318)' }}>
        {/* Grid lines */}
        <svg viewBox="0 0 800 400" className="w-full h-full absolute inset-0 opacity-10">
          {[100, 200, 300, 400, 500, 600, 700].map(x => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={400} stroke="#1A2030" strokeWidth="0.5" />
          ))}
          {[100, 200, 300].map(y => (
            <line key={`h${y}`} x1={0} y1={y} x2={800} y2={y} stroke="#1A2030" strokeWidth="0.5" />
          ))}
        </svg>
        {/* Flow arcs */}
        <svg viewBox="0 0 800 400" className="w-full h-full relative z-10">
          <defs>
            {Object.entries(regionColors).map(([_, color]) => (
              <linearGradient key={color} id={`flow-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                <stop offset="50%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          {top15.map(flow => {
            const fromX = ((flow.fromLng + 180) / 360) * 800
            const fromY = ((90 - flow.fromLat) / 180) * 400
            const toX = ((flow.toLng + 180) / 360) * 800
            const toY = ((90 - flow.toLat) / 180) * 400
            const midX = (fromX + toX) / 2
            const midY = Math.min(fromY, toY) - 30
            const thickness = Math.max(1, (flow.volume / maxVol) * 5)
            const color = regionColors[getRegion(flow.from)] || '#6B7A90'
            const isActive = selected?.id === flow.id
            const gradId = `flow-${color.replace('#', '')}`

            return (
              <g key={flow.id} onClick={() => setSelected(isActive ? null : flow)} className="cursor-pointer">
                <path
                  d={`M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`}
                  fill="none" stroke={`url(#${gradId})`}
                  strokeWidth={isActive ? thickness * 2 : thickness}
                  opacity={isActive ? 0.9 : 0.3}
                  className="transition-all duration-300"
                />
                <circle cx={fromX} cy={fromY} r={isActive ? 4 : 2.5} fill={color} opacity={0.8} className="transition-all" />
                <circle cx={toX} cy={toY} r={isActive ? 3.5 : 2} fill={color} opacity={0.6} className="transition-all" />
                {isActive && (
                  <>
                    <rect x={midX - 35} y={midY - 18} width="70" height="14" rx="3" fill="#0F1318" stroke={color} strokeOpacity={0.3} />
                    <text x={midX} y={midY - 9} textAnchor="middle" fill={color} fontSize="9" fontFamily="IBM Plex Mono" fontWeight="600">
                      {(flow.volume / 1000000).toFixed(1)}M bbl/d
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Flow list */}
      <div className="space-y-0 max-h-[140px] overflow-y-auto">
        {top15.map((flow, i) => {
          const color = regionColors[getRegion(flow.from)] || '#6B7A90'
          const pct = ((flow.volume / totalVol) * 100)
          return (
            <div
              key={flow.id}
              onClick={() => setSelected(selected?.id === flow.id ? null : flow)}
              className={`flex items-center gap-2 py-1.5 px-1 cursor-pointer transition-colors rounded ${
                selected?.id === flow.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-[8px] text-text-dim/40 font-mono w-3 text-right">{i + 1}</span>
              <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-text font-mono truncate min-w-0">{flow.from}</span>
              <span className="text-text-dim/30 text-[9px]">→</span>
              <span className="text-[10px] text-text font-mono truncate min-w-0">{flow.to}</span>
              <div className="flex-1" />
              <div className="w-16 h-[3px] rounded-full bg-white/[0.04] overflow-hidden shrink-0">
                <div className="h-full rounded-full" style={{ width: `${pct * 3}%`, backgroundColor: color, opacity: 0.6 }} />
              </div>
              <span className="text-[10px] text-amber font-mono font-semibold tabular-nums w-10 text-right">{(flow.volume / 1000000).toFixed(1)}M</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
