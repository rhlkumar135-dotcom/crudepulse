import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { BarChart3, TrendingUp, Radar, Wrench, Clock, Zap, Eye, Database, Users, Activity, Globe } from 'lucide-react'
import { PriceNewsChart } from '@/components/modules/PriceNews'
import { DisruptionRadar } from '@/components/modules/DisruptionRadar'
import { RigCountChart } from '@/components/modules/RigCount'
import { ReservesClock } from '@/components/modules/ReservesClock'
import { GlobalFlowMap as GlobalFlow } from '@/components/modules/GlobalFlow'
import { ChokepointsMonitor as Chokepoints } from '@/components/modules/Chokepoints'
import { SupplyDemandSim } from '@/components/modules/SupplyDemandSim'
import { RefineryHeatmap } from '@/components/modules/RefineryHeatmap'
import { StorageSatellite } from '@/components/modules/StorageSatellite'
import { FieldScorecard } from '@/components/modules/FieldScorecard'
import { MiddleEastCorrelation } from '@/components/modules/MiddleEastCorrelation'
import { CadenceBadge } from '@/components/CadenceBadge'

export function V2Page() {
  return (
    <div className="p-4 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Link to="/" className="text-[9px] text-muted hover:text-amber font-mono transition-colors">← HOME</Link>
        <span className="text-border">·</span>
        <span className="text-[9px] text-amber font-mono font-semibold">V2 TERMINAL</span>
        <span className="text-border">·</span>
        <span className="text-[8px] text-muted/50 font-mono">10 modules + V3 correlation · PRO</span>
      </div>

      {/* Module A — Price + News */}
      <section className="mb-3">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 pt-4 pb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center"><TrendingUp size={14} className="text-bg" /></div>
            <h2 className="text-sm font-semibold text-text-bright">Price & News Timeline</h2>
            <CadenceBadge cadence="live" />
            <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.01</span>
          </div>
          <div className="px-5 pb-4"><PriceNewsChart /></div>
        </div>
      </section>

      {/* Disruption Radar + Rig Count + Reserves */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        <div className="col-span-5">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-red/10 flex items-center justify-center"><Radar size={14} className="text-red" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Disruption Radar</h2>
              <CadenceBadge cadence="live" />
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><DisruptionRadar /></div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center"><Wrench size={14} className="text-teal" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Rig Count</h2>
              <CadenceBadge cadence="weekly" />
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><RigCountChart /></div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center"><Clock size={14} className="text-blue-400" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Reserves</h2>
              <CadenceBadge cadence="periodic" />
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><ReservesClock /></div>
          </div>
        </div>
      </div>

      {/* Supply-Demand + Refinery */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        <div className="col-span-6">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center"><BarChart3 size={14} className="text-purple-400" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Supply-Demand Simulator</h2>
              <CadenceBadge cadence="daily" />
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><SupplyDemandSim /></div>
          </div>
        </div>
        <div className="col-span-6">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><Activity size={14} className="text-orange-400" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Refinery Utilization</h2>
              <CadenceBadge cadence="weekly" />
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><RefineryHeatmap /></div>
          </div>
        </div>
      </div>

      {/* Flow + Chokepoints + Storage */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        <div className="col-span-5">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Zap size={14} className="text-cyan-400" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Global Flow Map</h2>
              <CadenceBadge cadence="weekly" />
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><GlobalFlow /></div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center"><Eye size={14} className="text-yellow-400" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Chokepoint Watch</h2>
              <CadenceBadge cadence="daily" />
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><Chokepoints /></div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Database size={14} className="text-emerald-400" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Storage + Satellite</h2>
              <CadenceBadge cadence="weekly" />
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><StorageSatellite /></div>
          </div>
        </div>
      </div>

      {/* Field Scorecard */}
      <section className="mb-3">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 pt-4 pb-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center"><Users size={14} className="text-rose-400" /></div>
            <h2 className="text-sm font-semibold text-text-bright">Field Scorecard</h2>
            <CadenceBadge cadence="periodic" />
          </div>
          <div className="px-5 pb-4"><FieldScorecard /></div>
        </div>
      </section>

      {/* V3 Correlation Engine */}
      <section className="mb-3">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 pt-4 pb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber to-red/70 flex items-center justify-center"><Globe size={14} className="text-white" /></div>
            <h2 className="text-sm font-semibold text-text-bright">ME ↔ Global Markets Correlation</h2>
            <span className="text-[8px] font-mono text-amber bg-amber/10 px-1.5 py-0.5 rounded border border-amber/20">V3</span>
          </div>
          <div className="px-5 pb-4"><MiddleEastCorrelation /></div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-4 border-t border-white/[0.04]">
        <div className="text-[9px] text-muted/40 font-mono space-y-0.5">
          <p>CrudePulse V2 Terminal — Real-Time Crude Oil Intelligence</p>
          <p>GDELT · Yahoo Finance · EIA · Baker Hughes · OPEC · USGS · Google News RSS</p>
          <p>Not financial advice</p>
        </div>
      </div>
    </div>
  )
}
