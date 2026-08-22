import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'

const CHOKEPOINTS = [
  { id: 'hormuz', name: 'Strait of Hormuz', lat: 26.5, lng: 56.3, bpd: 21, risk: 0.82 },
  { id: 'suez', name: 'Suez Canal', lat: 30.58, lng: 32.34, bpd: 9, risk: 0.71 },
  { id: 'bab', name: 'Bab el-Mandeb', lat: 12.58, lng: 43.33, bpd: 8.5, risk: 0.78 },
  { id: 'malacca', name: 'Malacca', lat: 2.5, lng: 101.5, bpd: 16, risk: 0.35 },
  { id: 'panama', name: 'Panama Canal', lat: 9.1, lng: -79.7, bpd: 1, risk: 0.45 },
]

const FLOWS = [
  { from: [24.7, 46.7], to: [31.2, 121.5], vol: 1750, label: 'Saudi → China' },
  { from: [55.7, 37.6], to: [39.9, 116.4], vol: 1300, label: 'Russia → China' },
  { from: [24.7, 46.7], to: [19.1, 72.9], vol: 980, label: 'Saudi → India' },
  { from: [33.3, 44.4], to: [31.2, 121.5], vol: 850, label: 'Iraq → China' },
  { from: [24.5, 54.7], to: [35.7, 139.7], vol: 720, label: 'UAE → Japan' },
  { from: [29.4, 47.9], to: [37.6, 127.0], vol: 580, label: 'Kuwait → S.Korea' },
  { from: [55.7, 37.6], to: [50.8, 4.4], vol: 1100, label: 'Russia → Europe' },
  { from: [53.5, -113.5], to: [29.8, -95.4], vol: 3200, label: 'Canada → US' },
]

function latLngToSvg(lat: number, lng: number, w = 900, h = 450) {
  const x = ((lng + 180) / 360) * w
  const y = ((90 - lat) / 180) * h
  return { x, y }
}

export function GlobalPage() {
  const [flows, setFlows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/market/flows').then(r => r.json()).then(d => { setFlows(d.routes || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Globe size={24} className="text-yellow-500" />
        <h1 className="text-2xl font-bold text-text-bright">Global Trade Flows</h1>
      </div>

      <div className="glass-card p-4 overflow-hidden" style={{ height: 500 }}>
        <svg viewBox="0 0 900 450" className="w-full h-full">
          <rect width="900" height="450" fill="#0A0E14" />
          <defs>
            <radialGradient id="ocean" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F1923" />
              <stop offset="100%" stopColor="#060A10" />
            </radialGradient>
          </defs>
          <rect width="900" height="450" fill="url(#ocean)" />

          {FLOWS.map((f, i) => {
            const s = latLngToSvg(f.from[0], f.from[1])
            const e = latLngToSvg(f.to[0], f.to[1])
            const mx = (s.x + e.x) / 2
            const my = (s.y + e.y) / 2 - 20
            const opacity = 0.3 + (f.vol / 3200) * 0.5
            return (
              <g key={i}>
                <path d={`M${s.x},${s.y} Q${mx},${my} ${e.x},${e.y}`} fill="none" stroke="#F5A623" strokeWidth={1 + f.vol / 800} opacity={opacity} />
                <circle cx={s.x} cy={s.y} r={3} fill="#22c55e" opacity={0.8} />
                <circle cx={e.x} cy={e.y} r={3} fill="#06b6d4" opacity={0.8} />
              </g>
            )
          })}

          {CHOKEPOINTS.map(cp => {
            const pos = latLngToSvg(cp.lat, cp.lng)
            const r = 4 + cp.risk * 6
            return (
              <g key={cp.id}>
                <circle cx={pos.x} cy={pos.y} r={r + 4} fill="none" stroke={cp.risk > 0.7 ? '#ef4444' : '#F5A623'} strokeWidth={1} opacity={0.4} />
                <circle cx={pos.x} cy={pos.y} r={r} fill={cp.risk > 0.7 ? '#ef4444' : '#F5A623'} opacity={0.7} />
                <text x={pos.x} y={pos.y - r - 6} textAnchor="middle" fill="#8892A0" fontSize={7} fontFamily="IBM Plex Mono, monospace">{cp.name}</text>
                <text x={pos.x} y={pos.y + r + 10} textAnchor="middle" fill="#5A6675" fontSize={6} fontFamily="IBM Plex Mono, monospace">{cp.bpd}M bpd</text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FLOWS.map((f, i) => (
          <div key={i} className="glass-card p-3">
            <div className="text-[10px] font-mono text-amber">{f.label}</div>
            <div className="text-lg font-bold text-text-bright">{(f.vol / 1000).toFixed(1)}M bbl/d</div>
          </div>
        ))}
      </div>
    </div>
  )
}
