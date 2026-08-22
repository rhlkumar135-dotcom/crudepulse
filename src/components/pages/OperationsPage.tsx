import { useState, useEffect } from 'react'
import { Wrench, AlertTriangle, ExternalLink } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface RefineryData { name: string; utilization: number; capacity: number; status: string; region: string }
interface StorageData { product: string; level: number; change: number; region: string }

export function OperationsPage() {
  const [refinery, setRefinery] = useState<RefineryData[]>([])
  const [storage, setStorage] = useState<StorageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/market/refinery').then(r => r.json()).catch(() => ({})),
      fetch('/api/market/storage').then(r => r.json()).catch(() => ({})),
    ]).then(([ref, st]) => {
      setRefinery(ref.refineries || [])
      setStorage(st.products || st.storage || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded shimmer" />)}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Wrench className="w-5 h-5 text-fuchsia-400" />
        <h2 className="text-lg font-semibold text-white">Operations Monitor</h2>
        <span className="live-dot" />
      </div>

      <div className="glass-card p-4 rounded-lg">
        <h3 className="text-xs font-mono text-gray-400 mb-3">REFINERY UTILIZATION</h3>
        {refinery.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={refinery.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2030" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6B7A90' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#6B7A90' }} />
              <Tooltip contentStyle={{ background: '#0F1318', border: '1px solid #1A2030', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="utilization" fill="#F59E0B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">Refinery data loading from EIA...</p>
        )}
      </div>

      <div className="glass-card p-4 rounded-lg">
        <h3 className="text-xs font-mono text-gray-400 mb-3">STORAGE LEVELS</h3>
        {storage.length > 0 ? (
          <div className="space-y-2">
            {storage.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-white/[0.02]">
                <div>
                  <span className="text-xs text-white">{s.product}</span>
                  <span className="text-[9px] text-gray-500 ml-2">{s.region}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-white">{s.level?.toLocaleString()} MBBL</span>
                  <span className={`font-mono text-[10px] ${s.change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {s.change > 0 ? '+' : ''}{s.change?.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">Storage data loading from EIA...</p>
        )}
      </div>

      <div className="glass-card p-4 rounded-lg border-amber-500/10">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono text-amber-400">LIVE STATUS</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 rounded bg-white/[0.02]">
            <p className="text-lg font-mono text-emerald-400">{refinery.length}</p>
            <p className="text-[9px] text-gray-500">REFINERIES TRACKED</p>
          </div>
          <div className="text-center p-2 rounded bg-white/[0.02]">
            <p className="text-lg font-mono text-amber-400">{storage.length}</p>
            <p className="text-[9px] text-gray-500">STORAGE POINTS</p>
          </div>
          <div className="text-center p-2 rounded bg-white/[0.02]">
            <p className="text-lg font-mono text-cyan-400">EIA</p>
            <p className="text-[9px] text-gray-500">PRIMARY SOURCE</p>
          </div>
          <div className="text-center p-2 rounded bg-white/[0.02]">
            <p className="text-lg font-mono text-white">24h</p>
            <p className="text-[9px] text-gray-500">UPDATE CADENCE</p>
          </div>
        </div>
      </div>
    </div>
  )
}
