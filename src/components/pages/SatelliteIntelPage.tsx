import { useState, useEffect } from 'react'
import { Satellite, Flame, Ship, Wind, Droplets, Thermometer, AlertTriangle, CheckCircle2, Radio, MapPin, ChevronDown, ChevronUp, ExternalLink, Eye, Shield, Zap } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'

// ═══ Types ═══════════════════════════════════════════════════════════════════

interface Facility {
  id: string; name: string; country: string; lat: number; lng: number
  type: 'refinery' | 'terminal' | 'field' | 'chokepoint' | 'pipeline_hub'
  satellite: string; satelliteLatency: string; capacity?: string; region: string
  nearbyFires: number; closestFire: { distance: number; brightness: number; frp: number; confidence: string } | null
  threatLevel: 'none' | 'watch' | 'elevated' | 'critical'
  emissionsFlags: number; spillFlags: number
}

interface IntelResponse {
  facilities: Facility[]
  threats: { critical: number; elevated: number; watch: number; totalFiresNearFacilities: number; globalFireCount: number }
  darkVessels: { recentEvents: Array<{ title: string; source: string; time: string; location: string; type: string }>; eventCount: number; sources: Array<{ name: string; latency: string }> }
  emissions: { recentEvents: Array<{ title: string; source: string; time: string; metric: string }>; eventCount: number; metrics: { ch4: number; no2: number; so2: number; flares: number; spills: number }; sources: Array<{ name: string; latency: string }> }
  spills: { recentEvents: Array<{ title: string; source: string; time: string; location: string; severity: string }>; eventCount: number; sources: Array<{ name: string; latency: string }> }
  sst: { global: { temperature: number; anomaly: number; unit: string }; persianGulf: { temperature: number; anomaly: number; unit: string }; sources: Array<{ name: string; latency: string }> }
  satelliteCoverage: Array<{ satellite: string; coverage: string; latency: string; facilities: number; gap: string }>
  dataSources: Array<{ name: string; url: string; latency: string; rank: number; coverage: string; description: string }>
  meta: { facilityCount: number; methodology: string }
  lastUpdated: string; source: string
}

// ═══ Latency Badge ═══════════════════════════════════════════════════════════

function LatencyBadge({ source, latency, compact = false }: { source: string; latency: string; compact?: boolean }) {
  const isFast = latency.includes('min')
  const isMedium = latency.includes('hour') || latency === '~1h'
  const isSlow = latency.includes('day') || latency.includes('week')

  const color = isFast ? '#00ff88' : isMedium ? '#F5A623' : isSlow ? '#94A3B8' : '#00d4ff'
  const rank = isFast ? 'RANK-1' : isMedium ? 'RANK-3' : isSlow ? 'RANK-7+' : 'RANK-5'

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-mono border"
        style={{ color, borderColor: color + '30', backgroundColor: color + '08' }}>
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
        {source} · {latency}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded border"
      style={{ borderColor: color + '20', backgroundColor: color + '05' }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-mono font-medium" style={{ color }}>{source}</span>
        <span className="text-[10px] font-mono text-[#94A3B8] ml-1">· {latency}</span>
      </div>
      <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded"
        style={{ color: color + 'cc', backgroundColor: color + '12' }}>{rank}</span>
    </div>
  )
}

// ═══ Threat Level Badge ═══════════════════════════════════════════════════════

function ThreatBadge({ level }: { level: string }) {
  const config = {
    critical: { color: '#EF4444', icon: AlertTriangle, label: 'CRITICAL' },
    elevated: { color: '#F59E0B', icon: Shield, label: 'ELEVATED' },
    watch: { color: '#00d4ff', icon: Eye, label: 'WATCH' },
    none: { color: '#22C55E', icon: CheckCircle2, label: 'CLEAR' },
  }[level] || { color: '#94A3B8', icon: Eye, label: level.toUpperCase() }

  const Icon = config.icon
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border"
      style={{ color: config.color, borderColor: config.color + '30', backgroundColor: config.color + '10' }}>
      <Icon size={8} />{config.label}
    </span>
  )
}

// ═══ Facility Type Icon ═══════════════════════════════════════════════════════

function FacilityTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    refinery: '🏭', terminal: '⚓', field: '🛢️', chokepoint: '🌊', pipeline_hub: '🔗',
  }
  return <span className="text-[11px]">{icons[type] || '📍'}</span>
}

// ═══ Satellite Coverage Panel ═══════════════════════════════════════════════

function SatelliteCoveragePanel({ coverage }: { coverage: IntelResponse['satelliteCoverage'] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {coverage.map(sat => (
        <div key={sat.satellite} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-1.5 mb-1">
            <Satellite size={10} className="text-[#00d4ff]" />
            <span className="text-[10px] font-mono font-bold text-white/90">{sat.satellite}</span>
          </div>
          <div className="text-[10px] font-mono text-[#94A3B8] mb-0.5">{sat.coverage}</div>
          <div className="text-[10px] font-mono font-bold text-[#00ff88]">{sat.latency}</div>
          <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5">{sat.facilities} facilities</div>
          {sat.gap && (
            <div className="text-[9px] font-mono text-[#F5A623]/70 mt-1 leading-tight">⚠ {sat.gap}</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══ Facility Watchlist ═══════════════════════════════════════════════════════

function FacilityWatchlist({ facilities }: { facilities: Facility[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterThreat, setFilterThreat] = useState<string | null>(null)
  const [filterSat, setFilterSat] = useState<string | null>(null)

  const filtered = facilities.filter(f => {
    if (filterThreat && f.threatLevel !== filterThreat) return false
    if (filterSat && f.satellite !== filterSat) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const order = { critical: 0, elevated: 1, watch: 2, none: 3 }
    return (order[a.threatLevel] ?? 4) - (order[b.threatLevel] ?? 4)
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono text-[#94A3B8] tracking-wider">THREAT:</span>
        {['all', 'critical', 'elevated', 'watch', 'none'].map(t => (
          <button key={t} onClick={() => setFilterThreat(t === 'all' ? null : t)}
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all ${
              (t === 'all' && !filterThreat) || filterThreat === t
                ? 'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]'
                : 'border-white/[0.04] text-[#94A3B8] hover:text-white/80'
            }`}>
            {t.toUpperCase()}
          </button>
        ))}
        <div className="w-px h-3 bg-white/10 mx-1" />
        <span className="text-[10px] font-mono text-[#94A3B8] tracking-wider">SAT:</span>
        {['all', 'Meteosat', 'GOES', 'Himawari'].map(s => (
          <button key={s} onClick={() => setFilterSat(s === 'all' ? null : s)}
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all ${
              (s === 'all' && !filterSat) || filterSat === s
                ? 'border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]'
                : 'border-white/[0.04] text-[#94A3B8] hover:text-white/80'
            }`}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Facility list */}
      <div className="space-y-0.5 max-h-[340px] overflow-y-auto pr-1">
        {sorted.map(facility => {
          const isExpanded = expanded === facility.id
          return (
            <div key={facility.id}
              className="rounded-lg border border-white/[0.04] hover:border-white/[0.08] transition-all">
              {/* Facility row */}
              <div onClick={() => setExpanded(isExpanded ? null : facility.id)}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer">
                <FacilityTypeIcon type={facility.type} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono font-medium text-white/90 truncate">{facility.name}</div>
                  <div className="text-[10px] font-mono text-[#94A3B8]">{facility.country} · {facility.region}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {facility.nearbyFires > 0 && (
                    <span className="text-[9px] font-mono text-[#EF4444] flex items-center gap-0.5">
                      <Flame size={8} /> {facility.nearbyFires}
                    </span>
                  )}
                  {facility.emissionsFlags > 0 && (
                    <span className="text-[9px] font-mono text-[#F59E0B] flex items-center gap-0.5">
                      <Wind size={8} /> {facility.emissionsFlags}
                    </span>
                  )}
                  {facility.spillFlags > 0 && (
                    <span className="text-[9px] font-mono text-[#6366F1] flex items-center gap-0.5">
                      <Droplets size={8} /> {facility.spillFlags}
                    </span>
                  )}
                </div>
                <ThreatBadge level={facility.threatLevel} />
                <span className="text-[9px] font-mono text-[#94A3B8] bg-white/[0.03] px-1 py-0.5 rounded">
                  {facility.satellite}
                </span>
                {isExpanded ? <ChevronUp size={12} className="text-[#94A3B8]" /> : <ChevronDown size={12} className="text-[#94A3B8]" />}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-3 pb-2 pt-1 border-t border-white/[0.04] space-y-1.5">
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-[#94A3B8]">TYPE</span>
                      <span className="text-white/80 ml-1 capitalize">{facility.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8]">CAPACITY</span>
                      <span className="text-white/80 ml-1">{facility.capacity || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8]">COORDS</span>
                      <span className="text-white/80 ml-1">{facility.lat.toFixed(2)}°{facility.lat >= 0 ? 'N' : 'S'}, {Math.abs(facility.lng).toFixed(2)}°{facility.lng >= 0 ? 'E' : 'W'}</span>
                    </div>
                  </div>
                  <LatencyBadge source={facility.satellite} latency={facility.satelliteLatency} />
                  {facility.closestFire && (
                    <div className="flex items-center gap-2 p-1.5 rounded bg-[#EF4444]/[0.06] border border-[#EF4444]/10">
                      <Flame size={10} className="text-[#EF4444]" />
                      <span className="text-[10px] font-mono text-[#EF4444]/80">
                        Nearest FIRMS fire: {facility.closestFire.distance}km away · brightness {facility.closestFire.brightness} · FRP {facility.closestFire.frp.toFixed(0)} MW
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══ Dark Vessel Panel ═══════════════════════════════════════════════════════

function DarkVesselPanel({ data }: { data: IntelResponse['darkVessels'] }) {
  const typeColors: Record<string, string> = {
    'STS Transfer': '#F59E0B', 'AIS Gap': '#EF4444', 'Seizure': '#8B5CF6',
    'Attack': '#EF4444', 'Activity': '#94A3B8',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="text-[12px] font-mono font-bold text-white/90">{data.eventCount}</div>
        <div className="text-[10px] font-mono text-[#94A3B8]">events detected</div>
        <div className="flex-1" />
        {data.sources.map(s => (
          <LatencyBadge key={s.name} source={s.name} latency={s.latency} compact />
        ))}
      </div>
      <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
        {data.recentEvents.map((event, i) => {
          const color = typeColors[event.type] || '#94A3B8'
          return (
            <div key={i} className="flex items-start gap-2 px-2 py-1 rounded hover:bg-white/[0.02]">
              <Ship size={10} className="mt-0.5 shrink-0" style={{ color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-white/80 leading-snug line-clamp-1">{event.title}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-[#94A3B8]">{event.source}</span>
                  <span className="text-[10px] font-mono text-[#00ff88]/70">{event.time}</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded border"
                    style={{ color, borderColor: color + '25', backgroundColor: color + '08' }}>
                    {event.type}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">{event.location}</span>
                </div>
              </div>
            </div>
          )
        })}
        {data.recentEvents.length === 0 && (
          <div className="text-[10px] font-mono text-[#94A3B8] text-center py-3">No dark vessel events detected</div>
        )}
      </div>
    </div>
  )
}

// ═══ Emissions Panel ═════════════════════════════════════════════════════════

function EmissionsPanel({ data }: { data: IntelResponse['emissions'] }) {
  const metricColors: Record<string, string> = {
    'CH₄': '#F59E0B', 'NO₂': '#EF4444', 'SO₂': '#8B5CF6', 'Flare': '#F97316', 'Spill': '#6366F1', 'Emissions': '#94A3B8',
  }
  const metricIcons: Record<string, string> = {
    'CH₄': '🔥', 'NO₂': '💨', 'SO₂': '🏭', 'Flare': '🔥', 'Spill': '🛢️', 'Emissions': '📊',
  }

  return (
    <div className="space-y-2">
      {/* Metric summary */}
      <div className="grid grid-cols-5 gap-1.5">
        {Object.entries(data.metrics).map(([key, count]) => {
          const metric = key === 'ch4' ? 'CH₄' : key === 'no2' ? 'NO₂' : key === 'so2' ? 'SO₂' : key === 'flares' ? 'Flare' : 'Spill'
          const color = metricColors[metric] || '#94A3B8'
          return (
            <div key={key} className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04] text-center">
              <div className="text-[14px] font-mono font-bold" style={{ color }}>{count}</div>
              <div className="text-[9px] font-mono text-[#94A3B8]">{metric}</div>
            </div>
          )
        })}
      </div>

      {/* Events */}
      <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
        {data.recentEvents.map((event, i) => {
          const color = metricColors[event.metric] || '#94A3B8'
          return (
            <div key={i} className="flex items-start gap-2 px-2 py-1 rounded hover:bg-white/[0.02]">
              <span className="text-[11px] mt-0.5">{metricIcons[event.metric] || '📊'}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-white/80 leading-snug line-clamp-1">{event.title}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-[#94A3B8]">{event.source}</span>
                  <span className="text-[10px] font-mono text-[#00ff88]/70">{event.time}</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded border"
                    style={{ color, borderColor: color + '25', backgroundColor: color + '08' }}>
                    {event.metric}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        {data.recentEvents.length === 0 && (
          <div className="text-[10px] font-mono text-[#94A3B8] text-center py-3">No emissions events detected</div>
        )}
      </div>

      {/* Sources */}
      <div className="flex flex-wrap gap-1.5">
        {data.sources.map(s => (
          <LatencyBadge key={s.name} source={s.name} latency={s.latency} compact />
        ))}
      </div>
    </div>
  )
}

// ═══ Spill Detection Panel ═══════════════════════════════════════════════════

function SpillPanel({ data }: { data: IntelResponse['spills'] }) {
  const severityColors: Record<string, string> = {
    Critical: '#EF4444', High: '#F59E0B', Moderate: '#00d4ff', Low: '#22C55E',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="text-[12px] font-mono font-bold text-white/90">{data.eventCount}</div>
        <div className="text-[10px] font-mono text-[#94A3B8]">spill signals (30d)</div>
        <div className="flex-1" />
        {data.sources.map(s => (
          <LatencyBadge key={s.name} source={s.name} latency={s.latency} compact />
        ))}
      </div>
      <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
        {data.recentEvents.map((event, i) => {
          const color = severityColors[event.severity] || '#94A3B8'
          return (
            <div key={i} className="flex items-start gap-2 px-2 py-1 rounded hover:bg-white/[0.02]">
              <Droplets size={10} className="mt-0.5 shrink-0" style={{ color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-white/80 leading-snug line-clamp-1">{event.title}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-[#94A3B8]">{event.source}</span>
                  <span className="text-[10px] font-mono text-[#00ff88]/70">{event.time}</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded border"
                    style={{ color, borderColor: color + '25', backgroundColor: color + '08' }}>
                    {event.severity}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">{event.location}</span>
                </div>
              </div>
            </div>
          )
        })}
        {data.recentEvents.length === 0 && (
          <div className="text-[10px] font-mono text-[#94A3B8] text-center py-3">No spill signals detected</div>
        )}
      </div>
      <div className="p-2 rounded bg-[#6366F1]/[0.05] border border-[#6366F1]/10">
        <div className="text-[9px] font-mono text-[#6366F1]/70 leading-relaxed">
          ℹ Spill candidates require Sentinel-1 SAR confirmation (~6 day latency). Flags shown here are news-aggregated signals awaiting satellite cross-verification per FR-74.
        </div>
      </div>
    </div>
  )
}

// ═══ Data Sources Panel ═══════════════════════════════════════════════════════

function DataSourcesPanel({ sources }: { sources: IntelResponse['dataSources'] }) {
  return (
    <div className="space-y-1">
      {sources.map(source => (
        <div key={source.name} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.02] border border-white/[0.02]">
          <span className="text-[9px] font-mono font-bold text-[#94A3B8] w-6 text-center"
            style={{ color: source.rank <= 3 ? '#00ff88' : source.rank <= 5 ? '#F5A623' : '#94A3B8' }}>
            R{source.rank}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <a href={source.url} target="_blank" rel="noopener"
                className="text-[10px] font-mono font-medium text-white/90 hover:text-[#00d4ff] transition-colors flex items-center gap-0.5">
                {source.name} <ExternalLink size={8} />
              </a>
            </div>
            <div className="text-[9px] font-mono text-[#94A3B8]">{source.description}</div>
          </div>
          <div className="text-right">
            <LatencyBadge source="" latency={source.latency} compact />
            <div className="text-[9px] font-mono text-[#94A3B8] mt-0.5">{source.coverage}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══ SST Panel ═══════════════════════════════════════════════════════════════

function SSTPanel({ sst }: { sst: IntelResponse['sst'] }) {
  const globalTemp = sst.global.temperature
  const globalAnomaly = sst.global.anomaly
  const pgTemp = sst.persianGulf.temperature
  const pgAnomaly = sst.persianGulf.anomaly

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-1.5 mb-1">
          <Thermometer size={10} className="text-[#00d4ff]" />
          <span className="text-[10px] font-mono text-[#94A3B8]">GLOBAL SST</span>
        </div>
        <div className="text-[16px] font-mono font-bold text-white/90">{globalTemp}{sst.global.unit}</div>
        <div className={`text-[11px] font-mono ${globalAnomaly >= 0 ? 'text-[#EF4444]' : 'text-[#38BDF8]'}`}>
          {globalAnomaly >= 0 ? '↑' : '↓'} {globalAnomaly >= 0 ? '+' : ''}{globalAnomaly}° vs avg
        </div>
        <div className="mt-1"><LatencyBadge source="Open-Meteo Marine" latency="~real-time" compact /></div>
      </div>
      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-1.5 mb-1">
          <Thermometer size={10} className="text-[#F59E0B]" />
          <span className="text-[10px] font-mono text-[#94A3B8]">PERSIAN GULF</span>
        </div>
        <div className="text-[16px] font-mono font-bold text-white/90">{pgTemp}{sst.persianGulf.unit}</div>
        <div className={`text-[11px] font-mono ${pgAnomaly >= 0 ? 'text-[#EF4444]' : 'text-[#38BDF8]'}`}>
          {pgAnomaly >= 0 ? '↑' : '↓'} {pgAnomaly >= 0 ? '+' : ''}{pgAnomaly}° vs avg
        </div>
        <div className="mt-1"><LatencyBadge source="Open-Meteo Marine" latency="~real-time" compact /></div>
      </div>
    </div>
  )
}

// ═══ Main Page ═══════════════════════════════════════════════════════════════

export function SatelliteIntelPage() {
  const [data, setData] = useState<IntelResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch('/api/v4/satellite/intel')
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        if (alive) { setData(json); setError(null); setLoading(false) }
      } catch (e) {
        if (alive) { setError(String(e)); setLoading(false) }
      }
    }
    load()
    const iv = setInterval(load, 60_000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  if (loading && !data) {
    return (
      <PageLayout title="Satellite Intelligence" subtitle="Thermal detection · Dark vessels · Emissions · Spill monitoring">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Satellite size={32} className="text-[#00d4ff] mx-auto mb-3 animate-pulse" />
            <div className="text-[11px] font-mono text-[#94A3B8]">INITIALIZING SATELLITE INTEL LAYER...</div>
            <div className="text-[10px] font-mono text-[#94A3B8]/50 mt-1">Connecting to NASA FIRMS · EUMETSAT · NOAA · GDELT</div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error && !data) {
    return (
      <PageLayout title="Satellite Intelligence" subtitle="Thermal detection · Dark vessels · Emissions · Spill monitoring">
        <div className="p-4 rounded-lg bg-[#EF4444]/[0.06] border border-[#EF4444]/10 text-center py-10">
          <AlertTriangle size={24} className="text-[#EF4444] mx-auto mb-2" />
          <div className="text-[11px] font-mono text-[#EF4444]">SATELLITE INTEL UNAVAILABLE</div>
          <div className="text-[10px] font-mono text-[#94A3B8] mt-1">{error}</div>
        </div>
      </PageLayout>
    )
  }

  const d = data!
  const timeSinceUpdate = d.lastUpdated ? Math.round((Date.now() - new Date(d.lastUpdated).getTime()) / 1000) : 0

  return (
    <PageLayout title="Satellite Intelligence" subtitle="Thermal detection · Dark vessels · Emissions · Spill monitoring">
      <div className="space-y-3">

        {/* Global Threat Summary */}
        <div className="grid grid-cols-6 gap-2">
          <div className="p-2 rounded-lg bg-[#EF4444]/[0.06] border border-[#EF4444]/10 text-center">
            <div className="text-[16px] font-mono font-bold text-[#EF4444]">{d.threats.critical}</div>
            <div className="text-[9px] font-mono text-[#EF4444]/70">CRITICAL</div>
          </div>
          <div className="p-2 rounded-lg bg-[#F59E0B]/[0.06] border border-[#F59E0B]/10 text-center">
            <div className="text-[16px] font-mono font-bold text-[#F59E0B]">{d.threats.elevated}</div>
            <div className="text-[9px] font-mono text-[#F59E0B]/70">ELEVATED</div>
          </div>
          <div className="p-2 rounded-lg bg-[#00d4ff]/[0.06] border border-[#00d4ff]/10 text-center">
            <div className="text-[16px] font-mono font-bold text-[#00d4ff]">{d.threats.watch}</div>
            <div className="text-[9px] font-mono text-[#00d4ff]/70">WATCH</div>
          </div>
          <div className="p-2 rounded-lg bg-[#EF4444]/[0.04] border border-[#EF4444]/08 text-center">
            <div className="text-[16px] font-mono font-bold text-[#EF4444]/80">{d.threats.totalFiresNearFacilities}</div>
            <div className="text-[9px] font-mono text-[#94A3B8]">FIRES NEAR</div>
          </div>
          <div className="p-2 rounded-lg bg-[#F59E0B]/[0.04] border border-[#F59E0B]/08 text-center">
            <div className="text-[16px] font-mono font-bold text-[#F59E0B]/80">{d.darkVessels.eventCount}</div>
            <div className="text-[9px] font-mono text-[#94A3B8]">DARK VESSELS</div>
          </div>
          <div className="p-2 rounded-lg bg-[#94A3B8]/[0.04] border border-[#94A3B8]/08 text-center">
            <div className="text-[16px] font-mono font-bold text-white/80">{d.threats.globalFireCount.toLocaleString()}</div>
            <div className="text-[9px] font-mono text-[#94A3B8]">GLOBAL FIRES</div>
          </div>
        </div>

        {/* Update indicator */}
        <div className="flex items-center gap-2 px-2 py-1 bg-[#00ff88]/[0.04] border border-[#00ff88]/10 rounded-lg">
          <Zap size={10} className="text-[#00ff88]/60" />
          <span className="text-[9px] font-mono text-[#00ff88]/60 tracking-wider">SATELLITE INTEL</span>
          <span className="text-[9px] font-mono text-[#00ff88]/80">· {d.meta.facilityCount} facilities monitored</span>
          <span className="text-[9px] font-mono text-[#94A3B8]">· {d.source}</span>
          <div className="flex-1" />
          <span className="text-[9px] font-mono text-[#94A3B8]">{timeSinceUpdate < 60 ? `${timeSinceUpdate}s` : `${Math.floor(timeSinceUpdate / 60)}m`} ago</span>
        </div>

        {/* Satellite Coverage */}
        <ModuleCard icon={Satellite} color="#00d4ff" title="Satellite Coverage" cadence="3-SAT">
          <SatelliteCoveragePanel coverage={d.satelliteCoverage} />
        </ModuleCard>

        {/* Facility Watchlist */}
        <ModuleCard icon={MapPin} color="#00ff88" title="Facility Watchlist" cadence="LIVE"
          tag={`NASA FIRMS × GOES/Meteosat/Himawari · ${d.meta.facilityCount} facilities · 50km geofence`}>
          <FacilityWatchlist facilities={d.facilities} />
        </ModuleCard>

        {/* Dark Vessels + Emissions side by side */}
        <div className="grid grid-cols-2 gap-3">
          <ModuleCard icon={Ship} color="#F59E0B" title="Dark Vessel Detection" cadence="HRS"
            tag="AIS-gap events · STS transfers · Global Fishing Watch">
            <DarkVesselPanel data={d.darkVessels} />
          </ModuleCard>

          <ModuleCard icon={Wind} color="#EF4444" title="Emissions Monitoring" cadence="DAILY"
            tag="Sentinel-5P · OpenAQ · VIIRS Nightfire">
            <EmissionsPanel data={d.emissions} />
          </ModuleCard>
        </div>

        {/* Spill Detection + SST */}
        <div className="grid grid-cols-2 gap-3">
          <ModuleCard icon={Droplets} color="#6366F1" title="Oil Spill Detection" cadence="6D"
            tag="Sentinel-1 SAR · News aggregation · Candidate flags only">
            <SpillPanel data={d.spills} />
          </ModuleCard>

          <ModuleCard icon={Thermometer} color="#00d4ff" title="Sea Surface Temperature" cadence="LIVE"
            tag="Open-Meteo Marine API · Real-time SST · Anomaly vs climatological mean">
            <SSTPanel sst={d.sst} />
          </ModuleCard>
        </div>

        {/* Data Sources Reference */}
        <ModuleCard icon={Radio} color="#94A3B8" title="V4 Data Sources — Honest Latency Reference" cadence="13 SOURCES">
          <DataSourcesPanel sources={d.dataSources} />
        </ModuleCard>

        {/* Methodology */}
        <div className="p-3 rounded-lg bg-white/[0.015] border border-white/[0.04]">
          <div className="text-[10px] font-mono text-[#94A3B8] leading-relaxed">
            <span className="text-[#00d4ff] font-bold">METHODOLOGY:</span> {d.meta.methodology}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
