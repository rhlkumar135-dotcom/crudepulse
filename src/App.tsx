import { useState, useEffect } from 'react'
import {
  TrendingUp, Radar, Wrench, Clock, BarChart3,
  User, LogOut, Zap, Shield, Users, Eye, EyeOff,
  ChevronDown, Database, Activity
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { TickerBar } from '@/components/TickerBar'
import { CadenceBadge } from '@/components/CadenceBadge'
import { PricingPage } from '@/components/PricingPage'
import { PriceNewsChart } from '@/components/modules/PriceNews'
import { DisruptionRadar } from '@/components/modules/DisruptionRadar'
import { RigCountChart } from '@/components/modules/RigCount'
import { ReservesClock } from '@/components/modules/ReservesClock'
import { GlobalFlowMap as GlobalFlow } from '@/components/modules/GlobalFlow'
import { ChokepointsMonitor as Chokepoints } from '@/components/modules/Chokepoints'
import { SupplyDemandSim } from '@/components/modules/SupplyDemandSim'
import { RefineryHeatmap } from '@/components/modules/RefineryHeatmap'
import { StorageSatellite } from '@/components/modules/StorageSatellite'
import { FieldScorecard } from '@/components/modules/FieldScorecard'

type Tier = 'free' | 'pro'
type Role = 'user' | 'admin'

interface AuthState {
  isLoggedIn: boolean
  email: string
  tier: Tier
  role: Role
  name: string
}

const API = '/api'

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [showPricing, setShowPricing] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  if (showPricing) return <PricingPage onBack={() => setShowPricing(false)} />
  if (!auth) return <AuthScreen onLogin={(a) => setAuth(a)} onShowPricing={() => setShowPricing(true)} />

  const isAdmin = auth.role === 'admin'
  const isPro = auth.tier === 'pro'

  return (
    <div className="min-h-screen bg-bg relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-amber/[0.015] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] bg-teal/[0.01] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        <TickerBar />

        {/* Header */}
        <header className="h-12 border-b border-border flex items-center px-4 gap-3 bg-bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center shadow-sm shadow-amber/20">
              <BarChart3 size={14} className="text-bg" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold tracking-wide text-text-bright">CrudePulse</span>
              <span className="text-[8px] font-mono text-amber/50 tracking-widest">V2 TERMINAL</span>
            </div>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Live status */}
          <div className="flex items-center gap-1.5">
            <span className="live-dot" />
            <span className="text-[9px] font-mono text-green-400 tracking-wider">SYSTEMS NOMINAL</span>
          </div>

          <div className="flex-1" />

          {/* Admin badge */}
          {isAdmin && (
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber/[0.06] border border-amber/15 text-amber text-[9px] font-mono font-medium hover:bg-amber/10 transition-colors"
            >
              <Shield size={10} />
              ADMIN
              <ChevronDown size={8} className={cn('transition-transform', showAdmin && 'rotate-180')} />
            </button>
          )}

          {/* Tier badge */}
          <div className={cn(
            'px-2 py-0.5 rounded text-[9px] font-mono font-medium tracking-wider border',
            isPro ? 'bg-amber/[0.08] text-amber border-amber/20' : 'bg-white/[0.03] text-muted border-white/5'
          )}>
            {isPro ? '⚡ PRO' : 'FREE'}
          </div>
          {!isPro && (
            <button
              onClick={() => setShowPricing(true)}
              className="px-2.5 py-1 bg-gradient-to-r from-amber to-amber/90 text-bg rounded-lg text-[9px] font-semibold hover:shadow-md hover:shadow-amber/20 transition-all"
            >
              UPGRADE
            </button>
          )}

          <div className="w-px h-5 bg-border" />

          {/* User */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center',
              isAdmin ? 'bg-amber/15 ring-1 ring-amber/30' : 'bg-white/5'
            )}>
              {isAdmin ? <Shield size={11} className="text-amber" /> : <User size={11} className="text-muted" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-text leading-tight">{auth.name}</span>
              <span className="text-[8px] text-muted font-mono leading-tight">{auth.email}</span>
            </div>
          </div>
          <button onClick={() => setAuth(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text transition-colors" title="Sign out">
            <LogOut size={13} />
          </button>
        </header>

        {/* Admin Panel */}
        {isAdmin && showAdmin && (
          <AdminPanel email={auth.email} onClose={() => setShowAdmin(false)} />
        )}

        {/* Dashboard */}
        <main className="p-4 max-w-[1600px] mx-auto">
          {/* Row 1: Module A — Price + News (full width) */}
          <section className="mb-3">
            <div className="glass-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center">
                  <TrendingUp size={14} className="text-bg" />
                </div>
                <h2 className="text-sm font-semibold text-text-bright">Price & News Timeline</h2>
                <CadenceBadge cadence="live" />
                <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.01 · WTI / Brent</span>
                <div className="flex-1" />
                {!isPro ? (
                  <span className="text-[9px] font-mono text-muted bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.04]">
                    STALE — <button onClick={() => setShowPricing(true)} className="text-amber hover:underline font-medium">Pro for live</button>
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-amber bg-amber/[0.06] px-2 py-0.5 rounded border border-amber/15 flex items-center gap-1">
                    <Activity size={8} /> FRESHEST DATA
                  </span>
                )}
              </div>
              <div className="px-5 pb-4"><PriceNewsChart /></div>
              <div className="border-t border-white/[0.04] mx-5 py-2">
                <div className="text-[8px] font-mono text-muted/50">GDELT + Alpha Vantage + NewsAPI · Refresh: {isPro ? '4h' : '8h'}</div>
              </div>
            </div>
          </section>

          {/* Row 2: Disruption Radar + Rig Count + Reserves Clock */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            <div className="col-span-5">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-red/10 flex items-center justify-center"><Radar size={14} className="text-red" /></div>
                  <h2 className="text-sm font-semibold text-text-bright">Disruption Radar</h2>
                  <CadenceBadge cadence="live" />
                  <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.02 · GDELT</span>
                </div>
                <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><DisruptionRadar /></div>
                <div className="border-t border-white/[0.04] mx-5 py-2"><div className="text-[8px] font-mono text-muted/50">GDELT Project · No key required · 30-min refresh</div></div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center"><Wrench size={14} className="text-teal" /></div>
                  <h2 className="text-sm font-semibold text-text-bright">Rig Count</h2>
                  <CadenceBadge cadence="weekly" />
                  <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.03</span>
                </div>
                <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><RigCountChart /></div>
                <div className="border-t border-white/[0.04] mx-5 py-2"><div className="text-[8px] font-mono text-muted/50">Baker Hughes · Public weekly XLSX</div></div>
              </div>
            </div>
            <div className="col-span-3">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center"><Clock size={14} className="text-blue-400" /></div>
                  <h2 className="text-sm font-semibold text-text-bright">Reserves</h2>
                  <CadenceBadge cadence="periodic" />
                  <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.04</span>
                </div>
                <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><ReservesClock /></div>
                <div className="border-t border-white/[0.04] mx-5 py-2"><div className="text-[8px] font-mono text-muted/50">EIA · USGS · Annual</div></div>
              </div>
            </div>
          </div>

          {/* Row 3: Supply-Demand Sim + Refinery Heatmap */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            <div className="col-span-6">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center"><BarChart3 size={14} className="text-purple-400" /></div>
                  <h2 className="text-sm font-semibold text-text-bright">Supply-Demand Simulator</h2>
                  <CadenceBadge cadence="daily" />
                  <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.05 · EIA</span>
                </div>
                <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><SupplyDemandSim /></div>
                <div className="border-t border-white/[0.04] mx-5 py-2"><div className="text-[8px] font-mono text-muted/50">EIA STEO + OPEC MOMR · Daily</div></div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><Activity size={14} className="text-orange-400" /></div>
                  <h2 className="text-sm font-semibold text-text-bright">Refinery Utilization</h2>
                  <CadenceBadge cadence="weekly" />
                  <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.06 · EIA</span>
                </div>
                <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><RefineryHeatmap /></div>
                <div className="border-t border-white/[0.04] mx-5 py-2"><div className="text-[8px] font-mono text-muted/50">EIA WPSR · PADD regions · Weekly</div></div>
              </div>
            </div>
          </div>

          {/* Row 4: Global Flow + Chokepoints + Storage */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            <div className="col-span-5">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Zap size={14} className="text-cyan-400" /></div>
                  <h2 className="text-sm font-semibold text-text-bright">Global Flow Map</h2>
                  <CadenceBadge cadence="weekly" />
                  <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.07 · UN Comtrade</span>
                </div>
                <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><GlobalFlow /></div>
                <div className="border-t border-white/[0.04] mx-5 py-2"><div className="text-[8px] font-mono text-muted/50">UN Comtrade + OPEC ASB · Monthly</div></div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center"><Eye size={14} className="text-yellow-400" /></div>
                  <h2 className="text-sm font-semibold text-text-bright">Chokepoint Watch</h2>
                  <CadenceBadge cadence="daily" />
                  <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.08 · 8 straits</span>
                </div>
                <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><Chokepoints /></div>
                <div className="border-t border-white/[0.04] mx-5 py-2"><div className="text-[8px] font-mono text-muted/50">GDELT disruption overlay + reference data</div></div>
              </div>
            </div>
            <div className="col-span-3">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Database size={14} className="text-emerald-400" /></div>
                  <h2 className="text-sm font-semibold text-text-bright">Storage + Satellite</h2>
                  <CadenceBadge cadence="weekly" />
                  <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.09</span>
                </div>
                <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><StorageSatellite /></div>
                <div className="border-t border-white/[0.04] mx-5 py-2"><div className="text-[8px] font-mono text-muted/50">EIA + Sentinel-2 · Weekly</div></div>
              </div>
            </div>
          </div>

          {/* Row 5: Field Scorecard (full width) */}
          <section className="mb-3">
            <div className="glass-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center"><Users size={14} className="text-rose-400" /></div>
                <h2 className="text-sm font-semibold text-text-bright">Field Scorecard</h2>
                <CadenceBadge cadence="periodic" />
                <span className="text-[8px] font-mono text-muted/60 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">MOD.10 · OPEC ASB</span>
              </div>
              <div className="px-5 pb-4"><FieldScorecard /></div>
              <div className="border-t border-white/[0.04] mx-5 py-2">
                <div className="text-[8px] font-mono text-muted/50">OPEC ASB + IHS Markit · Annual/Quarterly</div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center py-4 border-t border-white/[0.04]">
            <div className="text-[9px] text-muted/40 font-mono space-y-0.5">
              <p>CrudePulse V2 Terminal — Real-Time Crude Oil Intelligence</p>
              <p>GDELT · Alpha Vantage · NewsAPI · EIA · Baker Hughes · UN Comtrade · OPEC ASB · USGS</p>
              <p>Not financial advice</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// ═══ Admin Panel ══════════════════════════════════════════════════════════════

function AdminPanel({ email, onClose }: { email: string; onClose: () => void }) {
  const [users, setUsers] = useState<Array<{ id: string; email: string; name: string; tier: string; role: string; createdAt: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/admin/users?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [email])

  return (
    <div className="border-b border-amber/10 bg-amber/[0.02]">
      <div className="max-w-[1400px] mx-auto px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={12} className="text-amber" />
          <span className="text-[10px] font-mono text-amber tracking-wider font-semibold">ADMIN PANEL</span>
          <span className="text-[8px] font-mono text-muted">{users.length} users</span>
          <div className="flex-1" />
          <button onClick={onClose} className="text-[9px] text-muted hover:text-text font-mono">close ×</button>
        </div>
        {loading ? (
          <div className="text-[9px] text-muted font-mono">Loading users...</div>
        ) : (
          <div className="space-y-0.5">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 py-1 text-[10px] font-mono">
                <div className={cn('w-4 h-4 rounded-full flex items-center justify-center', u.role === 'admin' ? 'bg-amber/15' : 'bg-white/5')}>
                  {u.role === 'admin' ? <Shield size={8} className="text-amber" /> : <User size={8} className="text-muted" />}
                </div>
                <span className="text-text w-[180px] truncate">{u.email}</span>
                <span className="text-muted">{u.name}</span>
                <div className="flex-1" />
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[8px] font-medium',
                  u.tier === 'pro' ? 'bg-amber/10 text-amber' : 'bg-white/5 text-muted'
                )}>{u.tier}</span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[8px] font-medium',
                  u.role === 'admin' ? 'bg-amber/10 text-amber' : 'bg-white/5 text-muted'
                )}>{u.role}</span>
                <span className="text-muted/50">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══ Auth Screen ══════════════════════════════════════════════════════════════

function AuthScreen({ onLogin, onShowPricing }: { onLogin: (a: AuthState) => void; onShowPricing: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Authentication failed')
        setLoading(false)
        return
      }

      onLogin({
        isLoggedIn: true,
        email: data.user.email,
        tier: data.user.tier,
        role: data.user.role,
        name: data.user.name,
      })
    } catch {
      setError('Network error — try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(245,166,35,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber/[0.02] blur-[150px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[300px] bg-teal/[0.015] blur-[100px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-xl bg-amber/10 blur-xl" />
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center shadow-lg shadow-amber/20">
              <BarChart3 size={30} className="text-bg" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-text-bright mb-1">CrudePulse</h1>
          <p className="text-[10px] text-muted font-mono tracking-[0.2em]">REAL-TIME CRUDE OIL INTELLIGENCE</p>
        </div>

        {/* Auth card */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-bright">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
              <span className="text-[8px] font-mono text-muted/40 tracking-wider">SECURE</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {isSignUp && (
                <div>
                  <label className="block text-[8px] text-muted font-mono mb-1 tracking-widest">NAME</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-border text-[13px] text-text placeholder:text-muted/30 focus:outline-none focus:border-amber/30 focus:ring-1 focus:ring-amber/10 transition-all font-mono" />
                </div>
              )}
              <div>
                <label className="block text-[8px] text-muted font-mono mb-1 tracking-widest">EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-border text-[13px] text-text placeholder:text-muted/30 focus:outline-none focus:border-amber/30 focus:ring-1 focus:ring-amber/10 transition-all font-mono" />
              </div>
              <div>
                <label className="block text-[8px] text-muted font-mono mb-1 tracking-widest">PASSWORD</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-3 py-2 pr-9 rounded-lg bg-white/[0.03] border border-border text-[13px] text-text placeholder:text-muted/30 focus:outline-none focus:border-amber/30 focus:ring-1 focus:ring-amber/10 transition-all font-mono" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors">
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {error && <div className="text-[11px] text-red p-2 rounded-lg bg-red/[0.06] border border-red/10 font-mono">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber to-amber/90 text-bg font-semibold text-[13px] hover:shadow-lg hover:shadow-amber/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                {loading ? '...' : isSignUp ? 'Create Free Account' : 'Sign In'}
              </button>
            </form>
          </div>
          <div className="border-t border-white/[0.04] px-5 py-3 flex items-center justify-between">
            <span className="text-[10px] text-muted">
              {isSignUp ? 'Have an account?' : "New here?"}
              <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} className="ml-1 text-amber hover:text-amber/80 font-medium">
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </span>
            <button onClick={onShowPricing} className="text-[9px] text-muted hover:text-amber transition-colors font-mono tracking-wider">
              PRICING →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
