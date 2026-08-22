import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Droplets, CheckSquare, Square, AlertCircle } from 'lucide-react'

interface Grade {
  id: string
  name: string
  fullName: string
  apiGravity: number
  sulfur: number
  region: string
  benchmark: string
  price: number
  change: number
  production: number
}

interface GradesResponse {
  grades: Grade[]
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

export function GradesPage() {
  const [data, setData] = useState<GradesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/grades')
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Failed to load')
        setData(body)
      } catch (e: any) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  const grades = data?.grades ?? []

  const sorted = [...grades].sort((a, b) => {
    if (sortBy === 'api') return b.apiGravity - a.apiGravity
    if (sortBy === 'sulfur') return b.sulfur - a.sulfur
    if (sortBy === 'region') return a.region.localeCompare(b.region)
    return a.name.localeCompare(b.name)
  })

  const compareGrades = grades.filter(g => selected.includes(g.id))

  function toggleSelect(id: string) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(n => n !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev
    )
  }

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded bg-white/[0.03] animate-pulse" />
          <div className="h-4 w-48 rounded bg-white/[0.03] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle size={16} className="text-red shrink-0" />
          <span className="text-sm font-mono text-red">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplets size={20} className="text-emerald" />
            Crude Grades
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-emerald to-transparent mt-1" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Sort by</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-8 text-xs border-white/10 bg-white/[0.03]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="api">API Gravity</SelectItem>
              <SelectItem value="sulfur">Sulfur</SelectItem>
              <SelectItem value="region">Region</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {compareGrades.length >= 2 && (
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono text-white">
                Comparison ({compareGrades.length}/3)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-mono text-zinc-500 hover:text-white h-7"
                onClick={() => setSelected([])}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {compareGrades.map(g => (
                <div key={g.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 space-y-2">
                  <div className="text-xs font-bold text-white font-mono">{g.name}</div>
                  <div className="text-[9px] text-zinc-500 font-mono">{g.fullName}</div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-500 font-mono mb-0.5">
                        <span>API Gravity</span>
                        <span>{g.apiGravity}°</span>
                      </div>
                      <ProgressBar value={g.apiGravity} max={50} color="#00d4aa" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-500 font-mono mb-0.5">
                        <span>Sulfur</span>
                        <span>{g.sulfur}%</span>
                      </div>
                      <ProgressBar value={g.sulfur} max={5} color="#ef4444" />
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono">
                      Region: <span className="text-white">{g.region}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(g => {
          const isSelected = selected.includes(g.id)
          return (
            <Card
              key={g.id}
              className={cn(
                'bg-white/[0.02] border transition-all duration-200 cursor-pointer hover:bg-white/[0.04]',
                isSelected
                  ? 'border-emerald/40 shadow-[0_0_16px_rgba(0,212,170,0.08)]'
                  : 'border-white/[0.06]'
              )}
              onClick={() => toggleSelect(g.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xs font-mono text-white">{g.name}</CardTitle>
                    <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{g.fullName}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {g.benchmark && (
                      <Badge className="text-[8px] font-mono px-1.5 py-0 bg-amber-500/10 text-amber border-amber/20">
                        BENCHMARK
                      </Badge>
                    )}
                    <div className="text-zinc-600">
                      {isSelected ? <CheckSquare size={14} className="text-emerald" /> : <Square size={14} />}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono mb-0.5">
                    <span>API Gravity</span>
                    <span>{g.apiGravity}°</span>
                  </div>
                  <ProgressBar value={g.apiGravity} max={50} color="#00d4aa" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono mb-0.5">
                    <span>Sulfur</span>
                    <span>{g.sulfur}%</span>
                  </div>
                  <ProgressBar value={g.sulfur} max={5} color="#ef4444" />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <span className="text-[10px] text-zinc-500 font-mono">{g.region}</span>
                  {g.benchmark && (
                    <span className="text-sm font-mono font-bold text-white">${g.price}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
