import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { oilFields, type OilField } from '@/lib/mock-data/fields'
import { CountUp } from '../CountUp'

const metrics = ['production', 'reserves', 'breakeven', 'rpRatio', 'apiGravity'] as const
const metricLabels: Record<string, string> = {
  production: 'Prod.', reserves: 'Reserves', breakeven: 'B/E', rpRatio: 'R/P', apiGravity: 'API°',
}

function normalizeField(f: OilField) {
  return metrics.map(m => {
    const vals = oilFields.map(ff => ff[m])
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    return { metric: metricLabels[m], value: +(max > min ? ((f[m] - min) / (max - min)) * 100 : 50).toFixed(1), raw: f[m] }
  })
}

export function FieldScorecard() {
  const [selected, setSelected] = useState<OilField>(oilFields[0])
  const radarData = normalizeField(selected)
  const [sortKey, setSortKey] = useState<'production' | 'reserves' | 'rpRatio'>('production')
  const sortedFields = [...oilFields].sort((a, b) => b[sortKey] - a[sortKey])

  const statusConfig: Record<string, { color: string; bg: string }> = {
    producing: { color: '#22C55E', bg: '#22C55E10' },
    mature: { color: '#F5A623', bg: '#F5A62310' },
    declining: { color: '#EF4444', bg: '#EF444410' },
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Radar */}
        <div className="h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#141A22" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8, fill: '#6B7A90' }} />
              <Radar name={selected.name} dataKey="value" stroke="#F5A623" fill="#F5A623" fillOpacity={0.12} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Field selector + key stats */}
        <div>
          <div className="text-[8px] font-mono text-text-dim tracking-wider mb-1.5">SELECT FIELD</div>
          <div className="space-y-0.5 max-h-[100px] overflow-y-auto mb-2">
            {oilFields.map(f => {
              const cfg = statusConfig[f.status]
              return (
                <button
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className={`w-full text-left px-2 py-1 rounded text-[10px] font-mono transition-colors flex items-center justify-between ${
                    selected.id === f.id
                      ? 'bg-amber/[0.06] text-amber border border-amber/15'
                      : 'text-text-dim hover:text-text hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <span>{f.name}</span>
                  <span className="text-[7px] px-1 py-0.5 rounded" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{f.status}</span>
                </button>
              )
            })}
          </div>

          {/* Selected field stats */}
          <div className="grid grid-cols-3 gap-1.5">
            <MiniStat label="PROD." value={`${selected.production}`} unit="kbd" color="text-amber" />
            <MiniStat label="RESERVES" value={`${(selected.reserves / 1000).toFixed(0)}B`} unit="bbl" color="text-teal" />
            <MiniStat label="B/E" value={`$${selected.breakeven}`} unit="/bbl" color="text-text" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div>
        <div className="text-[8px] font-mono text-text-dim tracking-wider mb-1">COMPARISON</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[9px] font-mono">
            <thead>
              <tr className="text-text-dim/60 border-b border-white/[0.06]">
                <th className="text-left py-1 px-1 font-medium">Field</th>
                <th className="text-left py-1 px-1 font-medium">Status</th>
                <th className="text-right py-1 px-1 font-medium cursor-pointer hover:text-text" onClick={() => setSortKey('production')}>
                  Prod. {sortKey === 'production' ? '▼' : ''}
                </th>
                <th className="text-right py-1 px-1 font-medium cursor-pointer hover:text-text" onClick={() => setSortKey('reserves')}>
                  Res. {sortKey === 'reserves' ? '▼' : ''}
                </th>
                <th className="text-right py-1 px-1 font-medium">B/E</th>
                <th className="text-right py-1 px-1 font-medium cursor-pointer hover:text-text" onClick={() => setSortKey('rpRatio')}>
                  R/P {sortKey === 'rpRatio' ? '▼' : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedFields.map(f => {
                const cfg = statusConfig[f.status]
                return (
                  <tr
                    key={f.id}
                    onClick={() => setSelected(f)}
                    className={`cursor-pointer transition-colors border-b border-white/[0.03] ${
                      selected.id === f.id ? 'bg-amber/[0.04]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-1 px-1 text-text">{f.name}</td>
                    <td className="py-1 px-1">
                      <span className="text-[7px] px-1 py-0.5 rounded" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{f.status}</span>
                    </td>
                    <td className="text-right py-1 px-1 text-amber tabular-nums">{f.production.toLocaleString()}</td>
                    <td className="text-right py-1 px-1 text-teal tabular-nums">{(f.reserves / 1000).toFixed(1)}B</td>
                    <td className="text-right py-1 px-1 text-text tabular-nums">${f.breakeven}</td>
                    <td className="text-right py-1 px-1 text-text tabular-nums">{f.rpRatio}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.03]">
      <div className="text-[7px] text-text-dim/50 font-mono tracking-wider">{label}</div>
      <div className={`text-[11px] font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[7px] text-text-dim/40 font-mono">{unit}</div>
    </div>
  )
}
