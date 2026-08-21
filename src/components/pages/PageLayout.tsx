import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function PageLayout({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="absolute inset-0 circuit-grid opacity-30 pointer-events-none" />
      <div className="relative z-10 p-6 max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-end gap-4">
          <h1 className="text-2xl font-black tracking-[0.08em] text-white"
            style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 20px #00ff8820' }}>
            {title}
          </h1>
          <div className="h-px flex-1 bg-gradient-to-r from-[#2a2a3a] to-transparent mb-2" />
          <p className="text-xs text-[#94A3B8] tracking-[0.15em] uppercase shrink-0 mb-1"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            <span className="text-[#00ff88]/60">&gt;</span> {subtitle}
          </p>
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
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <div className="w-8 h-8 flex items-center justify-center border rounded-sm"
          style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
          <Icon size={15} style={{ color }} />
        </div>
        <h2 className="text-sm font-bold text-white tracking-wide"
          style={{ fontFamily: 'Orbitron, monospace' }}>
          {title}
        </h2>
        {cadence && (
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
            style={{ fontFamily: 'Share Tech Mono, monospace', color: '#00ff88', backgroundColor: '#00ff8815' }}>
            {cadence}
          </span>
        )}
        {tag && (
          <span className="text-[10px] font-mono text-[#94A3B8] bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.04]">
            {tag}
          </span>
        )}
      </div>
      <div className="px-5 pb-4">{children}</div>
    </div>
  )
}
