import { useState, useEffect } from 'react'
import { Satellite, Flame, Thermometer, AlertTriangle, Ship, Waves, Anchor, MapPin } from 'lucide-react'

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

function latLngToXY(lat: number, lng: number, w: number, h: number): { x: number; y: number } {
  return { x: ((lng + 180) / 360) * w, y: ((90 - lat) / 180) * h }
}

const OIL_REGIONS = [
  { name: 'Persian Gulf', lat: 27, lng: 51, radius: 4, color: '#FF6B35', risk: 'HIGH' },
  { name: 'Hormuz', lat: 26.5, lng: 56.3, radius: 2.5, color: '#EF4444', risk: 'CRITICAL' },
  { name: 'Red Sea', lat: 18, lng: 39, radius: 3, color: '#F59E0B', risk: 'HIGH' },
  { name: 'Suez Canal', lat: 30.6, lng: 32.3, radius: 2, color: '#F59E0B', risk: 'ELEVATED' },
  { name: 'Gulf of Oman', lat: 24.5, lng: 58.5, radius: 2, color: '#FF6B35', risk: 'HIGH' },
  { name: 'Niger Delta', lat: 4.5, lng: 6.5, radius: 3, color: '#2DD4BF', risk: 'MODERATE' },
  { name: 'North Sea', lat: 60, lng: 2, radius: 4, color: '#94A3B8', risk: 'LOW' },
  { name: 'Permian Basin', lat: 32, lng: -102, radius: 3, color: '#94A3B8', risk: 'LOW' },
]

export default function CopernicusMap() {
  const [data, setData] = useState<SatelliteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

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
    const iv = setInterval(load, 60_000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  const fires = data?.fires
  const sst = data?.sst
  const oilActivity = data?.oilActivity

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Satellite size={12} className="text-purple" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple">Oil Region Satellite Monitor</span>
        </div>
        <span className="text-[10px] font-mono text-muted">LIVE</span>
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
          <svg viewBox="0 0 800 400" className="w-full h-full">
            {/* Grid lines */}
            {[100, 200, 300].map(y => (
              <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#1a2a40" strokeWidth="0.5" />
            ))}
            {[200, 400, 600].map(x => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="400" stroke="#1a2a40" strokeWidth="0.5" />
            ))}

            {/* Continents outline (simplified) */}
            {/* Africa */}
            <path d="M330,160 L340,140 L370,130 L400,120 L410,140 L420,170 L430,200 L424,240 L410,260 L390,280 L370,290 L350,280 L340,250 L330,220 Z" fill="#0f1a2a" stroke="#1a2a40" strokeWidth="1" />
            {/* Europe */}
            <path d="M350,80 L360,70 L390,60 L420,64 L440,70 L450,80 L440,100 L420,110 L390,116 L370,110 L360,96 Z" fill="#0f1a2a" stroke="#1a2a40" strokeWidth="1" />
            {/* Middle East */}
            <path d="M420,110 L440,100 L470,96 L500,100 L510,116 L500,130 L480,140 L460,136 L440,130 L430,120 Z" fill="#111d30" stroke="#2a3a50" strokeWidth="1" />
            {/* Asia */}
            <path d="M500,60 L560,50 L640,56 L700,70 L720,100 L700,130 L660,140 L600,136 L560,120 L530,110 L510,90 Z" fill="#0f1a2a" stroke="#1a2a40" strokeWidth="1" />
            {/* Americas */}
            <path d="M100,60 L130,50 L150,60 L140,100 L120,140 L110,180 L100,220 L90,240 L80,260 L100,290 L110,310 L100,340 L80,360 L70,330 L60,280 L70,240 L80,200 L70,160 L80,120 L90,90 Z" fill="#0f1a2a" stroke="#1a2a40" strokeWidth="1" />

            {/* Oil regions */}
            {OIL_REGIONS.map(region => {
              const { x, y } = latLngToXY(region.lat, region.lng, 800, 400)
              const isSelected = selectedRegion === region.name
              return (
                <g key={region.name} onClick={() => setSelectedRegion(isSelected ? null : region.name)} className="cursor-pointer">
                  <circle cx={x} cy={y} r={region.radius * 6} fill={region.color} opacity={isSelected ? 0.2 : 0.08} stroke={region.color} strokeWidth="0.8" strokeDasharray={isSelected ? 'none' : '4,4'} />
                  <circle cx={x} cy={y} r="4" fill={region.color} opacity="0.9">
                    <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="1.5" fill="white" opacity="0.8" />
                  <text x={x} y={y - region.radius * 6 - 6} fill={region.color} fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight="bold">{region.name}</text>
                  <text x={x} y={y - region.radius * 6 + 4} fill={region.color} fontSize="6" textAnchor="middle" fontFamily="IBM Plex Mono" opacity="0.7">{region.risk}</text>
                </g>
              )
            })}

            {/* Trade routes (dashed lines) */}
            <path d="M440,116 Q480,150 660,110" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.4" />
            <path d="M440,116 Q500,160 620,100" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.3" />
            <path d="M440,116 Q380,140 360,160" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.3" />
          </svg>

          {/* Fire hotspots overlaid */}
          {fires?.hotspots?.map(f => {
            const { x, y } = latLngToXY(f.lat, f.lng, 100, 100)
            const size = Math.max(2, Math.min(5, f.frp / 8))
            const color = f.brightness > 400 ? '#EF4444' : f.brightness > 300 ? '#F59E0B' : '#F97316'
            return (
              <div key={f.id} className="absolute rounded-full animate-pulse" style={{
                left: `${x}%`, top: `${y}%`, width: size, height: size,
                backgroundColor: color, boxShadow: `0 0 ${size * 2}px ${color}`,
                transform: 'translate(-50%, -50%)',
              }} title={f.title || `${f.satellite} | ${f.date}`} />
            )
          })}
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
            <div className="w-3 h-px bg-amber/50 border-dashed" style={{ borderBottom: '1px dashed #F59E0B' }} />
            <span className="text-[10px] text-muted font-mono">TRADE ROUTE</span>
          </div>
        </div>
      </div>

      {/* Oil Activity News */}
      {oilActivity?.recentEvents && oilActivity.recentEvents.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-muted tracking-wider uppercase">OIL REGION UPDATES</span>
          <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
            {oilActivity.recentEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1 rounded bg-white/[0.015] hover:bg-white/[0.03]">
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
