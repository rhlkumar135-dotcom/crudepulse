import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Newspaper, MapPin, TrendingUp, Search, Filter, ChevronRight, X, Globe, Flame, DollarSign, Gavel, Droplets, Wrench, ExternalLink, Clock } from 'lucide-react'
import { WORLD_MAP_PATHS as WorldMapPaths } from '@/lib/world-map-paths'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

const CATEGORIES: Record<string, { color: string; icon: any; label: string }> = {
  disruption: { color: '#EF4444', icon: Flame, label: 'Disruption' },
  price: { color: '#F5A623', icon: DollarSign, label: 'Price/Market' },
  policy: { color: '#3B82F6', icon: Gavel, label: 'Policy/OPEC' },
  environmental: { color: '#2DD4BF', icon: Droplets, label: 'Environmental' },
  infrastructure: { color: '#A78BFA', icon: Wrench, label: 'Infrastructure' },
}

interface Story {
  id: string; title: string; source: string; url: string;
  lat: number; lng: number; location: string;
  category: string; tone: number;
  importanceScore: number; ageMs: number;
  rawDate: string; timeAgo: string;
  imageUrl: string | null; topicCount: number;
}

interface TrendingTopic { topic: string; velocity: number; direction: 'up' | 'down' }

const W = 900, H = 450
function toSVG(lat: number, lng: number): [number, number] {
  return [((lng + 180) / 360) * W, ((90 - lat) / 180) * H]
}

const REGION_PRESETS = [
  { name: 'Global', lat: 20, lng: 0, span: 200 },
  { name: 'Middle East', lat: 28, lng: 48, span: 40 },
  { name: 'N. America', lat: 38, lng: -100, span: 60 },
  { name: 'Europe', lat: 50, lng: 15, span: 50 },
  { name: 'Asia Pacific', lat: 25, lng: 110, span: 60 },
]

export function NewsAtlasPage() {
  const { data, loading } = useMarketData<{ stories: Story[]; totalStories: number; categoryCounts: Record<string, number>; trending: TrendingTopic[] }>('/api/news/atlas', 'free', 30_000)
  const stories = data?.stories || []
  const categoryCounts = data?.categoryCounts || {}
  const trending = data?.trending || []

  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(Object.keys(CATEGORIES)))
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [hoveredStory, setHoveredStory] = useState<Story | null>(null)
  const [activeRegion, setActiveRegion] = useState('Global')
  const [recencyFilter, setRecencyFilter] = useState<'24h' | '7d' | '30d'>('7d')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)
  const [newCount, setNewCount] = useState(0)
  const prevStoryCount = useRef(0)

  useEffect(() => {
    if (stories.length > prevStoryCount.current && prevStoryCount.current > 0) {
      setNewCount(stories.length - prevStoryCount.current)
    }
    prevStoryCount.current = stories.length
  }, [stories.length])

  const filteredStories = useMemo(() => {
    const maxAge = recencyFilter === '24h' ? 24 * 3600_000 : recencyFilter === '7d' ? 7 * 24 * 3600_000 : 30 * 24 * 3600_000
    return stories.filter(s => {
      if (!activeCategories.has(s.category)) return false
      if (s.ageMs > maxAge) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return s.title.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.source.toLowerCase().includes(q)
      }
      return true
    })
  }, [stories, activeCategories, searchQuery, recencyFilter])

  const toggleCategory = useCallback((cat: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  const pinRadius = useCallback((score: number) => {
    return Math.max(3, Math.min(10, 3 + score * 10))
  }, [])

  const pinOpacity = useCallback((ageMs: number) => {
    const hours = ageMs / 3600_000
    if (hours < 1) return 1
    if (hours < 24) return 0.7 + 0.3 * (1 - hours / 24)
    return Math.max(0.3, 1 - hours / (72))
  }, [])

  return (
    <div className="min-h-screen bg-[#060A10] flex flex-col">
      {/* Trending ticker */}
      {trending.length > 0 && (
        <div className="h-8 border-b border-white/[0.04] bg-[#0A0E15] flex items-center px-4 gap-6 overflow-hidden">
          <span className="text-[9px] font-bold text-gray-500 tracking-widest shrink-0" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>TRENDING</span>
          {trending.slice(0, 5).map((t, i) => (
            <button key={i} onClick={() => setSearchQuery(t.topic)}
              className="flex items-center gap-1.5 text-[10px] shrink-0 hover:bg-white/[0.04] px-2 py-0.5 rounded transition-colors"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <span className={t.direction === 'up' ? 'text-[#EF4444]' : 'text-[#2DD4BF]'}>
                {t.direction === 'up' ? '▲' : '▼'}
              </span>
              <span className="text-gray-300 font-medium">{t.topic}</span>
              <span className={t.direction === 'up' ? 'text-[#EF4444]' : 'text-[#2DD4BF]'}>{Math.abs(t.velocity)}%</span>
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-[9px] text-gray-600" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {filteredStories.length} stories · {data?.totalStories || 0} total
          </span>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* ═══ LEFT: Map ═══ */}
        <div className="flex-1 flex flex-col border-r border-white/[0.04]">
          {/* Search + Region chips */}
          <div className="flex items-center gap-2 p-3 border-b border-white/[0.04] bg-[#080C12]">
            <div className="relative flex-1 max-w-xs">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/30"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }} />
            </div>
            <div className="flex gap-1">
              {REGION_PRESETS.map(r => (
                <button key={r.name} onClick={() => setActiveRegion(r.name)}
                  className={cn('px-2 py-1 text-[9px] font-medium rounded transition-all',
                    activeRegion === r.name ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/20' : 'text-gray-500 hover:text-gray-300 border border-transparent')}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Map */}
          <div className="flex-1 relative overflow-hidden bg-[#060A10]">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="na-ocean" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="#0A1628" />
                  <stop offset="100%" stopColor="#060A10" />
                </radialGradient>
                <filter id="na-glow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              <rect width={W} height={H} fill="url(#na-ocean)" />

              {/* Grid */}
              {Array.from({ length: 17 }, (_, i) => (i + 1) * 50).map(x => (
                <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#1A2538" strokeWidth="0.3" opacity={0.3} />
              ))}
              {Array.from({ length: 8 }, (_, i) => (i + 1) * 50).map(y => (
                <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#1A2538" strokeWidth="0.3" opacity={0.3} />
              ))}

              {/* Real world map outlines */}
              <g>
                {Object.entries(WorldMapPaths).map(([cont, paths]) => (
                  paths.map((d, i) => (
                    <path key={`${cont}-${i}`} d={d} fill="#141E2C" stroke="#1E3048" strokeWidth="0.4" opacity="0.7" />
                  ))
                ))}
              </g>

              {/* Heatmap mode */}
              {showHeatmap && filteredStories.length > 0 && (
                <g>
                  {(() => {
                    const cells: Record<string, { lat: number; lng: number; score: number; count: number }> = {}
                    for (const s of filteredStories) {
                      const cellLat = Math.round(s.lat / 5) * 5
                      const cellLng = Math.round(s.lng / 5) * 5
                      const key = `${cellLat},${cellLng}`
                      if (!cells[key]) cells[key] = { lat: cellLat, lng: cellLng, score: 0, count: 0 }
                      cells[key].score += s.importanceScore
                      cells[key].count++
                    }
                    const maxScore = Math.max(1, ...Object.values(cells).map(c => c.score))
                    return Object.values(cells).map((cell, i) => {
                      const [cx, cy] = toSVG(cell.lat, cell.lng)
                      const intensity = cell.score / maxScore
                      const radius = 15 + intensity * 40
                      return (
                        <circle key={`heat-${i}`} cx={cx} cy={cy} r={radius}
                          fill={`rgba(239, 68, 68, ${0.1 + intensity * 0.35})`}
                          filter="url(#na-glow)" />
                      )
                    })
                  })()}
                </g>
              )}

              {/* News pins */}
              {!showHeatmap && filteredStories.map(story => {
                const [sx, sy] = toSVG(story.lat, story.lng)
                const cat = CATEGORIES[story.category] || CATEGORIES.price
                const r = pinRadius(story.importanceScore)
                const opacity = pinOpacity(story.ageMs)
                const isSelected = selectedStory?.id === story.id
                const isHovered = hoveredStory?.id === story.id
                const isNew = story.ageMs < 600_000 // < 10 min

                return (
                  <g key={story.id}
                    onMouseEnter={() => setHoveredStory(story)}
                    onMouseLeave={() => setHoveredStory(null)}
                    onClick={() => { setSelectedStory(story); setSearchQuery(''); }}
                    className="cursor-pointer">
                    {isNew && (
                      <circle cx={sx} cy={sy} r={r + 6} fill="none" stroke={cat.color} strokeWidth="1" opacity={0.5}>
                        <animate attributeName="r" values={`${r + 2};${r + 10};${r + 2}`} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {isSelected && (
                      <circle cx={sx} cy={sy} r={r + 5} fill="none" stroke={cat.color} strokeWidth="1.5" opacity={0.6} />
                    )}
                    <circle cx={sx} cy={sy} r={isSelected || isHovered ? r * 1.3 : r}
                      fill={cat.color} opacity={opacity}
                      stroke={isSelected || isHovered ? '#fff' : 'none'} strokeWidth={isSelected || isHovered ? 1 : 0}
                      className="transition-all duration-200" />
                  </g>
                )
              })}

              {/* Tooltip on hover */}
              {hoveredStory && !selectedStory && (() => {
                const [hx, hy] = toSVG(hoveredStory.lat, hoveredStory.lng)
                const cat = CATEGORIES[hoveredStory.category] || CATEGORIES.price
                return (
                  <g>
                    <rect x={Math.min(hx + 10, W - 220)} y={Math.max(hy - 30, 5)} width={210} height={36} rx={4}
                      fill="#0D1318" stroke={cat.color} strokeOpacity={0.4} strokeWidth={1} />
                    <text x={Math.min(hx + 18, W - 212)} y={Math.max(hy - 14, 18)} fill="white" fontSize="9" fontFamily="Inter, system-ui, sans-serif" fontWeight="600">
                      {hoveredStory.title.length > 38 ? hoveredStory.title.slice(0, 38) + '…' : hoveredStory.title}
                    </text>
                    <text x={Math.min(hx + 18, W - 212)} y={Math.max(hy - 3, 30)} fill={cat.color} fontSize="8" fontFamily="Inter, system-ui, sans-serif">
                      {hoveredStory.source} · {hoveredStory.timeAgo}
                    </text>
                  </g>
                )
              })()}
            </svg>

            {/* New stories toast */}
            {newCount > 0 && (
              <button onClick={() => { setNewCount(0); window.scrollTo({ top: 0 }) }}
                className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#00ff88]/15 border border-[#00ff88]/30 rounded-full text-[10px] font-bold text-[#00ff88] hover:bg-[#00ff88]/25 transition-all z-10"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {newCount} new stories
              </button>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: Feed + Controls ═══ */}
        <div className="w-[380px] flex flex-col bg-[#080C12]">
          {/* Controls bar */}
          <div className="p-3 border-b border-white/[0.04] space-y-2">
            {/* Category legend */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CATEGORIES).map(([key, cat]) => {
                const Icon = cat.icon
                const count = categoryCounts[key] || 0
                const active = activeCategories.has(key)
                return (
                  <button key={key} onClick={() => toggleCategory(key)}
                    className={cn('flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold border transition-all',
                      active ? 'border-white/10' : 'border-transparent opacity-30')}
                    style={{ color: cat.color, backgroundColor: active ? cat.color + '12' : 'transparent', fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <Icon size={10} />
                    <span>{cat.label}</span>
                    <span className="opacity-60">{count}</span>
                  </button>
                )
              })}
              <div className="flex-1" />
              <button onClick={() => setActiveCategories(new Set(Object.keys(CATEGORIES)))}
                className="text-[9px] text-gray-500 hover:text-gray-300 px-2 py-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Reset
              </button>
            </div>
            {/* Recency + heatmap toggle */}
            <div className="flex items-center gap-2">
              {(['24h', '7d', '30d'] as const).map(r => (
                <button key={r} onClick={() => setRecencyFilter(r)}
                  className={cn('px-2 py-0.5 text-[9px] font-medium rounded border transition-all',
                    recencyFilter === r ? 'bg-white/[0.06] text-white border-white/10' : 'text-gray-500 border-transparent hover:text-gray-300')}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {r}
                </button>
              ))}
              <div className="flex-1" />
              <button onClick={() => setShowHeatmap(!showHeatmap)}
                className={cn('px-2 py-0.5 text-[9px] font-medium rounded border transition-all',
                  showHeatmap ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20' : 'text-gray-500 border-transparent hover:text-gray-300')}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {showHeatmap ? 'Pins' : 'Heatmap'}
              </button>
            </div>
          </div>

          {/* Selected story detail */}
          {selectedStory && (
            <div className="p-4 border-b border-white/[0.04] bg-white/[0.02]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {(() => { const Icon = CATEGORIES[selectedStory.category]?.icon; return Icon ? <Icon size={14} style={{ color: CATEGORIES[selectedStory.category]?.color }} /> : null })()}
                  <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: CATEGORIES[selectedStory.category]?.color, fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {CATEGORIES[selectedStory.category]?.label}
                  </span>
                </div>
                <button onClick={() => setSelectedStory(null)} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {selectedStory.title}
              </h3>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <span className="flex items-center gap-1"><MapPin size={9} /> {selectedStory.location}</span>
                <span className="flex items-center gap-1"><Clock size={9} /> {selectedStory.timeAgo}</span>
                <span>{selectedStory.source}</span>
              </div>
              {selectedStory.url && (
                <a href={selectedStory.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded text-[10px] font-semibold text-[#00ff88] hover:bg-[#00ff88]/20 transition-all"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Read full article <ExternalLink size={10} />
                </a>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] text-gray-500" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Importance: {(selectedStory.importanceScore * 100).toFixed(0)}%
                </span>
                <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${selectedStory.importanceScore * 100}%`, backgroundColor: CATEGORIES[selectedStory.category]?.color || '#666' }} />
                </div>
              </div>
            </div>
          )}

          {/* Feed list */}
          <div ref={feedRef} className="flex-1 overflow-y-auto">
            {filteredStories.length === 0 && !loading && (
              <div className="p-8 text-center">
                <Newspaper size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {loading ? 'Loading news feed...' : 'No stories match your filters'}
                </p>
              </div>
            )}
            {filteredStories.map(story => {
              const cat = CATEGORIES[story.category] || CATEGORIES.price
              const Icon = cat.icon
              const isSelected = selectedStory?.id === story.id
              return (
                <div key={story.id}
                  onClick={() => setSelectedStory(isSelected ? null : story)}
                  className={cn('p-3 border-b border-white/[0.03] cursor-pointer transition-all hover:bg-white/[0.02]',
                    isSelected && 'bg-white/[0.04] border-l-2')}
                  style={isSelected ? { borderLeftColor: cat.color } : undefined}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: cat.color + '12' }}>
                      <Icon size={12} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {story.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[9px] text-gray-500" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        <span className="flex items-center gap-0.5">
                          <MapPin size={8} />
                          {story.location}
                        </span>
                        <span>·</span>
                        <span>{story.source}</span>
                        <span>·</span>
                        <span>{story.timeAgo}</span>
                      </div>
                    </div>
                    {story.importanceScore > 0.5 && (
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}40` }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
