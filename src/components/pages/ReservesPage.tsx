import { Shield } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { ReservesClock } from '@/components/modules/ReservesClock'

export function ReservesPage() {
  return (
    <PageLayout title="Reserves" subtitle="National strategic petroleum reserves">
      <div className="space-y-4">
        <ModuleCard icon={Shield} color="#3B82F6" title="Global Reserves" cadence="PERIODIC">
          <ReservesClock />
        </ModuleCard>

        <div className="text-center py-3">
          <div className="text-xs text-[#94A3B8] tracking-[0.12em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            USGS · OPEC · FRED · Annual reference data
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
