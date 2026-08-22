import { useState, useEffect } from 'react'
import { Satellite, Flame, Droplets, AlertTriangle } from 'lucide-react'
import { WORLD_MAP_PATHS, latLngToSvg } from '@/lib/world-map-paths'

interface FireData { id: string; lat: number; lng: number; frp: number; brightness: number; satellite: string; confidence: string }
interface DarkVessel { title: string; url: string; source: string; timestamp: string }
interface Emission { title: string; url: string; source: string; timestamp: string }
interface Spill { title: string; url: string; source: string; timestamp: string }
interface Facility { name: string; country: string; lat: number; lng: number; threat: string; type: string }

const FACILITIES: Facility[] = [
  { name: 'Ras Tanura Terminal', country: 'SA', lat: 26.6, lng: 50.1, threat: 'elevated', type: 'terminal' },
  { name: 'Strait of Hormuz', country: 'IR/OM', lat: 26.5, lng: 56.3, threat: 'critical', type: 'chokepoint' },
  { name: 'Suez Canal', country: 'EG', lat: 30.0, lng: 32.5, threat: 'elevated', type: 'chokepoint' },
  { name: 'Basra Oil Terminal', country: 'IQ', lat: 30.5, lng: 47.8, threat: 'elevated', type: 'terminal' },
  { name: 'Fujairah Terminal', country: 'AE', lat: 25.1, lng: 56.3, threat: 'watch', type: 'terminal' },
  { name: 'Cushing Hub', country: 'US', lat: 35.9, lng: -96.8, threat: 'clear', type: 'hub' },
  { name: 'Rotterdam Europoort', country: 'NL', lat: 51.9, lng: 4.1, threat: 'clear', type: 'terminal' },
  { name: 'Jurong Island', country: 'SG', lat: 1.3, lng: 103.7, threat: 'watch', type: 'terminal' },
]

const THREAT_COLORS: Record<string, string> = { critical: '#EF4444', elevated: '#F59E0B', watch: '#3B82F6', clear: '#22C55E' }

export function SatelliteIntelPage() {
  const [fires, setFires] = useState<FireData[]>([])
  const [darkVessels, setDarkVessels] = useState<DarkVessel[]>([])
  const [emissions, setEmissions] = useState<Emission[]>([])
  const [spills, setSpills] = useState<Spill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'fires' | 'dark' | 'emissions' | 'spills'>('map')

  useEffect(() => {
    fetch('/api/market/satellite').then(r => r.json()).then(d => {
      setFires(d.fires || [])
      setDarkVessels(d.darkVessels || [])
      setEmissions(d.emissions || [])
      setSpills(d.spills || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white/[0.03] rounded shimmer" />)}</div>

  const W = 800, H = 400

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Satellite className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Satellite Intelligence</h2>
        <span className="live-dot" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['map', 'fires', 'dark', 'emissions', 'spills'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[10px] px-3 py-1 rounded ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300 bg-white/[0.03]'}`}>
            {tab === 'map' ? 'FACILITY MAP' : tab === 'fires' ? `FIRES (${fires.length})` : tab === 'dark' ? `DARK VESSELS (${darkVessels.length})` : tab === 'emissions' ? `EMISSIONS (${emissions.length})` : `SPILLS (${spills.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'map' && (
        <div className="glass-card p-4 rounded-lg">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 600, background: '#080B10' }}>
            <defs>
              <radialGradient id="oceanGrad2"><stop offset="0%" stopColor="#0D1117" /><stop offset="100%" stopColor="#080B10" /></radialGradient>
              <filter id="glow2"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width={W} height={H} fill="url(#oceanGrad2)" />
            {WORLD_MAP_PATHS.map((c, i) => <path key={i} d={c.path} fill="#141E2C" stroke="#1E3048" strokeWidth={0.5} />)}
            {FACILITIES.map((f, i) => {
              const p = latLngToSvg(f.lat, f.lng, W, H)
              const color = THREAT_COLORS[f.threat] || '#666'
              return (
                <g key={i} onClick={() => setSelectedFacility(selectedFacility?.name === f.name ? null : f)} className="cursor-pointer">
                  <circle cx={p.x} cy={p.y} r={12} fill={color} opacity={0.1} />
                  <circle cx={p.x} cy={p.y} r={4} fill={color} filter="url(#glow2)" />
                  <text x={p.x + 7} y={p.y + 3} fill="#CBD5E1" fontSize={5} fontFamily="IBM Plex Mono">{f.name}</text>
                </g>
              )
            })}
            {fires.slice(0, 50).map((f, i) => {
              const p = latLngToSvg(f.lat, f.lng, W, H)
              return <circle key={`fire-${i}`} cx={p.x} cy={p.y} r={2} fill="#FF4500" opacity={0.6} filter="url(#glow2)" />
            })}
          </svg>
          {selectedFacility && (
            <div className="mt-3 p-3 bg-black/40 rounded border text-[10px]" style={{ borderColor: THREAT_COLORS[selectedFacility.threat] + '40' }}>
              <p className="font-mono text-white">{selectedFacility.name}</p>
              <p className="text-gray-400 mt-1">Country: {selectedFacility.country} | Type: {selectedFacility.type}</p>
              <p className="text-gray-400">Threat: <span style={{ color: THREAT_COLORS[selectedFacility.threat] }}>{selectedFacility.threat.toUpperCase()}</span></p>
              <p className="text-gray-500 mt-1">Nearby fires: {fires.filter(f => Math.abs(f.lat - selectedFacility.lat) < 5 && Math.abs(f.lng - selectedFacility.lng) < 5).length}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'fires' && (
        <div className="space-y-2">
          {fires.map((f, i) => (
            <div key={i} className="glass-card p-3 rounded-lg flex items-center gap-3">
              <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white font-mono">{f.lat.toFixed(2)}°, {f.lng.toFixed(2)}° — FRP: {f.frp.toFixed(0)} MW</p>
                <p className="text-[9px] text-gray-500">{f.satellite} | {f.confidence} confidence | {f.brightness.toFixed(0)}K</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'dark' && (
        <div className="space-y-2">
          {darkVessels.map((v, i) => (
            <div key={i} className="glass-card p-3 rounded-lg flex items-start gap-3 border-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white">{v.title}</p>
                <p className="text-[9px] text-gray-500 mt-1">{v.source} · {new Date(v.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {darkVessels.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No dark vessel detections in 14 days</p>}
        </div>
      )}

      {activeTab === 'emissions' && (
        <div className="space-y-2">
          {emissions.map((e, i) => (
            <div key={i} className="glass-card p-3 rounded-lg flex items-start gap-3 border-amber-500/10">
              <Droplets className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white">{e.title}</p>
                <p className="text-[9px] text-gray-500 mt-1">{e.source} · {new Date(e.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {emissions.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No emission events detected</p>}
        </div>
      )}

      {activeTab === 'spills' && (
        <div className="space-y-2">
          {spills.map((s, i) => (
            <div key={i} className="glass-card p-3 rounded-lg flex items-start gap-3 border-purple-500/10">
              <Droplets className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white">{s.title}</p>
                <p className="text-[9px] text-gray-500 mt-1">{s.source} · {new Date(s.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {spills.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No spill events detected</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-[9px] text-gray-400">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" />CLEAR</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" />WATCH</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" />ELEVATED</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" />CRITICAL</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" />FIRMS FIRE</div>
      </div>
    </div>
  )
}
