import { BarChart3, TrendingUp, Radar, Wrench, Clock, Zap, Globe, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LandingPage({ onShowPricing }: { onShowPricing?: () => void }) {
  return (
    <div className="min-h-screen bg-bg relative flex flex-col">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(245,166,35,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.4) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber/[0.02] blur-[150px] rounded-full" />

      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-2xl bg-amber/10 blur-xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center shadow-lg shadow-amber/20">
                <BarChart3 size={36} className="text-bg" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-wide text-text-bright mb-2">CrudePulse</h1>
            <p className="text-[11px] text-muted font-mono tracking-[0.2em]">REAL-TIME CRUDE OIL INTELLIGENCE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/v1" className="glass-card p-6 hover:border-amber/20 hover:bg-amber/[0.02] transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center"><TrendingUp size={18} className="text-teal" /></div>
                <div>
                  <div className="text-sm font-semibold text-text-bright">V1 — Quick Tour</div>
                  <div className="text-[9px] text-muted font-mono">4 modules · FREE</div>
                </div>
              </div>
              <p className="text-[10px] text-text-dim leading-relaxed mb-3">Price & News, Disruption Radar, Rig Count, and Reserves — the essential oil intelligence view.</p>
              <div className="text-[9px] text-amber font-mono flex items-center gap-1 group-hover:gap-2 transition-all">ENTER V1 <ArrowRight size={10} /></div>
            </Link>

            <Link to="/v2" className="glass-card p-6 hover:border-amber/20 hover:bg-amber/[0.02] transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center"><Radar size={18} className="text-amber" /></div>
                <div>
                  <div className="text-sm font-semibold text-text-bright">V2 — Full Dashboard</div>
                  <div className="text-[9px] text-muted font-mono">10 modules · PRO</div>
                </div>
              </div>
              <p className="text-[10px] text-text-dim leading-relaxed mb-3">Complete crude oil terminal with refinery utilization, global flows, chokepoints, storage, and field scorecard.</p>
              <div className="text-[9px] text-amber font-mono flex items-center gap-1 group-hover:gap-2 transition-all">ENTER V2 <ArrowRight size={10} /></div>
            </Link>

            <Link to="/v3" className="glass-card p-6 hover:border-amber/20 hover:bg-amber/[0.02] transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center"><Globe size={18} className="text-red" /></div>
                <div>
                  <div className="text-sm font-semibold text-text-bright">V3 — Correlation Engine</div>
                  <div className="text-[9px] text-muted font-mono">ME ↔ Global Markets · PRO</div>
                </div>
              </div>
              <p className="text-[10px] text-text-dim leading-relaxed mb-3">Quantify how Middle East events correlate with oil, currencies, and global indices — rolling Pearson coefficients, live.</p>
              <div className="text-[9px] text-amber font-mono flex items-center gap-1 group-hover:gap-2 transition-all">ENTER V3 <ArrowRight size={10} /></div>
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-[9px] text-muted/40 font-mono">GDELT · Yahoo Finance · EIA · Baker Hughes · OPEC · USGS · Google News RSS — All free sources</p>
          </div>
        </div>
      </div>
    </div>
  )
}
