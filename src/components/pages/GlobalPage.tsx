import { Globe, Users, Globe as GlobeIcon } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { GlobalFlowMap as GlobalFlow } from '@/components/modules/GlobalFlow'
import { FieldScorecard } from '@/components/modules/FieldScorecard'
import CopernicusMap from '@/components/modules/CopernicusMap'

export function GlobalPage() {
  return (
    <PageLayout title="GLOBAL" subtitle="Trade flows · Field performance · Satellite monitoring">
      <div className="space-y-3">
        <ModuleCard icon={Globe} color="#00d4ff" title="Global Flow Map" cadence="LIVE">
          <GlobalFlow />
        </ModuleCard>

        <ModuleCard icon={Users} color="#f43f5e" title="Field Scorecard" cadence="LIVE">
          <FieldScorecard />
        </ModuleCard>

        <ModuleCard icon={GlobeIcon} color="#a855f7" title="Copernicus / Satellite Feed" cadence="LIVE"
          tag="NASA EONET · NOAA Coral Reef Watch">
          <div style={{ height: 300 }}><CopernicusMap /></div>
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            IEA · OPEC · NASA EONET · NOAA · Google News · 60s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
