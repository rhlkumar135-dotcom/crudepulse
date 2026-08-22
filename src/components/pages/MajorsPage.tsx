import { useEffect, useRef, useState } from 'react'
import { Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface OilMajor {
  ticker: string
  name: string
  marketCap: string
  upstreamRevenue: number | string
  downstreamRevenue: number | string
  earnings: number | string
  stockPrice: number
}

function parseDollars(v: number | string): number {
  if (typeof v === 'number') return v
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

interface MajorsResponse {
  majors: OilMajor[]
  lastUpdated: string
}

function FlashPrice({ price, change }: { price: number; change: number }) {
  const prevRef = useRef(price)
  const elRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (price !== prevRef.current && elRef.current) {
      const cls = price > prevRef.current ? 'text-[#00ff88]' : 'text-[#ff3366]'
      elRef.current.classList.add(cls)
      const t = setTimeout(() => elRef.current?.classList.remove(cls), 600)
      prevRef.current = price
      return () => clearTimeout(t)
    }
  }, [price])

  return (
    <span ref={elRef} className="transition-colors duration-600 text-sm font-bold text-white"
      style={{ fontFamily: 'Orbitron, monospace' }}>
      ${price.toFixed(2)}
    </span>
  )
}

function RevBar({ upPct }: { upPct: number }) {
  const downPct = 100 - upPct
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
        <span>Upstream {upPct.toFixed(0)}%</span>
        <span>Downstream {downPct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden flex">
        <div className="h-full transition-all duration-700" style={{ width: `${upPct}%`, backgroundColor: '#00ff88' }} />
        <div className="h-full flex-1" style={{ backgroundColor: '#00d4ff' }} />
      </div>
    </div>
  )
}

export function MajorsPage() {
  const { data, loading } = useMarketData<MajorsResponse>('/api/market/majors', 'free', 30_000)
  const majors = data?.majors ?? []
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily')

  if (loading && !majors.length) {
    return (
      <PageLayout title="Oil Majors Financial Snapshot" subtitle="Stock price · Market cap · Revenue split">
        <div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading majors data…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Oil Majors Financial Snapshot" subtitle="Stock price · Market cap · Revenue split" lastUpdated={data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : undefined}>
      <div className="space-y-4">
        <ModuleCard icon={Building2} color="#00ff88" title="Oil Majors" cadence={viewMode.toUpperCase()} tag="PRICE · WEEKLY · FILINGS">
          {/* Daily / Weekly Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-[#94A3B8] font-mono tracking-wider">VIEW:</span>
            {(['daily', 'weekly'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={cn('px-3 py-1 text-[10px] font-bold rounded transition-all border',
                  viewMode === mode
                    ? 'bg-[#00ff88]/15 text-[#00ff88] border-[#00ff88]/30'
                    : 'text-[#94A3B8] border-white/[0.06] hover:text-white hover:border-white/10'
                )} style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {mode.toUpperCase()}
              </button>
            ))}
            {data?.lastUpdated && (
              <span className="ml-auto text-[9px] text-[#94A3B8]/50 font-mono">Updated: {new Date(data.lastUpdated).toLocaleString()}</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2">
            {majors.map(m => (
              <div key={m.ticker} className="bg-[#0d1117] border border-white/[0.05] rounded p-4 space-y-3 hover:border-[#00ff88]/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{m.name}</div>
                    <div className="text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {m.ticker}
                    </div>
                  </div>
                  <div className="text-right">
                    <FlashPrice price={m.stockPrice} change={0} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Mkt Cap', value: m.marketCap },
                    { label: 'Earnings', value: `$${parseDollars(m.earnings)}B` },
                    { label: 'Revenue', value: `$${(parseDollars(m.upstreamRevenue) + parseDollars(m.downstreamRevenue)).toFixed(0)}B` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-black/30 rounded p-1.5">
                      <div className="text-[8px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{label}</div>
                      <div className="text-[11px] font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{value}</div>
                    </div>
                  ))}
                </div>

                <RevBar upPct={parseDollars(m.upstreamRevenue) + parseDollars(m.downstreamRevenue) > 0 ? (parseDollars(m.upstreamRevenue) / (parseDollars(m.upstreamRevenue) + parseDollars(m.downstreamRevenue))) * 100 : 50} />
              </div>
            ))}
          </div>
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            SEC EDGAR filings · Yahoo Finance market data · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
