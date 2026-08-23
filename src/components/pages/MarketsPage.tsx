import { TrendingUp, Activity, Globe } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { PriceNewsChart } from '@/components/modules/PriceNews'
import MultiAssetChart from '@/components/modules/MultiAssetChart'

export function MarketsPage() {
  return (
    <PageLayout title="Markets" subtitle="Price action · News feed · Multi-asset comparison">
      <div className="space-y-4">
        <ModuleCard icon={TrendingUp} color="#00ff88" title="Price & News" cadence="LIVE">
          <PriceNewsChart />
        </ModuleCard>

        <ModuleCard icon={Activity} color="#00d4ff" title="Multi-Asset Comparison" cadence="LIVE"
          tag="BTC · Gold · Silver · Crude · Top 5 Indices">
          <div style={{ height: 400 }}><MultiAssetChart /></div>
        </ModuleCard>

        <div className="text-center py-3">
          <div className="text-xs text-[#94A3B8] tracking-[0.12em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Yahoo Finance · Google News RSS · CoinGecko · Swissquote · GDELT · streaming
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
