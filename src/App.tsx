import { useState, useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { User, LogOut, Shield, Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { TickerBar } from '@/components/TickerBar'
import { LandingPage } from '@/components/LandingPage'
import { AuthCinematic } from '@/components/AuthCinematic'
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
import { DisruptionsPage } from '@/components/pages/DisruptionsPage'
import { OperationsPage } from '@/components/pages/OperationsPage'
import { AnalysisPage } from '@/components/pages/AnalysisPage'
import { GlobalPage } from '@/components/pages/GlobalPage'
import { SatelliteIntelPage } from '@/components/pages/SatelliteIntelPage'
import { NewsAtlasPage } from '@/components/pages/NewsAtlasPage'

type Tier = 'free' | 'pro'
type Role = 'user' | 'admin'

interface AuthState {
  isLoggedIn: boolean
  email: string
  tier: Tier
  role: Role
  name: string
}

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

const NAV_ITEMS = [
  { to: '/markets', label: 'Markets', color: 'text-amber' },
  { to: '/disruptions', label: 'Disruptions', color: 'text-red' },
  { to: '/operations', label: 'Operations', color: 'text-fuchsia' },
  { to: '/analysis', label: 'Analysis', color: 'text-cyan' },
  { to: '/global', label: 'Global', color: 'text-yellow-500' },
  { to: '/satellite', label: 'Satellite', color: 'text-cyan' },
  { to: '/news', label: 'News', color: 'text-emerald' },
  { to: '/futures', label: 'Futures', color: 'text-blue' },
  { to: '/majors', label: 'Majors', color: 'text-indigo' },
  { to: '/freight', label: 'Freight', color: 'text-orange' },
  { to: '/downstream', label: 'Downstream', color: 'text-pink' },
  { to: '/grades', label: 'Grades', color: 'text-teal' },
  { to: '/spr', label: 'SPR', color: 'text-sky' },
  { to: '/refineries', label: 'Refineries', color: 'text-purple' },
  { to: '/pipelines', label: 'Pipelines', color: 'text-violet' },
  { to: '/opec', label: 'OPEC+', color: 'text-lime' },
  { to: '/sanctions', label: 'Sanctions', color: 'text-rose' },
]

function NavBar({ auth, onLogout }: { auth: AuthState | null; onLogout: () => void }) {
  const location = useLocation()
  const path = location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <TickerBar />
      <header className="border-b border-border bg-bg-card/50 backdrop-blur-md">
        <div className="flex items-center h-14 px-4 gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <span className="text-sm font-bold tracking-wide text-text-bright">CRUDEPULSES</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1 hidden md:block" />
          <nav className="hidden md:flex items-center gap-0.5 flex-wrap">
            {NAV_ITEMS.map(item => {
              const active = path === item.to
              return (
                <Link key={item.to} to={item.to}
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] font-mono transition-all border border-transparent whitespace-nowrap',
                    active ? `bg-white/[0.06] ${item.color} border-white/10 font-semibold` : 'text-muted hover:text-text hover:bg-white/[0.04]'
                  )}>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <span className="live-dot" />
            <span className="text-[9px] font-mono text-green-400 tracking-wider">LIVE</span>
          </div>
          {auth && (
            <div className="flex items-center gap-2 ml-2">
              {auth.role === 'admin' && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber/[0.06] border border-amber/15 text-amber text-[9px] font-mono font-medium">
                  <Shield size={9} /> ADMIN
                </div>
              )}
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', auth.role === 'admin' ? 'bg-amber/15 ring-1 ring-amber/30' : 'bg-white/5')}>
                {auth.role === 'admin' ? <Shield size={11} className="text-amber" /> : <User size={11} className="text-muted" />}
              </div>
              <span className="text-[10px] font-medium text-text hidden sm:inline">{auth.name}</span>
              <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-text transition-colors" title="Sign out">
                <LogOut size={13} />
              </button>
            </div>
          )}
          {!auth && (
            <Link to="/" className="px-2.5 py-1 bg-white/5 text-text rounded-lg text-[9px] font-mono hover:bg-white/10 transition-all border border-border ml-2">
              SIGN IN
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-muted ml-1">
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border p-3 grid grid-cols-3 gap-1 bg-bg-card/80 backdrop-blur-md">
            {NAV_ITEMS.map(item => {
              const active = path === item.to
              return (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-2 py-1.5 rounded-md text-[10px] font-mono transition-all text-center',
                    active ? `bg-white/[0.06] ${item.color} font-semibold` : 'text-muted hover:text-text hover:bg-white/[0.04]'
                  )}>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </header>
    </>
  )
}

function MarketsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-bright">Markets</h1>
      <p className="text-sm text-muted">Market overview dashboard</p>
    </div>
  )
}

function AppRoutes({ auth, setAuth }: { auth: AuthState | null; setAuth: React.Dispatch<React.SetStateAction<AuthState | null>> }) {
  return (
    <div className="min-h-screen bg-bg relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-amber/[0.015] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] bg-teal/[0.01] blur-[120px] rounded-full" />
      </div>
      <div className="relative z-10">
        <NavBar auth={auth} onLogout={() => setAuth(null)} />
        <main>
          <ErrorBoundary name="markets">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/disruptions" element={<DisruptionsPage />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/global" element={<GlobalPage />} />
              <Route path="/satellite" element={<SatelliteIntelPage />} />
              <Route path="/news" element={<NewsAtlasPage />} />
              <Route path="/futures" element={<FuturesCurvePage />} />
              <Route path="/majors" element={<MajorsPage />} />
              <Route path="/freight" element={<FreightTrackerPage />} />
              <Route path="/downstream" element={<DownstreamPage />} />
              <Route path="/grades" element={<GradesPage />} />
              <Route path="/spr" element={<SPRTrackerPage />} />
              <Route path="/refineries" element={<RefineryDirectoryPage />} />
              <Route path="/pipelines" element={<PipelineMapPage />} />
              <Route path="/opec" element={<OPECCompliancePage />} />
              <Route path="/sanctions" element={<SanctionsTrackerPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  if (!auth) return <AuthCinematic onLogin={(a) => setAuth(a)} />
  return (
    <BrowserRouter>
      <AppRoutes auth={auth} setAuth={setAuth} />
    </BrowserRouter>
  )
}
