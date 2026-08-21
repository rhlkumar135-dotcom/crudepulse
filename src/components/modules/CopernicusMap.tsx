import { useState, useEffect } from 'react'
import { Satellite, Flame, Thermometer, AlertTriangle } from 'lucide-react'

interface FireHotspot {
  id: string
  lat: number
  lng: number
  brightness: number
  confidence: string
  date: string
  satellite: string
  frp: number
  dayNight: string
}

interface SatelliteResponse {
  fires: {
    total: number
    industrial: number
    wildfire: number
    unknown: number
    hotspots: FireHotspot[]
    region: string
  }
  sst: { region: string; anomaly: number; unit: string }
  sources: Array<{ name: string; url: string; description: string; latency: string }>
  lastUpdated: string
}

function latLngToXY(lat: number, lng: number, w: number, h: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * w
  const y = ((90 - lat) / 180) * h
  return { x, y }
}

export default function CopernicusMap() {
  const [data, setData] = useState<SatelliteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Satellite size={12} className="text-purple" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple">Copernicus / Satellite Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted">NASA EONET + NOAA</span>
        </div>
      </div>

      {error && (
        <div className="text-[11px] text-amber font-mono bg-amber/10 rounded px-2 py-1 mb-2">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card rounded-lg p-2 border border-border">
          <div className="flex items-center gap-1 mb-1">
            <Flame size={10} className="text-orange" />
            <span className="text-[10px] font-mono text-muted uppercase">Active Fires</span>
          </div>
          <div className="text-[14px] font-mono text-orange font-bold">{fires?.total ?? 0}</div>
          <div className="text-[10px] font-mono text-muted">
            {fires?.wildfire ?? 0} wildfire / {fires?.industrial ?? 0} industrial
          </div>
        </div>
        <div className="bg-card rounded-lg p-2 border border-border">
          <div className="flex items-center gap-1 mb-1">
            <Thermometer size={10} className="text-cyan" />
            <span className="text-[10px] font-mono text-muted uppercase">SST Anomaly</span>
          </div>
          <div className={`text-[14px] font-mono font-bold ${(sst?.anomaly ?? 0) >= 0 ? 'text-red' : 'text-cyan'}`}>
            {sst?.anomaly ? `${sst.anomaly > 0 ? '+' : ''}${sst.anomaly}${sst.unit}` : 'N/A'}
          </div>
          <div className="text-[10px] font-mono text-muted">{sst?.region ?? 'Global'}</div>
        </div>
        <div className="bg-card rounded-lg p-2 border border-border">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle size={10} className="text-amber" />
            <span className="text-[10px] font-mono text-muted uppercase">Risk Level</span>
          </div>
          <div className="text-[14px] font-mono text-amber font-bold">
            {(fires?.total ?? 0) > 50 ? 'ELEVATED' : (fires?.total ?? 0) > 10 ? 'MODERATE' : 'LOW'}
          </div>
          <div className="text-[10px] font-mono text-muted">Based on fire density</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative bg-card rounded-lg border border-border overflow-hidden mb-2">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-light/30 to-navy-light/60">
          {/* Simple world map outline using a grid */}
          <svg viewBox="0 0 400 200" className="w-full h-full opacity-30">
            <line x1="0" y1="100" x2="400" y2="100" stroke="#1A2030" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="200" stroke="#1A2030" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="400" y2="50" stroke="#1A2030" strokeWidth="0.3" />
            <line x1="0" y1="150" x2="400" y2="150" stroke="#1A2030" strokeWidth="0.3" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="#1A2030" strokeWidth="0.3" />
            <line x1="300" y1="0" x2="300" y2="200" stroke="#1A2030" strokeWidth="0.3" />
            {/* ME region box */}
            <rect x="180" y="55" width="60" height="40" fill="none" stroke="#8B5CF6" strokeWidth="0.5" strokeDasharray="4,2" opacity="0.5" />
            <text x="210" y="52" fill="#8B5CF6" fontSize="6" textAnchor="middle" fontFamily="IBM Plex Mono">ME Region</text>
          </svg>

          {/* Fire hotspots */}
          {fires?.hotspots?.map(f => {
            const { x, y } = latLngToXY(f.lat, f.lng, 100, 100)
            const size = Math.max(2, Math.min(6, f.frp / 5))
            const color = f.brightness > 400 ? '#EF4444' : f.brightness > 300 ? '#F59E0B' : '#F97316'
            return (
              <div
                key={f.id}
                className="absolute rounded-full animate-pulse"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  backgroundColor: color,
                  boxShadow: `0 0 ${size * 2}px ${color}`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`${f.satellite} | ${f.date} | FRP: ${f.frp}`}
              />
            )
          })}
        </div>
      </div>

      {data?.sources && (
        <div className="flex gap-3 text-[10px] font-mono text-muted">
          {data.sources.map(s => (
            <span key={s.name}>📡 {s.name} ({s.latency})</span>
          ))}
        </div>
      )}
    </div>
  )
}
