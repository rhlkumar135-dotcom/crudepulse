import { useState, useMemo } from 'react'
import { useMarketData } from '@/lib/useMarketData'
import { AlertTriangle, Info, TrendingUp, TrendingDown, Minus, Globe, Shield, ChevronDown, ChevronUp } from 'lucide-react'

interface CorrelationResult { r: number; n: number }
interface Asset { symbol: string; label: string; type: string; latest: number | null; excluded?: boolean; exclusionReason?: string }
interface MEEvent { date: string; score: number; title: string; source: string }
interface Callout { text: string; strength: string; market: string; window: string }
interface CorrelationResponse {
  assets: Asset[]
  excludedAssets: Asset[]
  events: MEEvent[]
  eventCount: number
  correlations: Record<string, Record<string, CorrelationResult | null>>
  callouts: Callout[]
  meta: { windowDays: number[]; eventWindowSize: string; methodology: string }
}

function corrGradient(r: number): { bg: string; border: string; glow: string; text: string } {
  const abs = Math.abs(r)
  if (r > 0.7) return { bg: 'rgba(45, 212, 191, 0.85)', border: 'rgba(45, 212, 191, 0.6)', glow: '0 0 12px rgba(45, 212, 191, 0.4)', text: '#000' }
  if (r > 0.5) return { bg: 'rgba(45, 212, 191, 0.55)', border: 'rgba(45, 212, 191, 0.35)', glow: '0 0 8px rgba(45, 212, 191, 0.2)', text: '#fff' }
  if (r > 0.3) return { bg: 'rgba(45, 212, 191, 0.3)', border: 'rgba(45, 212, 191, 0.15)', glow: 'none', text: '#2DD4BF' }
  if (r > 0.1) return { bg: 'rgba(255, 255, 255, 0.04)', border: 'rgba(255, 255, 255, 0.06)', glow: 'none', text: '#64748B' }
  if (r > -0.1) return { bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.04)', glow: 'none', text: '#475569' }
  if (r > -0.3) return { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.12)', glow: 'none', text: '#F59E0B' }
  if (r > -0.5) return { bg: 'rgba(245, 158, 11, 0.4)', border: 'rgba(245, 158, 11, 0.25)', glow: '0 0 6px rgba(245, 158, 11, 0.15)', text: '#FBBF24' }
  if (r > -0.7) return { bg: 'rgba(239, 68, 68, 0.45)', border: 'rgba(239, 68, 68, 0.3)', glow: '0 0 8px rgba(239, 68, 68, 0.2)', text: '#F87171' }
  return { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(239, 68, 68, 0.5)', glow: '0 0 14px rgba(239, 68, 68, 0.35)', text: '#FFF' }
}

function corrStrength(r: number): string {
  const abs = Math.abs(r)
  if (abs >= 0.7) return 'STRONG'
  if (abs >= 0.4) return 'MODERATE'
  if (abs >= 0.2) return 'WEAK'
  return 'NONE'
}

function HeatmapCell({ result, assetLabel, window }: { result: CorrelationResult | null; assetLabel: string; window: string }) {
  const [hovered, setHovered] = useState(false)
  if (!result || result.n < 3) {
    return (
      <td
        className="relative text-center transition-all duration-200"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="mx-0.5 my-0.5 rounded-md px-1 py-2.5 bg-white/[0.02] border border-white/[0.04] flex items-center justify-center min-h-[48px]">
          <span className="text-[11px] font-mono text-white/20">n/a</span>
        </div>
        {hovered && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#121826] border border-white/10 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
            <div className="text-[10px] font-mono text-white/50">{assetLabel} ↔ ME Events</div>
            <div className="text-[11px] font-mono text-white/30 mt-0.5">{window} window — insufficient data</div>
          </div>
        )}
      </td>
    )
  }

  const insufficient = result.n < 10
  const g = corrGradient(result.r)
  const strength = corrStrength(result.r)

  return (
    <td
      className="relative text-center transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`mx-0.5 my-0.5 rounded-md px-1.5 py-2 min-h-[48px] flex flex-col items-center justify-center border transition-all duration-300 ${hovered ? 'scale-110 z-10' : ''} ${insufficient ? 'opacity-40' : ''}`}
        style={{
          backgroundColor: g.bg,
          borderColor: g.border,
          boxShadow: hovered ? `${g.glow}, 0 4px 20px rgba(0,0,0,0.4)` : g.glow,
        }}
      >
        <span className="text-[12px] font-mono font-bold tabular-nums leading-none" style={{ color: g.text }}>
          {result.r > 0 ? '+' : ''}{result.r.toFixed(2)}
        </span>
        <span className="text-[10px] font-mono mt-1 opacity-50" style={{ color: g.text }}>
          n={result.n}
        </span>
      </div>
      {hovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#121826] border border-white/10 rounded-lg px-3 py-2.5 shadow-xl min-w-[180px]">
          <div className="text-[10px] font-mono text-white/70 font-medium">{assetLabel}</div>
          <div className="text-[11px] font-mono text-white/40 mt-0.5">Window: {window}</div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold" style={{ color: g.text }}>
              r = {result.r > 0 ? '+' : ''}{result.r.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: g.bg, color: g.text, border: `1px solid ${g.border}` }}>
              {strength}
            </span>
          </div>
          <div className="text-[10px] font-mono text-white/30 mt-1">n = {result.n} data points</div>
          {insufficient && <div className="text-[10px] text-amber/60 mt-1">⚠ Limited sample size</div>}
        </div>
      )}
    </td>
  )
}

function ColorScale() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono text-white/30">-1.0</span>
      <div className="flex h-2 rounded overflow-hidden">
        <div className="w-3 bg-red/70" />
        <div className="w-3 bg-red/45" />
        <div className="w-3 bg-amber/40" />
        <div className="w-3 bg-amber/20" />
        <div className="w-3 bg-white/5" />
        <div className="w-3 bg-white/3" />
        <div className="w-3 bg-teal/20" />
        <div className="w-3 bg-teal/40" />
        <div className="w-3 bg-teal/55" />
        <div className="w-3 bg-teal/80" />
      </div>
      <span className="text-[10px] font-mono text-white/30">+1.0</span>
    </div>
  )
}

export function MiddleEastCorrelation() {
  const { data } = useMarketData<CorrelationResponse>('/api/market/correlation', 'pro', 30000)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const [showMethodology, setShowMethodology] = useState(false)

  const strongCorrelations = useMemo(() => {
    if (!data) return []
    return data.callouts.filter(c => c.strength === 'strong')
  }, [data])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[400px] text-white/40 text-[11px] font-mono">
        <div className="text-center space-y-2">
          <div className="animate-pulse">Loading correlation engine...</div>
          <div className="text-[11px] opacity-50">Fetching 9 market series + ME events</div>
        </div>
      </div>
    )
  }

  const marketLabels: Record<string, string> = {
    'CL=F': 'WTI Crude', 'BZ=F': 'Brent Crude',
    'EURUSD=X': 'EUR/USD', 'EGPUSD=X': 'EGP/USD',
    'TRY=X': 'TRY/USD', 'DX-Y.NYB': 'USD Index',
    '^GSPC': 'S&P 500', '^FTSE': 'FTSE 100', '^N225': 'Nikkei 225',
  }

  const typeEmojis: Record<string, string> = {
    oil: '🛢️', currency: '💱', index: '📈',
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-amber" />
          <span className="text-[11px] font-mono tracking-wider text-white font-semibold">MIDDLE EAST ↔ GLOBAL MARKETS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 font-mono">{data.eventCount} ME events</span>
          <button onClick={() => setShowMethodology(!showMethodology)} className="text-white/30 hover:text-amber transition-colors">
            <Info size={12} />
          </button>
        </div>
      </div>

      {/* Methodology */}
      {showMethodology && (
        <div className="bg-amber/[0.04] border border-amber/10 rounded-lg p-3 text-[11px] text-white/50 leading-relaxed">
          <strong className="text-amber">Methodology:</strong> {data.meta.methodology}
          <div className="mt-1 text-white/30">Windows: {data.meta.windowDays.join('d, ')}d rolling Pearson correlations | Events: {data.meta.eventWindowSize}</div>
        </div>
      )}

      {/* Strong callouts */}
      {strongCorrelations.length > 0 && (
        <div className="space-y-1.5">
          {strongCorrelations.map((c, i) => (
            <div key={i} className="flex items-start gap-2 bg-amber/[0.06] border border-amber/15 rounded-lg px-3 py-2">
              <AlertTriangle size={11} className="text-amber mt-0.5 shrink-0" />
              <span className="text-[10px] text-amber/80 leading-relaxed">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ HEATMAP GRID ═══ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-white/50 tracking-wider">CORRELATION MATRIX</span>
            <span className="text-[10px] font-mono text-white/25 bg-white/[0.04] px-1.5 py-0.5 rounded">PEARSON r</span>
          </div>
          <ColorScale />
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
          <table className="w-full text-[10px] font-mono border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-2.5 text-left text-white/40 font-normal w-[130px] border-b border-white/[0.06] bg-white/[0.02]">MARKET</th>
                <th className="px-2 py-2.5 text-center text-white/40 font-normal border-b border-white/[0.06] bg-white/[0.02]">LATEST</th>
                <th className="px-3 py-2.5 text-center border-b border-white/[0.06] bg-teal/[0.06]">
                  <span className="text-[10px] font-mono text-teal/70 tracking-wider">7 DAY</span>
                </th>
                <th className="px-3 py-2.5 text-center border-b border-white/[0.06] bg-teal/[0.04]">
                  <span className="text-[10px] font-mono text-teal/50 tracking-wider">30 DAY</span>
                </th>
                <th className="px-3 py-2.5 text-center border-b border-white/[0.06] bg-teal/[0.03]">
                  <span className="text-[10px] font-mono text-teal/40 tracking-wider">90 DAY</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.assets.map((asset, idx) => {
                const corr = data.correlations[asset.symbol] || {}
                const emoji = typeEmojis[asset.type] || '📊'
                return (
                  <tr key={asset.symbol} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${idx % 2 === 0 ? 'bg-white/[0.005]' : ''}`}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]">{emoji}</span>
                        <div>
                          <div className="text-white/80 font-medium text-[10px]">{marketLabels[asset.label] || asset.label}</div>
                          <div className="text-[10px] text-white/25 font-mono mt-0.5">{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-[11px] text-white/70 font-medium tabular-nums">
                        {asset.latest ? (asset.latest > 1000 ? asset.latest.toLocaleString('en-US', { maximumFractionDigits: 0 }) : asset.latest.toFixed(asset.latest < 10 ? 4 : 2)) : '—'}
                      </span>
                    </td>
                    <HeatmapCell result={corr['7d']} assetLabel={marketLabels[asset.label] || asset.label} window="7d" />
                    <HeatmapCell result={corr['30d']} assetLabel={marketLabels[asset.label] || asset.label} window="30d" />
                    <HeatmapCell result={corr['90d']} assetLabel={marketLabels[asset.label] || asset.label} window="90d" />
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excluded currencies */}
      {data.excludedAssets.length > 0 && (
        <div className="bg-white/[0.015] border border-white/[0.04] rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Shield size={10} className="text-white/30" />
            <span className="text-[10px] text-white/30 font-mono tracking-wider">EXCLUDED BY DESIGN</span>
          </div>
          <div className="space-y-1">
            {data.excludedAssets.map(a => (
              <div key={a.symbol} className="flex items-start gap-2 text-[11px] text-white/30">
                <span className="font-medium text-white/40 shrink-0">{a.label}</span>
                <span>— {a.exclusionReason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All callouts */}
      {data.callouts.length > strongCorrelations.length && (
        <div className="space-y-1.5">
          <div className="text-[10px] text-white/30 font-mono tracking-wider mb-1">ALL NOTABLE CORRELATIONS</div>
          {data.callouts.filter(c => c.strength !== 'strong').map((c, i) => (
            <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded bg-white/[0.01]">
              {c.strength === 'moderate' ? <TrendingUp size={9} className="text-teal/40 mt-0.5 shrink-0" /> : <Minus size={9} className="text-white/20 mt-0.5 shrink-0" />}
              <span className="text-[11px] text-white/40 leading-relaxed">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ME Event Timeline */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] text-white/30 font-mono tracking-wider">MIDDLE EAST EVENT TIMELINE</span>
          <span className="text-[10px] text-white/20 font-mono">({data.events.length} events)</span>
        </div>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {data.events.map((event, i) => {
            const isExpanded = expandedEvent === i
            const scoreColor = event.score < -0.3 ? '#EF4444' : event.score > 0.3 ? '#2DD4BF' : '#64748B'
            const scoreBg = event.score < -0.3 ? 'rgba(239,68,68,0.08)' : event.score > 0.3 ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.01)'
            return (
              <div key={i} className="rounded-lg border border-white/[0.04] cursor-pointer hover:border-white/[0.08] transition-all"
                style={{ backgroundColor: scoreBg }}
                onClick={() => setExpandedEvent(isExpanded ? null : i)}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-[10px] font-mono font-bold tabular-nums w-12 text-right" style={{ color: scoreColor }}>
                    {event.score > 0 ? '+' : ''}{event.score.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-white/70 leading-snug flex-1 line-clamp-1">{event.title}</span>
                  <span className="text-[10px] text-white/25 font-mono shrink-0">{event.date}</span>
                  {isExpanded ? <ChevronUp size={10} className="text-white/20" /> : <ChevronDown size={10} className="text-white/20" />}
                </div>
                {isExpanded && (
                  <div className="px-3 pb-2.5 pt-0.5 border-t border-white/[0.04]">
                    <div className="text-[11px] text-white/50 leading-relaxed">{event.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-white/25 font-mono">Source: {event.source}</span>
                      <span className="text-[10px] text-white/25 font-mono">Date: {event.date}</span>
                      <div className="flex-1" />
                      <span className="text-[11px] font-mono font-bold" style={{ color: scoreColor }}>
                        Tone: {event.score > 0 ? '+' : ''}{event.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
