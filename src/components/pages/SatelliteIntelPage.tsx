import { useState, useEffect } from 'react'
import { Satellite, Flame, Ship, Wind, Droplets, Thermometer, AlertTriangle, CheckCircle2, Radio, MapPin, ChevronDown, ChevronUp, ExternalLink, Eye, Shield, Zap } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { WORLD_MAP_PATHS } from '@/lib/world-map-paths'

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

// ═══ Facility Map with Overlays ═══════════════════════════════════════════

const MAP_W = 900
const MAP_H = 450
function toSVG(lat: number, lng: number): [number, number] {
  return [((lng + 180) / 360) * MAP_W, ((90 - lat) / 180) * MAP_H]
}

// Map location names from news events to real coordinates
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'strait of hormuz': { lat: 26.5, lng: 56.3 },
  'hormuz': { lat: 26.5, lng: 56.3 },
  'persian gulf': { lat: 27.0, lng: 51.0 },
  'red sea': { lat: 18.0, lng: 39.0 },
  'suez': { lat: 30.0, lng: 32.5 },
  'suez canal': { lat: 30.6, lng: 32.3 },
  'bab el-mandeb': { lat: 12.6, lng: 43.3 },
  'malacca strait': { lat: 2.5, lng: 101.5 },
  'malacca': { lat: 2.5, lng: 101.5 },
  'gulf of oman': { lat: 24.5, lng: 58.5 },
  'oman': { lat: 21.5, lng: 57.0 },
  'nigeria': { lat: 4.5, lng: 6.5 },
  'niger delta': { lat: 4.5, lng: 6.5 },
  'russia': { lat: 45.0, lng: 38.0 },
  'permian': { lat: 31.7, lng: -103.2 },
  'permian basin': { lat: 31.7, lng: -103.2 },
  'gulf of mexico': { lat: 28.0, lng: -90.0 },
  'north sea': { lat: 57.0, lng: 2.0 },
  'libya': { lat: 30.0, lng: 18.0 },
  'iran': { lat: 32.0, lng: 53.0 },
  'iraq': { lat: 33.0, lng: 44.0 },
  'saudi': { lat: 24.7, lng: 46.7 },
  'china': { lat: 35.0, lng: 115.0 },
  'india': { lat: 20.0, lng: 78.0 },
  'japan': { lat: 36.0, lng: 140.0 },
  'korea': { lat: 36.0, lng: 127.0 },
  'global': { lat: 0, lng: 0 },
}

function geolocate(title: string, fallbackLocation?: string): { lat: number; lng: number } | null {
  const text = `${title} ${fallbackLocation || ''}`.toLowerCase()
  // Match longest key first for accuracy
  const sortedKeys = Object.keys(LOCATION_COORDS).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    if (text.includes(key)) return LOCATION_COORDS[key]
  }
  return null
}

interface FacilityMapProps {
  facilities: Facility[]
  darkVesselEvents: Array<{ title: string; source: string; time: string; location: string }>
  spillEvents: Array<{ title: string; source: string; severity: string; location: string }>
  emissionEvents: Array<{ title: string; source: string; metric: string; time: string }>
}

function FacilityMap({ facilities, darkVesselEvents, spillEvents, emissionEvents }: FacilityMapProps) {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [hoveredFacility, setHoveredFacility] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<{ type: string; data: any } | null>(null)

  const threatColor = (level: string) => {
    if (level === 'critical') return '#EF4444'
    if (level === 'elevated') return '#F59E0B'
    if (level === 'watch') return '#00d4ff'
    return '#22C55E'
  }

  // Derive map positions from real API events
  const darkVesselPositions: Array<{ lat: number; lng: number; label: string; color: string; time: string; source: string }> = darkVesselEvents
    .map(e => {
      const pos = geolocate(e.title, e.location)
      if (!pos || pos.lat === 0) return null
      return { ...pos, label: e.title.slice(0, 40), color: '#EF4444', time: e.time, source: e.source }
    })
    .filter(Boolean) as any
    .slice(0, 8)

  const spillPositions: Array<{ lat: number; lng: number; label: string; color: string; severity: string; source: string }> = spillEvents
    .map(e => {
      const pos = geolocate(e.title, e.location)
      if (!pos || pos.lat === 0) return null
      return { ...pos, label: e.title.slice(0, 40), color: '#6366F1', severity: e.severity, source: e.source }
    })
    .filter(Boolean) as any
    .slice(0, 8)

  const emissionPositions: Array<{ lat: number; lng: number; label: string; color: string; metric: string; source: string }> = emissionEvents
    .map(e => {
      const pos = geolocate(e.title)
      if (!pos || pos.lat === 0) return null
      return { ...pos, label: e.title.slice(0, 40), color: e.metric === 'CH₄' ? '#F59E0B' : e.metric === 'NO₂' ? '#EF4444' : e.metric === 'SO₂' ? '#8B5CF6' : '#F97316', metric: e.metric, source: e.source }
    })
    .filter(Boolean) as any
    .slice(0, 8)

  return (
    <div className="relative rounded-lg overflow-hidden border border-white/[0.04]"
      style={{ background: 'linear-gradient(180deg, #080C12 0%, #0D1318 50%, #0F1620 100%)' }}>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full" style={{ aspectRatio: '2/1' }}>
        <defs>
          <radialGradient id="sat-ocean" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#0A1628" />
            <stop offset="100%" stopColor="#060A10" />
          </radialGradient>
          <filter id="sat-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="vessel-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width={MAP_W} height={MAP_H} fill="url(#sat-ocean)" />

        {/* Grid */}
        {Array.from({ length: 18 }, (_, i) => (i + 1) * 50).map(x => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={MAP_H} stroke="#1A2538" strokeWidth="0.3" opacity={0.25} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (i + 1) * 50).map(y => (
          <line key={`h${y}`} x1={0} y1={y} x2={MAP_W} y2={y} stroke="#1A2538" strokeWidth="0.3" opacity={0.25} />
        ))}

        {/* Real world map */}
        {Object.entries(WORLD_MAP_PATHS).map(([continent, paths]) => (
          paths.map((d, i) => (
            <path key={`${continent}-${i}`} d={d} fill="#141E2C" stroke="#1E3048" strokeWidth="0.5" opacity="0.9" />
          ))
        ))}

        {/* Dark vessel markers (glowing red) */}
        {darkVesselPositions.map((v, i) => {
          const [vx, vy] = toSVG(v.lat, v.lng)
          return (
            <g key={`dv-${i}`} onClick={() => setSelectedEvent({ type: 'darkVessel', data: v })} className="cursor-pointer">
              <circle cx={vx} cy={vy} r="12" fill={v.color} opacity="0.15" filter="url(#vessel-glow)">
                <animate attributeName="r" values="8;14;8" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={vx} cy={vy} r="4" fill={v.color} opacity="0.8">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x={vx} y={vy - 8} textAnchor="middle" fill={v.color} fontSize="7" fontFamily="IBM Plex Mono" fontWeight="600" opacity="0.8">
                {v.label}
              </text>
            </g>
          )
        })}

        {/* Spill markers (glowing blue/purple) */}
        {spillPositions.map((s, i) => {
          const [sx, sy] = toSVG(s.lat, s.lng)
          return (
            <g key={`sp-${i}`} onClick={() => setSelectedEvent({ type: 'spill', data: s })} className="cursor-pointer">
              <ellipse cx={sx} cy={sy} rx="15" ry="8" fill={s.color} opacity="0.12" filter="url(#vessel-glow)">
                <animate attributeName="rx" values="12;18;12" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.12;0.04;0.12" dur="4s" repeatCount="indefinite" />
              </ellipse>
              <circle cx={sx} cy={sy} r="3" fill={s.color} opacity="0.7" />
              <text x={sx} y={sy - 10} textAnchor="middle" fill={s.color} fontSize="6" fontFamily="IBM Plex Mono" fontWeight="600" opacity="0.7">
                🛢️ {s.label}
              </text>
            </g>
          )
        })}

        {/* Emission markers (glowing orange/yellow) */}
        {emissionPositions.map((e, i) => {
          const [ex, ey] = toSVG(e.lat, e.lng)
          return (
            <g key={`em-${i}`} onClick={() => setSelectedEvent({ type: 'emission', data: e })} className="cursor-pointer">
              <circle cx={ex} cy={ey} r="10" fill={e.color} opacity="0.1" filter="url(#vessel-glow)">
                <animate attributeName="r" values="7;12;7" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.1;0.03;0.1" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={ex} cy={ey} r="3" fill={e.color} opacity="0.75" />
              <text x={ex} y={ey - 8} textAnchor="middle" fill={e.color} fontSize="6" fontFamily="IBM Plex Mono" fontWeight="600" opacity="0.7">
                💨 {e.label}
              </text>
            </g>
          )
        })}

        {/* Facility markers */}
        {facilities.map(f => {
          const [fx, fy] = toSVG(f.lat, f.lng)
          const color = threatColor(f.threatLevel)
          const isSelected = selectedFacility?.id === f.id
          const isHovered = hoveredFacility === f.id
          const size = f.threatLevel === 'critical' ? 5 : f.threatLevel === 'elevated' ? 4 : 3

          return (
            <g key={f.id}
              onClick={() => setSelectedFacility(isSelected ? null : f)}
              onMouseEnter={() => setHoveredFacility(f.id)}
              onMouseLeave={() => setHoveredFacility(null)}
              className="cursor-pointer">
              {/* Threat pulse */}
              {f.threatLevel !== 'none' && (
                <circle cx={fx} cy={fy} r={size * 2.5} fill={color} opacity={isSelected ? 0.2 : 0.08}>
                  <animate attributeName="r" values={`${size * 2};${size * 3};${size * 2}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values={`${isSelected ? 0.2 : 0.08};${isSelected ? 0.05 : 0.02};${isSelected ? 0.2 : 0.08}`} dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Center dot */}
              <circle cx={fx} cy={fy} r={isSelected || isHovered ? size + 1 : size} fill={color} opacity="0.9" filter={f.threatLevel === 'critical' ? 'url(#sat-glow)' : undefined} />
              <circle cx={fx} cy={fy} r="1.5" fill="white" opacity="0.8" />
              {/* Label on hover */}
              {(isHovered || isSelected) && (
                <g>
                  <rect x={fx - 50} y={fy + 8} width={100} height={22} rx={4} fill="#0a0e14" stroke={color} strokeOpacity={0.5} strokeWidth={0.8} />
                  <text x={fx} y={fy + 18} textAnchor="middle" fill="white" fontSize="7" fontFamily="IBM Plex Mono" fontWeight="600">
                    {f.name}
                  </text>
                  <text x={fx} y={fy + 26} textAnchor="middle" fill={color} fontSize="6" fontFamily="IBM Plex Mono">
                    {f.threatLevel.toUpperCase()} · {f.country}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Legend */}
        <g transform="translate(10, 380)">
          <rect width="140" height="60" rx="4" fill="#0a0e14" fillOpacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
          <text x="8" y="14" fill="#94A3B8" fontSize="7" fontFamily="IBM Plex Mono" fontWeight="700">LEGEND</text>
          <circle cx="14" cy="24" r="3" fill="#EF4444" /><text x="22" y="27" fill="#EF4444" fontSize="6" fontFamily="IBM Plex Mono">Dark Vessel</text>
          <circle cx="14" cy="34" r="3" fill="#6366F1" /><text x="22" y="37" fill="#6366F1" fontSize="6" fontFamily="IBM Plex Mono">Oil Spill</text>
          <circle cx="14" cy="44" r="3" fill="#F59E0B" /><text x="22" y="47" fill="#F59E0B" fontSize="6" fontFamily="IBM Plex Mono">Emissions</text>
          <circle cx="80" cy="24" r="3" fill="#22C55E" /><text x="88" y="27" fill="#22C55E" fontSize="6" fontFamily="IBM Plex Mono">Facility</text>
          <circle cx="80" cy="34" r="3" fill="#EF4444" /><text x="88" y="37" fill="#EF4444" fontSize="6" fontFamily="IBM Plex Mono">Critical</text>
          <circle cx="80" cy="44" r="3" fill="#F59E0B" /><text x="88" y="47" fill="#F59E0B" fontSize="6" fontFamily="IBM Plex Mono">Elevated</text>
        </g>
      </svg>

      {/* Selected facility detail popup */}
      {selectedFacility && (
        <div className="absolute top-2 right-2 bg-[#0a0e14]/95 border border-white/15 rounded-lg shadow-2xl p-3 max-w-[220px] backdrop-blur-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-[11px] font-bold text-white font-mono">{selectedFacility.name}</div>
              <div className="text-[9px] text-gray-400 font-mono">{selectedFacility.country} · {selectedFacility.region}</div>
            </div>
            <button onClick={() => setSelectedFacility(null)} className="text-gray-500 hover:text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: threatColor(selectedFacility.threatLevel), backgroundColor: threatColor(selectedFacility.threatLevel) + '15', border: `1px solid ${threatColor(selectedFacility.threatLevel)}30` }}>
                {selectedFacility.threatLevel.toUpperCase()}
              </span>
              <span className="text-[9px] text-gray-400 font-mono">{selectedFacility.type.replace('_', ' ')}</span>
            </div>
            {selectedFacility.capacity && (
              <div className="text-[9px] text-gray-400 font-mono">Capacity: {selectedFacility.capacity}</div>
            )}
            <div className="text-[9px] text-gray-400 font-mono">Sat: {selectedFacility.satellite} ({selectedFacility.satelliteLatency})</div>
            {selectedFacility.nearbyFires > 0 && (
              <div className="flex items-center gap-1 text-[9px] text-red font-mono">
                <Flame size={8} /> {selectedFacility.nearbyFires} nearby fires
              </div>
            )}
            {selectedFacility.emissionsFlags > 0 && (
              <div className="flex items-center gap-1 text-[9px] text-amber font-mono">
                <Wind size={8} /> {selectedFacility.emissionsFlags} emissions flags
              </div>
            )}
            {selectedFacility.spillFlags > 0 && (
              <div className="flex items-center gap-1 text-[9px] text-purple font-mono">
                <Droplets size={8} /> {selectedFacility.spillFlags} spill flags
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event detail popup (dark vessel / spill / emission) */}
      {selectedEvent && (
        <div className="absolute top-2 right-2 bg-[#0a0e14]/95 border border-white/15 rounded-lg shadow-2xl p-3 max-w-[260px] backdrop-blur-sm z-10">
          <div className="flex items-start justify-between mb-2">
            <div className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: selectedEvent.data.color }}>
              {selectedEvent.type === 'darkVessel' ? '⚓ DARK VESSEL EVENT' :
               selectedEvent.type === 'spill' ? '🛢️ OIL SPILL DETECTION' :
               '💨 EMISSION EVENT'}
            </div>
            <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="text-[10px] text-white/80 font-mono leading-snug mb-2">
            {selectedEvent.data.label}
          </div>
          <div className="space-y-1">
            {selectedEvent.data.source && (
              <div className="text-[9px] text-gray-400 font-mono">Source: {selectedEvent.data.source}</div>
            )}
            {selectedEvent.data.time && (
              <div className="text-[9px] text-gray-400 font-mono">Detected: {selectedEvent.data.time}</div>
            )}
            {selectedEvent.data.severity && (
              <div className="text-[9px] font-mono" style={{ color: selectedEvent.data.severity === 'High' ? '#EF4444' : '#F59E0B' }}>
                Severity: {selectedEvent.data.severity}
              </div>
            )}
            {selectedEvent.data.metric && (
              <div className="text-[9px] text-gray-400 font-mono">Metric: {selectedEvent.data.metric}</div>
            )}
          </div>
        </div>
      )}
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
    const iv = setInterval(load, 15_000)
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
    <PageLayout title="Satellite Intelligence" subtitle="Thermal detection · Dark vessels · Emissions · Spill monitoring" lastUpdated={data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : undefined}>
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

        {/* Facility Watchlist Map */}
        <ModuleCard icon={MapPin} color="#00ff88" title="Facility Watchlist — Global View" cadence="LIVE"
          tag={`${d.meta.facilityCount} facilities · Dark vessels · Spills · Emissions`}>
          <FacilityMap
            facilities={d.facilities}
            darkVesselEvents={d.darkVessels.recentEvents}
            spillEvents={d.spills.recentEvents}
            emissionEvents={d.emissions.recentEvents}
          />
        </ModuleCard>

        {/* Facility Watchlist (detailed list) */}
        <ModuleCard icon={MapPin} color="#00ff88" title="Facility Watchlist — Detailed" cadence="LIVE"
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
