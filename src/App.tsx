import { useState, useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { BarChart3, User, LogOut, Shield, Eye, EyeOff, TrendingUp, Radar, Wrench, Activity, Globe, Satellite } from 'lucide-react'
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

const NAV_ITEMS = [
  { to: '/markets', label: 'Markets', icon: TrendingUp, color: '#00ff88' },
  { to: '/disruptions', label: 'Disruptions', icon: Radar, color: '#ff3366' },
  { to: '/operations', label: 'Operations', icon: Wrench, color: '#ff00ff' },
  { to: '/analysis', label: 'Analysis', icon: Activity, color: '#00d4ff' },
  { to: '/global', label: 'Global', icon: Globe, color: '#F5A623' },
  { to: '/satellite-intel', label: 'Satellite', icon: Satellite, color: '#00d4ff' },
]

function NavBar({ auth, onLogout }: { auth: AuthState | null; onLogout: () => void }) {
  const location = useLocation()
  const path = location.pathname

  return (
    <>
      <TickerBar />
      <header className="h-14 border-b border-[#2a2a3a] flex items-center px-5 gap-4 bg-[#0a0a0f]/90 backdrop-blur-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
          <div className="w-8 h-8 flex items-center justify-center border border-[#00ff88]/40 bg-[#00ff88]/10"
            style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}>
            <BarChart3 size={16} className="text-[#00ff88]" />
          </div>
          <span className="text-sm font-black tracking-[0.1em] text-white"
            style={{ fontFamily: 'Orbitron, monospace' }}>
            CRUDE<span className="text-[#00ff88]">PULSES</span>
          </span>
        </Link>

        <div className="w-px h-6 bg-[#2a2a3a]" />

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = path === item.to || (item.to !== '/' && path.startsWith(item.to))
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide transition-all border rounded-sm',
                  active
                    ? 'border-[color:var(--active)]/30 bg-[color:var(--active)]/[0.08] text-white shadow-[0_0_12px_-4px_var(--active)]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#e0e0e0] hover:bg-white/[0.04]'
                )}
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '11px',
                  '--active': item.color,
                } as React.CSSProperties}>
                <Icon size={13} style={{ color: active ? item.color : undefined }} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="w-px h-6 bg-[#2a2a3a]" />

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[10px] font-bold text-[#00ff88] tracking-[0.12em]"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>LIVE</span>
        </div>

        <div className="flex-1" />

        {/* Auth */}
        {auth && (
          <>
            {auth.role === 'admin' && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5A623]/[0.08] border border-[#F5A623]/20 text-[#F5A623] text-[10px] font-bold tracking-wider rounded-sm"
                style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                <Shield size={10} /> ADMIN
              </div>
            )}
            <div className="w-px h-6 bg-[#2a2a3a]" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center border rounded-sm"
                style={{
                  borderColor: auth.role === 'admin' ? '#F5A62340' : '#2a2a3a',
                  backgroundColor: auth.role === 'admin' ? '#F5A62315' : '#ffffff08'
                }}>
                {auth.role === 'admin' ? <Shield size={12} className="text-[#F5A623]" /> : <User size={12} className="text-[#94A3B8]" />}
              </div>
              <span className="text-xs font-medium text-[#e0e0e0]">{auth.name}</span>
            </div>
            <button onClick={onLogout}
              className="p-2 hover:bg-[#ff3366]/10 text-[#94A3B8] hover:text-[#ff3366] transition-colors rounded-sm"
              title="Sign out">
              <LogOut size={15} />
            </button>
          </>
        )}
        {!auth && (
          <Link to="/" className="px-4 py-1.5 border border-[#00ff88]/30 text-[#00ff88] text-[10px] font-bold tracking-wider hover:bg-[#00ff88]/10 transition-all rounded-sm"
            style={{ fontFamily: 'Orbitron, monospace' }}>
            SIGN IN
          </Link>
        )}
      </header>
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#00ff88]/10 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 bg-[#12121a] border-2 border-[#00ff88] flex items-center justify-center"
              style={{ clipPath: 'polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <BarChart3 size={36} className="text-[#00ff88]" />
            </div>
          </div>
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
