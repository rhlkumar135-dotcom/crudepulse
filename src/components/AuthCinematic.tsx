import { useState, useEffect, useRef, useCallback } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { GreenBackground } from '@/components/GreenBackground'

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

// ─── Live Ticker Data ────────────────────────────────────────────────

// ─── Live Ticker ─────────────────────────────────────────────────────

function LiveTicker() {
  const [prices, setPrices] = useState([
    { label: 'WTI', value: 0 },
    { label: 'BRENT', value: 0 },
    { label: 'SPREAD', value: 0 },
  ])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/market/prices')
        const data = await res.json()
        const wti = data?.wti?.current ?? 0
        const brent = data?.brent?.current ?? 0
        const spread = data?.spread ?? (brent - wti)
        setPrices([
          { label: 'WTI', value: wti },
          { label: 'BRENT', value: brent },
          { label: 'SPREAD', value: typeof spread === 'number' ? spread : parseFloat(spread) || 0 },
        ])
        setLoaded(true)
      } catch {
        setPrices([
          { label: 'WTI', value: 87.06 },
          { label: 'BRENT', value: 94.39 },
          { label: 'SPREAD', value: 7.33 },
        ])
        setLoaded(true)
      }
    }
    fetchPrices()
  }, [])

  const COLORS: Record<string, { color: string; glow: string }> = {
    WTI: { color: '#3EE07A', glow: 'rgba(62,224,122,0.4)' },
    BRENT: { color: '#00d4ff', glow: 'rgba(0,212,255,0.4)' },
    SPREAD: { color: '#F5A623', glow: 'rgba(245,166,35,0.4)' },
  }

  return (
    <div className="flex gap-8 mb-3 justify-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {prices.map((item, i) => {
        const c = COLORS[item.label] || { color: '#a9c2b0', glow: 'transparent' }
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: '#7a9484' }}>
              {item.label}
            </span>
            <span
              className="text-xl font-black px-2 py-1 rounded-md"
              style={{
                color: c.color,
                textShadow: `0 0 20px ${c.glow}, 0 0 40px ${c.glow}`,
                background: `${c.color}10`,
                border: `1px solid ${c.color}25`,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              ${item.value.toFixed(2)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Pulse SVG Strip ─────────────────────────────────────────────────

function PulseStrip() {
  return (
    <div className="absolute top-[-1px] left-[14px] right-[14px] h-[26px] overflow-hidden pointer-events-none z-[1]">
      <svg viewBox="0 0 400 26" preserveAspectRatio="none" className="w-[200%] h-full" style={{ animation: 'pulseScroll 5s linear infinite' }}>
        <path
          d="M0,13 L40,13 L48,4 L56,22 L64,13 L100,13 L108,6 L116,20 L124,13 L400,13 L440,13 L448,4 L456,22 L464,13 L500,13 L508,6 L516,20 L524,13 L800,13"
          fill="none" stroke="#3EE07A" strokeWidth="1.5" opacity="0.65"
        />
      </svg>
    </div>
  )
}

// ─── Auth Form ───────────────────────────────────────────────────────

export function AuthCinematic({ onLogin, onGuest }: Props) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  // Parallax mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(0)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'rotateY(0) rotateX(0)'
    }
  }, [])

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
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#060907' }}>
      <GreenBackground />

      {/* Content wrapper */}
      <div
        className="relative z-[3] min-h-screen flex flex-col items-center justify-center px-5 py-8"
        style={{ transform: 'translateY(-7%)' }}
      >
        {/* Eyebrow */}
        <div
          className="flex items-center gap-2 mb-4"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.14em',
            color: '#3EE07A',
            textTransform: 'uppercase',
            textShadow: '0 0 12px rgba(62,224,122,0.55)',
            animation: 'fadeUp 0.8s ease forwards 0.1s',
            opacity: 0,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#3EE07A',
              animation: 'livePulse 2s ease-out infinite',
            }}
          />
          LIVE · GLOBAL CRUDE INTELLIGENCE
        </div>

        {/* Headline */}
        <h1
          className="text-center max-w-[800px] mb-4"
          style={{
            fontSize: 'clamp(20px, 2.9vw, 30px)',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            lineHeight: 1.32,
            color: '#eafff2',
            textShadow: '0 2px 24px rgba(0,0,0,0.6)',
            animation: 'fadeUp 0.8s ease forwards 0.22s',
            opacity: 0,
          }}
        >
          Real-time crude oil intelligence,{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #b9ffd2, #3EE07A 45%, #1fae5c 70%, #3EE07A)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              backgroundSize: '250% auto',
              animation: 'shimmer 6s linear infinite',
            }}
          >
            reimagined
          </span>{' '}
          — live markets, satellite insight, and global disruption tracking in one strikingly visual dashboard.
        </h1>

        {/* Live Ticker */}
        <div style={{ animation: 'fadeUp 0.8s ease forwards 0.46s', opacity: 0 }}>
          <LiveTicker />
        </div>

        {/* Login Card */}
        <div
          style={{
            perspective: 1000,
            marginTop: 22,
            animation: 'fadeUp 0.9s ease forwards 0.6s',
            opacity: 0,
          }}
        >
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-[460px] max-w-[92vw] overflow-hidden"
            style={{
              background: 'rgba(8,16,11,0.68)',
              backdropFilter: 'blur(20px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
              border: '1px solid rgba(62,224,122,0.18)',
              borderRadius: 18,
              padding: '28px 26px 22px',
              boxShadow: '0 40px 80px -24px rgba(0,0,0,0.7), 0 0 0 1px rgba(62,224,122,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Card shimmer sweep */}
            <div
              className="absolute inset-[-2px] z-0 pointer-events-none"
              style={{
                background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.05) 45%, rgba(62,224,122,0.14) 50%, rgba(255,255,255,0.05) 55%, transparent 70%)',
                backgroundSize: '250% 250%',
                animation: 'sweep 7s ease-in-out infinite',
              }}
            />

            {/* Pulse core */}
            <div
              className="absolute z-0 pointer-events-none"
              style={{
                top: -70, left: '50%', transform: 'translateX(-50%)',
                width: 180, height: 180, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(62,224,122,0.32), rgba(15,90,50,0.12) 55%, transparent 72%)',
                filter: 'blur(6px)',
                animation: 'coreBeat 2.4s ease-in-out infinite',
              }}
            />

            {/* Pulse strip */}
            <PulseStrip />

            {/* Content */}
            <div className="relative z-[1]">
              {confirmSent ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">📧</div>
                  <h2
                    className="text-sm font-bold mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#eafff2', letterSpacing: '0.05em' }}
                  >
                    CHECK YOUR EMAIL
                  </h2>
                  <p className="text-[10px] mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#a9c2b0' }}>
                    Confirmation link sent to:
                  </p>
                  <p className="text-[11px] font-bold mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#3EE07A' }}>
                    {email}
                  </p>
                  <p className="text-[9px] mb-5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'rgba(169,194,176,0.6)' }}>
                    Click the link to activate. Expires in 24h.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => { setConfirmSent(false); setIsSignUp(false); setError('') }}
                      className="px-5 py-2.5 text-[10px] font-bold border border-[rgba(62,224,122,0.35)] rounded-[10px] transition-all hover:border-[#3EE07A] hover:bg-[rgba(62,224,122,0.08)]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#3EE07A', letterSpacing: '0.05em' }}
                    >
                      BACK TO SIGN IN
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/signup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password, name: name || undefined }),
                          })
                        } catch { /* ignore */ }
                      }}
                      className="px-5 py-2.5 text-[10px] font-bold border border-[rgba(62,224,122,0.35)] rounded-[10px] transition-all hover:border-[#3EE07A] hover:bg-[rgba(62,224,122,0.08)]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#3EE07A', letterSpacing: '0.05em' }}
                    >
                      RESEND
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Brand row */}
                  <div className="flex items-baseline justify-between mb-5">
                    <div className="text-lg font-bold" style={{ color: '#eafff2', letterSpacing: '-0.01em' }}>
                      Crude<span
                        style={{
                          background: 'linear-gradient(90deg, #3EE07A, #b9ffd2)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                          textShadow: '0 0 18px rgba(62,224,122,0.55)',
                        }}
                      >Pulses</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-[10px] uppercase"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        letterSpacing: '0.08em',
                        color: '#3EE07A',
                        border: '1px solid rgba(62,224,122,0.35)',
                        padding: '3px 7px',
                        borderRadius: 20,
                      }}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full"
                        style={{ background: '#3EE07A', boxShadow: '0 0 6px #3EE07A' }}
                      />
                      Secure
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {isSignUp && (
                      <div>
                        <label
                          className="block mb-1.5"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10.5,
                            letterSpacing: '0.1em',
                            color: '#a9c2b0',
                            textTransform: 'uppercase',
                          }}
                        >
                          NAME
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="your_name"
                          className="w-full"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(62,224,122,0.18)',
                            borderRadius: 10,
                            padding: '12px 14px',
                            color: '#fff',
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 13.5,
                            outline: 'none',
                            transition: 'border-color .2s ease, box-shadow .2s ease, background .2s ease',
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = '#3EE07A'
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(62,224,122,0.16), 0 0 24px rgba(62,224,122,0.14)'
                            e.currentTarget.style.background = 'rgba(62,224,122,0.03)'
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = 'rgba(62,224,122,0.18)'
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                          }}
                        />
                      </div>
                    )}

                    <div className={isSignUp ? 'mt-4' : ''}>
                      <label
                        className="block mb-1.5"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10.5,
                          letterSpacing: '0.1em',
                          color: '#a9c2b0',
                          textTransform: 'uppercase',
                        }}
                      >
                        EMAIL
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(62,224,122,0.18)',
                          borderRadius: 10,
                          padding: '12px 14px',
                          color: '#fff',
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 13.5,
                          outline: 'none',
                          transition: 'border-color .2s ease, box-shadow .2s ease, background .2s ease',
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = '#3EE07A'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(62,224,122,0.16), 0 0 24px rgba(62,224,122,0.14)'
                          e.currentTarget.style.background = 'rgba(62,224,122,0.03)'
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'rgba(62,224,122,0.18)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        }}
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        className="block mb-1.5"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10.5,
                          letterSpacing: '0.1em',
                          color: '#a9c2b0',
                          textTransform: 'uppercase',
                        }}
                      >
                        PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pr-10"
                          style={{
                            border: `1px solid ${pwFocused ? '#3EE07A' : 'rgba(62,224,122,0.18)'}`,
                            borderRadius: 10,
                            padding: '12px 14px',
                            color: '#fff',
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 13.5,
                            outline: 'none',
                            transition: 'border-color .2s ease, box-shadow .2s ease, background .2s ease',
                            boxShadow: pwFocused ? '0 0 0 3px rgba(62,224,122,0.16), 0 0 24px rgba(62,224,122,0.14)' : 'none',
                            background: pwFocused ? 'rgba(62,224,122,0.03)' : 'rgba(255,255,255,0.03)',
                          }}
                          onFocus={() => setPwFocused(true)}
                          onBlur={() => setPwFocused(false)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{
                            color: pwFocused ? '#3EE07A' : '#a9c2b0',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontFamily: "'IBM Plex Mono', monospace",
                            background: 'none',
                            border: 'none',
                          }}
                        >
                          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div
                        className="mt-3 p-2 text-[10px]"
                        style={{
                          color: '#EF4444',
                          background: 'rgba(239,68,68,0.06)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          fontFamily: "'IBM Plex Mono', monospace",
                          letterSpacing: '0.05em',
                        }}
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-5 relative overflow-hidden disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(90deg, #1fae5c, #3EE07A, #1fae5c)',
                        backgroundSize: '200% auto',
                        color: '#04150a',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        fontSize: 14,
                        border: 'none',
                        borderRadius: 10,
                        padding: 13,
                        cursor: 'pointer',
                        transition: 'transform .15s ease, box-shadow .2s ease, background-position .4s ease',
                        boxShadow: '0 8px 24px -6px rgba(62,224,122,0.55)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 14px 32px -6px rgba(62,224,122,0.7)'
                        e.currentTarget.style.backgroundPosition = '100% center'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(62,224,122,0.55)'
                      }}
                    >
                      {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-2.5 my-4">
                    <div className="flex-1 h-px" style={{ background: 'rgba(62,224,122,0.18)' }} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#a9c2b0' }}>or</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(62,224,122,0.18)' }} />
                  </div>

                  {/* Guest button */}
                  <button
                    onClick={handleGuest}
                    className="w-full flex items-center justify-center gap-2 transition-all group"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(62,224,122,0.18)',
                      color: '#dcede2',
                      padding: 11,
                      borderRadius: 10,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 500,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#3EE07A'
                      e.currentTarget.style.background = 'rgba(62,224,122,0.08)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(62,224,122,0.14)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(62,224,122,0.18)'
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    Continue without signing up
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Toggle */}
                  <div className="text-center mt-4" style={{ fontSize: 12.5, color: '#a9c2b0' }}>
                    {isSignUp ? 'EXISTING USER?' : 'No account?'}
                    <button
                      onClick={() => { setIsSignUp(!isSignUp); setError(''); setConfirmSent(false) }}
                      className="ml-1 font-semibold transition-opacity hover:opacity-80"
                      style={{ color: '#3EE07A', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5 }}
                    >
                      {isSignUp ? 'SIGN IN' : 'Sign up free'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
