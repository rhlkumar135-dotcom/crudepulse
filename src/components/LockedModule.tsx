import { Lock, Zap, ArrowRight } from 'lucide-react'
import { type ReactNode } from 'react'

export function LockedModule({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="locked-blur">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-card/70 via-bg-card/85 to-bg-card/70" />

        <div className="relative flex flex-col items-center">
          {/* Premium lock icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber/15 to-amber/5 border border-amber/10 flex items-center justify-center mb-3 shadow-lg shadow-amber/5">
            <Lock size={18} className="text-amber" />
          </div>

          <h3 className="text-sm font-semibold text-text-bright mb-0.5 tracking-wide">{title}</h3>
          <p className="text-[10px] text-text-dim mb-3">Pro module · Requires subscription</p>

          <button className="group/btn inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber to-amber/90 text-bg rounded-lg text-[11px] font-semibold hover:shadow-lg hover:shadow-amber/20 transition-all">
            <Zap size={11} />
            Upgrade to Pro
            <ArrowRight size={10} className="opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
