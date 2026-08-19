import { Zap, Check, X as XIcon, ArrowRight } from 'lucide-react'

interface PricingPageProps {
  onBack: () => void
  onSignup?: (email: string) => void
}

export function PricingPage({ onBack, onSignup }: PricingPageProps) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button onClick={onBack} className="text-muted hover:text-text text-xs font-mono mb-6 transition-colors">
          ← Back to Dashboard
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1">Simple, honest pricing</h1>
          <p className="text-xs text-muted max-w-md mx-auto">
            Free users see all 4 modules. Pro users get Module A with the freshest data — no artificial locks on useful tools.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Free tier */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold mb-1">Free</h2>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold font-mono">$0</span>
            </div>
            <p className="text-[10px] text-muted mb-4">All 4 modules, honest cadences</p>

            <div className="space-y-2">
              {[
                'All 4 V1 modules visible',
                'Modules B/C/D fully live',
                'Module A (Price+News) one cycle stale',
                'GDELT disruption radar — truly live',
                'Rig count — weekly cadence',
                'Reserves clock — annual data',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <Check size={11} className="text-teal shrink-0" />
                  <span className="text-text">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tier */}
          <div className="glass-card p-5 border-amber/20 relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber text-bg text-[8px] font-bold font-mono rounded-full tracking-wider">
              RECOMMENDED
            </div>

            <h2 className="text-sm font-semibold mb-1">Pro</h2>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold font-mono">$25</span>
              <span className="text-xs text-muted">/mo</span>
            </div>
            <p className="text-[10px] text-muted mb-4">Freshest price data, every 4 hours</p>

            <button className="w-full py-2 rounded-lg bg-amber text-bg font-semibold text-xs hover:bg-amber/90 transition-colors flex items-center justify-center gap-1.5 mb-4">
              <Zap size={12} />
              Upgrade to Pro
              <ArrowRight size={10} className="opacity-60" />
            </button>

            <div className="space-y-2">
              {[
                'Everything in Free',
                'Module A: freshest cron batch (4h)',
                'Free gets 8h-stale price data',
                'Custom price alerts (coming soon)',
                'CSV/PNG export (coming soon)',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <Check size={11} className="text-amber shrink-0" />
                  <span className="text-text">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[9px] text-muted font-mono mt-4">
          The entire V1 paywall: fresher data on one module. No features hidden. No tricks.
        </p>
      </div>
    </div>
  )
}
