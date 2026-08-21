import { Link } from 'react-router-dom'
import { MiddleEastCorrelation } from '@/components/modules/MiddleEastCorrelation'
import { Globe } from 'lucide-react'

export function V3Page() {
  return (
    <div className="p-4 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Link to="/" className="text-[9px] text-muted hover:text-amber font-mono transition-colors">← HOME</Link>
        <span className="text-border">·</span>
        <span className="text-[9px] text-amber font-mono font-semibold">V3 CORRELATION ENGINE</span>
        <span className="text-border">·</span>
        <span className="text-[8px] text-muted/50 font-mono">ME ↔ Global Markets · PRO</span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 pt-4 pb-4">
          <MiddleEastCorrelation />
        </div>
        <div className="border-t border-white/[0.04] mx-5 py-2">
          <div className="text-[8px] font-mono text-muted/50">Yahoo Finance + Google News RSS · Pearson correlations · 60s refresh</div>
        </div>
      </div>

      <div className="text-center py-4">
        <div className="text-[9px] text-muted/40 font-mono space-y-0.5">
          <p>Rolling Pearson correlation coefficients — correlation ≠ causation</p>
          <p>Gulf-pegged currencies (SAR, AED) excluded by design — zero independent variance</p>
        </div>
      </div>
    </div>
  )
}
