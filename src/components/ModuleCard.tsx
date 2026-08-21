import { useState, type ReactNode } from 'react'
import { Expand, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CadenceBadge, SourceLabel } from './CadenceBadge'

interface ModuleCardProps {
  title: string
  icon: ReactNode
  cadence: 'live' | 'daily' | 'weekly' | 'periodic'
  source: string
  lastUpdated?: string
  moduleId?: string
  children: ReactNode
  className?: string
  fullScreenClassName?: string
}

export function ModuleCard({ title, icon, cadence, source, lastUpdated, moduleId, children, className, fullScreenClassName }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <div className="module-expanded">
        <div className={cn('glass-card h-full flex flex-col', fullScreenClassName)}>
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-3">
              {moduleId && (
                <span className="text-[11px] font-mono text-amber/60 bg-amber/5 px-1.5 py-0.5 rounded tracking-wider">{moduleId}</span>
              )}
              <div className="text-amber">{icon}</div>
              <h2 className="text-base font-semibold text-text-bright tracking-wide">{title}</h2>
              <CadenceBadge cadence={cadence} />
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-text"
            >
              <X size={16} />
            </button>
          </div>
          <div className="section-divider mx-5" />
          <div className="flex-1 overflow-auto min-h-0 p-5">{children}</div>
          <div className="section-divider mx-5" />
          <div className="px-5 pb-3">
            <SourceLabel source={source} lastUpdated={lastUpdated} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'glass-card group relative transition-all duration-300',
        className
      )}
    >
      {/* Top accent line — subtle amber glow */}
      <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {moduleId && (
              <span className="text-[10px] font-mono text-amber/50 bg-amber/[0.04] px-1 py-0.5 rounded tracking-widest border border-amber/[0.06]">{moduleId}</span>
            )}
            <div className="text-amber/80 group-hover:text-amber transition-colors">{icon}</div>
            <h3 className="text-[13px] font-semibold tracking-wide text-text-bright">{title}</h3>
            <CadenceBadge cadence={cadence} />
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="p-1 rounded-md hover:bg-white/5 transition-all text-text-dim hover:text-text opacity-0 group-hover:opacity-100"
            title="Expand to fullscreen"
          >
            <Expand size={12} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 min-h-0">{children}</div>

      <div className="border-t border-border-subtle mx-4 pt-2 pb-2.5 px-0">
        <SourceLabel source={source} lastUpdated={lastUpdated} />
      </div>
    </div>
  )
}
