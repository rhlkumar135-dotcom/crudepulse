import { cn } from '@/lib/cn'

type Cadence = 'live' | 'daily' | 'weekly' | 'periodic'

const config: Record<Cadence, { label: string; dot: string; bg: string; text: string; glow: string }> = {
  live: { label: 'LIVE', dot: 'bg-green-500', bg: 'bg-green-500/[0.08]', text: 'text-green-400', glow: 'shadow-[0_0_4px] shadow-green-500/20' },
  daily: { label: 'DAILY', dot: 'bg-amber', bg: 'bg-amber/[0.08]', text: 'text-amber', glow: 'shadow-[0_0_4px] shadow-amber/20' },
  weekly: { label: 'WEEKLY', dot: 'bg-blue-400', bg: 'bg-blue-400/[0.08]', text: 'text-blue-400', glow: '' },
  periodic: { label: 'PERIODIC', dot: 'bg-muted', bg: 'bg-muted/[0.08]', text: 'text-muted', glow: '' },
}

export function CadenceBadge({ cadence, className }: { cadence: Cadence; className?: string }) {
  const c = config[cadence]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-[9px] font-mono font-medium tracking-wider border',
      c.bg, c.text, c.glow,
      cadence === 'live' ? 'border-green-500/20' : cadence === 'daily' ? 'border-amber/15' : 'border-white/5',
      className
    )}>
      <span className={cn('w-[5px] h-[5px] rounded-full', c.dot, cadence === 'live' && 'animate-pulse')} />
      {c.label}
    </span>
  )
}

export function SourceLabel({ source, lastUpdated }: { source: string; lastUpdated?: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-mono text-text-dim">
      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-40 shrink-0">
        <circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="4" cy="4" r="1" fill="currentColor" />
      </svg>
      <span>{source}</span>
      {lastUpdated && (
        <>
          <span className="text-border">·</span>
          <span className="text-text-dim/70">{lastUpdated}</span>
        </>
      )}
    </div>
  )
}
