import { Wrench, Activity, Database } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { RigCountChart } from '@/components/modules/RigCount'
import { RefineryHeatmap } from '@/components/modules/RefineryHeatmap'
import { StorageSatellite } from '@/components/modules/StorageSatellite'

export function OperationsPage() {
  return (
    <PageLayout title="Operations" subtitle="Rig activity · Refinery utilization · Storage levels">
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">
            <ModuleCard icon={Wrench} color="#ff00ff" title="Rig Count" cadence="LIVE" className="h-full">
              <RigCountChart />
            </ModuleCard>
          </div>
          <div className="col-span-7">
            <ModuleCard icon={Activity} color="#F5A623" title="Refinery Utilization" cadence="LIVE" className="h-full">
              <RefineryHeatmap />
            </ModuleCard>
          </div>
        </div>

        <ModuleCard icon={Database} color="#22C55E" title="Storage + Satellite" cadence="LIVE">
          <StorageSatellite />
        </ModuleCard>

        <div className="text-center py-3">
          <div className="text-xs text-[#94A3B8] tracking-[0.12em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Baker Hughes · EIA WPST Table 1+2+4 · Google News · 60s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
