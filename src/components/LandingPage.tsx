import { BarChart3, TrendingUp, Radar, Wrench, Activity, Globe, ArrowRight, Zap, Shield, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/markets', label: 'MARKETS', icon: TrendingUp, color: '#00ff88', desc: 'Price & News · Multi-Asset Comparison' },
  { to: '/disruptions', label: 'DISRUPTIONS', icon: Radar, color: '#ff3366', desc: 'Radar · Chokepoint Watch' },
  { to: '/operations', label: 'OPERATIONS', icon: Wrench, color: '#ff00ff', desc: 'Rigs · Refinery · Storage' },
  { to: '/analysis', label: 'ANALYSIS', icon: Activity, color: '#00d4ff', desc: 'Correlation Engine · Supply Simulator' },
  { to: '/global', label: 'GLOBAL', icon: Globe, color: '#F5A623', desc: 'Flows · Fields · Satellite Feed' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg relative flex flex-col overflow-hidden">
      {/* Circuit grid background */}
      <div className="absolute inset-0 circuit-grid opacity-50" />

      {/* Neon glow blobs */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-[#00ff88]/[0.02] blur-[200px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-[#ff00ff]/[0.015] blur-[150px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#00d4ff]/[0.01] blur-[120px] rounded-full" />

      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-[#00ff88]/10 blur-2xl rounded-full" />
              <div className="relative w-24 h-24 bg-[#12121a] border-2 border-[#00ff88] flex items-center justify-center"
                style={{ clipPath: 'polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                <BarChart3 size={40} className="text-[#00ff88]" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-[0.15em] text-white mb-4 uppercase"
              style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 20px #00ff8840, 0 0 40px #00ff8820' }}>
              <span className="cyber-glitch">CRUDE</span>
              <span className="text-[#00ff88]">PULSES</span>
            </h1>

            <p className="text-xs text-[#94A3B8] tracking-[0.3em] uppercase mb-6" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              <span className="text-[#00ff88]/60">&gt;</span> REAL-TIME CRUDE OIL INTELLIGENCE SYSTEM <span className="cursor-blink" />
            </p>

            <div className="flex items-center justify-center gap-6 text-[11px] text-[#94A3B8] tracking-[0.15em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              <span className="flex items-center gap-1.5"><span className="live-dot" /> LIVE DATA</span>
              <span className="text-[#2a2a3a]">│</span>
              <span>12 MODULES</span>
              <span className="text-[#2a2a3a]">│</span>
              <span className="text-[#00ff88]">100% FREE</span>
              <span className="text-[#2a2a3a]">│</span>
              <span>ZERO API KEYS</span>
            </div>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.to} to={item.to}
                  className="cyber-card corner-accents p-6 group cursor-pointer block">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center border"
                      style={{ borderColor: item.color + '40', backgroundColor: item.color + '10' }}>
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wider"
                        style={{ fontFamily: 'Orbitron, monospace' }}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] tracking-widest uppercase"
                        style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full mb-3" style={{ background: `linear-gradient(90deg, ${item.color}20, transparent)` }} />

                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase group-hover:gap-3 transition-all"
                    style={{ color: item.color, fontFamily: 'Share Tech Mono, monospace' }}>
                    ENTER <ArrowRight size={12} />
                  </div>
                </Link>
              )
            })}

            {/* Quick Access — Reserves */}
            <Link to="/reserves" className="cyber-card corner-accents p-6 group cursor-pointer block">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center border border-[#3B82F6]/40 bg-[#3B82F6]/10">
                  <Shield size={18} className="text-[#3B82F6]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-wider"
                    style={{ fontFamily: 'Orbitron, monospace' }}>RESERVES</div>
                  <div className="text-[10px] text-[#94A3B8] tracking-widest uppercase"
                    style={{ fontFamily: 'Share Tech Mono, monospace' }}>National Stockpile Data</div>
                </div>
              </div>
              <div className="h-px w-full mb-3" style={{ background: 'linear-gradient(90deg, #3B82F620, transparent)' }} />
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase group-hover:gap-3 transition-all text-[#3B82F6]"
                style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                ENTER <ArrowRight size={12} />
              </div>
            </Link>
          </div>

          {/* Sources */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#12121a] border border-[#2a2a3a]"
              style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}>
              <Lock size={10} className="text-[#00ff88]" />
              <span className="text-[10px] text-[#94A3B8] tracking-[0.2em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                GDELT · YAHOO FINANCE · EIA · BAKER HUGHES · OPEC · USGS · GOOGLE NEWS · NASA EONET
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
