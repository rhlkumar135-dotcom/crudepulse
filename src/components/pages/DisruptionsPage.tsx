import { Radar, Eye } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { DisruptionRadar } from '@/components/modules/DisruptionRadar'
import { ChokepointsMonitor as Chokepoints } from '@/components/modules/Chokepoints'

export function DisruptionsPage() {
  return (
    <PageLayout title="DISRUPTIONS" subtitle="Real-time event monitoring · Chokepoint surveillance">
      <div className="space-y-3">
        <ModuleCard icon={Radar} color="#ff3366" title="Disruption Radar" cadence="LIVE">
          <DisruptionRadar />
        </ModuleCard>

        <ModuleCard icon={Eye} color="#F5A623" title="Chokepoint Watch" cadence="LIVE">
          <Chokepoints />
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#6b7280] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            GDELT · Google News RSS · USGS reference · 60s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
