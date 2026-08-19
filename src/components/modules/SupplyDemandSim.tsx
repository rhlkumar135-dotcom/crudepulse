import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { RotateCcw } from 'lucide-react'
import { CountUp } from '../CountUp'

interface Scenario {
  opecCut: number; demandGrowth: number; usProduction: number; chinaDemand: number; weatherRisk: number
}

const baseline = {
  worldSupply: 102.8, worldDemand: 103.2,
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

function generateBalance(scenario: Scenario) {
  return baseline.months.map((month, i) => {
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * 0.8
    const opecEffect = -scenario.opecCut * (i > 2 ? 1 : i / 3)
    const demandEffect = scenario.demandGrowth * (i / 12) * 2
    const usEffect = scenario.usProduction
    const chinaEffect = scenario.chinaDemand * (i / 12)
    const weatherEffect = scenario.weatherRisk * 0.15
    const supply = baseline.worldSupply + opecEffect + usEffect - weatherEffect + seasonal * 0.2
    const demand = baseline.worldDemand + demandEffect + chinaEffect + seasonal * 0.15
    return { month, supply: +supply.toFixed(1), demand: +demand.toFixed(1), balance: +(supply - demand).toFixed(2) }
  })
}

const sliders: { key: keyof Scenario; label: string; min: number; max: number; step: number; unit: string; color: string }[] = [
  { key: 'opecCut', label: 'OPEC+ Cut', min: -2, max: 3, step: 0.5, unit: 'M bbl/d', color: '#F5A623' },
  { key: 'demandGrowth', label: 'Demand Δ', min: -1, max: 2, step: 0.1, unit: 'M bbl/d', color: '#2DD4BF' },
  { key: 'usProduction', label: 'US Output', min: -1, max: 1.5, step: 0.1, unit: 'M bbl/d', color: '#38BDF8' },
  { key: 'chinaDemand', label: 'China Δ', min: -1.5, max: 1.5, step: 0.1, unit: 'M bbl/d', color: '#EF4444' },
  { key: 'weatherRisk', label: 'Weather', min: 0, max: 2, step: 0.2, unit: 'M bbl/d', color: '#A78BFA' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/30">
      <div className="text-[8px] text-text-dim font-mono mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[9px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.stroke }} />
          <span className="text-text-dim">{p.name}</span>
          <span className="font-medium text-text-bright">{p.value}M</span>
        </div>
      ))}
    </div>
  )
}

export function SupplyDemandSim() {
  const [scenario, setScenario] = useState<Scenario>({
    opecCut: 0, demandGrowth: 0, usProduction: 0, chinaDemand: 0, weatherRisk: 0,
  })

  const data = useMemo(() => generateBalance(scenario), [scenario])
  const avgBalance = data.reduce((s, d) => s + d.balance, 0) / data.length
  const yearEnd = data[11].balance

  const update = (key: keyof Scenario, val: number) => setScenario(prev => ({ ...prev, [key]: val }))
  const reset = () => setScenario({ opecCut: 0, demandGrowth: 0, usProduction: 0, chinaDemand: 0, weatherRisk: 0 })

  const hasChanges = Object.values(scenario).some(v => v !== 0)

  return (
    <div className="space-y-3">
      {/* KPI row */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg flex-1 ${avgBalance >= 0 ? 'bg-teal/[0.04] border border-teal/10' : 'bg-red/[0.04] border border-red/10'}`}>
          <div className="text-[7px] text-text-dim/50 font-mono tracking-wider">AVG BALANCE</div>
          <div className={`text-base font-bold font-mono tabular-nums ${avgBalance >= 0 ? 'text-teal' : 'text-red'}`}>
            <CountUp value={avgBalance} decimals={2} prefix={avgBalance >= 0 ? '+' : ''} suffix="M" />
          </div>
        </div>
        <div className={`p-2 rounded-lg flex-1 ${yearEnd >= 0 ? 'bg-teal/[0.04] border border-teal/10' : 'bg-red/[0.04] border border-red/10'}`}>
          <div className="text-[7px] text-text-dim/50 font-mono tracking-wider">YEAR-END</div>
          <div className={`text-base font-bold font-mono tabular-nums ${yearEnd >= 0 ? 'text-teal' : 'text-red'}`}>
            <CountUp value={yearEnd} decimals={2} prefix={yearEnd >= 0 ? '+' : ''} suffix="M" />
          </div>
        </div>
        {hasChanges && (
          <button onClick={reset} className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors" title="Reset scenario">
            <RotateCcw size={11} className="text-text-dim" />
          </button>
        )}
      </div>

      {/* Sliders */}
      <div className="space-y-1.5">
        {sliders.map(s => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="text-[8px] text-text-dim/60 font-mono w-[60px] shrink-0">{s.label}</span>
            <input
              type="range" min={s.min} max={s.max} step={s.step} value={scenario[s.key]}
              onChange={e => update(s.key, +e.target.value)}
              className="flex-1"
              style={{ accentColor: s.color }}
            />
            <span className="text-[9px] font-mono w-[48px] text-right tabular-nums" style={{ color: scenario[s.key] !== 0 ? s.color : '#475569' }}>
              {scenario[s.key] >= 0 ? '+' : ''}{scenario[s.key]}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="simSupply" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="simDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} stroke="#141A22" />
            <YAxis tick={{ fontSize: 8 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={30} stroke="#141A22" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={baseline.worldSupply} stroke="#2DD4BF30" strokeDasharray="2 2" />
            <ReferenceLine y={baseline.worldDemand} stroke="#EF444430" strokeDasharray="2 2" />
            <Area type="monotone" dataKey="supply" stroke="#2DD4BF" fill="url(#simSupply)" strokeWidth={1.5} dot={false} name="Supply" />
            <Area type="monotone" dataKey="demand" stroke="#EF4444" fill="url(#simDemand)" strokeWidth={1.5} dot={false} name="Demand" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
