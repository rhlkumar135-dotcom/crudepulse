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
  const [flashDir, setFlashDir] = useState<'up' | 'down' | null>(null)
  const [time, setTime] = useState(new Date())
  const [source, setSource] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const wtiRef = useRef<number | null>(null)
  const brentRef = useRef<number | null>(null)
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/market/prices')
      if (!res.ok) return
      const data: PriceResponse = await res.json()
      if (data.wti?.current && data.brent?.current) {
        setPrevWti(wtiRef.current)
        setPrevBrent(brentRef.current)

        const newWti = data.wti.current
        const newBrent = data.brent.current

        setWti(newWti)
        setBrent(newBrent)
        setSource(data.source || '')
        setIsConnected(true)

        if (wtiRef.current !== null && newWti !== wtiRef.current) {
          const dir = newWti > wtiRef.current ? 'up' : 'down'
          setFlashDir(dir)
          if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
          flashTimerRef.current = setTimeout(() => setFlashDir(null), 1200)
        }

        wtiRef.current = newWti
        brentRef.current = newBrent
      }
    } catch {
      setIsConnected(false)
    }
    setTime(new Date())
  }, [])

  useEffect(() => {
    fetchPrices()
    const iv = setInterval(fetchPrices, 5_000)
    return () => { clearInterval(iv); if (flashTimerRef.current) clearTimeout(flashTimerRef.current) }
  }, [fetchPrices])

  const wChg = wti && prevWti ? wti - prevWti : 0
  const bChg = brent && prevBrent ? brent - prevBrent : 0
  const spread = wti && brent ? +(brent - wti).toFixed(2) : null

  const barFlashStyle = flashDir === 'up'
    ? { backgroundColor: 'rgba(0, 255, 136, 0.08)', boxShadow: 'inset 0 0 30px rgba(0, 255, 136, 0.06)' }
    : flashDir === 'down'
    ? { backgroundColor: 'rgba(255, 51, 102, 0.08)', boxShadow: 'inset 0 0 30px rgba(255, 51, 102, 0.06)' }
    : {}

  return (
    <div
      className="h-9 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-[#2a2a3a] flex items-center px-5 gap-5 overflow-hidden transition-all duration-500"
      style={{ fontFamily: 'Share Tech Mono, monospace', ...barFlashStyle }}
    >
      {/* LIVE indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <Wifi size={10} className={`transition-colors duration-300 ${isConnected ? 'text-[#00ff88]' : 'text-red-500'}`} />
          {isConnected && (
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" style={{ animationDuration: '1.5s' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00ff88]" />
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#00ff88] tracking-[0.12em] font-bold">LIVE</span>
      </div>

      <div className="w-px h-4 bg-[#2a2a3a] shrink-0" />

      {/* WTI */}
      <div
        className="flex items-center gap-2 rounded px-2 py-0.5 transition-all duration-500"
        style={flashDir === 'up' ? { backgroundColor: 'rgba(0, 255, 136, 0.12)' } : flashDir === 'down' ? { backgroundColor: 'rgba(255, 51, 102, 0.12)' } : {}}
      >
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

      {/* BRENT */}
      <div
        className="flex items-center gap-2 rounded px-2 py-0.5 transition-all duration-500"
        style={flashDir === 'up' ? { backgroundColor: 'rgba(0, 212, 255, 0.12)' } : flashDir === 'down' ? { backgroundColor: 'rgba(255, 51, 102, 0.12)' } : {}}
      >
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

      {/* SPREAD */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#94A3B8] tracking-[0.12em]">SPREAD</span>
        <span className="text-[11px] font-bold text-[#e0e0e0]">{spread != null ? `$${spread}` : '--'}</span>
      </div>

      <div className="flex-1" />

      {/* Timestamp */}
      <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] shrink-0">
        <span className="live-dot" style={{ width: 5, height: 5 }} />
        <span className="tabular-nums">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        {source && <span className="text-[11px] text-[#94A3B8]/40 uppercase">{source}</span>}
      </div>
    </div>
  )
}
