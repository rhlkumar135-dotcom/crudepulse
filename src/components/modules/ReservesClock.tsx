import { useMarketData } from '@/lib/useMarketData'
import { CountUp } from '../CountUp'

interface ReserveData { country: string; code: string; reserves: number; production: number; rpRatio: number; flag: string }

export function ReservesClock() {
  const { data, loading } = useMarketData<{ countries: ReserveData[] }>('/api/market/reserves')
  const reservesData = data?.countries || []
  const maxRp = Math.max(...reservesData.map(r => r.rpRatio), 1)

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-1">
        {[
          { label: '>50 yrs', color: '#2DD4BF' },
          { label: '25-50 yrs', color: '#F5A623' },
          { label: '<25 yrs', color: '#EF4444' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-text-dim font-mono">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {reservesData.slice(0, 8).map(country => {
          const normalizedRp = country.rpRatio / maxRp
          const color = country.rpRatio > 50 ? '#2DD4BF' : country.rpRatio > 25 ? '#F5A623' : '#EF4444'
          const circumference = 2 * Math.PI * 32
          const dashoffset = circumference * (1 - normalizedRp * 0.75)
          const isHigh = country.rpRatio > 50

          return (
            <div key={country.code} className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
              isHigh ? 'bg-teal/[0.03] border-teal/8 hover:border-teal/15' : 'bg-white/[0.015] border-transparent hover:bg-white/[0.03]'
            }`}>
              <div className="relative w-[68px] h-[68px] shrink-0">
                <svg viewBox="0 0 68 68" className="w-full h-full -rotate-90">
                  <circle cx="34" cy="34" r="32" fill="none" stroke="#141A22" strokeWidth="3.5" />
                  <circle
                    cx="34" cy="34" r="32"
                    fill="none"
                    stroke={color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    className="transition-all duration-1000"
                    style={{ filter: `drop-shadow(0 0 3px ${color}30)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold font-mono tabular-nums" style={{ color }}>
                    <CountUp value={country.rpRatio} decimals={0} />
                  </span>
                  <span className="text-[10px] text-text-dim/60 font-mono">yrs</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-text truncate">{country.flag} {country.country}</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
                  <div className="text-[10px] text-text-dim/50 font-mono">Reserves</div>
                  <div className="text-[11px] text-amber font-mono font-medium text-right">{(country.reserves / 1000).toFixed(0)}B bbl</div>
                  <div className="text-[10px] text-text-dim/50 font-mono">Output</div>
                  <div className="text-[11px] text-text font-mono text-right">{(country.production).toLocaleString()} kbd</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
