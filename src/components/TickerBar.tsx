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
      const res = await fetch('/api/market/prices?tier=pro')
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
    } catch {}
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
    <div className="h-9 bg-bg-card/80 backdrop-blur-sm border-b border-border flex items-center px-4 gap-5 text-sm font-mono overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0">
        <Wifi size={10} className="text-green-500" />
        <span className="text-[9px] text-green-400 tracking-wider font-semibold">LIVE</span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <div className="flex items-center gap-2">
        <span className="text-[9px] text-muted tracking-wider">WTI</span>
        <span className="text-amber font-semibold text-sm">
          {wti != null ? <CountUp value={wti} decimals={2} prefix="$" /> : <span className="text-muted">--</span>}
        </span>
        {wChg !== 0 && (
          <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${wChg > 0.005 ? 'text-teal' : wChg < -0.005 ? 'text-red' : 'text-muted'}`}>
            {wChg > 0.005 ? <TrendingUp size={9} /> : wChg < -0.005 ? <TrendingDown size={9} /> : <Minus size={9} />}
            {wChg > 0 ? '+' : ''}{wChg.toFixed(2)}
          </span>
        )}
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <div className="flex items-center gap-2">
        <span className="text-[9px] text-muted tracking-wider">BRENT</span>
        <span className="text-teal font-semibold text-sm">
          {brent != null ? <CountUp value={brent} decimals={2} prefix="$" /> : <span className="text-muted">--</span>}
        </span>
        {bChg !== 0 && (
          <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${bChg > 0.005 ? 'text-teal' : bChg < -0.005 ? 'text-red' : 'text-muted'}`}>
            {bChg > 0.005 ? <TrendingUp size={9} /> : bChg < -0.005 ? <TrendingDown size={9} /> : <Minus size={9} />}
            {bChg > 0 ? '+' : ''}{bChg.toFixed(2)}
          </span>
        )}
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-muted tracking-wider">SPREAD</span>
        <span className="text-[11px] font-semibold">{spread != null ? `$${spread}` : '--'}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-[9px] text-muted shrink-0">
        <span className="live-dot" />
        <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        {source && <span className="text-[7px] text-muted/40 uppercase">{source}</span>}
      </div>
    </div>
  )
}
