import { Activity, BarChart3 } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { MiddleEastCorrelation } from '@/components/modules/MiddleEastCorrelation'
import { SupplyDemandSim } from '@/components/modules/SupplyDemandSim'

export function AnalysisPage() {
  return (
    <PageLayout title="ANALYSIS" subtitle="Correlation engine · Supply-demand simulation">
      <div className="space-y-3">
        <ModuleCard icon={Activity} color="#00d4ff" title="ME ↔ Global Markets Correlation" cadence="LIVE">
          <MiddleEastCorrelation />
        </ModuleCard>

        <ModuleCard icon={BarChart3} color="#a855f7" title="Supply-Demand Simulator" cadence="LIVE">
          <SupplyDemandSim />
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Yahoo Finance · Google News RSS · Pearson correlation · Real-time simulation
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
