import { useEffect, useState, useCallback, useRef } from 'react'
import { TrendingUp, TrendingDown, Minus, Wifi } from 'lucide-react'
import { CountUp } from './CountUp'

interface PriceResponse {
  wti?: { current: number }
  brent?: { current: number }
  spread?: number
  source?: string
  stale?: boolean
}

export function TickerBar() {
  const [wti, setWti] = useState<number | null>(null)
  const [brent, setBrent] = useState<number | null>(null)
  const [prevWti, setPrevWti] = useState<number | null>(null)
  const [prevBrent, setPrevBrent] = useState<number | null>(null)
  const [time, setTime] = useState(new Date())
  const [source, setSource] = useState('')
  const wtiRef = useRef<number | null>(null)
  const brentRef = useRef<number | null>(null)

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/market/prices')
      if (!res.ok) return
      const data: PriceResponse = await res.json()
      if (data.wti?.current && data.brent?.current) {
        setPrevWti(wtiRef.current)
        setPrevBrent(brentRef.current)
        setWti(data.wti.current)
        setBrent(data.brent.current)
        wtiRef.current = data.wti.current
        brentRef.current = data.brent.current
        setSource(data.source || '')
      }
    } catch { /* ignore */ }
    setTime(new Date())
  }, [])

  useEffect(() => {
    fetchPrices()
    const iv = setInterval(fetchPrices, 10_000)
    return () => clearInterval(iv)
  }, [fetchPrices])

  const wChg = wti && prevWti ? wti - prevWti : 0
  const bChg = brent && prevBrent ? brent - prevBrent : 0
  const spread = wti && brent ? +(brent - wti).toFixed(2) : null

  return (
    <div className="h-9 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-[#2a2a3a] flex items-center px-5 gap-5 overflow-hidden"
      style={{ fontFamily: 'Share Tech Mono, monospace' }}>
      <div className="flex items-center gap-2 shrink-0">
        <Wifi size={10} className="text-[#00ff88]" />
        <span className="text-[11px] text-[#00ff88] tracking-[0.12em] font-bold">LIVE</span>
      </div>

      <div className="w-px h-4 bg-[#2a2a3a] shrink-0" />

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#94A3B8] tracking-[0.12em]">WTI</span>
        <span className="text-[#00ff88] font-bold text-xs">
          {wti != null ? <CountUp value={wti} decimals={2} prefix="$" /> : <span className="text-[#94A3B8]">--</span>}
        </span>
        {wChg !== 0 && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${wChg > 0.005 ? 'text-[#00ff88]' : wChg < -0.005 ? 'text-[#ff3366]' : 'text-[#94A3B8]'}`}>
            {wChg > 0.005 ? <TrendingUp size={9} /> : wChg < -0.005 ? <TrendingDown size={9} /> : <Minus size={9} />}
            {wChg > 0 ? '+' : ''}{wChg.toFixed(2)}
          </span>
        )}
      </div>

      <div className="w-px h-4 bg-[#2a2a3a] shrink-0" />

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#94A3B8] tracking-[0.12em]">BRENT</span>
        <span className="text-[#00d4ff] font-bold text-xs">
          {brent != null ? <CountUp value={brent} decimals={2} prefix="$" /> : <span className="text-[#94A3B8]">--</span>}
        </span>
        {bChg !== 0 && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${bChg > 0.005 ? 'text-[#00ff88]' : bChg < -0.005 ? 'text-[#ff3366]' : 'text-[#94A3B8]'}`}>
            {bChg > 0.005 ? <TrendingUp size={9} /> : bChg < -0.005 ? <TrendingDown size={9} /> : <Minus size={9} />}
            {bChg > 0 ? '+' : ''}{bChg.toFixed(2)}
          </span>
        )}
      </div>

      <div className="w-px h-4 bg-[#2a2a3a] shrink-0" />

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#94A3B8] tracking-[0.12em]">SPREAD</span>
        <span className="text-[11px] font-bold text-[#e0e0e0]">{spread != null ? `$${spread}` : '--'}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] shrink-0">
        <span className="live-dot" style={{ width: 5, height: 5 }} />
        <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        {source && <span className="text-[11px] text-[#94A3B8]/40 uppercase">{source}</span>}
      </div>
    </div>
  )
}
