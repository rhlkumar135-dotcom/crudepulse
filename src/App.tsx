import { useState, useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { User, LogOut, Shield, Eye, EyeOff, TrendingUp, Radar, Wrench, Activity, Globe, Satellite, Newspaper, Menu, X, Droplets, Building2, Ship, BarChart3, ShieldAlert, Factory, Route as RouteIcon, Filter } from 'lucide-react'
import { cn } from '@/lib/cn'
import { TickerBar } from '@/components/TickerBar'
import { LandingPage } from '@/components/LandingPage'
import { MarketsPage } from '@/components/pages/MarketsPage'
import { DisruptionsPage } from '@/components/pages/DisruptionsPage'
import { OperationsPage } from '@/components/pages/OperationsPage'
import { AnalysisPage } from '@/components/pages/AnalysisPage'
import { GlobalPage } from '@/components/pages/GlobalPage'
import { ReservesPage } from '@/components/pages/ReservesPage'
import { SatelliteIntelPage } from '@/components/pages/SatelliteIntelPage'
import { NewsAtlasPage } from '@/components/pages/NewsAtlasPage'
import { GradesPage } from '@/components/pages/GradesPage'
import { MajorsPage } from '@/components/pages/MajorsPage'
import { SPRTrackerPage } from '@/components/pages/SPRTrackerPage'
import { RefineryDirectoryPage } from '@/components/pages/RefineryDirectoryPage'
import { PipelineMapPage } from '@/components/pages/PipelineMapPage'
import { FreightTrackerPage } from '@/components/pages/FreightTrackerPage'
import { FuturesCurvePage } from '@/components/pages/FuturesCurvePage'
import { OPECCompliancePage } from '@/components/pages/OPECCompliancePage'
import { DownstreamPage } from '@/components/pages/DownstreamPage'
import { SanctionsTrackerPage } from '@/components/pages/SanctionsTrackerPage'

type Role = 'user' | 'admin'

interface AuthState {
  isLoggedIn: boolean
  email: string
  role: Role
  name: string
}

class ErrorBoundary extends Component<{ children: ReactNode; name: string }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' }
  static getDerivedStateFromError(err: Error) { return { hasError: true, error: err.message } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-[#12121a] border border-[#ff3366]/20"
          style={{ clipPath: 'polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          <div className="text-[10px] font-bold text-[#ff3366] tracking-wider uppercase mb-1"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            MODULE ERROR — {this.props.name}
          </div>
          <div className="text-[9px] text-[#94A3B8]">{this.state.error}</div>
        </div>
      )
    }
    return this.props.children
  }
}

// ═══ Cyberpunk Nav Shell ═══════════════════════════════════════════════════

interface NavItem { to: string; label: string; icon: any; color: string }

const ALL_TABS: NavItem[] = [
  // Core
  { to: '/markets', label: 'Markets', icon: TrendingUp, color: '#00ff88' },
  { to: '/disruptions', label: 'Disruptions', icon: Radar, color: '#ff3366' },
  { to: '/operations', label: 'Operations', icon: Wrench, color: '#ff00ff' },
  { to: '/analysis', label: 'Analysis', icon: Activity, color: '#00d4ff' },
  { to: '/global', label: 'Global', icon: Globe, color: '#F5A623' },
  { to: '/satellite-intel', label: 'Satellite', icon: Satellite, color: '#00d4ff' },
  { to: '/news', label: 'News', icon: Newspaper, color: '#FFC107' },
  // Markets
  { to: '/futures', label: 'Futures', icon: BarChart3, color: '#00ff88' },
  { to: '/majors', label: 'Majors', icon: Building2, color: '#00d4ff' },
  { to: '/freight', label: 'Freight', icon: Ship, color: '#ff9500' },
  { to: '/downstream', label: 'Downstream', icon: Droplets, color: '#ff3366' },
  { to: '/grades', label: 'Grades', icon: Filter, color: '#2DD4BF' },
  // Supply
  { to: '/spr', label: 'SPR', icon: Shield, color: '#00d4ff' },
  { to: '/refineries', label: 'Refineries', icon: Factory, color: '#94A3B8' },
  { to: '/pipelines', label: 'Pipelines', icon: RouteIcon, color: '#F5A623' },
  // Policy
  { to: '/opec-compliance', label: 'OPEC+', icon: ShieldAlert, color: '#ff00ff' },
  { to: '/sanctions', label: 'Sanctions', icon: ShieldAlert, color: '#ff3366' },
]

function NavBar({ auth, onLogout }: { auth: AuthState | null; onLogout: () => void }) {
  const location = useLocation()
  const path = location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (item: NavItem) => path === item.to || (item.to !== '/' && path.startsWith(item.to))

  return (
    <>
      <TickerBar />
      <header className="border-b border-[#2a2a3a] bg-[#0a0a0f]/90 backdrop-blur-md">
        {/* Top row: brand + auth */}
        <div className="flex items-center px-5 h-10 gap-3">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            <span className="text-sm font-black tracking-[0.1em] text-white"
              style={{ fontFamily: 'Orbitron, monospace' }}>
              CRUDE<span className="text-[#00ff88]">PULSES</span>
            </span>
          </Link>

          <div className="w-px h-5 bg-[#2a2a3a] shrink-0" />

          {/* Live indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="live-dot" />
            <span className="text-[10px] font-bold text-[#00ff88] tracking-[0.12em]"
              style={{ fontFamily: 'Share Tech Mono, monospace' }}>LIVE</span>
          </div>

          <div className="flex-1" />

          {/* Auth */}
          {auth && (
            <>
              {auth.role === 'admin' && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#F5A623]/[0.08] border border-[#F5A623]/20 text-[#F5A623] text-[10px] font-bold tracking-wider rounded-sm"
                  style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  <Shield size={10} /> ADMIN
                </div>
              )}
              <div className="w-px h-5 bg-[#2a2a3a] hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center border rounded-sm"
                  style={{
                    borderColor: auth.role === 'admin' ? '#F5A62340' : '#2a2a3a',
                    backgroundColor: auth.role === 'admin' ? '#F5A62315' : '#ffffff08'
                  }}>
                  {auth.role === 'admin' ? <Shield size={11} className="text-[#F5A623]" /> : <User size={11} className="text-[#94A3B8]" />}
                </div>
                <span className="text-xs font-medium text-[#e0e0e0]">{auth.name}</span>
              </div>
              <button onClick={onLogout}
                className="p-1.5 hover:bg-[#ff3366]/10 text-[#94A3B8] hover:text-[#ff3366] transition-colors rounded-sm"
                title="Sign out">
                <LogOut size={14} />
              </button>
            </>
          )}
          {!auth && (
            <Link to="/" className="px-4 py-1.5 border border-[#00ff88]/30 text-[#00ff88] text-[10px] font-bold tracking-wider hover:bg-[#00ff88]/10 transition-all rounded-sm"
              style={{ fontFamily: 'Orbitron, monospace' }}>
              SIGN IN
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 text-[#94A3B8] hover:text-white">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Tab bar — all 17 tabs, wrapping to multiline */}
        <nav className="hidden md:flex flex-wrap items-center gap-0.5 px-3 pb-1.5 pt-0">
          {ALL_TABS.map(item => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 text-[9px] font-semibold tracking-wide transition-all border rounded-sm whitespace-nowrap',
                  active
                    ? 'border-[#00ff88]/30 bg-[#00ff88]/[0.08] text-white'
                    : 'border-transparent text-[#94A3B8] hover:text-[#e0e0e0] hover:bg-white/[0.04]'
                )}
                style={{ fontFamily: 'Orbitron, monospace' }}>
                <Icon size={9} style={{ color: active ? item.color : undefined }} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-[96px] left-0 right-0 bg-[#0d1117] border-b border-[#2a2a3a] max-h-[80vh] overflow-y-auto p-3"
            onClick={e => e.stopPropagation()}>
            <div className="flex flex-wrap gap-1">
              {ALL_TABS.map(item => {
                const Icon = item.icon
                const active = isActive(item)
                return (
                  <Link key={item.to} to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold rounded border transition-all',
                      active
                        ? 'bg-[#00ff88]/[0.08] border-[#00ff88]/30 text-white'
                        : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-white/[0.03]'
                    )}
                    style={{ fontFamily: 'Orbitron, monospace' }}>
                    <Icon size={11} style={{ color: active ? item.color : undefined }} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══ Auth-Gated Route ═══════════════════════════════════════════════════════

function AuthGate({ auth, children }: { auth: AuthState | null; children: ReactNode }) {
  if (!auth) return <Navigate to="/" replace />
  return <>{children}</>
}

// ═══ Main App ═══════════════════════════════════════════════════════════════

function AppRoutes({ auth, setAuth }: {
  auth: AuthState | null
  setAuth: (next: AuthState | null) => void
}) {
  return (
    <div className="min-h-screen bg-bg relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-[#00ff88]/[0.008] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] bg-[#ff00ff]/[0.005] blur-[120px] rounded-full" />
      </div>
      <div className="relative z-10">
        <NavBar auth={auth} onLogout={() => setAuth(null)} />
        <main>
          <Routes>
            <Route path="/" element={
              auth ? <Navigate to="/markets" replace /> : <LandingPage />
            } />
            <Route path="/markets" element={<AuthGate auth={auth}><MarketsPage /></AuthGate>} />
            <Route path="/disruptions" element={<AuthGate auth={auth}><DisruptionsPage /></AuthGate>} />
            <Route path="/operations" element={<AuthGate auth={auth}><OperationsPage /></AuthGate>} />
            <Route path="/analysis" element={<AuthGate auth={auth}><AnalysisPage /></AuthGate>} />
            <Route path="/global" element={<AuthGate auth={auth}><GlobalPage /></AuthGate>} />
            <Route path="/reserves" element={<AuthGate auth={auth}><ReservesPage /></AuthGate>} />
            <Route path="/satellite-intel" element={<AuthGate auth={auth}><SatelliteIntelPage /></AuthGate>} />
            <Route path="/news" element={<AuthGate auth={auth}><NewsAtlasPage /></AuthGate>} />
            <Route path="/grades" element={<AuthGate auth={auth}><GradesPage /></AuthGate>} />
            <Route path="/majors" element={<AuthGate auth={auth}><MajorsPage /></AuthGate>} />
            <Route path="/spr" element={<AuthGate auth={auth}><SPRTrackerPage /></AuthGate>} />
            <Route path="/refineries" element={<AuthGate auth={auth}><RefineryDirectoryPage /></AuthGate>} />
            <Route path="/pipelines" element={<AuthGate auth={auth}><PipelineMapPage /></AuthGate>} />
            <Route path="/freight" element={<AuthGate auth={auth}><FreightTrackerPage /></AuthGate>} />
            <Route path="/futures" element={<AuthGate auth={auth}><FuturesCurvePage /></AuthGate>} />
            <Route path="/opec-compliance" element={<AuthGate auth={auth}><OPECCompliancePage /></AuthGate>} />
            <Route path="/downstream" element={<AuthGate auth={auth}><DownstreamPage /></AuthGate>} />
            <Route path="/sanctions" element={<AuthGate auth={auth}><SanctionsTrackerPage /></AuthGate>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

const AUTH_STORAGE_KEY = 'crudepulse_auth'

function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.isLoggedIn && parsed.email) return parsed
    return null
  } catch { return null }
}

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(loadAuth)

  const handleSetAuth = (next: AuthState | null) => {
    setAuth(next)
    if (next) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  if (!auth) return <AuthScreen onLogin={(a) => handleSetAuth(a)} />

  return (
    <BrowserRouter>
      <AppRoutes auth={auth} setAuth={handleSetAuth} />
    </BrowserRouter>
  )
}

// ═══ Auth Screen — Cyberpunk ════════════════════════════════════════════════

function AuthScreen({ onLogin }: { onLogin: (a: AuthState) => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('REQUIRED: Fill all fields'); return }
    setLoading(true)
    setError('')
    setConfirmSent(false)

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'AUTH FAILED')
        setLoading(false)
        return
      }

      if (data.message && isSignUp) {
        setConfirmSent(true)
        setLoading(false)
        return
      }

      onLogin({
        isLoggedIn: true,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
      })
    } catch {
      setError('NETWORK ERROR — RETRY')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Circuit grid */}
      <div className="absolute inset-0 circuit-grid opacity-40" />

      {/* Neon glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#00ff88]/[0.015] blur-[200px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[300px] bg-[#ff00ff]/[0.01] blur-[150px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-[0.15em] text-white mb-2 uppercase"
            style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 20px #00ff8840' }}>
            <span className="cyber-glitch">CRUDE</span><span className="text-[#00ff88]">PULSES</span>
          </h1>
          <p className="text-[10px] text-[#94A3B8] tracking-[0.3em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            <span className="text-[#00ff88]/60">&gt;</span> SECURE ACCESS TERMINAL
          </p>
        </div>

        {/* Auth Card */}
        <div className="cyber-card">
          <div className="p-6 pb-4">
            {confirmSent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">📧</div>
                <h2 className="text-sm font-bold text-white tracking-wider mb-2"
                  style={{ fontFamily: 'Orbitron, monospace' }}>CHECK YOUR EMAIL</h2>
                <p className="text-[10px] text-[#94A3B8] mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  Confirmation link sent to:
                </p>
                <p className="text-[11px] text-[#00ff88] font-bold mb-3" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  {email}
                </p>
                <p className="text-[9px] text-[#94A3B8]/60 mb-5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  Click the link to activate. Expires in 24h.
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setConfirmSent(false); setIsSignUp(false); setError('') }}
                    className="cyber-btn text-[10px]">
                    BACK TO SIGN IN
                  </button>
                  <button onClick={async () => {
                    try {
                      await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, name: name || undefined }),
                      })
                    } catch { /* ignore */ }
                  }}
                    className="cyber-btn cyber-btn-magenta text-[10px]">
                    RESEND
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[11px] font-bold text-white tracking-[0.15em] uppercase"
                    style={{ fontFamily: 'Orbitron, monospace' }}>
                    {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                  </h2>
                  <span className="text-[8px] text-[#94A3B8] tracking-widest"
                    style={{ fontFamily: 'Share Tech Mono, monospace' }}>SECURE</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {isSignUp && (
                    <div>
                      <label className="block text-[8px] text-[#94A3B8] mb-1 tracking-[0.2em] uppercase"
                        style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                        <span className="text-[#00ff88]/60">&gt;</span> NAME
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88]/40 text-[11px]"
                          style={{ fontFamily: 'Share Tech Mono, monospace' }}>&gt;</span>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="your_name"
                          className="cyber-input w-full" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[8px] text-[#94A3B8] mb-1 tracking-[0.2em] uppercase"
                      style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      <span className="text-[#00ff88]/60">&gt;</span> EMAIL
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88]/40 text-[11px]"
                        style={{ fontFamily: 'Share Tech Mono, monospace' }}>&gt;</span>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                        className="cyber-input w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] text-[#94A3B8] mb-1 tracking-[0.2em] uppercase"
                      style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      <span className="text-[#00ff88]/60">&gt;</span> PASSWORD
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88]/40 text-[11px]"
                        style={{ fontFamily: 'Share Tech Mono, monospace' }}>&gt;</span>
                      <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                        className="cyber-input w-full pr-9" />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]/40 hover:text-[#00ff88] transition-colors">
                        {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-[10px] text-[#ff3366] p-2 bg-[#ff3366]/[0.06] border border-[#ff3366]/20 tracking-wider"
                      style={{ fontFamily: 'Share Tech Mono, monospace', clipPath: 'polygon(0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px))' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full cyber-btn-filled py-2.5 text-[11px] font-bold tracking-[0.15em] disabled:opacity-50"
                    style={{ fontFamily: 'Orbitron, monospace' }}>
                    {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'AUTHENTICATE'}
                  </button>
                </form>
              </>
            )}
          </div>
          <div className="border-t border-[#2a2a3a] px-6 py-3 flex items-center justify-center">
            <span className="text-[10px] text-[#94A3B8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              {isSignUp ? 'EXISTING USER?' : 'NO ACCOUNT?'}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setConfirmSent(false) }}
                className="ml-1 text-[#00ff88] hover:text-[#00ff88]/80 font-bold">
                {isSignUp ? 'SIGN IN' : 'SIGN UP FREE'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
