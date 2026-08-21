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

function corrColor(r: number): string {
  const abs = Math.abs(r)
  if (r > 0.6) return 'bg-teal/80 text-black'
  if (r > 0.3) return 'bg-teal/40 text-teal'
  if (r > -0.3) return 'bg-white/5 text-text-dim'
  if (r > -0.6) return 'bg-amber/40 text-amber'
  return 'bg-red/60 text-red'
}

function corrLabel(r: number): string {
  const abs = Math.abs(r)
  if (abs >= 0.7) return 'Strong'
  if (abs >= 0.4) return 'Moderate'
  if (abs >= 0.2) return 'Weak'
  return 'None'
}

function CorrelationCell({ result, window }: { result: CorrelationResult | null; window: string }) {
  if (!result || result.n < 3) {
    return (
      <td className="px-2 py-2 text-center">
        <span className="text-[9px] text-text-dim/30 font-mono">n/a</span>
      </td>
    )
  }
  const insufficient = result.n < 10
  return (
    <td className="px-2 py-2 text-center">
      <div className={`inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded ${corrColor(result.r)} ${insufficient ? 'opacity-40' : ''}`}>
        <span className="text-[11px] font-mono font-bold tabular-nums">{result.r > 0 ? '+' : ''}{result.r.toFixed(2)}</span>
        <span className="text-[7px] opacity-60 font-mono">n={result.n}</span>
      </div>
      {insufficient && <div className="text-[7px] text-amber/50 mt-0.5">insufficient data</div>}
    </td>
  )
}

export function MiddleEastCorrelation() {
  const { data } = useMarketData<CorrelationResponse>('/api/market/correlation', 'pro', 60000)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const [showMethodology, setShowMethodology] = useState(false)
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null)

  const strongCorrelations = useMemo(() => {
    if (!data) return []
    return data.callouts.filter(c => c.strength === 'strong')
  }, [data])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[400px] text-text-dim text-[11px] font-mono">
        <div className="text-center space-y-2">
          <div className="animate-pulse">Loading correlation engine...</div>
          <div className="text-[9px] opacity-50">Fetching 9 market series + ME events</div>
        </div>
      </div>
    )
  }

  const marketLabels: Record<string, string> = {
    'CL=F': 'WTI Crude', 'BZ=F': 'Brent Crude',
    'EURUSD=X': 'EUR/USD', 'EGPUSD=X': 'EGP/USD',
    'TRY=X': 'TRY/USD (Lira)', 'DX-Y.NYB': 'USD Index',
    '^GSPC': 'S&P 500', '^FTSE': 'FTSE 100', '^N225': 'Nikkei 225',
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-amber" />
          <span className="text-[11px] font-mono tracking-wider text-text-bright font-semibold">MIDDLE EAST ↔ GLOBAL MARKETS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-text-dim font-mono">{data.eventCount} ME events</span>
          <button onClick={() => setShowMethodology(!showMethodology)} className="text-text-dim hover:text-amber transition-colors">
            <Info size={12} />
          </button>
        </div>
      </div>

      {/* Methodology tooltip */}
      {showMethodology && (
        <div className="bg-amber/[0.04] border border-amber/10 rounded-lg p-3 text-[9px] text-text-dim leading-relaxed">
          <strong className="text-amber">Methodology:</strong> {data.meta.methodology}
          <div className="mt-1 text-text-dim/50">Windows: {data.meta.windowDays.join('d, ')}d rolling Pearson correlations | Events: {data.meta.eventWindowSize}</div>
        </div>
      )}

      {/* Callouts */}
      {strongCorrelations.length > 0 && (
        <div className="space-y-1.5">
          {strongCorrelations.map((c, i) => (
            <div key={i} className="flex items-start gap-2 bg-amber/[0.04] border border-amber/10 rounded-lg px-3 py-2">
              <AlertTriangle size={11} className="text-amber mt-0.5 shrink-0" />
              <span className="text-[10px] text-amber/80 leading-relaxed">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Correlation Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-2 text-left text-text-dim font-normal w-[140px]">MARKET</th>
              <th className="px-2 py-2 text-center text-text-dim font-normal">LATEST</th>
              <th className="px-2 py-2 text-center text-text-dim font-normal">7d</th>
              <th className="px-2 py-2 text-center text-text-dim font-normal">30d</th>
              <th className="px-2 py-2 text-center text-text-dim font-normal">90d</th>
            </tr>
          </thead>
          <tbody>
            {data.assets.map(asset => {
              const corr = data.correlations[asset.symbol] || {}
              const typeLabel = asset.type === 'oil' ? '🛢' : asset.type === 'currency' ? '💱' : '📈'
              return (
                <tr key={asset.symbol} className="border-b border-border/50 hover:bg-white/[0.02]">
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px]">{typeLabel}</span>
                      <span className="text-text font-medium">{marketLabels[asset.label] || asset.label}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className="text-[10px] text-text-bright font-medium tabular-nums">
                      {asset.latest ? (asset.latest > 1000 ? asset.latest.toLocaleString('en-US', { maximumFractionDigits: 0 }) : asset.latest.toFixed(asset.latest < 10 ? 4 : 2)) : '—'}
                    </span>
                  </td>
                  <CorrelationCell result={corr['7d']} window="7d" />
                  <CorrelationCell result={corr['30d']} window="30d" />
                  <CorrelationCell result={corr['90d']} window="90d" />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Excluded currencies notice (FR-31) */}
      {data.excludedAssets.length > 0 && (
        <div className="bg-white/[0.02] border border-border/50 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Shield size={10} className="text-text-dim/40" />
            <span className="text-[8px] text-text-dim/60 font-mono tracking-wider">EXCLUDED BY DESIGN</span>
          </div>
          <div className="space-y-1">
            {data.excludedAssets.map(a => (
              <div key={a.symbol} className="flex items-start gap-2 text-[9px] text-text-dim/50">
                <span className="font-medium text-text-dim/70 shrink-0">{a.label}</span>
                <span>— {a.exclusionReason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All callouts */}
      {data.callouts.length > strongCorrelations.length && (
        <div className="space-y-1.5">
          <div className="text-[8px] text-text-dim/40 font-mono tracking-wider mb-1">ALL NOTABLE CORRELATIONS</div>
          {data.callouts.filter(c => c.strength !== 'strong').map((c, i) => (
            <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded bg-white/[0.01]">
              {c.strength === 'moderate' ? <TrendingUp size={9} className="text-teal/60 mt-0.5 shrink-0" /> : <Minus size={9} className="text-text-dim/30 mt-0.5 shrink-0" />}
              <span className="text-[9px] text-text-dim/60 leading-relaxed">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ME Event Timeline */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[8px] text-text-dim/40 font-mono tracking-wider">MIDDLE EAST EVENT TIMELINE</span>
          <span className="text-[7px] text-text-dim/30 font-mono">({data.events.length} events)</span>
        </div>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {data.events.map((event, i) => {
            const isExpanded = expandedEvent === i
            const scoreColor = event.score < -0.3 ? 'text-red' : event.score > 0.3 ? 'text-teal' : 'text-text-dim'
            const scoreBg = event.score < -0.3 ? 'bg-red/10' : event.score > 0.3 ? 'bg-teal/10' : 'bg-white/[0.02]'
            return (
              <div key={i} className={`rounded-lg border border-border/30 ${scoreBg} cursor-pointer hover:border-border/60 transition-all`}
                onClick={() => setExpandedEvent(isExpanded ? null : i)}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className={`text-[10px] font-mono font-bold tabular-nums w-12 text-right ${scoreColor}`}>
                    {event.score > 0 ? '+' : ''}{event.score.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-text leading-snug flex-1 line-clamp-1">{event.title}</span>
                  <span className="text-[7px] text-text-dim/40 font-mono shrink-0">{event.date}</span>
                  {isExpanded ? <ChevronUp size={10} className="text-text-dim/30" /> : <ChevronDown size={10} className="text-text-dim/30" />}
                </div>
                {isExpanded && (
                  <div className="px-3 pb-2.5 pt-0.5 border-t border-border/20">
                    <div className="text-[9px] text-text-dim leading-relaxed">{event.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-text-dim/40 font-mono">Source: {event.source}</span>
                      <span className="text-[8px] text-text-dim/40 font-mono">Date: {event.date}</span>
                      <div className="flex-1" />
                      <span className={`text-[9px] font-mono font-bold ${scoreColor}`}>
                        Tone score: {event.score > 0 ? '+' : ''}{event.score.toFixed(2)}
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
