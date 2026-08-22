import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Shield, AlertCircle } from 'lucide-react'

interface HistoryPoint {
  date: string
  stocks: number
}

interface CountryReserve {
  name: string
  reserves: number
  capacity: number
}

interface SPRResponse {
  usHistory: HistoryPoint[]
  countries: CountryReserve[]
}

export function SPRPage() {
  const [data, setData] = useState<SPRResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/spr')
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Failed to load')
        setData(body)
      } catch (e: any) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [])

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-white/[0.03] animate-pulse" />
        <div className="h-72 rounded-xl bg-white/[0.03] animate-pulse" />
        <div className="h-72 rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle size={16} className="text-red shrink-0" />
          <span className="text-sm font-mono text-red">{error}</span>
        </div>
      </div>
    )
  }

  const usHistory = data?.usHistory ?? []
  const countries = data?.countries ?? []

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield size={20} className="text-cyan" />
          Strategic Petroleum Reserve
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-cyan to-transparent mt-1" />
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-zinc-400">US SPR History (Million Barrels)</CardTitle>
        </CardHeader>
        <CardContent>
          {usHistory.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-zinc-500">
              No historical SPR data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'IBM Plex Mono, monospace' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'IBM Plex Mono, monospace' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
                />
                <Line
                  type="monotone"
                  dataKey="stocks"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#06b6d4' }}
                  name="Stocks (Mb)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {countries.length > 0 && (
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-zinc-400">
              International Strategic Reserves Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(250, countries.length * 40)}>
              <BarChart data={countries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'IBM Plex Mono, monospace' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'IBM Plex Mono, monospace' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
                />
                <Bar dataKey="reserves" fill="#06b6d4" name="Reserves (Mb)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="capacity" fill="rgba(6,182,212,0.2)" name="Capacity (Mb)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
