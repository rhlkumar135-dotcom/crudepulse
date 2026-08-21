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
      <div className="relative z-10 p-4 max-w-[1600px] mx-auto">
        <div className="mb-4">
          <h1 className="text-lg font-black tracking-[0.15em] text-white uppercase"
            style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 12px #00ff8830' }}>
            {title}
          </h1>
          <p className="text-[11px] text-[#6b7280] tracking-[0.2em] uppercase mt-1"
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
        <div className="w-7 h-7 flex items-center justify-center border"
          style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
          <Icon size={14} style={{ color }} />
        </div>
        <h2 className="text-[11px] font-bold text-white tracking-wider uppercase"
          style={{ fontFamily: 'Orbitron, monospace' }}>
          {title}
        </h2>
        {cadence && (
          <span className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
            style={{ fontFamily: 'Share Tech Mono, monospace', color: '#00ff88', backgroundColor: '#00ff8815' }}>
            {cadence}
          </span>
        )}
        {tag && (
          <span className="text-[10px] font-mono text-[#6b7280] bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
            {tag}
          </span>
        )}
      </div>
      <div className="px-5 pb-4">{children}</div>
    </div>
  )
}
