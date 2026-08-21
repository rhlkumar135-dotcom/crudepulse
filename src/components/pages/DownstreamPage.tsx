import { Droplets, MapPin } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageLayout, ModuleCard } from './PageLayout'
import { useMarketData } from '@/lib/useMarketData'
import { cn } from '@/lib/cn'

interface ProductPrice {
  product: string
  region: string
  price_gallon: number
  unit: string
  change_pct: number
  source: string
}

interface CrackSpread {
  name: string
  value: number
  change_pct: number
}

interface CrudeComparisonPoint {
  date: string
  crude: number
  gasoline: number
  diesel: number
}

interface DownstreamResponse {
  products: Array<{ product: string; region: string; pricePerGal: number; changePct: number; source: string }>
  crackSpreads: { gulfGasolineCrack: number; gulfDieselCrack: number; note: string }
  news: Array<{ title: string; source: string; time: string }>
  lastUpdated: string
}

const PRODUCT_COLOR: Record<string, string> = {
  'Gasoline': '#ff3366',
  'Diesel': '#00d4ff',
  'Jet Fuel': '#F5A623',
  'Heating Oil': '#ff00ff',
  'Ethanol': '#00ff88',
  'Propane': '#A78BFA',
}

export function DownstreamPage() {
  const { data, loading } = useMarketData<DownstreamResponse>('/api/market/downstream', 'free', 30_000)
  const products = data?.products ?? []

  if (loading && !products.length) {
    return <PageLayout title="Downstream Product Prices" subtitle="Gasoline · Diesel · Jet Fuel · Heating Oil · Crack spreads"><div className="text-[#94A3B8] text-sm font-mono animate-pulse">Loading downstream data…</div></PageLayout>
  }

  const grouped = new Map<string, ProductPrice[]>()
  for (const p of products) {
    const list = grouped.get(p.product) || []
    list.push(p)
    grouped.set(p.product, list)
  }

  return (
    <PageLayout title="Downstream Product Prices" subtitle="Gasoline · Diesel · Jet Fuel · Regional pricing · Crack spreads">
      <div className="space-y-4">

        {/* Product Price Cards */}
        {Array.from(grouped.entries()).map(([product, prices]) => (
          <ModuleCard key={product} icon={Droplets} color={PRODUCT_COLOR[product] || '#94A3B8'} title={product} cadence="WEEKLY" tag={`EIA · ${prices[0]?.source || 'Public data'}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
              {prices.map((p, i) => (
                <div key={i} className="bg-[#0d1117] border border-white/[0.05] rounded p-3 space-y-1.5">
                  <div className="flex items-center gap-1">
                    <MapPin size={9} className="text-[#4a4a5a]" />
                    <span className="text-[9px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{p.region}</span>
                  </div>
                  <div className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
                    ${p.pricePerGal?.toFixed(2) ?? '—'}<span className="text-[9px] text-[#94A3B8] ml-0.5">/gal</span>
                  </div>
                  <div className={cn('text-[10px] font-mono', (p.changePct ?? 0) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]')}>
                    {(p.changePct ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(p.changePct ?? 0).toFixed(1)}%
                  </div>
                  <div className="text-[8px] text-[#4a4a5a]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>Geographic scope: {p.region}</div>
                </div>
              ))}
            </div>
          </ModuleCard>
        ))}

        {/* Crack Spreads */}
        {data?.crack_spreads && data.crack_spreads.length > 0 && (
          <ModuleCard icon={Droplets} color="#ff00ff" title="Crack Spreads" cadence="WEEKLY" tag="Refining margin indicator">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {data.crack_spreads.map(cs => (
                <div key={cs.name} className="bg-[#0d1117] border border-white/[0.05] rounded p-3 text-center">
                  <div className="text-[9px] text-[#94A3B8] mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{cs.name}</div>
                  <div className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>${cs.value.toFixed(2)}</div>
                  <div className={cn('text-[10px] font-mono', cs.change_pct >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]')}>
                    {cs.change_pct >= 0 ? '+' : ''}{cs.change_pct.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </ModuleCard>
        )}

        {/* Crude vs Product Chart */}
        {data?.crude_vs_products && data.crude_vs_products.length > 0 && (
          <ModuleCard icon={Droplets} color="#00d4ff" title="Crude vs Downstream Products (Synced)" cadence="WEEKLY" tag="Lag/pass-through relationship">
            <div style={{ height: 220 }} className="mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.crude_vs_products} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                  <XAxis dataKey="date" tick={{ fill: '#4a4a5a', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }} tickLine={false} />
                  <YAxis tick={{ fill: '#4a4a5a', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1a2a3a', borderRadius: 4, fontSize: 11 }} />
                  <Line type="monotone" dataKey="crude" stroke="#00ff88" strokeWidth={2} dot={false} name="WTI Crude" />
                  <Line type="monotone" dataKey="gasoline" stroke="#ff3366" strokeWidth={2} dot={false} name="Gasoline" />
                  <Line type="monotone" dataKey="diesel" stroke="#00d4ff" strokeWidth={2} dot={false} name="Diesel" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ModuleCard>
        )}

        <div className="text-center py-2">
          <div className="text-[10px] text-[#94A3B8] tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            EIA Gasoline &amp; Diesel Retail Prices · EIA Jet Fuel / Heating Oil · 30s refresh
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
