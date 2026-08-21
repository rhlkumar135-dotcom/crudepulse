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
    const iv = setInterval(fetchPrices, 1000)
    return () => clearInterval(iv)
  }, [fetchPrices])

  const wChg = wti && prevWti ? wti - prevWti : 0
  const bChg = brent && prevBrent ? brent - prevBrent : 0
  const spread = wti && brent ? +(brent - wti).toFixed(2) : null

  return (
    <div className="h-8 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-[#2a2a3a] flex items-center px-4 gap-4 overflow-hidden"
      style={{ fontFamily: 'Share Tech Mono, monospace' }}>
      <div className="flex items-center gap-1.5 shrink-0">
        <Wifi size={9} className="text-[#00ff88]" />
        <span className="text-[8px] text-[#00ff88] tracking-[0.15em] font-bold">LIVE</span>
      </div>

      <div className="w-px h-4 bg-[#2a2a3a] shrink-0" />

      <div className="flex items-center gap-2">
        <span className="text-[8px] text-[#6b7280] tracking-[0.15em]">WTI</span>
        <span className="text-[#00ff88] font-bold text-[11px]">
          {wti != null ? <CountUp value={wti} decimals={2} prefix="$" /> : <span className="text-[#6b7280]">--</span>}
        </span>
        {wChg !== 0 && (
          <span className={`flex items-center gap-0.5 text-[8px] font-bold ${wChg > 0.005 ? 'text-[#00ff88]' : wChg < -0.005 ? 'text-[#ff3366]' : 'text-[#6b7280]'}`}>
            {wChg > 0.005 ? <TrendingUp size={8} /> : wChg < -0.005 ? <TrendingDown size={8} /> : <Minus size={8} />}
            {wChg > 0 ? '+' : ''}{wChg.toFixed(2)}
          </span>
        )}
      </div>

      <div className="w-px h-4 bg-[#2a2a3a] shrink-0" />

      <div className="flex items-center gap-2">
        <span className="text-[8px] text-[#6b7280] tracking-[0.15em]">BRENT</span>
        <span className="text-[#00d4ff] font-bold text-[11px]">
          {brent != null ? <CountUp value={brent} decimals={2} prefix="$" /> : <span className="text-[#6b7280]">--</span>}
        </span>
        {bChg !== 0 && (
          <span className={`flex items-center gap-0.5 text-[8px] font-bold ${bChg > 0.005 ? 'text-[#00ff88]' : bChg < -0.005 ? 'text-[#ff3366]' : 'text-[#6b7280]'}`}>
            {bChg > 0.005 ? <TrendingUp size={8} /> : bChg < -0.005 ? <TrendingDown size={8} /> : <Minus size={8} />}
            {bChg > 0 ? '+' : ''}{bChg.toFixed(2)}
          </span>
        )}
      </div>

      <div className="w-px h-4 bg-[#2a2a3a] shrink-0" />

      <div className="flex items-center gap-1.5">
        <span className="text-[8px] text-[#6b7280] tracking-[0.15em]">SPREAD</span>
        <span className="text-[10px] font-bold text-[#e0e0e0]">{spread != null ? `$${spread}` : '--'}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-[8px] text-[#6b7280] shrink-0">
        <span className="live-dot" style={{ width: 5, height: 5 }} />
        <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        {source && <span className="text-[7px] text-[#6b7280]/40 uppercase">{source}</span>}
      </div>
    </div>
  )
}
