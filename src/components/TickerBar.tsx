import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Wifi } from 'lucide-react'
import { CountUp } from './CountUp'
import { currentWTI, currentBrent } from '@/lib/mock-data/prices'

export function TickerBar() {
  const [wti, setWti] = useState(currentWTI)
  const [brent, setBrent] = useState(currentBrent)
  const [prevWti, setPrevWti] = useState(currentWTI)
  const [prevBrent, setPrevBrent] = useState(currentBrent)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const iv = setInterval(() => {
      setPrevWti(wti)
      setPrevBrent(brent)
      setWti(+(wti + (Math.random() - 0.5) * 0.15).toFixed(2))
      setBrent(+(brent + (Math.random() - 0.5) * 0.15).toFixed(2))
      setTime(new Date())
    }, 3000)
    return () => clearInterval(iv)
  }, [wti, brent])

  const wChg = wti - prevWti
  const bChg = brent - prevBrent
  const spread = +(brent - wti).toFixed(2)

  return (
    <div className="h-9 bg-bg-card/80 backdrop-blur-sm border-b border-border flex items-center px-4 gap-5 text-sm font-mono overflow-hidden">
      {/* Brand */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Wifi size={10} className="text-green-500" />
        <span className="text-[9px] text-green-400 tracking-wider font-semibold">LIVE</span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* WTI */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-muted tracking-wider">WTI</span>
        <span className="text-amber font-semibold text-sm">
          <CountUp value={wti} decimals={2} prefix="$" />
        </span>
        <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${wChg > 0.005 ? 'text-teal' : wChg < -0.005 ? 'text-red' : 'text-muted'}`}>
          {wChg > 0.005 ? <TrendingUp size={9} /> : wChg < -0.005 ? <TrendingDown size={9} /> : <Minus size={9} />}
          {wChg > 0 ? '+' : ''}{wChg.toFixed(2)}
        </span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Brent */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-muted tracking-wider">BRENT</span>
        <span className="text-teal font-semibold text-sm">
          <CountUp value={brent} decimals={2} prefix="$" />
        </span>
        <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${bChg > 0.005 ? 'text-teal' : bChg < -0.005 ? 'text-red' : 'text-muted'}`}>
          {bChg > 0.005 ? <TrendingUp size={9} /> : bChg < -0.005 ? <TrendingDown size={9} /> : <Minus size={9} />}
          {bChg > 0 ? '+' : ''}{bChg.toFixed(2)}
        </span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Spread */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-muted tracking-wider">SPREAD</span>
        <span className="text-[11px] font-semibold">${spread}</span>
      </div>

      <div className="flex-1" />

      {/* Time */}
      <div className="flex items-center gap-2 text-[9px] text-muted shrink-0">
        <span className="live-dot" />
        <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
    </div>
  )
}
