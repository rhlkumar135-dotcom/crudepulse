import { useState, useEffect } from 'react'
import { Flame, Radio, ExternalLink } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

interface Event { title: string; source: string; url: string; timestamp: string; score?: number }

export function DisruptionsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [history, setHistory] = useState<{ time: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      const r = await fetch('/api/market/disruptions')
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      setEvents(d.events || [])
      const now = new Date()
      const hourly: Record<string, number> = {}
      for (let i = 23; i >= 0; i--) {
        const h = new Date(now.getTime() - i * 3600000)
        hourly[h.getHours().toString().padStart(2, '0') + ':00'] = 0
      }
      for (const e of d.events || []) {
        const h = new Date(e.timestamp).getHours().toString().padStart(2, '0') + ':00'
        if (h in hourly) hourly[h]++
      }
      setHistory(Object.entries(hourly).map(([time, count]) => ({ time, count })))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i) }, [])

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded shimmer" />)}</div>
  if (error) return <div className="p-6 text-red-400 text-sm">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Disruption Tracker</h2>
        <span className="live-dot ml-2" />
      </div>

      <div className="glass-card p-4 rounded-lg">
        <h3 className="text-xs font-mono text-gray-400 mb-3">24H EVENT VOLUME</h3>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2030" />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#6B7A90' }} />
            <YAxis tick={{ fontSize: 9, fill: '#6B7A90' }} />
            <Tooltip contentStyle={{ background: '#0F1318', border: '1px solid #1A2030', borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="count" stroke="#EF4444" fill="url(#redGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {events.map((e, i) => (
          <div key={i} className="glass-card p-3 rounded-lg flex items-start gap-3 hover:border-red-500/20 transition-colors">
            <Radio className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{e.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-gray-500">{e.source}</span>
                <span className="text-[9px] text-gray-600">·</span>
                <span className="text-[9px] text-gray-500">{new Date(e.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              <ExternalLink className="w-3 h-3 text-gray-600 hover:text-gray-400" />
            </a>
          </div>
        ))}
        {events.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No disruption events detected</p>}
      </div>
    </div>
  )
}
