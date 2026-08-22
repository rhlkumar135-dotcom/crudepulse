import { useState, useEffect } from 'react'
import { Newspaper, MapPin, Filter, Search } from 'lucide-react'
import { WORLD_MAP_PATHS, latLngToSvg } from '@/lib/world-map-paths'

interface Story { title: string; url: string; source: string; timestamp: string; category: string; importance: number; lat: number; lng: number }

const CAT_COLORS: Record<string, string> = {
  disruption: '#EF4444', price: '#F59E0B', policy: '#3B82F6',
  infrastructure: '#8B5CF6', market: '#22C55E',
}

export function NewsAtlasPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchNews = async () => {
    try {
      const r = await fetch('/api/news/atlas')
      if (!r.ok) throw new Error(`${r.status}`)
      const d = await r.json()
      setStories(d.stories || [])
    } catch { /* keep existing */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNews(); const i = setInterval(fetchNews, 30000); return () => clearInterval(i) }, [])

  const filtered = stories.filter(s => {
    if (filter !== 'all' && s.category !== filter) return false
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const W = 800, H = 400

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">News Atlas</h2>
        <span className="live-dot" />
        <span className="text-[9px] text-gray-500 ml-auto">{filtered.length} stories</span>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <div className="flex items-center gap-1 bg-white/[0.03] rounded px-2 py-1">
          <Search className="w-3 h-3 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent text-[10px] text-white outline-none w-32 placeholder-gray-600" />
        </div>
        {Object.entries(CAT_COLORS).map(([cat, color]) => (
          <button key={cat} onClick={() => setFilter(filter === cat ? 'all' : cat)} className={`text-[9px] px-2 py-0.5 rounded capitalize ${filter === cat ? 'text-white' : 'text-gray-500'}`} style={filter === cat ? { background: color + '30', color } : {}}>
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-4" style={{ height: 500 }}>
        <div className="glass-card rounded-lg overflow-hidden flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#080B10' }}>
            <rect width={W} height={H} fill="#080B10" />
            {WORLD_MAP_PATHS.map((c, i) => <path key={i} d={c.d} fill="#141E2C" stroke="#1E3048" strokeWidth={0.5} />)}
            {filtered.map((s, i) => {
              const [px, py] = latLngToSvg(s.lat, s.lng)
              const color = CAT_COLORS[s.category] || '#22C55E'
              const isSelected = selectedStory?.title === s.title
              const size = 3 + (s.importance / 20)
              return (
                <g key={i} onClick={() => setSelectedStory(isSelected ? null : s)} className="cursor-pointer">
                  <circle cx={px} cy={py} r={isSelected ? size * 2 : size} fill={color} opacity={isSelected ? 0.4 : 0.2} />
                  <circle cx={px} cy={py} r={size * 0.5} fill={color} opacity={0.9} />
                  {isSelected && <circle cx={px} cy={py} r={size * 3} fill="none" stroke={color} strokeWidth={1} opacity={0.3}><animate attributeName="r" values={`${size * 2};${size * 4};${size * 2}`} dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" /></circle>}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="w-80 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 500 }}>
          {filtered.map((s, i) => (
            <div key={i} onClick={() => setSelectedStory(selectedStory?.title === s.title ? null : s)} className={`glass-card p-3 rounded-lg cursor-pointer transition-colors ${selectedStory?.title === s.title ? 'border-white/20' : 'hover:border-white/10'}`}>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: CAT_COLORS[s.category] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white leading-tight">{s.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-gray-500">{s.source}</span>
                    <span className="text-[8px] text-gray-600">·</span>
                    <span className="text-[8px] text-gray-500">{new Date(s.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && <p className="text-xs text-gray-500 text-center py-8">No stories match filters</p>}
        </div>
      </div>
    </div>
  )
}
