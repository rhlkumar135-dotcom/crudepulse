import { cn } from '@/lib/cn'

type Cadence = 'live' | 'daily' | 'weekly' | 'periodic'

const config: Record<Cadence, { label: string; color: string }> = {
  live: { label: 'LIVE', color: '#00ff88' },
  daily: { label: 'DAILY', color: '#F5A623' },
  weekly: { label: 'WEEKLY', color: '#00d4ff' },
  periodic: { label: 'PERIODIC', color: '#6b7280' },
}

export function CadenceBadge({ cadence, className }: { cadence: Cadence; className?: string }) {
  const c = config[cadence]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-[1px] text-[10px] font-bold tracking-[0.15em] uppercase border',
      className
    )}
      style={{
        fontFamily: 'Share Tech Mono, monospace',
        color: c.color,
        backgroundColor: c.color + '10',
        borderColor: c.color + '30',
      }}>
      {cadence === 'live' && <span className="w-[5px] h-[5px] rounded-full animate-pulse" style={{ backgroundColor: c.color }} />}
      {c.label}
    </span>
  )
}

export function SourceLabel({ source, lastUpdated }: { source: string; lastUpdated?: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-[#4a4a5a]"
      style={{ fontFamily: 'Share Tech Mono, monospace' }}>
      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-40 shrink-0">
        <circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="4" cy="4" r="1" fill="currentColor" />
      </svg>
      <span>{source}</span>
      {lastUpdated && (
        <>
          <span className="text-[#2a2a3a]">·</span>
          <span className="text-[#4a4a5a]/70">{lastUpdated}</span>
        </>
      )}
    </div>
  )
}
