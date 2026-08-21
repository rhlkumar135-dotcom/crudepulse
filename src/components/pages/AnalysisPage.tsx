import { Activity, BarChart3 } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { MiddleEastCorrelation } from '@/components/modules/MiddleEastCorrelation'
import { SupplyDemandSim } from '@/components/modules/SupplyDemandSim'

export function AnalysisPage() {
  return (
    <PageLayout title="Analysis" subtitle="Global zone events · Correlation engine · Supply-demand simulation">
      <div className="space-y-4">
        <ModuleCard icon={Activity} color="#00d4ff" title="Global Zone Events ↔ Markets Correlation" cadence="LIVE">
          <MiddleEastCorrelation />
        </ModuleCard>

        <ModuleCard icon={BarChart3} color="#a855f7" title="Supply-Demand Simulator" cadence="LIVE">
          <SupplyDemandSim />
        </ModuleCard>

        <div className="text-center py-3">
          <div className="text-xs text-[#94A3B8] tracking-[0.12em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Yahoo Finance · Google News RSS · Pearson correlation · Real-time simulation
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
