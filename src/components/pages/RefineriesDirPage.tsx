import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Factory, AlertCircle, Search, ArrowUpDown } from 'lucide-react'

interface Refinery {
  name: string
  country: string
  capacityBpd: number
  owner: string
  complexity: string
  lat: number
  lng: number
}

interface RefineriesResponse {
  refineries: Refinery[]
}

type SortField = 'country' | 'capacity' | 'owner'

export function RefineriesDirPage() {
  const [data, setData] = useState<RefineriesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('country')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/refineries-dir')
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Failed to load')
        setData(body)
      } catch (e: any) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [])

  const refineries = data?.refineries ?? []

  const filtered = refineries
    .filter(r => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        r.name.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortField === 'capacity') return b.capacityBpd - a.capacityBpd
      return a[sortField].localeCompare(b[sortField])
    })

  const maxCapacity = Math.max(...refineries.map(r => r.capacityBpd), 1)

  if (loading && !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-white/[0.03] animate-pulse" />
        <div className="h-10 w-full rounded bg-white/[0.03] animate-pulse" />
        <div className="h-96 rounded-xl bg-white/[0.03] animate-pulse" />
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
            <Factory size={20} className="text-amber" />
            Refinery Directory
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-amber to-transparent mt-1" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, country, or owner..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald/30"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['country', 'capacity', 'owner'] as SortField[]).map(f => (
            <button
              key={f}
              onClick={() => setSortField(f)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono transition-colors',
                sortField === f
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <ArrowUpDown size={10} />
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Name', 'Country', 'Owner', 'Capacity (BPD)', 'Complexity'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[9px] text-zinc-600 uppercase tracking-wider font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-white font-medium text-[11px]">{r.name}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{r.country}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{r.owner}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white font-medium">{r.capacityBpd.toLocaleString()}</span>
                        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full bg-amber rounded-full transition-all duration-500"
                            style={{ width: `${(r.capacityBpd / maxCapacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge className="text-[9px] font-mono px-1.5 py-0 bg-white/[0.04] text-zinc-400 border-white/[0.06]">
                        {r.complexity}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs font-mono text-zinc-600">
                      No refineries match your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
