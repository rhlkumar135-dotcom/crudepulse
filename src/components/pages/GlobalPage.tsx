import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { WORLD_MAP_PATHS, OIL_REGIONS, CHOKEPOINTS, TRADE_FLOWS, FLOW_COLORS, latLngToSvg, flowPath } from '@/lib/world-map-paths'

export function GlobalPage() {
  const [flows, setFlows] = useState<any[]>([])
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
  const [selectedChoke, setSelectedChoke] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/market/flows').then(r => r.json()).then(d => {
      setFlows(d.flows || TRADE_FLOWS)
      setLoading(false)
    }).catch(() => { setFlows(TRADE_FLOWS); setLoading(false) })
  }, [])

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
            <radialGradient id="oceanGrad"><stop offset="0%" stopColor="#0D1117" /><stop offset="100%" stopColor="#080B10" /></radialGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect width={960} height={500} fill="url(#oceanGrad)" />
          {[0,60,120,180,240,300,360,420,480].map(y => <line key={y} x1={0} y1={y} x2={960} y2={y} stroke="#1E3048" strokeWidth={0.3} opacity={0.2} />)}
          {[0,120,240,360,480,600,720,840,960].map(x => <line key={x} x1={x} y1={0} x2={x} y2={500} stroke="#1E3048" strokeWidth={0.3} opacity={0.2} />)}
          {WORLD_MAP_PATHS.map((landmass) => {
            const fill = landmass.label === 'Middle East' ? '#1A2520' : '#141E2C'
            return <path key={landmass.label} d={landmass.d} fill={fill} stroke="#1E3048" strokeWidth={0.5} opacity={0.85} />
          })}
          {TRADE_FLOWS.map((f, i) => {
            const [fx, fy] = latLngToSvg(f.from.lat, f.from.lng)
            const [tx, ty] = latLngToSvg(f.to.lat, f.to.lng)
            const fp = flowPath(fx, fy, tx, ty)
            const isSelected = selectedFlow === f.name
            return (
              <g key={i} onClick={() => setSelectedFlow(isSelected ? null : f.name)} className="cursor-pointer">
                <path d={fp} fill="none" stroke={FLOW_COLORS[f.region] || '#666'} strokeWidth={isSelected ? 3 : 1.5} opacity={isSelected ? 1 : 0.5} strokeDasharray={isSelected ? 'none' : '4,3'} />
                {isSelected && <circle r={4} fill={FLOW_COLORS[f.region] || '#666'} filter="url(#glow)"><animateMotion dur="3s" repeatCount="indefinite" path={fp} /></circle>}
              </g>
            )
          })}
          {OIL_REGIONS.map((r, i) => {
            const [x, y] = latLngToSvg(r.lat, r.lng)
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={r.radius * 0.8} fill={r.threat === 'elevated' ? '#F59E0B' : r.threat === 'watch' ? '#3B82F6' : '#22C55E'} opacity={0.15} />
                <circle cx={x} cy={y} r={3} fill={r.threat === 'elevated' ? '#F59E0B' : r.threat === 'watch' ? '#3B82F6' : '#22C55E'} filter="url(#glow)" />
                <text x={x + 6} y={y + 3} fill="#CBD5E1" fontSize={6} fontFamily="IBM Plex Mono">{r.name}</text>
              </g>
            )
          })}
          {CHOKEPOINTS.map((c, i) => {
            const [x, y] = latLngToSvg(c.lat, c.lng)
            return (
              <g key={i} onClick={() => setSelectedChoke(selectedChoke?.name === c.name ? null : c)} className="cursor-pointer">
                <circle cx={x} cy={y} r={8} fill="none" stroke="#EF4444" strokeWidth={1} opacity={0.4}>
                  <animate attributeName="r" values="4;10;4" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={y} r={3} fill="#EF4444" />
                <text x={x + 5} y={y - 5} fill="#EF4444" fontSize={5} fontFamily="IBM Plex Mono">{c.name}</text>
              </g>
            )
          })}
        </svg>

        {selectedFlow && (() => {
          const f = TRADE_FLOWS.find(fl => fl.name === selectedFlow)
          if (!f) return null
          return (
            <div className="mt-3 p-3 bg-black/40 rounded border border-white/10 text-[10px]">
              <p className="text-white font-mono">{f.name}</p>
              <p className="text-gray-400 mt-1">Volume: {f.volume}</p>
              <p className="text-gray-400">Region: {f.region}</p>
            </div>
          )
        })()}

        {selectedChoke && (
          <div className="mt-3 p-3 bg-black/40 rounded border border-red-500/20 text-[10px]">
            <p className="text-red-400 font-mono">{selectedChoke.name}</p>
            <p className="text-gray-400 mt-1">Throughput: {selectedChoke.throughput}</p>
            <p className="text-gray-400">Risk: {selectedChoke.risk}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(FLOW_COLORS).map(([region, color]) => (
          <div key={region} className="flex items-center gap-1.5 text-[9px] text-gray-400 capitalize">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />{region.replace('-', ' ')}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[9px] text-gray-400"><div className="w-2 h-2 rounded-full bg-red-500" />Chokepoints</div>
      </div>
    </div>
  )
}
