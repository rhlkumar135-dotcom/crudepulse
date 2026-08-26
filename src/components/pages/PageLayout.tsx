import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function PageLayout({ title, subtitle, children, lastUpdated }: {
  title: string
  subtitle: string
  children: ReactNode
  lastUpdated?: string
}) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="absolute inset-0 circuit-grid opacity-30 pointer-events-none" />
      <div className="relative z-10 p-3 md:p-6 max-w-[1600px] mx-auto">
        <div className="mb-4 md:mb-6">
          {/* Mobile: stacked layout, Desktop: side-by-side */}
          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
            <h1 className="text-lg md:text-2xl font-black tracking-[0.08em] text-white"
              style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 20px #00ff8820' }}>
              {title}
            </h1>
            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-[#2a2a3a] to-transparent mb-2" />
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-[10px] md:text-xs text-[#94A3B8] tracking-[0.15em] uppercase shrink-0"
                style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                <span className="text-[#00ff88]/60">&gt;</span> {subtitle}
              </p>
              {lastUpdated && (
                <span className="text-[9px] text-[#94A3B8]/50 font-mono shrink-0"
                  style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  ⏱ {lastUpdated}
                </span>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ModuleCard({ icon: Icon, color, title, cadence, tag, children, className = '' }: {
  icon: LucideIcon
  color: string
  title: string
  cadence?: string
  tag?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`cyber-card overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-5 pt-3 md:pt-4 pb-1.5 md:pb-2">
        <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border rounded-sm shrink-0"
          style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
          <Icon size={13} style={{ color }} />
        </div>
        <h2 className="text-xs md:text-sm font-bold text-white tracking-wide truncate"
          style={{ fontFamily: 'Orbitron, monospace' }}>
          {title}
        </h2>
        {cadence && (
          <span className="hidden sm:inline text-[9px] md:text-[10px] font-bold tracking-widest uppercase px-1.5 md:px-2 py-0.5 rounded shrink-0"
            style={{ fontFamily: 'Share Tech Mono, monospace', color: '#00ff88', backgroundColor: '#00ff8815' }}>
            {cadence}
          </span>
        )}
        {tag && (
          <span className="hidden md:inline text-[10px] font-mono text-[#94A3B8] bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.04] shrink-0">
            {tag}
          </span>
        )}
      </div>
      <div className="px-3 md:px-5 pb-3 md:pb-4">{children}</div>
    </div>
  )
}
