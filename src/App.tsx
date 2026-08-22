import { useState, useEffect, useCallback } from 'react'
import { useMarketData } from '@/lib/useMarketData'
import { AuthCinematic } from '@/components/AuthCinematic'
import { LandingPage } from '@/components/LandingPage'
import { TickerBar } from '@/components/TickerBar'
import { DataHealth } from '@/components/DataHealth'
import { GradesPage } from '@/components/pages/GradesPage'
import { MajorsPage } from '@/components/pages/MajorsPage'
import { SPRPage } from '@/components/pages/SPRPage'
import { RefineriesDirPage } from '@/components/pages/RefineriesDirPage'
import { PipelinesPage } from '@/components/pages/PipelinesPage'
import { FreightPage } from '@/components/pages/FreightPage'
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
import { LogOut, Activity, Menu, X } from 'lucide-react'

interface User { id: string; email: string; name: string; role: string }

const TABS = [
  { id: 'markets', label: 'Markets', color: '#22C55E' },
  { id: 'disruptions', label: 'Disruptions', color: '#EF4444' },
  { id: 'operations', label: 'Operations', color: '#D946EF' },
  { id: 'analysis', label: 'Analysis', color: '#06B6D4' },
  { id: 'global', label: 'Global', color: '#F59E0B' },
  { id: 'satellite', label: 'Satellite', color: '#06B6D4' },
  { id: 'news', label: 'News', color: '#22C55E' },
  { id: 'futures', label: 'Futures', color: '#3B82F6' },
  { id: 'majors', label: 'Majors', color: '#F59E0B' },
  { id: 'freight', label: 'Freight', color: '#D946EF' },
  { id: 'downstream', label: 'Downstream', color: '#14B8A6' },
  { id: 'grades', label: 'Grades', color: '#F59E0B' },
  { id: 'spr', label: 'SPR', color: '#3B82F6' },
  { id: 'refineries', label: 'Refineries', color: '#EF4444' },
  { id: 'pipelines', label: 'Pipelines', color: '#14B8A6' },
  { id: 'opec', label: 'OPEC+', color: '#F59E0B' },
  { id: 'sanctions', label: 'Sanctions', color: '#EF4444' },
]

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState('markets')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user) }).catch(() => {})
  }, [])

  const handleAuth = useCallback((u: User) => setUser(u), [])
  const handleLogout = useCallback(() => {
    fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).catch(() => {})
    setUser(null)
  }, [])

  if (!user) {
    return <AuthCinematic onLogin={handleAuth} />
  }

  const renderPage = () => {
    switch (page) {
      case 'markets': return <LandingPage onSelectPage={setPage} />
      case 'grades': return <GradesPage />
      case 'majors': return <MajorsPage />
      case 'spr': return <SPRPage />
      case 'refineries': return <RefineriesDirPage />
      case 'pipelines': return <PipelinesPage />
      case 'freight': return <FreightPage />
      case 'futures': return <FuturesCurvePage />
      case 'opec': return <OPECCompliancePage />
      case 'downstream': return <DownstreamPage />
      case 'sanctions': return <SanctionsTrackerPage />
      case 'disruptions': return <DisruptionsPage />
      case 'operations': return <OperationsPage />
      case 'analysis': return <AnalysisPage />
      case 'global': return <GlobalPage />
      case 'satellite': return <SatelliteIntelPage />
      case 'news': return <NewsAtlasPage />
      default: return <LandingPage onSelectPage={setPage} />
    }
  }

  return (
    <div className="min-h-screen bg-[#080B10] text-[#CBD5E1] flex flex-col">
      <header className="h-14 border-b border-white/5 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-base font-bold text-emerald-400 tracking-wider" style={{ textShadow: '0 0 12px rgba(34,197,94,0.3)' }}>CRUDEPULSES</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 hidden sm:block">{user.name || user.email}</span>
          <button onClick={handleLogout} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <nav className="border-b border-white/5 px-3 py-1.5 flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setPage(t.id)} className={`text-[9px] px-2.5 py-1 rounded-sm transition-all font-mono ${page === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`} style={page === t.id ? { background: t.color + '20', color: t.color, boxShadow: `0 0 12px ${t.color}15` } : {}}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  )
}
