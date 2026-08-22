/**
 * Reusable green-themed background overlay for all pages.
 * Dark green blurred refinery + bright scanline + green orb glows.
 */
export function GreenBackground() {
  return (
    <>
      {/* Photo background — dark green, blurred, visible */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/login-bg.png"
          alt=""
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center 40%',
            filter: 'saturate(0.85) brightness(0.75) blur(1.5px)',
            animation: 'kenburns 26s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Green tint overlay — dark with green wash */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, rgba(6,9,7,0.45) 0%, rgba(6,9,7,0.25) 35%, rgba(6,9,7,0.65) 78%, rgba(6,9,7,0.88) 100%),
            radial-gradient(ellipse 70% 55% at 50% 40%, rgba(15,90,50,0.28), transparent 65%)
          `,
        }}
      />
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background: 'rgba(20,60,38,0.28)', mixBlendMode: 'color' }}
      />

      {/* Bright green orb — top left */}
      <div
        className="fixed rounded-full z-[2] pointer-events-none"
        style={{
          width: 500, height: 500, top: '-12%', left: '-8%',
          background: 'radial-gradient(circle, rgba(62,224,122,0.6), transparent 65%)',
          filter: 'blur(70px)', mixBlendMode: 'screen', opacity: 0.65,
          animation: 'floatA 16s ease-in-out infinite',
        }}
      />
      {/* Green orb — bottom right */}
      <div
        className="fixed rounded-full z-[2] pointer-events-none"
        style={{
          width: 450, height: 450, bottom: '-14%', right: '-8%',
          background: 'radial-gradient(circle, rgba(15,90,50,0.7), transparent 65%)',
          filter: 'blur(70px)', mixBlendMode: 'screen', opacity: 0.55,
          animation: 'floatB 20s ease-in-out infinite',
        }}
      />
      {/* Subtle green orb — top right */}
      <div
        className="fixed rounded-full z-[2] pointer-events-none"
        style={{
          width: 350, height: 350, top: '5%', right: '-5%',
          background: 'radial-gradient(circle, rgba(62,224,122,0.35), transparent 65%)',
          filter: 'blur(80px)', mixBlendMode: 'screen', opacity: 0.4,
          animation: 'floatC 14s ease-in-out infinite',
        }}
      />

      {/* BRIGHT green scanline — the signature flowing line */}
      <div
        className="fixed left-0 right-0 z-[2] pointer-events-none overflow-hidden"
        style={{ height: 3, top: 0 }}
      >
        <div
          style={{
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(62,224,122,0.4) 20%, rgba(62,224,122,0.9) 50%, rgba(62,224,122,0.4) 80%, transparent)',
            boxShadow: '0 0 20px rgba(62,224,122,0.6), 0 0 60px rgba(62,224,122,0.3), 0 2px 10px rgba(62,224,122,0.5)',
            animation: 'scanlineH 9s linear infinite',
          }}
        />
      </div>
      {/* Second sweep glow — wider, softer, follows the bright line */}
      <div
        className="fixed left-0 right-0 z-[2] pointer-events-none"
        style={{
          height: 140,
          top: 0,
          background: 'linear-gradient(180deg, rgba(62,224,122,0.08) 0%, rgba(62,224,122,0.03) 40%, transparent 100%)',
          animation: 'scanlineV 9s linear infinite',
        }}
      />

      {/* Grain */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          opacity: 0.04,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  )
}
