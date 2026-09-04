import { useState, useEffect, useMemo } from 'react'
import { Globe, Users, Globe as GlobeIcon, Filter, Eye, EyeOff, Ship, Flame, Factory, Anchor, Route, Zap } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { FieldScorecard } from '@/components/modules/FieldScorecard'
import CopernicusMap from '@/components/modules/CopernicusMap'
import { useMarketData } from '@/lib/useMarketData'
import { WORLD_MAP_PATHS } from '@/lib/world-map-paths'

const W = 900
const H = 450
function toSVG(lat: number, lng: number): [number, number] {
  return [((lng + 180) / 360) * W, ((90 - lat) / 180) * H]
}

interface Facility {
  id: string; name: string; country: string; lat: number; lng: number
  type: string; satellite: string; satelliteLatency: string; capacity: string; region: string
  nearbyFires?: number; threatLevel?: string; emissionsFlags?: number; spillFlags?: number
}

interface DarkVessel { title: string; source: string; time: string; location: string; type: string }
interface EmissionEvent { title: string; source: string; time: string; metric: string }
interface FireHotspot { id: string; lat: number; lng: number; brightness: number; frp: number; confidence: string; satellite: string; date: string }
interface TradeFlow { id: string; from: string; fromLat: number; fromLng: number; to: string; toLat: number; toLng: number; volume: number; route: string }
interface ChokepointInfo { name: string; lat: number; lng: number; color: string; bpd: string; description: string; risks: string[] }

const CHOKEPOINTS: ChokepointInfo[] = [
  { name: 'Hormuz', lat: 26.5, lng: 56.3, color: '#F5A623', bpd: '21M bbl/d', description: 'Narrowest point — 21M bbl/d transits.', risks: ['Iran confrontation', 'Mine warfare'] },
  { name: 'Suez', lat: 30.0, lng: 32.5, color: '#F5A623', bpd: '5.5M bbl/d', description: 'Egypt\'s canal connects ME to Europe.', risks: ['Blockage risk', 'Political instability'] },
  { name: 'Bab el-Mandeb', lat: 12.6, lng: 43.3, color: '#EF4444', bpd: '6.2M bbl/d', description: 'Gateway to Red Sea. Houthi attacks.', risks: ['Houthi drones', 'Piracy'] },
  { name: 'Malacca', lat: 2.5, lng: 101.5, color: '#38BDF8', bpd: '16M bbl/d', description: 'World\'s busiest shipping lane.', risks: ['Congestion', 'Piracy'] },
  { name: 'Panama', lat: 9.4, lng: -79.9, color: '#2DD4BF', bpd: '1M bbl/d', description: 'Americas key link. Drought restrictions.', risks: ['Drought restrictions', 'Lock maintenance'] },
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

const FACILITY_COLORS: Record<string, string> = {
  refinery: '#F59E0B', terminal: '#38BDF8', field: '#2DD4BF', chokepoint: '#EF4444', pipeline_hub: '#A78BFA',
}

type FilterKey = 'facilities' | 'darkVessels' | 'emissions' | 'chokepoints' | 'fires' | 'tradeFlows'

interface FilterDef { key: FilterKey; label: string; icon: any; color: string }

const FILTERS: FilterDef[] = [
  { key: 'facilities', label: '21 Facilities', icon: Factory, color: '#F59E0B' },
  { key: 'darkVessels', label: 'Dark Vessels', icon: Ship, color: '#EF4444' },
  { key: 'emissions', label: 'Emissions', icon: Zap, color: '#A78BFA' },
  { key: 'chokepoints', label: 'Chokepoints', icon: Anchor, color: '#F5A623' },
  { key: 'fires', label: 'Fire Hotspots', icon: Flame, color: '#F97316' },
  { key: 'tradeFlows', label: 'Trade Flows', icon: Route, color: '#38BDF8' },
]

function FilterBar({ filters, onToggle }: { filters: Record<FilterKey, boolean>; onToggle: (k: FilterKey) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Filter size={12} className="text-gray-500 mr-1" />
      {FILTERS.map(f => {
        const Icon = f.icon
        const active = filters[f.key]
        return (
          <button key={f.key} onClick={() => onToggle(f.key)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono rounded-md border transition-all ${
              active
                ? 'border-white/20 bg-white/[0.06] text-white'
                : 'border-white/[0.06] bg-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
            }`}>
            <Icon size={10} style={{ color: active ? f.color : undefined }} />
            <span>{f.label}</span>
            {active ? <Eye size={9} className="opacity-50" /> : <EyeOff size={9} className="opacity-30" />}
          </button>
        )
      })}
    </div>
  )
}

function GlobalIntelMap({ filters }: { filters: Record<FilterKey, boolean> }) {
  const { data: v4Data } = useMarketData<any>('/api/v4/satellite/intel', 'free', 30_000)
  const { data: flowData } = useMarketData<{ routes: TradeFlow[] }>('/api/market/flows', 'free', 30_000)

  const facilities: Facility[] = v4Data?.facilities || []
  const darkVessels: DarkVessel[] = v4Data?.darkVessels?.recentEvents || []
  const emissions: EmissionEvent[] = v4Data?.emissions?.recentEvents || []
  const fires: FireHotspot[] = v4Data?.fires?.hotspots || v4Data?.threats?.totalFiresNearFacilities || []
  const tradeFlows = (flowData?.routes || []).sort((a: TradeFlow, b: TradeFlow) => b.volume - a.volume).slice(0, 15)
  const maxVol = tradeFlows[0]?.volume || 1
  const totalFlowVol = tradeFlows.reduce((s: number, f: TradeFlow) => s + f.volume, 0)

  const [selected, setSelected] = useState<{ type: string; data: any } | null>(null)

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden border border-white/[0.04]"
        style={{ background: 'linear-gradient(180deg, #080C12 0%, #0D1318 50%, #0F1620 100%)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: '2/1' }}>
          <defs>
            <radialGradient id="ig-ocean" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#0A1628" />
              <stop offset="100%" stopColor="#060A10" />
            </radialGradient>
            <filter id="ig-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect width={W} height={H} fill="url(#ig-ocean)" />
          {Array.from({ length: 18 }, (_, i) => (i + 1) * 50).map(x => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#1A2538" strokeWidth="0.3" opacity={0.25} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (i + 1) * 50).map(y => (
            <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#1A2538" strokeWidth="0.3" opacity={0.25} />
          ))}
          {Object.entries(WORLD_MAP_PATHS).map(([cont, paths]) => (
            paths.map((d, i) => (
              <path key={`${cont}-${i}`} d={d} fill={cont === 'Middle East' ? '#1A2520' : '#141E2C'} stroke="#1E3048" strokeWidth="0.5" opacity="0.85" />
            ))
          ))}

          {/* Trade Flows */}
          {filters.tradeFlows && tradeFlows.map(flow => {
            const [fx, fy] = toSVG(flow.fromLat, flow.fromLng)
            const [tx, ty] = toSVG(flow.toLat, flow.toLng)
            const thickness = Math.max(1, (flow.volume / maxVol) * 5)
            const color = regionColors[getRegion(flow.from)] || '#6B7A90'
            const dx = tx - fx, dy = ty - fy
            const dist = Math.sqrt(dx * dx + dy * dy)
            const archHeight = Math.min(dist * 0.25, 80)
            const midX = (fx + tx) / 2, midY = (fy + ty) / 2 - archHeight
            const isFlowSelected = selected?.type === 'flow' && selected?.data?.id === flow.id
            return (
              <g key={flow.id} onClick={() => setSelected(isFlowSelected ? null : { type: 'flow', data: flow })} className="cursor-pointer">
                {/* Glow behind selected flow */}
                {isFlowSelected && (
                  <path d={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`} fill="none" stroke={color} strokeWidth={thickness * 3} opacity={0.2} />
                )}
                <path d={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`} fill="none" stroke={color}
                  strokeWidth={isFlowSelected ? thickness * 2 : thickness}
                  opacity={isFlowSelected ? 0.9 : 0.35} strokeLinecap="round" />
                {/* Animated dots along selected flow */}
                {isFlowSelected && (
                  <>
                    <circle r="2.5" fill={color}>
                      <animateMotion dur="2.5s" repeatCount="indefinite" path={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`} />
                    </circle>
                    <circle r="1.5" fill="#fff" opacity="0.8">
                      <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.2s" path={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`} />
                    </circle>
                  </>
                )}
                <circle cx={fx} cy={fy} r={isFlowSelected ? 4 : 3} fill={color} opacity={isFlowSelected ? 0.9 : 0.7} />
                <circle cx={fx} cy={fy} r={1.5} fill="#fff" opacity={0.9} />
                <circle cx={tx} cy={ty} r={isFlowSelected ? 3 : 2} fill={color} opacity={isFlowSelected ? 0.8 : 0.5} />
                <circle cx={tx} cy={ty} r={1} fill="#fff" opacity={0.7} />
                {/* Tooltip for selected flow */}
                {isFlowSelected && (
                  <foreignObject x={Math.min(midX - 80, W - 170)} y={Math.max(midY - 40, 5)} width={160} height={60}>
                    <div className="bg-[#0a0e14]/95 border border-white/15 rounded-lg shadow-2xl p-2 backdrop-blur-sm">
                      <div className="text-[9px] font-bold font-mono" style={{ color }}>{flow.from} → {flow.to}</div>
                      <div className="text-[8px] text-gray-400 font-mono">{flow.route}</div>
                      <div className="text-[10px] font-bold font-mono mt-0.5" style={{ color }}>
                        {(flow.volume / 1000000).toFixed(2)}M bbl/d ({((flow.volume / totalFlowVol) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}

          {/* Chokepoints */}
          {filters.chokepoints && CHOKEPOINTS.map(cp => {
            const [cx, cy] = toSVG(cp.lat, cp.lng)
            const isSelected = selected?.type === 'chokepoint' && selected?.data?.name === cp.name
            return (
              <g key={cp.name} onClick={() => setSelected(isSelected ? null : { type: 'chokepoint', data: cp })} className="cursor-pointer">
                <circle cx={cx} cy={cy} r={isSelected ? 8 : 5} fill="none" stroke={cp.color} strokeWidth={isSelected ? 1.5 : 1} opacity={isSelected ? 0.8 : 0.4}>
                  <animate attributeName="r" values="4;7;4" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={cx} cy={cy} r={2} fill={cp.color} opacity={0.85} />
                <text x={cx} y={cy - 8} textAnchor="middle" fill={cp.color} fontSize="7" fontFamily="IBM Plex Mono" fontWeight="700" opacity={isSelected ? 1 : 0.65}>
                  {cp.name}
                </text>
                {isSelected && (
                  <foreignObject x={Math.min(cx + 10, W - 205)} y={Math.max(cy - 60, 5)} width={200} height={100}>
                    <div className="bg-[#0a0e14]/95 border border-white/15 rounded-lg shadow-2xl p-2 backdrop-blur-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: cp.color }} />
                        <span className="text-[10px] font-bold text-white font-mono">{cp.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded ml-auto" style={{ background: cp.color + '20', color: cp.color }}>{cp.bpd}</span>
                      </div>
                      <p className="text-[8.5px] text-gray-400 leading-relaxed">{cp.description}</p>
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}

          {/* Facilities */}
          {filters.facilities && facilities.map(f => {
            const [fx, fy] = toSVG(f.lat, f.lng)
            const color = FACILITY_COLORS[f.type] || '#6B7A90'
            const threat = f.threatLevel || 'none'
            const threatColor = threat === 'critical' ? '#EF4444' : threat === 'elevated' ? '#F59E0B' : threat === 'watch' ? '#FBBF24' : color
            const isSelected = selected?.type === 'facility' && selected?.data?.id === f.id
            const size = isSelected ? 5 : 3
            return (
              <g key={f.id} onClick={() => setSelected(isSelected ? null : { type: 'facility', data: f })} className="cursor-pointer">
                <circle cx={fx} cy={fy} r={size + 3} fill={threatColor} opacity={0.12}>
                  {threat !== 'none' && <animate attributeName="r" values={`${size + 1};${size + 5};${size + 1}`} dur="2s" repeatCount="indefinite" />}
                </circle>
                <circle cx={fx} cy={fy} r={size} fill={threatColor} opacity={0.85} />
                <circle cx={fx} cy={fy} r={1.5} fill="#fff" opacity={0.9} />
                <text x={fx} y={fy - (isSelected ? 10 : 7)} textAnchor="middle" fill={threatColor} fontSize="6.5" fontFamily="IBM Plex Mono" fontWeight="600" opacity={isSelected ? 1 : 0.7}>
                  {f.name}
                </text>
                {isSelected && (
                  <foreignObject x={Math.min(fx + 10, W - 210)} y={Math.max(fy - 50, 5)} width={200} height={120}>
                    <div className="bg-[#0a0e14]/95 border border-white/15 rounded-lg shadow-2xl p-2.5 backdrop-blur-sm">
                      <div className="text-[10px] font-bold text-white font-mono mb-1">{f.name}</div>
                      <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                        <span className="text-gray-500">Type:</span><span className="text-gray-300">{f.type}</span>
                        <span className="text-gray-500">Satellite:</span><span className="text-gray-300">{f.satellite} ({f.satelliteLatency})</span>
                        <span className="text-gray-500">Capacity:</span><span className="text-gray-300">{f.capacity}</span>
                        <span className="text-gray-500">Threat:</span><span style={{ color: threatColor }}>{threat.toUpperCase()}</span>
                        {f.nearbyFires ? <><span className="text-gray-500">Nearby fires:</span><span className="text-orange-400">{f.nearbyFires}</span></> : null}
                        {f.emissionsFlags ? <><span className="text-gray-500">Emission flags:</span><span className="text-purple-400">{f.emissionsFlags}</span></> : null}
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}

          {/* Dark vessel indicators (as pulsing red dots near shipping lanes) */}
          {filters.darkVessels && darkVessels.length > 0 && (
            <g>
              {[
                { lat: 26.0, lng: 56.5, label: 'Gulf of Oman' },
                { lat: 12.0, lng: 43.5, label: 'Red Sea' },
                { lat: 2.0, lng: 102.0, label: 'Malacca' },
              ].map((zone, i) => {
                const [zx, zy] = toSVG(zone.lat, zone.lng)
                return (
                  <g key={`dv-${i}`}>
                    <circle cx={zx} cy={zy} r={4} fill="#EF4444" opacity={0.3}>
                      <animate attributeName="r" values="3;7;3" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.08;0.3" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={zx} cy={zy} r={2} fill="#EF4444" opacity={0.8} />
                    <text x={zx} y={zy - 8} textAnchor="middle" fill="#EF4444" fontSize="6" fontFamily="IBM Plex Mono" fontWeight="600" opacity={0.7}>⚡ DARK</text>
                  </g>
                )
              })}
            </g>
          )}

          {/* Emission indicators */}
          {filters.emissions && (
            <g>
              {[
                { lat: 26.8, lng: 49.8, label: 'CH₄' },
                { lat: 30.0, lng: -95.0, label: 'NO₂' },
                { lat: 28.0, lng: 52.0, label: 'SO₂' },
              ].map((em, i) => {
                const [ex, ey] = toSVG(em.lat, em.lng)
                return (
                  <g key={`em-${i}`}>
                    <circle cx={ex} cy={ey} r={5} fill="#A78BFA" opacity={0.08} stroke="#A78BFA" strokeWidth={0.5} strokeDasharray="2,2">
                      <animate attributeName="r" values="4;8;4" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <text x={ex} y={ey + 3} textAnchor="middle" fill="#A78BFA" fontSize="7" fontFamily="IBM Plex Mono" fontWeight="700" opacity={0.6}>
                      {em.label}
                    </text>
                  </g>
                )
              })}
            </g>
          )}

          {/* Region labels */}
          <g fontFamily="IBM Plex Mono" fontSize="8" fill="#3A5068" fontWeight="600" letterSpacing="0.5" opacity="0.5">
            <text x={165} y={140} textAnchor="middle">N. AMERICA</text>
            <text x={215} y={300} textAnchor="middle">S. AMERICA</text>
            <text x={455} y={245} textAnchor="middle">AFRICA</text>
            <text x={460} y={78} textAnchor="middle">EUROPE</text>
            <text x={520} y={118} textAnchor="middle" fill="#4A6080">MIDDLE EAST</text>
            <text x={630} y={55} textAnchor="middle">RUSSIA</text>
            <text x={700} y={110} textAnchor="middle">CHINA</text>
            <text x={770} y={90} textAnchor="middle" fontSize="7">JAPAN</text>
            <text x={590} y={170} textAnchor="middle">INDIA</text>
            <text x={755} y={300} textAnchor="middle">AUSTRALIA</text>
          </g>
        </svg>

        {/* Legend + click hint */}
        <div className="absolute bottom-2 left-2 bg-[#0a0e14]/90 border border-white/10 rounded p-1.5 space-y-0.5">
          {filters.facilities && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} /><span className="text-[9px] text-gray-400 font-mono">FACILITIES</span></div>}
          {filters.darkVessels && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red" /><span className="text-[9px] text-gray-400 font-mono">DARK VESSELS</span></div>}
          {filters.emissions && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: '#A78BFA' }} /><span className="text-[9px] text-gray-400 font-mono">EMISSIONS</span></div>}
          {filters.chokepoints && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber" /><span className="text-[9px] text-gray-400 font-mono">CHOKEPOINTS</span></div>}
          {filters.fires && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange" /><span className="text-[9px] text-gray-400 font-mono">FIRES</span></div>}
          {filters.tradeFlows && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: '#38BDF8' }} /><span className="text-[9px] text-gray-400 font-mono">TRADE FLOWS</span></div>}
        </div>
        <div className="absolute bottom-2 right-2 bg-[#0a0e14]/70 border border-white/10 rounded px-2 py-1">
          <span className="text-[9px] text-gray-500 font-mono">Click flows, facilities & chokepoints for intel</span>
        </div>
      </div>

      {/* Selected flow detail panel */}
      {selected?.type === 'flow' && selected.data && (
        <div className="mt-2 p-3 rounded-lg border border-white/10 bg-[#0a0e14]/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: regionColors[getRegion(selected.data.from)] || '#6B7A90' }} />
            <span className="text-xs font-bold text-white font-mono">{selected.data.from}</span>
            <span className="text-gray-500">→</span>
            <span className="text-xs font-bold text-white font-mono">{selected.data.to}</span>
            <div className="flex-1" />
            <button onClick={() => setSelected(null)} className="text-[10px] text-gray-500 hover:text-white transition-colors font-mono">✕</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[9px] text-gray-500 font-mono uppercase">Volume</div>
              <div className="text-sm font-bold font-mono" style={{ color: regionColors[getRegion(selected.data.from)] || '#6B7A90' }}>
                {(selected.data.volume / 1000000).toFixed(2)}M bbl/d
              </div>
            </div>
            <div>
              <div className="text-[9px] text-gray-500 font-mono uppercase">Share</div>
              <div className="text-sm font-bold text-white font-mono">
                {((selected.data.volume / totalFlowVol) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[9px] text-gray-500 font-mono uppercase">Route</div>
              <div className="text-[11px] text-gray-300 font-mono">{selected.data.route}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function GlobalPage() {
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    facilities: true,
    darkVessels: true,
    emissions: true,
    chokepoints: true,
    fires: true,
    tradeFlows: true,
  })

  const toggleFilter = (key: FilterKey) => setFilters(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <PageLayout title="Global Intelligence" subtitle="Satellite monitoring · Facility watchlist · Dark vessels · Emissions · Trade flows">
      <div className="space-y-4">
        <ModuleCard icon={Globe} color="#F5A623" title="Global Facility Watchlist Map" cadence="LIVE"
          tag="21 facilities · NASA FIRMS · GOES/Meteosat/Himawari">
          <FilterBar filters={filters} onToggle={toggleFilter} />
          <div className="mt-3">
            <GlobalIntelMap filters={filters} />
          </div>
        </ModuleCard>

        <ModuleCard icon={Users} color="#f43f5e" title="Field Scorecard" cadence="LIVE">
          <FieldScorecard />
        </ModuleCard>

        <ModuleCard icon={GlobeIcon} color="#a855f7" title="Copernicus / Satellite Feed" cadence="LIVE"
          tag="NASA EONET · NOAA Coral Reef Watch">
          <CopernicusMap />
        </ModuleCard>

        <div className="text-center py-3">
          <div className="text-xs text-[#94A3B8] tracking-[0.12em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            IEA · OPEC · NASA EONET · NOAA · Google News · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
