/**
 * Reusable green-themed background overlay for all pages.
 * Apply this as a fixed background behind page content.
 */
export function GreenBackground() {
  return (
    <>
      {/* Photo background — subtle, blurred */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/login-bg.png"
          alt=""
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center 40%',
            filter: 'saturate(0.7) brightness(0.45) blur(1px)',
            transform: 'scale(1.05)',
          }}
        />
      </div>

      {/* Green tint overlay for legibility */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, rgba(6,9,7,0.7) 0%, rgba(6,9,7,0.5) 35%, rgba(6,9,7,0.8) 78%, rgba(6,9,7,0.95) 100%),
            radial-gradient(ellipse 70% 55% at 50% 40%, rgba(15,90,50,0.22), transparent 65%)
          `,
        }}
      />

      {/* Floating green orbs — subtle ambient glow */}
      <div
        className="fixed rounded-full z-[2] pointer-events-none"
        style={{
          width: 500, height: 500, top: '-10%', left: '-8%',
          background: 'radial-gradient(circle, rgba(62,224,122,0.35), transparent 70%)',
          filter: 'blur(80px)', mixBlendMode: 'screen', opacity: 0.4,
          animation: 'floatA 18s ease-in-out infinite',
        }}
      />
      <div
        className="fixed rounded-full z-[2] pointer-events-none"
        style={{
          width: 400, height: 400, bottom: '-12%', right: '-6%',
          background: 'radial-gradient(circle, rgba(15,90,50,0.4), transparent 70%)',
          filter: 'blur(80px)', mixBlendMode: 'screen', opacity: 0.35,
          animation: 'floatB 22s ease-in-out infinite',
        }}
      />
      <div
        className="fixed rounded-full z-[2] pointer-events-none"
        style={{
          width: 300, height: 300, top: '40%', right: '10%',
          background: 'radial-gradient(circle, rgba(185,255,210,0.25), transparent 70%)',
          filter: 'blur(70px)', mixBlendMode: 'screen', opacity: 0.3,
          animation: 'floatC 15s ease-in-out infinite',
        }}
      />

      {/* Subtle scanline */}
      <div
        className="fixed left-0 right-0 h-[120px] z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(62,224,122,0.03) 45%, rgba(62,224,122,0.06) 50%, rgba(62,224,122,0.03) 55%, transparent)',
          animation: 'scanlineV 12s linear infinite',
        }}
      />

      {/* Grain */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          opacity: 0.03,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  )
}
