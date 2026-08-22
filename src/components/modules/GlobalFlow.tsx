import { useState } from 'react'
import { useMarketData } from '@/lib/useMarketData'
import { WORLD_MAP_PATHS } from '@/lib/world-map-paths'

interface TradeFlow { id: string; from: string; fromLat: number; fromLng: number; to: string; toLat: number; toLng: number; volume: number; route: string }

interface ChokepointInfo {
  name: string; lat: number; lng: number; color: string; bpd: string
  description: string; risks: string[]
}

const CHOKEPOINTS: ChokepointInfo[] = [
  { name: 'Hormuz', lat: 26.5, lng: 56.3, color: '#F5A623', bpd: '21M bbl/d', description: 'Narrowest point — 21M bbl/d transits. Any closure = global crisis.', risks: ['Iran confrontation', 'Mine warfare', 'Naval blockade'] },
  { name: 'Suez', lat: 30.0, lng: 32.5, color: '#F5A623', bpd: '5.5M bbl/d', description: 'Egypt\'s canal connects ME to Europe. 12% of global trade.', risks: ['Blockage risk', 'Political instability', 'Capacity limits'] },
  { name: 'Bab el-Mandeb', lat: 12.6, lng: 43.3, color: '#EF4444', bpd: '6.2M bbl/d', description: 'Gateway to Red Sea. Houthi attacks forcing 30% rerouting.', risks: ['Houthi drones', 'Piracy', 'Shipping reroutes'] },
  { name: 'Malacca', lat: 2.5, lng: 101.5, color: '#38BDF8', bpd: '16M bbl/d', description: 'World\'s busiest shipping lane. 25% of global oil passes through.', risks: ['Congestion', 'Piracy', 'Geopolitical tension'] },
  { name: 'Panama', lat: 9.4, lng: -79.9, color: '#2DD4BF', bpd: '1M bbl/d', description: 'Americas key link. Drought has reduced transit capacity.', risks: ['Drought restrictions', 'Lock maintenance', 'Capacity constraints'] },
]

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

const W = 900
const H = 450

function toSVG(lat: number, lng: number): [number, number] {
  return [((lng + 180) / 360) * W, ((90 - lat) / 180) * H]
}

export function GlobalFlowMap() {
  const { data } = useMarketData<{ routes: TradeFlow[] }>('/api/market/flows')
  const tradeFlows = data?.routes || []
  const [selected, setSelected] = useState<TradeFlow | null>(null)
  const [selectedCP, setSelectedCP] = useState<ChokepointInfo | null>(null)
  const top15 = [...tradeFlows].sort((a: TradeFlow, b: TradeFlow) => b.volume - a.volume)
  const maxVol = top15[0]?.volume || 1
  const totalVol = top15.reduce((s: number, f: TradeFlow) => s + f.volume, 0)

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(regionColors).filter(([k]) => k !== 'Other').map(([region, color]) => (
          <div key={region} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-text-dim font-mono">{region}</span>
          </div>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-text-dim font-mono">{(totalVol / 1000000).toFixed(0)}M total bbl/d</span>
      </div>

      {/* SVG Map */}
      <div
        className="relative rounded-lg overflow-hidden border border-white/[0.04]"
        style={{ background: 'linear-gradient(180deg, #080C12 0%, #0D1318 50%, #0F1620 100%)' }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: '2/1' }}>
          <defs>
            <radialGradient id="ocean-glow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#0A1628" />
              <stop offset="100%" stopColor="#060A10" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="soft-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {Object.entries(regionColors).map(([_, color]) => (
              <linearGradient key={color} id={`flow-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="50%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0.8} />
              </linearGradient>
            ))}
            <linearGradient id="flow-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5A623" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#F5A623" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#F5A623" stopOpacity={0.9} />
            </linearGradient>
          </defs>

          {/* Ocean background */}
          <rect width={W} height={H} fill="url(#ocean-glow)" />

          {/* Subtle grid */}
          {Array.from({ length: 18 }, (_, i) => (i + 1) * 50).map(x => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#1A2538" strokeWidth="0.3" opacity={0.3} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (i + 1) * 50).map(y => (
            <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#1A2538" strokeWidth="0.3" opacity={0.3} />
          ))}

          {/* ═══ WORLD MAP OUTLINE (Natural Earth 110m) ═══ */}
          <g>
            {WORLD_MAP_PATHS.map((landmass) => {
              const fill = landmass.name === 'Middle East' ? '#1A2520' : '#141E2C'
              return (
                <path key={landmass.name} d={landmass.path} fill={fill} stroke="#1E3048" strokeWidth="0.5" opacity="0.85" />
              )
            })}
          </g>

          {/* ═══ TRADE FLOW ROUTES ═══ */}
          <g>
            {top15.map(flow => {
              const [fx, fy] = toSVG(flow.fromLat, flow.fromLng)
              const [tx, ty] = toSVG(flow.toLat, flow.toLng)
              const thickness = Math.max(1.2, (flow.volume / maxVol) * 6)
              const color = regionColors[getRegion(flow.from)] || '#6B7A90'
              const isActive = selected?.id === flow.id

              // Great circle-like curve (higher arch for longer routes)
              const dx = tx - fx
              const dy = ty - fy
              const dist = Math.sqrt(dx * dx + dy * dy)
              const archHeight = Math.min(dist * 0.25, 80)
              const midX = (fx + tx) / 2
              const midY = (fy + ty) / 2 - archHeight

              return (
                <g key={flow.id} onClick={() => setSelected(isActive ? null : flow)} className="cursor-pointer">
                  {/* Shadow / glow */}
                  {isActive && (
                    <path
                      d={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`}
                      fill="none" stroke={color} strokeWidth={thickness * 3}
                      opacity={0.15} filter="url(#glow)"
                    />
                  )}
                  {/* Main arc */}
                  <path
                    d={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`}
                    fill="none"
                    stroke={isActive ? color : `url(#flow-${color.replace('#', '')})`}
                    strokeWidth={isActive ? thickness * 2 : thickness}
                    opacity={isActive ? 0.95 : 0.4}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Animated dots along route */}
                  {isActive && (
                    <>
                      <circle r="2.5" fill={color} filter="url(#soft-glow)">
                        <animateMotion dur="2s" repeatCount="indefinite"
                          path={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`} />
                      </circle>
                      <circle r="2" fill="#fff" opacity="0.8">
                        <animateMotion dur="2s" repeatCount="indefinite" begin="1s"
                          path={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`} />
                      </circle>
                    </>
                  )}
                  {/* Source dot (larger, pulsing) */}
                  <circle cx={fx} cy={fy} r={isActive ? 7 : 4} fill={color}
                    opacity={isActive ? 1 : 0.7} filter={isActive ? 'url(#soft-glow)' : undefined}
                    className="transition-all duration-300" />
                  {/* Dest dot */}
                  <circle cx={tx} cy={ty} r={isActive ? 5 : 2.5} fill={color}
                    opacity={isActive ? 0.9 : 0.5} className="transition-all duration-300" />
                  {/* Tooltip on active */}
                  {isActive && (
                    <g>
                      <rect x={midX - 55} y={midY - 26} width={110} height={22} rx={4}
                        fill="#0D1318" stroke={color} strokeOpacity={0.4} strokeWidth={1} />
                      <text x={midX} y={midY - 11} textAnchor="middle" fill={color}
                        fontSize="10" fontFamily="IBM Plex Mono" fontWeight="600">
                        {flow.from} → {flow.to}
                      </text>
                      <rect x={midX - 45} y={midY - 2} width={90} height={16} rx={3}
                        fill={color} fillOpacity={0.12} />
                      <text x={midX} y={midY + 10} textAnchor="middle" fill={color}
                        fontSize="10" fontFamily="IBM Plex Mono" fontWeight="700">
                        {(flow.volume / 1000000).toFixed(1)}M bbl/d
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {/* ═══ REGION LABELS ═══ */}
          <g fontFamily="IBM Plex Mono" fontSize="9" fill="#3A5068" fontWeight="600" letterSpacing="0.5" opacity="0.7">
            <text x={165} y={140} textAnchor="middle">N. AMERICA</text>
            <text x={215} y={300} textAnchor="middle">S. AMERICA</text>
            <text x={455} y={245} textAnchor="middle">AFRICA</text>
            <text x={460} y={78} textAnchor="middle">EUROPE</text>
            <text x={520} y={118} textAnchor="middle" fill="#4A6080">MIDDLE EAST</text>
            <text x={630} y={55} textAnchor="middle">RUSSIA</text>
            <text x={700} y={110} textAnchor="middle">CHINA</text>
            <text x={770} y={90} textAnchor="middle" fontSize="8">JAPAN</text>
            <text x={590} y={170} textAnchor="middle">INDIA</text>
            <text x={755} y={300} textAnchor="middle">AUSTRALIA</text>
          </g>

          {/* ═══ KEY CHOKEPOINTS ═══ */}
          <g>
            {CHOKEPOINTS.map(cp => {
              const [cx, cy] = toSVG(cp.lat, cp.lng)
              const isActive = selectedCP?.name === cp.name
              return (
                <g key={cp.name} onClick={(e) => { e.stopPropagation(); setSelectedCP(isActive ? null : cp); setSelected(null) }} className="cursor-pointer">
                  <circle cx={cx} cy={cy} r={isActive ? 9 : 5} fill="none" stroke={cp.color} strokeWidth={isActive ? 1.5 : 1} opacity={isActive ? 0.8 : 0.5}>
                    <animate attributeName="r" values="4;7;4" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r={isActive ? 3 : 2} fill={cp.color} opacity={0.85} />
                  <text x={cx} y={cy - (isActive ? 12 : 8)} textAnchor="middle" fill={cp.color}
                    fontSize={isActive ? '8' : '7'} fontFamily="IBM Plex Mono" fontWeight="700" opacity={isActive ? 1 : 0.7}>
                    {cp.name}
                  </text>
                  {/* Popup when selected */}
                  {isActive && (
                    <foreignObject x={Math.min(cx + 10, W - 205)} y={Math.max(cy - 70, 5)} width={200} height={135}>
                      <div className="bg-[#0a0e14]/95 border border-white/15 rounded-lg shadow-2xl shadow-black/50 p-2.5 backdrop-blur-sm"
                       >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: cp.color }} />
                            <span className="text-[10px] font-bold text-white font-mono">{cp.name}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: cp.color + '20', color: cp.color }}>
                            {cp.bpd}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-gray-400 leading-relaxed mb-1.5">{cp.description}</p>
                        <div className="space-y-0.5">
                          <div className="text-[7.5px] font-mono text-gray-500 uppercase tracking-wider">Risks</div>
                          {cp.risks.map((r, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <div className="w-0.5 h-0.5 rounded-full" style={{ background: cp.color }} />
                              <span className="text-[8px] text-gray-300 font-mono">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
        {/* Click hint */}
        <div className="absolute bottom-2 right-2 bg-[#0a0e14]/70 border border-white/10 rounded px-2 py-1 flex items-center gap-1.5">
          <span className="text-[9px] text-gray-500 font-mono">Click routes & chokepoints for intel</span>
        </div>
      </div>

      {/* Flow list */}
      <div className="space-y-0 max-h-[220px] overflow-y-auto">
        {top15.map((flow, i) => {
          const color = regionColors[getRegion(flow.from)] || '#6B7A90'
          const pct = ((flow.volume / totalVol) * 100)
          return (
            <div
              key={flow.id}
              onClick={() => setSelected(selected?.id === flow.id ? null : flow)}
              className={`flex items-center gap-2.5 py-2 px-2 cursor-pointer transition-colors rounded ${
                selected?.id === flow.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-xs text-text-dim/40 font-mono w-4 text-right">{i + 1}</span>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-text font-mono truncate min-w-0">{flow.from}</span>
              <span className="text-text-dim/30 text-sm">→</span>
              <span className="text-xs text-text font-mono truncate min-w-0">{flow.to}</span>
              <div className="flex-1" />
              <div className="w-20 h-1.5 rounded-full bg-white/[0.04] overflow-hidden shrink-0">
                <div className="h-full rounded-full" style={{ width: `${pct * 3}%`, backgroundColor: color, opacity: 0.6 }} />
              </div>
              <span className="text-xs text-amber font-mono font-semibold tabular-nums w-12 text-right">{(flow.volume / 1000000).toFixed(1)}M</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
