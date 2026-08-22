import { useState, useEffect, useRef, useMemo } from 'react'
import { User, LogOut, Shield, Eye, EyeOff, ArrowRight, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface AuthState {
  isLoggedIn: boolean
  email: string
  role: 'user' | 'admin'
  name: string
}

interface Props {
  onLogin: (a: AuthState) => void
  onGuest?: () => void
}

// ─── Floating Data Particles ───────────────────────────────────────────

const TICKER_ITEMS = [
  'WTI $68.42 ▲1.2%', 'Brent $72.15 ▲0.8%', 'OPEC+ CUTS 2.1M BBL/D',
  'SPR LEVELS 395.3M BBL', 'NAT GAS $2.84 ▼0.3%', 'REFINERY UTIL 92.1%',
  'IRAN SANCTIONS tightened', 'SUEZ TRANSIT +12%', 'HORMUZ RISK: ELEVATED',
  'US SHALE +340K B/D', 'CHINA IMPORTS ▲8.2%', 'NIGER DELTA SPILL ALERT',
  'RED SEA DISRUPTION', 'GOLD $2,412 ▲0.5%', 'USD INDEX 104.2',
  'BRENT-WTI SPREAD $3.73', 'OIL DEMAND 103.2M B/D', 'RIG COUNT 582 ▲3',
  'RUSSIAN CRUDE 9.2M B/D', 'LIBYA OUTPUT HALTED', 'IRAQ QUOTA 4.0M B/D',
  'BRAZIL PRE-SALT 3.8M B/D', 'NORWAY JOHAN SVERDRUP 720K B/D',
]

const NEWS_HEADLINES = [
  'Houthi forces target 2nd tanker in Red Sea this week',
  'OPEC+ emergency meeting called as Brent falls below $70',
  'US SPR releases 4M barrels amid supply concerns',
  'Permian Basin output hits record 6.1M barrels per day',
  'Iran nuclear deal collapse threatens Strait of Hormuz',
  'China builds 500M barrels strategic reserve',
  'BP declares force majeure on Nigerian crude exports',
  'Baltic Dry Index surges 45% on vessel shortages',
  'North Sea maintenance cuts output by 300K b/d',
  'Venezuela sanctions relief could add 200K b/d',
]

const MAP_COORDS = [
  '26.5°N 56.3°E', '27.0°N 51.0°E', '28.0°N -90.0°W',
  '57.0°N 2.0°E', '31.7°N -103.2°W', '4.5°N 6.5°E',
  '30.0°N 32.5°E', '12.6°N 43.3°E', '2.5°N 101.5°E',
  '24.0°N 54.0°E', '21.5°N 57.0°E', '32.0°N 53.0°E',
]

interface Particle {
  id: number
  type: 'ticker' | 'headline' | 'coords'
  text: string
  x: number
  y: number
  speed: number
  opacity: number
  size: number
}

function useParticles(count: number): Particle[] {
  const [particles, setParticles] = useState<Particle[]>(() => {
    const items: Particle[] = []
    for (let i = 0; i < count; i++) {
      const type = i % 3 === 0 ? 'ticker' : i % 3 === 1 ? 'headline' : 'coords'
      const pool = type === 'ticker' ? TICKER_ITEMS : type === 'headline' ? NEWS_HEADLINES : MAP_COORDS
      items.push({
        id: i,
        type,
        text: pool[i % pool.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.15 + Math.random() * 0.35,
        opacity: 0.04 + Math.random() * 0.08,
        size: type === 'ticker' ? 10 : type === 'headline' ? 9 : 8,
      })
    }
    return items
  })

  useEffect(() => {
    let frame: number
    const tick = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        y: p.y - p.speed * 0.12,
        x: p.x + Math.sin(Date.now() * 0.0003 + p.id) * 0.02,
        opacity: 0.04 + Math.sin(Date.now() * 0.0005 + p.id * 2) * 0.025,
      })).map(p => p.y < -5 ? { ...p, y: 105 } : p))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return particles
}

// ─── Mini Sparkline ────────────────────────────────────────────────────

function MiniSparkline({ seed, color }: { seed: number; color: string }) {
  const points = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i < 20; i++) {
      const y = 50 + Math.sin(i * 0.5 + seed) * 30 + Math.cos(i * 0.8 + seed * 2) * 15
      pts.push(`${(i / 19) * 100},${y}`)
    }
    return pts.join(' ')
  }, [seed])

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
    </svg>
  )
}

// ─── Animated Background ───────────────────────────────────────────────

function AnimatedBackground() {
  const particles = useParticles(36)

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background image — 0 blur, your uploaded image */}
      <div className="absolute inset-0">
        <img src="/login-bg.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/60 via-transparent to-[#050810]/70" />
      </div>

      {/* Neon glow accents on top of image */}
      <div className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 30% 20%, rgba(0,255,136,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 100% 60% at 70% 80%, rgba(255,0,255,0.03) 0%, transparent 60%),
            radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,212,255,0.02) 0%, transparent 70%)
          `
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 circuit-grid opacity-20" />

      {/* Floating particles — oil prices, news, coordinates */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute whitespace-nowrap pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            fontSize: `${p.size}px`,
            fontFamily: 'Share Tech Mono, monospace',
            color: p.type === 'ticker' ? '#00ff88' : p.type === 'headline' ? '#ff3366' : '#00d4ff',
            letterSpacing: p.type === 'coords' ? '0.15em' : undefined,
            transition: 'none',
            filter: 'blur(0.5px)',
          }}
        >
          {p.type === 'ticker' && <span className="mr-1">◆</span>}
          {p.text}
        </div>
      ))}

      {/* Glowing orb — animated pulse */}
      <div className="absolute top-[15%] left-[20%] w-[500px] h-[400px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animationDuration: '8s',
        }}
      />
      <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[350px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255,0,255,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animationDuration: '12s',
          animationDelay: '3s',
        }}
      />
      <div className="absolute top-[60%] left-[60%] w-[300px] h-[300px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animationDuration: '10s',
          animationDelay: '6s',
        }}
      />

      {/* Sparkline rows — bottom */}
      <div className="absolute bottom-8 left-0 right-0 flex gap-2 px-8 opacity-20">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex-1 h-12">
            <MiniSparkline seed={i * 1.7} color={i % 2 === 0 ? '#00ff88' : '#ff3366'} />
          </div>
        ))}
      </div>

      {/* Vertical scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00ff88]/10 to-transparent"
          style={{
            animation: 'scanline 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* Horizontal scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff88]/8 to-transparent"
          style={{
            animation: 'scanlineH 6s ease-in-out infinite',
          }}
        />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }}
      />
    </div>
  )
}

// ─── Auth Form ─────────────────────────────────────────────────────────

export function AuthCinematic({ onLogin, onGuest }: Props) {
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

  const handleGuest = () => {
    onLogin({
      isLoggedIn: true,
      email: 'guest@crudepulses.com',
      role: 'user',
      name: 'Guest',
    })
    onGuest?.()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-[0.15em] text-white mb-2 uppercase"
            style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 30px #00ff8840, 0 0 60px #00ff8815' }}>
            <span className="cyber-glitch">CRUDE</span><span className="text-[#00ff88]">PULSES</span>
          </h1>
          <p className="text-[10px] text-[#94A3B8] tracking-[0.3em] uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            <span className="text-[#00ff88]/60">&gt;</span> CRUDE OIL INTELLIGENCE TERMINAL
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

          {/* Guest + Toggle */}
          <div className="border-t border-[#2a2a3a] px-6 py-3 space-y-2">
            {/* Proceed Without Signup */}
            <button onClick={handleGuest}
              className="w-full flex items-center justify-center gap-2 py-2 rounded border border-[#00ff88]/20 bg-[#00ff88]/[0.04] hover:bg-[#00ff88]/[0.08] hover:border-[#00ff88]/30 transition-all group"
            >
              <span className="text-[10px] text-[#00ff88]/80 tracking-[0.15em] font-semibold"
                style={{ fontFamily: 'Orbitron, monospace' }}>
                PROCEED WITHOUT SIGNUP
              </span>
              <ArrowRight size={12} className="text-[#00ff88]/60 group-hover:text-[#00ff88] group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Toggle sign in / sign up */}
            <div className="flex items-center justify-center">
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

        {/* Bottom tagline */}
        <div className="text-center mt-5">
          <p className="text-[9px] text-[#94A3B8]/30 tracking-[0.2em]"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            GDELT · EIA · SENTINEL-5P · NASA FIRMS · YAHOO FINANCE · BA
          </p>
        </div>
      </div>
    </div>
  )
}
