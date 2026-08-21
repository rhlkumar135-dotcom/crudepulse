import { BarChart3, TrendingUp, Radar, Wrench, Activity, Globe, ArrowRight, Shield, Zap, Satellite, Droplets, Ship, Target, Eye, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/markets', label: 'MARKETS', icon: TrendingUp, color: '#00ff88', desc: 'Price & News · Multi-Asset Comparison' },
  { to: '/disruptions', label: 'DISRUPTIONS', icon: Radar, color: '#ff3366', desc: 'Radar · Chokepoint Watch' },
  { to: '/operations', label: 'OPERATIONS', icon: Wrench, color: '#ff00ff', desc: 'Rigs · Refinery · Storage' },
  { to: '/analysis', label: 'ANALYSIS', icon: Activity, color: '#00d4ff', desc: 'Correlation Engine · Supply Simulator' },
  { to: '/global', label: 'GLOBAL', icon: Globe, color: '#F5A623', desc: 'Flows · Fields · Satellite Feed' },
]

const INSIGHT_CARDS = [
  {
    title: 'Strait of Hormuz',
    subtitle: '21M bbl/d transit',
    metric: '3.5°C',
    metricLabel: 'thermal anomaly',
    color: '#F5A623',
    icon: Target,
    description: 'Real-time satellite monitoring reveals elevated thermal signatures near the world\'s most critical chokepoint.',
  },
  {
    title: 'Permian Basin',
    subtitle: 'Rig count: 287',
    metric: '12.5K',
    metricLabel: 'mtCO₂e methane',
    color: '#2DD4BF',
    icon: Activity,
    description: 'Production activity and emissions tracking — flaring intensity up 8% month-over-month.',
  },
  {
    title: 'Global Supply',
    subtitle: '101.2M bbl/d',
    metric: '-0.4',
    metricLabel: 'M bbl/d vs demand',
    color: '#ff3366',
    icon: Droplets,
    description: 'Supply-demand balance tightened by OPEC+ cuts. Spare capacity at 2.8M bbl/d — lowest since 2016.',
  },
  {
    title: 'Dark Vessels',
    subtitle: 'AIS gap detection',
    metric: '5',
    metricLabel: 'events in 24h',
    color: '#A78BFA',
    icon: Ship,
    description: 'Five tanker AIS transponders went dark near the Strait of Hormuz — potential sanctions evasion activity.',
  },
]

const FEATURES = [
  { icon: Satellite, label: 'Satellite Intel', desc: 'Thermal anomalies, emissions, SAR slick detection', color: '#F5A623' },
  { icon: Target, label: 'Chokepoint Radar', desc: 'Hormuz, Suez, Malacca — live disruption feed', color: '#ff3366' },
  { icon: BarChart3, label: 'Correlation Engine', desc: 'Cross-asset correlation heatmap (9×9 matrix)', color: '#00d4ff' },
  { icon: Shield, label: 'National Reserves', desc: 'SPR, IEA reserves, strategic stockpiles', color: '#3B82F6' },
  { icon: Globe, label: 'Trade Flows', desc: '15 major crude routes on world map', color: '#2DD4BF' },
  { icon: Zap, label: 'Zero API Keys', desc: 'GDELT, Yahoo, EIA, OPEC — all free sources', color: '#ff00ff' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060A10] relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/3 w-[700px] h-[500px] bg-[#00ff88]/[0.015] blur-[200px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-[#F5A623]/[0.012] blur-[180px] rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20">

        {/* ═══ HERO ═══ */}
        <div className="text-center mb-20">
          {/* Logo */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#00ff88]/8 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 bg-[#0C1018] border border-[#00ff88]/30 flex items-center justify-center rounded-lg">
              <BarChart3 size={32} className="text-[#00ff88]" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Crude Oil Intelligence
            <span className="block text-[#00ff88] mt-1">That Moves Markets</span>
          </h1>

          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Real-time satellite monitoring, trade flow tracking, disruption alerts, and supply-demand analytics —
            all from open sources. No subscriptions. No API keys. Just signal.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              Live Data
            </span>
            <span className="w-px h-4 bg-gray-700" />
            <span>12 Modules</span>
            <span className="w-px h-4 bg-gray-700" />
            <span className="text-[#00ff88] font-semibold">100% Free</span>
          </div>
        </div>

        {/* ═══ INSIGHT PREVIEW CARDS ═══ */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <p className="text-xs text-gray-500 tracking-[0.3em] uppercase mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Live Intelligence Feed
            </p>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              What You'll See Inside
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSIGHT_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title}
                  className="relative group p-5 rounded-xl border border-white/[0.06] bg-[#0C1018]/80 hover:bg-[#0F1520] transition-all duration-300 hover:border-white/[0.12]">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-5 right-5 h-px" style={{ background: `linear-gradient(90deg, transparent, ${card.color}40, transparent)` }} />

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '12' }}>
                      <Icon size={16} style={{ color: card.color }} />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: card.color, fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {card.metric}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {card.metricLabel}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-0.5" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {card.subtitle}
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ MODULE NAVIGATION ═══ */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <p className="text-xs text-gray-500 tracking-[0.3em] uppercase mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Dashboard Modules
            </p>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Explore the Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.to} to={item.to}
                  className="group p-5 rounded-xl border border-white/[0.06] bg-[#0C1018]/80 hover:bg-[#0F1520] transition-all duration-300 hover:border-white/[0.12] block">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + '12' }}>
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-gray-500 tracking-wider uppercase" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase group-hover:gap-2.5 transition-all"
                    style={{ color: item.color, fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Explore <ChevronRight size={14} />
                  </div>
                </Link>
              )
            })}

            {/* Reserves */}
            <Link to="/reserves" className="group p-5 rounded-xl border border-white/[0.06] bg-[#0C1018]/80 hover:bg-[#0F1520] transition-all duration-300 hover:border-white/[0.12] block">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#3B82F6]/10">
                  <Shield size={18} className="text-[#3B82F6]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>RESERVES</div>
                  <div className="text-[10px] text-gray-500 tracking-wider uppercase" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>National Stockpile Data</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase group-hover:gap-2.5 transition-all text-[#3B82F6]"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Explore <ChevronRight size={14} />
              </div>
            </Link>
          </div>
        </div>

        {/* ═══ FEATURES STRIP ═══ */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.label} className="text-center p-4 rounded-xl border border-white/[0.04] bg-[#0A0E15]">
                  <Icon size={20} className="mx-auto mb-2" style={{ color: feat.color }} />
                  <div className="text-xs font-bold text-white mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {feat.label}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-snug" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {feat.desc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ DATA SOURCES ═══ */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-xl bg-[#0C1018] border border-white/[0.06]">
            <Eye size={14} className="text-[#00ff88]" />
            <div className="flex items-center gap-4 text-xs text-gray-500 tracking-wider uppercase" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <span>GDELT</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>Yahoo Finance</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>EIA</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>Baker Hughes</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>OPEC</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>USGS</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>NASA EONET</span>
            </div>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="text-center mt-12">
          <p className="text-[10px] text-gray-600" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            CRUDEPULSES — Open-source crude oil intelligence. Data is aggregated from public sources and may contain inaccuracies.
          </p>
        </div>
      </div>
    </div>
  )
}
