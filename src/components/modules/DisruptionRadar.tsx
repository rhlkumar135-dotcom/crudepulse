import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react'
import { useMarketData } from '@/lib/useMarketData'

interface GeoEvent { id: string; title: string; location: string; severity: number; sentiment: string | number; score: number; source: string; time: string; category: string; rawDate?: string }

function sentimentToNum(s: string | number): number {
  if (typeof s === 'number') return s
  const map: Record<string, number> = { positive: 1, negative: -1, neutral: 0 }
  return map[String(s).toLowerCase()] ?? 0
}

const categoryColors: Record<string, string> = {
  Attack: '#EF4444', Military: '#F97316', Sanctions: '#A78BFA',
  Refinery: '#F59E0B', OPEC: '#3B82F6', Infrastructure: '#F472B6',
  Supply: '#2DD4BF', Weather: '#38BDF8', Production: '#22C55E', Shipping: '#6366F1',
}

function buildHourlyFromEvents(events: GeoEvent[]) {
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, volume: 0 }))

  for (const e of events) {
    if (e.rawDate) {
      const d = new Date(e.rawDate)
      if (!isNaN(d.getTime())) {
        const h = d.getHours()
        hours[h].volume++
      }
    }
  }

  // If all zeros (no rawDate), just show zeros — no fake data
  return hours
}

export function DisruptionRadar() {
  const { data } = useMarketData<{ events: GeoEvent[] }>('/api/market/disruptions', 'free', 30000)
  const geoEvents = data?.events || []
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const regionData = useMemo(() => buildRegionData(geoEvents), [geoEvents])
  const hourlyVolume = useMemo(() => buildHourlyFromEvents(geoEvents), [geoEvents])
  const spikeThreshold = useMemo(() => Math.max(...hourlyVolume.map(h => h.volume), 1) * 1.5, [hourlyVolume])

  const totalEvents = geoEvents.length
  const highSeverity = geoEvents.filter((e: GeoEvent) => e.severity >= 0.7).length
  const avgTone = totalEvents > 0 ? +(geoEvents.reduce((s: number, e: GeoEvent) => s + sentimentToNum(e.sentiment), 0) / totalEvents).toFixed(2) : 0

  const filteredEvents = selectedCategory
    ? geoEvents.filter((e: GeoEvent) => e.category === selectedCategory)
    : geoEvents
  const sorted = [...filteredEvents].sort((a: GeoEvent, b: GeoEvent) => {
    // Sort by recency first (newest first), then by severity
    if (a.rawDate && b.rawDate) return b.rawDate.localeCompare(a.rawDate)
    return b.severity - a.severity
  })

  const newestEvent = geoEvents[0]
  const newestTime = newestEvent?.time || ''

  return (
    <div className="space-y-3">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="TOTAL EVENTS" value={String(totalEvents)} sub="last 7d" color="text-text" />
        <StatCard label="HIGH SEVERITY" value={String(highSeverity)} sub="≥ 7.0/10" color="text-red" />
        <StatCard label="AVG TONE" value={avgTone > 0 ? `+${avgTone}` : String(avgTone)} sub="GDELT" color={avgTone >= 0 ? 'text-teal' : 'text-red'} />
        <StatCard label="ACTIVE REGIONS" value={String(regionData.length)} sub="categories" color="text-amber" />
      </div>

      {/* Live indicator */}
      {newestTime && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-teal/[0.06] border border-teal/10 rounded-lg">
          <Clock size={10} className="text-teal/60" />
          <span className="text-[8px] font-mono text-teal/60 tracking-wider">LATEST EVENT</span>
          <span className="text-[9px] font-mono text-teal font-medium">{newestTime}</span>
        </div>
      )}

      {/* Real-time hourly volume bar chart */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-mono text-muted tracking-wider">24H EVENT VOLUME</span>
          <span className="text-[8px] font-mono text-teal bg-teal/10 px-1 py-0.5 rounded border border-teal/15">⚡ LIVE FROM EVENTS</span>
        </div>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyVolume} margin={{ left: -10, right: 0 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 7 }} tickLine={false} axisLine={false} width={20} />
              <Tooltip
                contentStyle={{ background: '#121826', border: '1px solid #1E293B', borderRadius: 8, fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                labelStyle={{ color: '#94A3B8' }}
              />
              <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                {hourlyVolume.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.volume >= spikeThreshold ? '#EF4444' : '#2DD4BF'}
                    opacity={entry.volume >= spikeThreshold ? 0.9 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Region ranking by event volume */}
      <div>
        <span className="text-[9px] font-mono text-muted tracking-wider">REGIONS RANKED BY 24H VOLUME</span>
        <div className="mt-1.5 space-y-1">
          {regionData.map(region => {
            const color = categoryColors[region.region] || '#94A3B8'
            const maxCount = regionData[0]?.count || 1
            const barWidth = (region.count / maxCount) * 100
            const isSelected = selectedCategory === region.region

            return (
              <div
                key={region.region}
                onClick={() => setSelectedCategory(isSelected ? null : region.region)}
                className={`flex items-center gap-3 py-1.5 px-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-medium w-[90px] shrink-0">{region.region}</span>
                <div className="flex-1 h-[6px] rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, backgroundColor: color, opacity: 0.6 }} />
                </div>
                <span className="text-[10px] font-mono font-semibold w-6 text-right" style={{ color }}>{region.count}</span>
                {region.isSpike && (
                  <span className="text-[8px] font-mono font-bold text-red bg-red/10 px-1 py-0.5 rounded border border-red/20 flex items-center gap-0.5">
                    <AlertTriangle size={8} /> SPIKE
                  </span>
                )}
                <span className="text-[8px] font-mono text-muted w-[32px] text-right">
                  {region.avgSeverity >= 0.7 ? '▲' : region.avgSeverity >= 0.4 ? '—' : '▼'}
                  {(region.avgSeverity * 10).toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event list — sorted by recency (newest first) */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-mono text-muted tracking-wider">EVENT FEED</span>
          <span className="text-[8px] font-mono text-muted">({sorted.length} events)</span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[8px] font-mono text-amber hover:underline ml-1"
            >
              clear filter ×
            </button>
          )}
        </div>
        <div className="space-y-0.5 max-h-[180px] overflow-y-auto pr-1">
          {sorted.map(event => {
            const color = categoryColors[event.category] || '#94A3B8'
            const sentimentVal = sentimentToNum(event.sentiment)
            const sentimentIcon = sentimentVal > 0 ? <TrendingUp size={8} className="text-teal" /> : sentimentVal < 0 ? <TrendingDown size={8} className="text-red" /> : <Minus size={8} className="text-muted" />

            return (
              <div key={event.id} className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-white/[0.02] transition-colors">
                <div className="relative mt-1 shrink-0">
                  <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
                  {event.severity >= 0.7 && (
                    <div className="absolute -inset-1 rounded-full animate-ping opacity-20" style={{ backgroundColor: color }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] leading-snug line-clamp-1">{event.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px] text-muted font-mono">{event.location}</span>
                    <span className="text-[7px] text-border">·</span>
                    <span className="text-[8px] text-teal/70 font-mono font-medium">{event.time}</span>
                    <span className="text-[8px] font-mono px-1 py-0.5 rounded" style={{ color, backgroundColor: color + '15' }}>
                      {event.category}
                    </span>
                    <div className="flex-1" />
                    {sentimentIcon}
                    <span className={`text-[8px] font-mono ${sentimentVal >= 0 ? 'text-teal' : 'text-red'}`}>
                      {sentimentVal > 0 ? '+' : ''}{sentimentVal.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function buildRegionData(events: GeoEvent[]) {
  const regionMap = new Map<string, { count: number; avgSeverity: number; totalSeverity: number; events: GeoEvent[] }>()

  for (const e of events) {
    const region = e.category
    if (!regionMap.has(region)) regionMap.set(region, { count: 0, avgSeverity: 0, totalSeverity: 0, events: [] })
    const r = regionMap.get(region)!
    r.count++
    r.totalSeverity += e.severity
    r.events.push(e)
  }

  const result = Array.from(regionMap.entries()).map(([region, data]) => ({
    region,
    count: data.count,
    avgSeverity: +(data.totalSeverity / data.count).toFixed(2),
    events: data.events,
    isSpike: data.count > (events.length / regionMap.size) * 1.5,
  }))

  return result.sort((a, b) => b.count - a.count)
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
      <div className="text-[8px] text-muted font-mono tracking-wider">{label}</div>
      <div className={`text-base font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[8px] text-muted font-mono">{sub}</div>
    </div>
  )
}
