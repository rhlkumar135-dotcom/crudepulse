import { useState, useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { BarChart3, User, LogOut, Shield, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { TickerBar } from '@/components/TickerBar'
import { LandingPage } from '@/components/LandingPage'
import { V1Page } from '@/components/pages/V1Page'
import { V2Page } from '@/components/pages/V2Page'
import { V3Page } from '@/components/pages/V3Page'

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

class ErrorBoundary extends Component<{ children: ReactNode; name: string }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' }
  static getDerivedStateFromError(err: Error) { return { hasError: true, error: err.message } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-red/[0.04] border border-red/10">
          <div className="text-[10px] font-mono text-red mb-1">Module Error — {this.props.name}</div>
          <div className="text-[9px] font-mono text-muted/60">{this.state.error}</div>
        </div>
      )
    }
    return this.props.children
  }
}

// ═══ Persistent Nav Shell ═══════════════════════════════════════════════════

function NavBar({ auth, onLogout }: { auth: AuthState | null; onLogout: () => void }) {
  const location = useLocation()
  const path = location.pathname

  return (
    <>
      <TickerBar />
      <header className="h-12 border-b border-border flex items-center px-4 gap-3 bg-bg-card/50 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center shadow-sm shadow-amber/20">
            <BarChart3 size={14} className="text-bg" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-wide text-text-bright">CrudePulse</span>
          </div>
        </Link>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Page nav — FR-34 */}
        <nav className="flex items-center gap-0.5">
          {[
            { to: '/v1', label: 'V1', sub: 'Tour' },
            { to: '/v2', label: 'V2', sub: 'Terminal' },
            { to: '/v3', label: 'V3', sub: 'Correlation' },
          ].map(item => {
            const active = path === item.to || (item.to === '/v2' && path.startsWith('/v2'))
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-mono transition-all',
                  active ? 'bg-amber/10 text-amber border border-amber/20' : 'text-muted hover:text-text hover:bg-white/[0.04] border border-transparent'
                )}>
                <span className="font-semibold">{item.label}</span>
                <span className="opacity-50 hidden sm:inline">{item.sub}</span>
              </Link>
            )
          })}
        </nav>

        <div className="w-px h-5 bg-border mx-1" />

        <div className="flex items-center gap-1.5">
          <span className="live-dot" />
          <span className="text-[9px] font-mono text-green-400 tracking-wider">LIVE</span>
        </div>

        <div className="flex-1" />

        {auth && (
          <>
            {auth.role === 'admin' && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber/[0.06] border border-amber/15 text-amber text-[9px] font-mono font-medium">
                <Shield size={9} /> ADMIN
              </div>
            )}
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', auth.role === 'admin' ? 'bg-amber/15 ring-1 ring-amber/30' : 'bg-white/5')}>
                {auth.role === 'admin' ? <Shield size={11} className="text-amber" /> : <User size={11} className="text-muted" />}
              </div>
              <span className="text-[10px] font-medium text-text">{auth.name}</span>
            </div>
            <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text transition-colors" title="Sign out">
              <LogOut size={13} />
            </button>
          </>
        )}
        {!auth && (
          <Link to="/" className="px-2.5 py-1 bg-white/5 text-text rounded-lg text-[9px] font-mono hover:bg-white/10 transition-all border border-border">
            SIGN IN
          </Link>
        )}
      </header>
    </>
  )
}

// ═══ Main App with Routing ══════════════════════════════════════════════════

function AppRoutes({ auth, setAuth }: {
  auth: AuthState | null
  setAuth: React.Dispatch<React.SetStateAction<AuthState | null>>
}) {
  return (
    <div className="min-h-screen bg-bg relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-amber/[0.015] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] bg-teal/[0.01] blur-[120px] rounded-full" />
      </div>
      <div className="relative z-10">
        <NavBar auth={auth} onLogout={() => setAuth(null)} />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/v1" element={<V1Page />} />
            <Route path="/v2" element={<V2Page />} />
            <Route path="/v3" element={<V3Page />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  if (!auth) return <AuthScreen onLogin={(a) => setAuth(a)} />

  return (
    <BrowserRouter>
      <AppRoutes auth={auth} setAuth={setAuth} />
    </BrowserRouter>
  )
}

// ═══ Auth Screen ══════════════════════════════════════════════════════════════

function AuthScreen({ onLogin }: { onLogin: (a: AuthState) => void }) {
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
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(245,166,35,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.4) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber/[0.02] blur-[150px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[300px] bg-teal/[0.015] blur-[100px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
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
          <div className="border-t border-white/[0.04] px-5 py-3 flex items-center justify-center">
            <span className="text-[10px] text-muted">
              {isSignUp ? 'Have an account?' : "New here?"}
              <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} className="ml-1 text-amber hover:text-amber/80 font-medium">
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
