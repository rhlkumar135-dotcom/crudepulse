import { Shield } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { ReservesClock } from '@/components/modules/ReservesClock'

export function ReservesPage() {
  return (
    <PageLayout title="RESERVES" subtitle="National strategic petroleum reserves">
      <div className="space-y-3">
        <ModuleCard icon={Shield} color="#3B82F6" title="Global Reserves" cadence="PERIODIC">
          <ReservesClock />
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[8px] text-[#6b7280] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            USGS · OPEC · FRED · Annual reference data
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
