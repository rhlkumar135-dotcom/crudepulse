import { useState, useEffect, Component, type ReactNode, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { User, LogOut, Shield, TrendingUp, Radar, Wrench, Activity, Globe, Satellite, Newspaper, Menu, X, Droplets, Building2, Ship, BarChart3, ShieldAlert, Factory, Route as RouteIcon, Filter, BookOpen } from 'lucide-react'
import { cn } from '@/lib/cn'
import { TickerBar } from '@/components/TickerBar'
import { AuthCinematic } from '@/components/AuthCinematic'
import { LandingPage } from '@/components/LandingPage'
import { GreenBackground } from '@/components/GreenBackground'

const MarketsPage = lazy(() => import('@/components/pages/MarketsPage').then(m => ({ default: m.MarketsPage })))
const DisruptionsPage = lazy(() => import('@/components/pages/DisruptionsPage').then(m => ({ default: m.DisruptionsPage })))
const OperationsPage = lazy(() => import('@/components/pages/OperationsPage').then(m => ({ default: m.OperationsPage })))
const AnalysisPage = lazy(() => import('@/components/pages/AnalysisPage').then(m => ({ default: m.AnalysisPage })))
const GlobalPage = lazy(() => import('@/components/pages/GlobalPage').then(m => ({ default: m.GlobalPage })))
const ReservesPage = lazy(() => import('@/components/pages/ReservesPage').then(m => ({ default: m.ReservesPage })))
const SatelliteIntelPage = lazy(() => import('@/components/pages/SatelliteIntelPage').then(m => ({ default: m.SatelliteIntelPage })))
const NewsAtlasPage = lazy(() => import('@/components/pages/NewsAtlasPage').then(m => ({ default: m.NewsAtlasPage })))
const GradesPage = lazy(() => import('@/components/pages/GradesPage').then(m => ({ default: m.GradesPage })))
const MajorsPage = lazy(() => import('@/components/pages/MajorsPage').then(m => ({ default: m.MajorsPage })))
const SPRTrackerPage = lazy(() => import('@/components/pages/SPRTrackerPage').then(m => ({ default: m.SPRTrackerPage })))
const RefineryDirectoryPage = lazy(() => import('@/components/pages/RefineryDirectoryPage').then(m => ({ default: m.RefineryDirectoryPage })))
const PipelineMapPage = lazy(() => import('@/components/pages/PipelineMapPage').then(m => ({ default: m.PipelineMapPage })))
const FreightTrackerPage = lazy(() => import('@/components/pages/FreightTrackerPage').then(m => ({ default: m.FreightTrackerPage })))
const FuturesCurvePage = lazy(() => import('@/components/pages/FuturesCurvePage').then(m => ({ default: m.FuturesCurvePage })))
const OPECCompliancePage = lazy(() => import('@/components/pages/OPECCompliancePage').then(m => ({ default: m.OPECCompliancePage })))
const DownstreamPage = lazy(() => import('@/components/pages/DownstreamPage').then(m => ({ default: m.DownstreamPage })))
const SanctionsTrackerPage = lazy(() => import('@/components/pages/SanctionsTrackerPage').then(m => ({ default: m.SanctionsTrackerPage })))
const GlossaryPage = lazy(() => import('@/components/pages/GlossaryPage').then(m => ({ default: m.GlossaryPage })))

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
  { to: '/glossary', label: 'Glossary', icon: BookOpen, color: '#3EE07A' },
]

function NavBar({ auth, onLogout }: { auth: AuthState | null; onLogout: () => void }) {
  const location = useLocation()
  const path = location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (item: NavItem) => path === item.to || (item.to !== '/' && path.startsWith(item.to))

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [path])

  return (
    <>
      <TickerBar />
      <header className="border-b border-[rgba(62,224,122,0.15)] sticky top-0 z-40" style={{ background: 'rgba(6,9,7,0.95)', backdropFilter: 'blur(12px)' }}>
        {/* Top row: brand + auth */}
        <div className="flex items-center px-3 md:px-5 h-11 md:h-10 gap-2 md:gap-3">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            <span className="text-sm md:text-sm font-black tracking-[0.1em] text-white"
              style={{ fontFamily: 'Orbitron, monospace' }}>
              Crude<span style={{ color: '#3EE07A' }}>Pulses</span>
            </span>
          </Link>

          <div className="w-px h-5 bg-[#2a2a3a] shrink-0 hidden sm:block" />

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="live-dot" style={{ width: 5, height: 5, background: '#3EE07A', boxShadow: '0 0 8px #3EE07A80' }} />
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.12em]"
              style={{ fontFamily: 'Share Tech Mono, monospace', color: '#3EE07A' }}>LIVE</span>
          </div>

          <div className="flex-1" />

          {/* Auth — desktop only */}
          {auth && (
            <>
              {auth.role === 'admin' && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#F5A623]/[0.08] border border-[#F5A623]/20 text-[#F5A623] text-[10px] font-bold tracking-wider rounded-sm"
                  style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  <Shield size={10} /> ADMIN
                </div>
              )}
              <div className="w-px h-5 bg-[#2a2a3a] hidden lg:block" />
              <div className="hidden lg:flex items-center gap-2.5">
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
            <Link to="/" className="hidden sm:inline-flex px-4 py-1.5 border text-[10px] font-bold tracking-wider hover:opacity-80 transition-all rounded-sm"
              style={{ fontFamily: 'Orbitron, monospace', borderColor: 'rgba(62,224,122,0.4)', color: '#3EE07A' }}>
              SIGN IN
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-1 text-[#94A3B8] hover:text-[#3EE07A] active:scale-95 transition-all"
            aria-label="Toggle navigation">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Tab bar — desktop: all tabs, horizontal scroll */}
        <nav className="hidden md:flex items-center gap-1 px-3 lg:px-4 pb-2 pt-1 overflow-x-auto scrollbar-none">
          {ALL_TABS.map(item => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-[10px] lg:text-[11px] font-semibold tracking-wide rounded-md whitespace-nowrap shrink-0',
                  'transition-all duration-300 ease-in-out border',
                  active
                    ? 'border-[rgba(62,224,122,0.4)] bg-[rgba(62,224,122,0.12)] text-white shadow-[0_0_12px_rgba(62,224,122,0.15)]'
                    : 'border-transparent text-[#8899A0] hover:text-[#d0d0d0] hover:bg-white/[0.04]'
                )}
                style={{ fontFamily: 'Orbitron, monospace' }}>
                <Icon size={11} className="transition-colors duration-300 shrink-0" style={{ color: active ? '#3EE07A' : undefined }} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile Drawer — slides from top, proper touch targets */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          {/* Drawer panel */}
          <div className="absolute top-0 left-0 right-0 bg-[#0a0d0b]/98 border-b border-[rgba(62,224,122,0.2)] max-h-[85vh] overflow-y-auto"
            style={{ backdropFilter: 'blur(20px)', paddingTop: 'env(safe-area-inset-top, 0px)' }}
            onClick={e => e.stopPropagation()}>
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]/50">
              <span className="text-xs font-bold tracking-[0.15em] text-[#3EE07A]"
                style={{ fontFamily: 'Orbitron, monospace' }}>
                NAVIGATION
              </span>
              <button onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-sm text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>
            {/* Tabs grid — 2 columns on mobile for better touch */}
            <div className="p-3 grid grid-cols-2 gap-2">
              {ALL_TABS.map(item => {
                const Icon = item.icon
                const active = isActive(item)
                return (
                  <Link key={item.to} to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-3 text-xs font-semibold rounded-lg border transition-all duration-200',
                      active
                        ? 'bg-[rgba(62,224,122,0.15)] border-[rgba(62,224,122,0.4)] text-white shadow-[0_0_12px_rgba(62,224,122,0.1)]'
                        : 'border-[#2a2a3a]/50 text-[#8899A0] active:bg-white/[0.05]'
                    )}
                    style={{ fontFamily: 'Orbitron, monospace' }}>
                    <Icon size={14} className="shrink-0" style={{ color: active ? '#3EE07A' : item.color + '80' }} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
            {/* User info on mobile */}
            {auth && (
              <div className="px-4 py-3 border-t border-[#2a2a3a]/50 flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border rounded-sm"
                  style={{ borderColor: auth.role === 'admin' ? '#F5A62340' : '#2a2a3a', backgroundColor: auth.role === 'admin' ? '#F5A62315' : '#ffffff08' }}>
                  {auth.role === 'admin' ? <Shield size={13} className="text-[#F5A623]" /> : <User size={13} className="text-[#94A3B8]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{auth.name}</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">{auth.email}</div>
                </div>
                <button onClick={() => { onLogout(); setMobileOpen(false) }}
                  className="p-2 text-[#94A3B8] hover:text-[#ff3366] hover:bg-[#ff3366]/10 rounded-sm transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            )}
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
    <div className="min-h-screen relative" style={{ background: '#060907' }}>
      <GreenBackground />
      <div className="relative z-10">
        <NavBar auth={auth} onLogout={() => setAuth(null)} />
        <main>
          <Suspense fallback={<div className="flex items-center justify-center h-[50vh]"><div className="text-xs text-[#94A3B8] font-mono tracking-wider animate-pulse">LOADING MODULE...</div></div>}>
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
            <Route path="/glossary" element={<AuthGate auth={auth}><GlossaryPage /></AuthGate>} />
          </Routes>
          </Suspense>
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

  if (!auth) return <AuthCinematic onLogin={(a) => handleSetAuth(a)} />

  return (
    <BrowserRouter>
      <AppRoutes auth={auth} setAuth={handleSetAuth} />
    </BrowserRouter>
  )
}

