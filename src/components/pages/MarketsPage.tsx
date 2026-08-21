import { TrendingUp, Activity, Globe } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'
import { PriceNewsChart } from '@/components/modules/PriceNews'
import MultiAssetChart from '@/components/modules/MultiAssetChart'

export function MarketsPage() {
  return (
    <PageLayout title="MARKETS" subtitle="Price action · News feed · Multi-asset comparison">
      <div className="space-y-3">
        <ModuleCard icon={TrendingUp} color="#00ff88" title="Price & News" cadence="LIVE">
          <PriceNewsChart />
        </ModuleCard>

        <ModuleCard icon={Activity} color="#00d4ff" title="Multi-Asset Comparison" cadence="LIVE"
          tag="BTC · Gold · Silver · Crude · Top 5 Indices">
          <div style={{ height: 380 }}><MultiAssetChart /></div>
        </ModuleCard>

        <div className="text-center py-2">
          <div className="text-[10px] text-[#6b7280] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Yahoo Finance · Google News RSS · CoinGecko · Swissquote · GDELT · 1s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
