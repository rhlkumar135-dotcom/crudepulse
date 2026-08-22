import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

interface ZoneEvent { title: string; source: string; timestamp: string; zone: string; severity: string }
interface ZoneData { zone: string; events: ZoneEvent[]; count: number }

const ZONE_COLORS: Record<string, string> = {
  'middle-east': '#F59E0B', 'americas': '#14B8A6', 'africa': '#8B5CF6',
  'asia-pacific': '#3B82F6', 'europe': '#EF4444',
}

export function AnalysisPage() {
  const [correlation, setCorrelation] = useState<{ matrix: Record<string, Record<string, number>>; timestamps: string[] }>({ matrix: {}, timestamps: [] })
  const [zones, setZones] = useState<ZoneData[]>([])
  const [activeZone, setActiveZone] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/market/correlation').then(r => r.json()).catch(() => ({})),
      fetch('/api/market/multi-zone-events').then(r => r.json()).catch(() => ({})),
    ]).then(([corr, zoneData]) => {
      setCorrelation({ matrix: corr.matrix || {}, timestamps: corr.timestamps || [] })
      setZones(zoneData.zones || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white/[0.03] rounded shimmer" />)}</div>

  const assets = Object.keys(correlation.matrix)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Analysis Engine</h2>
      </div>

      {assets.length > 0 && (
        <div className="glass-card p-4 rounded-lg">
          <h3 className="text-xs font-mono text-gray-400 mb-3">CORRELATION MATRIX (7D)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr>
                  <th className="text-left p-1 text-gray-500"></th>
                  {assets.map(a => <th key={a} className="p-1 text-gray-500 text-center">{a}</th>)}
                </tr>
              </thead>
              <tbody>
                {assets.map(row => (
                  <tr key={row}>
                    <td className="p-1 text-gray-400 font-mono">{row}</td>
                    {assets.map(col => {
                      const v = correlation.matrix[row]?.[col] ?? 0
                      const bg = v > 0.5 ? 'bg-emerald-500/20' : v < -0.5 ? 'bg-red-500/20' : 'bg-white/[0.02]'
                      return <td key={col} className={`p-1 text-center font-mono ${bg}`}>{typeof v === 'number' ? v.toFixed(2) : '—'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-gray-400">MULTI-ZONE EVENTS (LATEST 10)</h3>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setActiveZone('all')} className={`text-[9px] px-2 py-0.5 rounded ${activeZone === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>ALL</button>
            {Object.keys(ZONE_COLORS).map(z => (
              <button key={z} onClick={() => setActiveZone(z)} className={`text-[9px] px-2 py-0.5 rounded capitalize ${activeZone === z ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{z.replace('-', ' ')}</button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {zones.filter(z => activeZone === 'all' || z.zone === activeZone).map(z => (
            <div key={z.zone}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: ZONE_COLORS[z.zone] || '#666' }} />
                <span className="text-xs font-mono text-white capitalize">{z.zone.replace('-', ' ')}</span>
                <span className="text-[9px] text-gray-500">({z.count} events)</span>
              </div>
              <div className="space-y-1 ml-4">
                {z.events.slice(0, 10).map((e, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded hover:bg-white/[0.02]">
                    <div className={`w-1.5 h-1.5 rounded-full ${e.severity === 'high' ? 'bg-red-400' : e.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="text-[10px] text-gray-300 truncate flex-1">{e.title}</span>
                    <span className="text-[9px] text-gray-600">{e.source}</span>
                  </div>
                ))}
                {z.events.length === 0 && <p className="text-[9px] text-gray-600 ml-2">No events in 24h</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
