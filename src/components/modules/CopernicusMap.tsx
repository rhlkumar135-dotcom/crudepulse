import { useState, useEffect, useCallback } from 'react'
import { Satellite, Flame, Thermometer, AlertTriangle, Ship, Waves, Anchor, MapPin, X, Info, Radio, ExternalLink } from 'lucide-react'
import { WORLD_MAP_PATHS } from '@/lib/world-map-paths'

interface Hotspot {
  id: string; lat: number; lng: number; brightness: number
  confidence: string; date: string; satellite: string; frp: number; dayNight: string
  type?: string; title?: string
}

interface SatelliteResponse {
  fires: { total: number; industrial: number; wildfire: number; unknown: number; hotspots: Hotspot[]; region: string }
  sst: { region: string; anomaly: number; unit: string }
  oilActivity: {
    activeIncidents: number
    shippingDensity: string
    portClosures: number
    pipelineAlerts: number
    recentEvents: Array<{ title: string; source: string; time: string; type: string }>
  }
  sources: Array<{ name: string; url: string; description: string; latency: string }>
  lastUpdated: string
}

const W = 900
const H = 450

function latLngToSVG(lat: number, lng: number): [number, number] {
  return [((lng + 180) / 360) * W, ((90 - lat) / 180) * H]
}

interface OilRegion {
  name: string; lat: number; lng: number; radius: number; color: string; risk: string
  description: string; bpd: string; threats: string[]
}

const OIL_REGIONS: OilRegion[] = [
  { name: 'Persian Gulf', lat: 27, lng: 51, radius: 4, color: '#FF6B35', risk: 'HIGH', bpd: '20.5M', description: 'World\'s largest oil-producing region. Holds ~48% of proven reserves.', threats: ['Geopolitical tensions', 'Shipping lane disruption', 'Sanctions risk'] },
  { name: 'Strait of Hormuz', lat: 26.5, lng: 56.3, radius: 2.5, color: '#EF4444', risk: 'CRITICAL', bpd: '21M transit', description: 'Narrow chokepoint — 21M bbl/d transits. Any closure = global crisis.', threats: ['Iran tensions', 'Mine risk', 'Dark vessel activity', 'Naval confrontation'] },
  { name: 'Red Sea', lat: 18, lng: 39, radius: 3, color: '#F59E0B', risk: 'HIGH', bpd: '8.8M', description: 'Critical Suez corridor. Houthi attacks have rerouted 15% of global shipping.', threats: ['Houthi drone strikes', 'Shipping rerouting', 'Insurance premiums +300%'] },
  { name: 'Suez Canal', lat: 30.6, lng: 32.3, radius: 2, color: '#F59E0B', risk: 'ELEVATED', bpd: '5.5M', description: 'Egypt\'s canal handles 12% of global trade. Chokepoint for ME→EU flows.', threats: ['Blockage risk', 'Political instability', 'Capacity constraints'] },
  { name: 'Gulf of Oman', lat: 24.5, lng: 58.5, radius: 2, color: '#FF6B35', risk: 'HIGH', bpd: '4.2M', description: 'Gateway between Persian Gulf and open ocean. Major tanker transit zone.', threats: ['Tanker seizures', 'Piracy', 'Naval incidents'] },
  { name: 'Niger Delta', lat: 4.5, lng: 6.5, radius: 3, color: '#2DD4BF', risk: 'MODERATE', bpd: '1.4M', description: 'Nigeria\'s oil heartland. Pipeline sabotage and theft ongoing.', threats: ['Pipeline vandalism', 'Oil theft', 'Environmental damage'] },
  { name: 'North Sea', lat: 60, lng: 2, radius: 4, color: '#94A3B8', risk: 'LOW', bpd: '2.8M', description: 'Mature basin. Norway + UK major producers. Declining but stable.', threats: ['Aging infrastructure', 'Storm disruptions', 'Decommissioning'] },
  { name: 'Permian Basin', lat: 32, lng: -102, radius: 3, color: '#94A3B8', risk: 'LOW', bpd: '5.8M', description: 'US shale powerhouse. Largest US oil-producing basin.', threats: ['Price sensitivity', 'Water scarcity', 'DUC well depletion'] },
]

interface RegionInfoPopupProps {
  region: OilRegion
  fires: Hotspot[]
  onClose: () => void
}

function RegionInfoPopup({ region, fires, onClose }: RegionInfoPopupProps) {
  const [cx, cy] = latLngToSVG(region.lat, region.lng)
  const nearbyFires = fires.filter(f => {
    const dist = Math.sqrt(Math.pow(f.lat - region.lat, 2) + Math.pow(f.lng - region.lng, 2))
    return dist < region.radius * 2
  })

  return (
    <foreignObject x={Math.min(cx + 12, W - 220)} y={Math.max(cy - 80, 10)} width={210} height={180}>
      <div className="bg-[#0a0e14]/95 border border-white/15 rounded-lg shadow-2xl shadow-black/50 p-3 backdrop-blur-sm"
        xmlns="http://www.w3.org/1999/xhtml">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[11px] font-bold text-white font-mono">{region.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: region.color + '20', color: region.color }}>
                {region.risk}
              </span>
              <span className="text-[9px] text-gray-400 font-mono">{region.bpd} bbl/d</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <p className="text-[9px] text-gray-400 leading-relaxed mb-2">{region.description}</p>
        <div className="space-y-1">
          <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">Active Threats</div>
          {region.threats.map((t, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full" style={{ background: region.color }} />
              <span className="text-[9px] text-gray-300 font-mono">{t}</span>
            </div>
          ))}
        </div>
        {nearbyFires.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="text-[8px] font-mono text-red/70 uppercase tracking-wider mb-1">
              🔥 {nearbyFires.length} fire hotspot{nearbyFires.length > 1 ? 's' : ''} nearby
            </div>
          </div>
        )}
      </div>
    </foreignObject>
  )
}

interface FirePopupProps {
  fire: Hotspot
  onClose: () => void
}

function FirePopup({ fire, onClose }: FirePopupProps) {
  const [cx, cy] = latLngToSVG(fire.lat, fire.lng)
  return (
    <foreignObject x={Math.min(cx + 10, W - 200)} y={Math.max(cy - 60, 10)} width={195} height={140}>
      <div className="bg-[#0a0e14]/95 border border-red-500/30 rounded-lg shadow-2xl shadow-black/50 p-2.5 backdrop-blur-sm"
        xmlns="http://www.w3.org/1999/xhtml">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Flame size={10} className="text-red" />
            <span className="text-[10px] font-bold text-white font-mono">
              {fire.title || 'Fire Hotspot'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
          <div><span className="text-gray-500">Sat:</span> <span className="text-gray-300">{fire.satellite}</span></div>
          <div><span className="text-gray-500">FRP:</span> <span className="text-red">{fire.frp} MW</span></div>
          <div><span className="text-gray-500">Bright:</span> <span className="text-amber">{fire.brightness}K</span></div>
          <div><span className="text-gray-500">Conf:</span> <span className="text-gray-300">{fire.confidence}</span></div>
          <div className="col-span-2"><span className="text-gray-500">Coords:</span> <span className="text-gray-300">{fire.lat.toFixed(2)}°, {fire.lng.toFixed(2)}°</span></div>
          <div className="col-span-2"><span className="text-gray-500">Date:</span> <span className="text-gray-300">{fire.date}</span></div>
        </div>
      </div>
    </foreignObject>
  )
}

export default function CopernicusMap() {
  const [data, setData] = useState<SatelliteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<OilRegion | null>(null)
  const [selectedFire, setSelectedFire] = useState<Hotspot | null>(null)
  const [hoveredChokepoint, setHoveredChokepoint] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch('/api/market/satellite')
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        if (alive) { setData(json); setError(null) }
      } catch (e) { if (alive) setError(String(e)) }
    }
    load()
    const iv = setInterval(load, 15_000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  const handleRegionClick = useCallback((region: OilRegion) => {
    setSelectedFire(null)
    setSelectedRegion(prev => prev?.name === region.name ? null : region)
  }, [])

  const handleFireClick = useCallback((fire: Hotspot) => {
    setSelectedRegion(null)
    setSelectedFire(prev => prev?.id === fire.id ? null : fire)
  }, [])

  const fires = data?.fires
  const sst = data?.sst
  const oilActivity = data?.oilActivity

  const chokepoints = [
    { name: 'Hormuz', lat: 26.5, lng: 56.3, color: '#EF4444', bpd: '21M bbl/d' },
    { name: 'Suez', lat: 30.0, lng: 32.5, color: '#F59E0B', bpd: '5.5M bbl/d' },
    { name: 'Bab el-Mandeb', lat: 12.6, lng: 43.3, color: '#EF4444', bpd: '6.2M bbl/d' },
    { name: 'Malacca', lat: 2.5, lng: 101.5, color: '#38BDF8', bpd: '16M bbl/d' },
    { name: 'Panama', lat: 9.4, lng: -79.9, color: '#2DD4BF', bpd: '1M bbl/d' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Satellite size={12} className="text-purple" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple">Oil Region Satellite Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted">LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
        </div>
      </div>

      {error && (
        <div className="text-[11px] text-amber font-mono bg-amber/10 rounded px-2 py-1 mb-2">
          ⚠ {error}
        </div>
      )}

      {/* Oil Activity Stats */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <div className="bg-card rounded-lg p-1.5 border border-border">
          <div className="flex items-center gap-1 mb-0.5">
            <Flame size={10} className="text-red" />
            <span className="text-[10px] font-mono text-muted">Incidents</span>
          </div>
          <div className="text-[14px] font-mono text-red font-bold">{oilActivity?.activeIncidents ?? fires?.total ?? 0}</div>
        </div>
        <div className="bg-card rounded-lg p-1.5 border border-border">
          <div className="flex items-center gap-1 mb-0.5">
            <Ship size={10} className="text-amber" />
            <span className="text-[10px] font-mono text-muted">Shipping</span>
          </div>
          <div className="text-[11px] font-mono text-amber font-bold">{oilActivity?.shippingDensity || 'Normal'}</div>
        </div>
        <div className="bg-card rounded-lg p-1.5 border border-border">
          <div className="flex items-center gap-1 mb-0.5">
            <Anchor size={10} className="text-cyan" />
            <span className="text-[10px] font-mono text-muted">Port Status</span>
          </div>
          <div className="text-[14px] font-mono text-cyan font-bold">{oilActivity?.portClosures ?? 0}</div>
          <div className="text-[10px] font-mono text-muted">closures</div>
        </div>
        <div className="bg-card rounded-lg p-1.5 border border-border">
          <div className="flex items-center gap-1 mb-0.5">
            <Waves size={10} className="text-purple" />
            <span className="text-[10px] font-mono text-muted">SST Anom</span>
          </div>
          <div className={`text-[14px] font-mono font-bold ${(sst?.anomaly ?? 0) >= 0 ? 'text-red' : 'text-cyan'}`}>
            {sst?.anomaly ? `${sst.anomaly > 0 ? '+' : ''}${sst.anomaly}${sst.unit}` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative bg-card rounded-lg border border-border overflow-hidden mb-2">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] to-[#060d18]">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
            <defs>
              <radialGradient id="copernicus-ocean" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#0A1628" />
                <stop offset="100%" stopColor="#060A10" />
              </radialGradient>
              <filter id="region-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Ocean background */}
            <rect width={W} height={H} fill="url(#copernicus-ocean)" />

            {/* Subtle grid */}
            {Array.from({ length: 18 }, (_, i) => (i + 1) * 50).map(x => (
              <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#1A2538" strokeWidth="0.3" opacity={0.25} />
            ))}
            {Array.from({ length: 9 }, (_, i) => (i + 1) * 50).map(y => (
              <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#1A2538" strokeWidth="0.3" opacity={0.25} />
            ))}

            {/* ═══ REAL WORLD MAP OUTLINE (Natural Earth 110m) ═══ */}
            {Object.entries(WORLD_MAP_PATHS).map(([continent, paths]) => {
              const isHighlighted = continent === 'Middle East'
              return paths.map((d, i) => (
                <path
                  key={`${continent}-${i}`}
                  d={d}
                  fill={isHighlighted ? '#1A2520' : '#141E2C'}
                  stroke={isHighlighted ? '#2A4A38' : '#1E3048'}
                  strokeWidth="0.5"
                  opacity="0.9"
                />
              ))
            })}

            {/* ═══ TRADE ROUTES (dashed) ═══ */}
            <g opacity="0.35">
              {/* Persian Gulf → Asia */}
              {(() => {
                const [fx, fy] = latLngToSVG(27, 51)
                const [tx, ty] = latLngToSVG(22, 114)
                return <path d={`M ${fx} ${fy} Q ${(fx + tx) / 2} ${Math.min(fy, ty) - 40} ${tx} ${ty}`} fill="none" stroke="#FF6B35" strokeWidth="1.2" strokeDasharray="6,4" />
              })()}
              {/* Suez → Europe */}
              {(() => {
                const [fx, fy] = latLngToSVG(30.6, 32.3)
                const [tx, ty] = latLngToSVG(48, 8)
                return <path d={`M ${fx} ${fy} Q ${(fx + tx) / 2 - 20} ${(fy + ty) / 2} ${tx} ${ty}`} fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="6,4" />
              })()}
              {/* West Africa → Americas */}
              {(() => {
                const [fx, fy] = latLngToSVG(4.5, 6.5)
                const [tx, ty] = latLngToSVG(30, -90)
                return <path d={`M ${fx} ${fy} Q ${(fx + tx) / 2} ${Math.min(fy, ty) - 30} ${tx} ${ty}`} fill="none" stroke="#2DD4BF" strokeWidth="1.2" strokeDasharray="6,4" />
              })()}
            </g>

            {/* ═══ KEY CHOKEPOINTS ═══ */}
            {chokepoints.map(cp => {
              const [cx, cy] = latLngToSVG(cp.lat, cp.lng)
              const isHovered = hoveredChokepoint === cp.name
              return (
                <g key={cp.name}
                  onMouseEnter={() => setHoveredChokepoint(cp.name)}
                  onMouseLeave={() => setHoveredChokepoint(null)}
                  className="cursor-pointer">
                  <circle cx={cx} cy={cy} r={isHovered ? 8 : 5} fill="none" stroke={cp.color} strokeWidth={isHovered ? 1.5 : 1} opacity={isHovered ? 0.8 : 0.4}>
                    <animate attributeName="r" values="4;7;4" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.15;0.4" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r={2} fill={cp.color} opacity={0.85} />
                  <text x={cx} y={cy - 9} textAnchor="middle" fill={cp.color}
                    fontSize="7" fontFamily="IBM Plex Mono" fontWeight="700" opacity={isHovered ? 1 : 0.65}>
                    {cp.name}
                  </text>
                  {isHovered && (
                    <g>
                      <rect x={cx - 38} y={cy + 6} width={76} height={14} rx={3} fill="#0a0e14" stroke={cp.color} strokeOpacity={0.4} strokeWidth={0.8} />
                      <text x={cx} y={cy + 15.5} textAnchor="middle" fill={cp.color} fontSize="7.5" fontFamily="IBM Plex Mono" fontWeight="600">
                        {cp.bpd}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* ═══ OIL REGIONS (clickable) ═══ */}
            {OIL_REGIONS.map(region => {
              const [x, y] = latLngToSVG(region.lat, region.lng)
              const isSelected = selectedRegion?.name === region.name
              return (
                <g key={region.name} onClick={() => handleRegionClick(region)} className="cursor-pointer">
                  {/* Pulse ring */}
                  <circle cx={x} cy={y} r={region.radius * 6} fill={region.color} opacity={isSelected ? 0.18 : 0.06}
                    stroke={region.color} strokeWidth={isSelected ? 1 : 0.6} strokeDasharray={isSelected ? 'none' : '4,4'} />
                  {/* Glow filter */}
                  <circle cx={x} cy={y} r="4" fill={region.color} opacity="0.9" filter={isSelected ? 'url(#region-glow)' : undefined}>
                    <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Center dot */}
                  <circle cx={x} cy={y} r="1.5" fill="white" opacity="0.85" />
                  {/* Label */}
                  <text x={x} y={y - region.radius * 6 - 6} fill={region.color} fontSize="8.5" textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight="bold">
                    {region.name}
                  </text>
                  <text x={x} y={y - region.radius * 6 + 4} fill={region.color} fontSize="6" textAnchor="middle" fontFamily="IBM Plex Mono" opacity="0.65">
                    {region.risk} · {region.bpd}
                  </text>
                </g>
              )
            })}

            {/* ═══ FIRE HOTSPOTS ═══ */}
            {fires?.hotspots?.map(f => {
              const [fx, fy] = latLngToSVG(f.lat, f.lng)
              const size = Math.max(2, Math.min(5, f.frp / 8))
              const color = f.brightness > 400 ? '#EF4444' : f.brightness > 300 ? '#F59E0B' : '#F97316'
              const isFireSelected = selectedFire?.id === f.id
              return (
                <g key={f.id} onClick={(e) => { e.stopPropagation(); handleFireClick(f) }} className="cursor-pointer">
                  <circle cx={fx} cy={fy} r={isFireSelected ? size * 2.5 : size * 1.5} fill={color} opacity={isFireSelected ? 0.4 : 0.15}>
                    <animate attributeName="r" values={`${size * 1.2};${size * 2};${size * 1.2}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.08;0.2" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={fx} cy={fy} r={size * 0.7} fill={color} opacity="0.9" />
                </g>
              )
            })}

            {/* ═══ INFO POPUPS (rendered last, on top) ═══ */}
            {selectedRegion && (
              <RegionInfoPopup region={selectedRegion} fires={fires?.hotspots || []} onClose={() => setSelectedRegion(null)} />
            )}
            {selectedFire && (
              <FirePopup fire={selectedFire} onClose={() => setSelectedFire(null)} />
            )}

            {/* Region labels */}
            <g fontFamily="IBM Plex Mono" fontSize="8" fill="#3A5068" fontWeight="600" letterSpacing="0.5" opacity="0.55">
              <text x={165} y={140} textAnchor="middle">N. AMERICA</text>
              <text x={215} y={300} textAnchor="middle">S. AMERICA</text>
              <text x={460} y={255} textAnchor="middle">AFRICA</text>
              <text x={460} y={78} textAnchor="middle">EUROPE</text>
              <text x={630} y={50} textAnchor="middle">RUSSIA</text>
              <text x={720} y={115} textAnchor="middle">CHINA</text>
              <text x={800} y={90} textAnchor="middle" fontSize="7">JAPAN</text>
              <text x={600} y={170} textAnchor="middle">INDIA</text>
              <text x={775} y={300} textAnchor="middle">AUSTRALIA</text>
            </g>
          </svg>
        </div>

        {/* Map legend */}
        <div className="absolute bottom-2 left-2 bg-[#0a0e14]/90 border border-white/10 rounded p-1.5 space-y-0.5">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            <span className="text-[10px] text-muted font-mono">CRITICAL</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber" />
            <span className="text-[10px] text-muted font-mono">ELEVATED</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal" />
            <span className="text-[10px] text-muted font-mono">NORMAL</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: '#F5A623' }}>---</span>
            <span className="text-[10px] text-muted font-mono">TRADE ROUTE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange" />
            <span className="text-[10px] text-muted font-mono">FIRE</span>
          </div>
          <div className="pt-0.5 mt-0.5 border-t border-white/5">
            <span className="text-[8px] text-gray-500 font-mono">Click region for details</span>
          </div>
        </div>

        {/* Click instruction */}
        {!selectedRegion && !selectedFire && (
          <div className="absolute top-2 right-2 bg-[#0a0e14]/70 border border-white/10 rounded px-2 py-1 flex items-center gap-1.5">
            <Info size={10} className="text-gray-500" />
            <span className="text-[9px] text-gray-500 font-mono">Click markers for intel</span>
          </div>
        )}
      </div>

      {/* Oil Activity News */}
      {oilActivity?.recentEvents && oilActivity.recentEvents.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-muted tracking-wider uppercase">OIL REGION UPDATES</span>
          <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
            {oilActivity.recentEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1 rounded bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                <MapPin size={10} className="text-purple mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-white/80 leading-snug line-clamp-1">{event.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted font-mono">{event.source}</span>
                    <span className="text-[10px] text-purple/70 font-mono font-medium">{event.time}</span>
                    <span className="text-[10px] text-muted font-mono px-1 rounded bg-white/[0.04]">{event.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {data?.sources && (
        <div className="flex gap-3 text-[10px] font-mono text-muted mt-1">
          {data.sources.map(s => (
            <span key={s.name}>📡 {s.name} ({s.latency})</span>
          ))}
        </div>
      )}
    </div>
  )
}
