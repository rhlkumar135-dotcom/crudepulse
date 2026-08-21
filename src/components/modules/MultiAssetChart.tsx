import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AssetSeries {
  symbol: string
  label: string
  type: string
  color: string
  current: number
  history: Array<{ date: string; value: number }>
}

interface MultiAssetResponse {
  series: AssetSeries[]
  source: string
  lastUpdated: string
}

export default function MultiAssetChart() {
  const [data, setData] = useState<MultiAssetResponse | null>(null)
  const [normalize, setNormalize] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['crypto', 'metal', 'oil', 'index']))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch('/api/market/multi-asset')
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        if (alive) { setData(json); setError(null) }
      } catch (e) { if (alive) setError(String(e)) }
    }
    load()
    const iv = setInterval(load, 1_000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  const chartData = useMemo(() => {
    if (!data?.series) return []
    const activeSeries = data.series.filter(s => selectedTypes.has(s.type) && s.history.length > 0)
    if (activeSeries.length === 0) return []

    const dateSet = new Set<string>()
    for (const s of activeSeries) for (const h of s.history) dateSet.add(h.date)
    const dates = Array.from(dateSet).sort()

    return dates.map(date => {
      const point: Record<string, string | number | null> = { date }
      for (const s of activeSeries) {
        const match = s.history.find(h => h.date === date)
        if (normalize) {
          const base = s.history[0]?.value || 1
          point[s.label] = match ? +((match.value / base - 1) * 100).toFixed(2) : 0
        } else {
          point[s.label] = match?.value ?? 0
        }
      }
      return point
    })
  }, [data, normalize, selectedTypes])

  const activeSeries = data?.series.filter(s => selectedTypes.has(s.type)) || []

  function toggleType(type: string) {
    setSelectedTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const typeButtons = [
    { key: 'crypto', label: 'Crypto', color: '#F7931A' },
    { key: 'metal', label: 'Metals', color: '#FFD700' },
    { key: 'oil', label: 'Oil', color: '#2DD4BF' },
    { key: 'index', label: 'Indices', color: '#8B5CF6' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-cyan" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan">Multi-Asset Comparison</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-muted">Source: CoinGecko + Yahoo Finance</span>
        </div>
      </div>

      {error && (
        <div className="text-[9px] text-amber font-mono bg-amber/10 rounded px-2 py-1 mb-2">
          ⚠ {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {typeButtons.map(tb => (
          <button
            key={tb.key}
            onClick={() => toggleType(tb.key)}
            className={`text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
              selectedTypes.has(tb.key)
                ? 'border-current text-white'
                : 'border-border text-muted hover:text-white'
            }`}
            style={selectedTypes.has(tb.key) ? { borderColor: tb.color, color: tb.color } : {}}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: tb.color }} />
            {tb.label}
          </button>
        ))}
        <button
          onClick={() => setNormalize(!normalize)}
          className="text-[8px] font-mono px-2 py-0.5 rounded border border-border text-muted hover:text-white ml-auto"
        >
          {normalize ? '% Change' : 'Absolute'}
        </button>
      </div>

      <div className="flex gap-3 mb-2 flex-wrap">
        {activeSeries.map(s => {
          const hist = s.history
          const current = s.current
          const prev = hist.length > 1 ? hist[hist.length - 2]?.value : current
          const pct = prev ? ((current - prev) / prev * 100) : 0
          return (
            <div key={s.symbol} className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[9px] font-mono text-white">{s.label}</span>
              <span className="text-[9px] font-mono text-muted">${current >= 1000 ? current.toLocaleString(undefined, { maximumFractionDigits: 0 }) : current.toFixed(2)}</span>
              <span className={`text-[8px] font-mono ${pct >= 0 ? 'text-teal' : 'text-red'}`}>
                {pct >= 0 ? <TrendingUp size={8} className="inline" /> : <TrendingDown size={8} className="inline" />}
                {' '}{Math.abs(pct).toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex-1 min-h-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#141A22" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono' }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(chartData.length / 6)}
                stroke="#141A22"
              />
              <YAxis
                tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono' }}
                tickLine={false}
                axisLine={false}
                width={45}
                stroke="#141A22"
                tickFormatter={v => normalize ? `${v}%` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip
                contentStyle={{
                  background: '#0A0E14',
                  border: '1px solid #1A2030',
                  borderRadius: 4,
                  fontSize: 9,
                  fontFamily: 'IBM Plex Mono',
                }}
                labelStyle={{ color: '#8892A0' }}
                formatter={(value: number, name: string) => [
                  normalize ? `${value.toFixed(2)}%` : `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                  name,
                ]}
              />
              {activeSeries.map(s => (
                <Line
                  key={s.symbol}
                  type="monotone"
                  dataKey={s.label}
                  stroke={s.color}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted text-[10px] font-mono">
            {data?.series ? 'No overlapping data points for selected assets' : 'Loading...'}
          </div>
        )}
      </div>
    </div>
  )
}
