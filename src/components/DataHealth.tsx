import { useState, useEffect } from 'react'

interface DataSource {
  name: string
  status: 'live' | 'cached' | 'stale' | 'cold'
  refreshRate: string
  age: string | null
}

const statusConfig: Record<string, { color: string; text: string; label: string; glow: string }> = {
  live: { color: 'bg-green-500', text: 'text-green-400', label: 'LIVE', glow: 'shadow-[0_0_4px] shadow-green-500/30' },
  cached: { color: 'bg-amber', text: 'text-amber', label: 'CACHED', glow: '' },
  stale: { color: 'bg-red', text: 'text-red', label: 'STALE', glow: 'shadow-[0_0_4px] shadow-red/30' },
  cold: { color: 'bg-gray-500', text: 'text-gray-400', label: 'COLD', glow: '' },
}

export function DataHealth() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/health')
        if (res.ok) {
          const data = await res.json()
          setSources(data.sources || [])
        }
      } catch {}
    }
    fetchHealth()
    const iv = setInterval(fetchHealth, 30_000)
    return () => clearInterval(iv)
  }, [])

  const liveCount = sources.filter(s => s.status === 'live').length
  const okCount = sources.filter(s => s.status !== 'stale' && s.status !== 'cold').length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-white/[0.03] transition-colors text-[11px] font-mono"
      >
        <div className="flex items-center gap-1">
          <span className={`w-[5px] h-[5px] rounded-full ${okCount === sources.length ? 'bg-green-500' : 'bg-amber'}`} />
          <span className="text-text-dim tracking-wider">APIs</span>
        </div>
        <span className={okCount === sources.length ? 'text-green-400' : 'text-amber'}>
          {okCount}/{sources.length}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 glass-card min-w-[280px] shadow-2xl shadow-black/50">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-text-dim tracking-wider">API STATUS</span>
                <span className="text-[10px] font-mono text-text-dim">{liveCount} live · {sources.length - liveCount} cached</span>
              </div>
              <div className="space-y-0">
                {sources.map((s, i) => {
                  const cfg = statusConfig[s.status] || statusConfig.cold
                  return (
                    <div key={s.name} className="data-grid-line">
                      <div className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-[5px] h-[5px] rounded-full ${cfg.color} ${cfg.glow}`} />
                          <span className="text-[11px] font-mono text-text">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-text-dim font-mono tabular-nums">{s.age || '—'}</span>
                          <span className="text-[10px] font-mono text-text-dim/60 w-12 text-right">{s.refreshRate}</span>
                          <span className={`text-[10px] font-mono font-medium ${cfg.text}`}>{cfg.label}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
