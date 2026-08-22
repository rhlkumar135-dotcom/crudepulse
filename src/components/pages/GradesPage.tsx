import { useState } from 'react'
import { Droplets, CheckSquare, Square } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface CrudeGrade {
  name: string
  apiGravity: number
  sulfurContent: number
  classification: string | { density: string; sweetness: string }
  origin: string
  benchmark: string
  typicalPrice: number
}

function formatClassification(c: string | { density: string; sweetness: string }): string {
  if (typeof c === 'string') return c
  return `${c.density} ${c.sweetness}`
}

interface GradesResponse {
  grades: CrudeGrade[]
  benchmarkPrices: { wti: number; brent: number; spread: number }
  lastUpdated: string
}

const CLASSIFICATION_COLOR: Record<string, string> = {
  'Light Sweet': '#00ff88',
  'Light Sour': '#F5A623',
  'Medium Sour': '#ff9500',
  'Heavy Sour': '#ff3366',
  'Heavy Sweet': '#00d4ff',
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }} />
    </div>
  )
}

export function GradesPage() {
  const { data, loading } = useMarketData<GradesResponse>('/api/market/grades', 'free', 30_000)
  const [selected, setSelected] = useState<string[]>([])

  const grades = data?.grades ?? []
  const compareMode = selected.length > 0
  const compareGrades = grades.filter(g => selected.includes(g.name))

  function toggleSelect(name: string) {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name)
        : prev.length < 4 ? [...prev, name] : prev
    )
  }

  if (loading && !grades.length) {
    return (
      <PageLayout title="Crude Grades & Quality Explorer" subtitle="API gravity · Sulfur content · Classification · Price">
        <div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading grade data…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Crude Grades & Quality Explorer" subtitle="API gravity · Sulfur content · Classification · Price" lastUpdated={data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : undefined}>
      <div className="space-y-4">

        {/* Compare Panel */}
        {compareMode && (
          <ModuleCard icon={Droplets} color="#ff00ff" title="Grade Comparison" cadence="COMPARE" tag={`${selected.length}/4 selected`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {compareGrades.map(g => (
                <div key={g.name} className="bg-[#0d1117] border border-white/[0.06] rounded p-3 space-y-2">
                  <div className="text-xs font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{g.name}</div>
                  <div className="text-[10px]" style={{ fontFamily: 'Share Tech Mono, monospace', color: CLASSIFICATION_COLOR[formatClassification(g.classification)] ?? '#94A3B8' }}>
                    {formatClassification(g.classification)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      <span>API</span><span>{g.apiGravity.toFixed(1)}°</span>
                    </div>
                    <Bar value={g.apiGravity} max={60} color="#00d4ff" />
                    <div className="flex justify-between text-[10px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      <span>Sulfur</span><span>{g.sulfurContent.toFixed(2)}%</span>
                    </div>
                    <Bar value={g.sulfurContent} max={4} color="#ff3366" />
                  </div>
                  <div className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                    ${g.typicalPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected([])} className="mt-3 text-[10px] text-[#94A3B8] hover:text-white transition-colors font-mono">
              ✕ Clear selection
            </button>
          </ModuleCard>
        )}

        {/* Grade Grid */}
        <ModuleCard icon={Droplets} color="#00ff88" title="All Crude Grades" cadence="DAILY"
          tag="Click to compare up to 4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
            {grades.map(g => {
              const isSelected = selected.includes(g.name)
              const classColor = CLASSIFICATION_COLOR[formatClassification(g.classification)] ?? '#94A3B8'
              return (
                <div key={g.name}
                  onClick={() => toggleSelect(g.name)}
                  className={cn(
                    'bg-[#0d1117] border rounded p-3 space-y-2 cursor-pointer transition-all duration-200 hover:border-white/20',
                    isSelected ? 'border-[#ff00ff]/50 shadow-[0_0_12px_#ff00ff20]' : 'border-white/[0.05]'
                  )}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-white leading-tight" style={{ fontFamily: 'Orbitron, monospace' }}>{g.name}</div>
                      <div className="text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{g.benchmark} · {g.origin}</div>
                    </div>
                    <div className="mt-0.5 text-[#ff00ff]/60">
                      {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                    </div>
                  </div>

                  <span className="inline-block text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider"
                    style={{ fontFamily: 'Share Tech Mono, monospace', color: classColor, backgroundColor: classColor + '15' }}>
                    {formatClassification(g.classification)}
                  </span>

                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[9px] text-[#94A3B8] mb-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                        <span>API Gravity</span><span>{g.apiGravity.toFixed(1)}°</span>
                      </div>
                      <Bar value={g.apiGravity} max={60} color="#00d4ff" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-[#94A3B8] mb-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                        <span>Sulfur</span><span>{g.sulfurContent.toFixed(2)}%</span>
                      </div>
                    <Bar value={g.sulfurContent} max={4} color="#ff3366" />
                  </div>
                </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                      ${g.typicalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            EIA Crude API Gravity Reference · Yahoo Finance spot prices · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
