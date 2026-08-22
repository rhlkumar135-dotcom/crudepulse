import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { WORLD_MAP_PATHS, OIL_REGIONS, CHOKEPOINTS, TRADE_FLOWS, FLOW_COLORS, latLngToSvg, flowPath } from '@/lib/world-map-paths'

export function GlobalPage() {
  const [selectedFlow, setSelectedFlow] = useState<number | null>(null)
  const [selectedChoke, setSelectedChoke] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Global Trade Flows</h2>
        <span className="live-dot" />
      </div>

      <div className="glass-card p-4 rounded-lg">
        <svg viewBox="0 0 960 500" className="w-full" style={{ background: '#080B10' }}>
          <defs>
            <radialGradient id="og"><stop offset="0%" stopColor="#0D1117" /><stop offset="100%" stopColor="#080B10" /></radialGradient>
            <filter id="gl"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect width={960} height={500} fill="url(#og)" />
          {[0,60,120,180,240,300,360,420,480].map(y => <line key={y} x1={0} y1={y} x2={960} y2={y} stroke="#1E3048" strokeWidth={0.3} opacity={0.2} />)}
          {[0,120,240,360,480,600,720,840,960].map(x => <line key={x} x1={x} y1={0} x2={x} y2={500} stroke="#1E3048" strokeWidth={0.3} opacity={0.2} />)}
          {WORLD_MAP_PATHS.map((lm) => (
            <path key={lm.label} d={lm.d} fill={lm.label === 'Middle East' ? '#1A2520' : '#141E2C'} stroke="#1E3048" strokeWidth={0.5} opacity={0.85} />
          ))}
          {TRADE_FLOWS.map((f, i) => {
            const [fx, fy] = latLngToSvg(f.fromLat, f.fromLng)
            const [tx, ty] = latLngToSvg(f.toLat, f.toLng)
            const fp = flowPath(fx, fy, tx, ty)
            const sel = selectedFlow === i
            return (
              <g key={i} onClick={() => setSelectedFlow(sel ? null : i)} className="cursor-pointer">
                <path d={fp} fill="none" stroke={f.color} strokeWidth={sel ? 3 : 1.5} opacity={sel ? 1 : 0.5} strokeDasharray={sel ? 'none' : '4,3'} />
                {sel && <circle r={4} fill={f.color} filter="url(#gl)"><animateMotion dur="3s" repeatCount="indefinite" path={fp} /></circle>}
              </g>
            )
          })}
          {OIL_REGIONS.map((r, i) => {
            const [x, y] = latLngToSvg(r.lat, r.lng)
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={10} fill={r.color} opacity={0.15} />
                <circle cx={x} cy={y} r={3} fill={r.color} filter="url(#gl)" />
                <text x={x + 6} y={y + 3} fill="#CBD5E1" fontSize={6} fontFamily="IBM Plex Mono">{r.name}</text>
              </g>
            )
          })}
          {CHOKEPOINTS.map((cp, i) => {
            const [x, y] = latLngToSvg(cp.lat, cp.lng)
            return (
              <g key={i} onClick={() => setSelectedChoke(selectedChoke === i ? null : i)} className="cursor-pointer">
                <circle cx={x} cy={y} r={8} fill="none" stroke="#EF4444" strokeWidth={1} opacity={0.4}>
                  <animate attributeName="r" values="4;10;4" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={y} r={3} fill="#EF4444" />
                <text x={x + 5} y={y - 5} fill="#EF4444" fontSize={5} fontFamily="IBM Plex Mono">{cp.name}</text>
              </g>
            )
          })}
        </svg>

        {selectedFlow !== null && (() => {
          const f = TRADE_FLOWS[selectedFlow]
          return (
            <div className="mt-3 p-3 bg-black/40 rounded border border-white/10 text-[10px]">
              <p className="text-white font-mono">{f.from} → {f.to}</p>
              <p className="text-gray-400 mt-1">Volume: {f.volume}M bbl/d</p>
            </div>
          )
        })()}

        {selectedChoke !== null && (() => {
          const cp = CHOKEPOINTS[selectedChoke]
          return (
            <div className="mt-3 p-3 bg-black/40 rounded border border-red-500/20 text-[10px]">
              <p className="text-red-400 font-mono">{cp.name}</p>
              <p className="text-gray-400 mt-1">Throughput: {cp.bpd}</p>
            </div>
          )
        })()}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(FLOW_COLORS).map(([color, region]) => (
          <div key={color} className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />{region}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[9px] text-gray-400"><div className="w-2 h-2 rounded-full bg-red-500" />Chokepoints</div>
      </div>
    </div>
  )
}
