import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props { tier: 'free' | 'pro'; onUpgrade: () => void; onSignOut: () => void }

const TIERS = [
  {
    id: 'free', name: 'FREE', price: '$0', period: '/mo',
    color: '#556677',
    features: [
      'Modules B, C, H — fully accessible',
      'Data updated every 8-12 hours (weekly cadence)',
      'Market data dashboard access',
      'Basic disruption alerts',
      'Community forum access',
    ],
    missing: [
      'No Module A (Price + News Sync)',
      'No D, E, F, G (satellite, refinery, chokepoints, global flow)',
      'No real-time data feeds',
      'No priority support',
    ],
    badge: 'Free Tier',
  },
  {
    id: 'pro', name: 'PRO', price: '$25', period: '/mo',
    color: '#F0B429',
    features: [
      'All 8 modules with real-time feeds',
      'GDELT live disruptions + radar map',
      'Interactive supply-demand simulator',
      'Global flow arc diagram (15 bilateral routes)',
      'Chokepoint risk radar with 8 straits',
      'Storage + satellite comparison',
      'Refinery utilization heatmap (PADD regions)',
      'Reserves clock — 8 OPEC+ nations',
      'Email + Slack alerts for disruption spikes',
      'API access (1,000 requests/day)',
      'Priority support',
    ],
    missing: [],
    badge: 'Full Access',
  },
]

export function PricingPage({ tier, onUpgrade, onSignOut }: Props) {
  return (
    <div className="v2-page">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-amber)] to-[var(--accent-amber-dim)] flex items-center justify-center">
                <span className="text-[var(--bg-deep)] font-bold text-sm">CP</span>
              </div>
            </div>
            <h1 className="v2-text-display text-4xl font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
              CrudePulse <span className="v2-text-price">V2</span>
            </h1>
            <p className="v2-text-body text-lg" style={{ color: 'var(--text-muted)' }}>
              Real-time oil market intelligence. 8 data modules.
              <br />
              <span className="v2-text-label">GLOBAL CRUDE OIL INTELLIGENCE PLATFORM</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {TIERS.map((t) => (
              <Card key={t.id} className={`v2-card relative overflow-hidden ${tier === t.id ? 'ring-1' : ''}`}
                style={{ borderColor: tier === t.id ? t.color + '40' : undefined, ringColor: tier === t.id ? t.color + '30' : undefined }}>
                {tier === t.id && (
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: t.color }} />
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="v2-badge" style={{ background: t.color + '20', color: t.color }}>
                      {t.badge}
                    </div>
                    {tier === t.id && (
                      <span className="v2-text-mono text-xs" style={{ color: 'var(--text-muted)' }}>CURRENT</span>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="v2-text-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {t.price}
                      </span>
                      <span className="v2-text-body text-sm" style={{ color: 'var(--text-muted)' }}>{t.period}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {t.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span style={{ color: 'var(--accent-green)' }} className="mt-0.5 text-xs">●</span>
                        <span className="v2-text-body text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</span>
                      </div>
                    ))}
                    {t.missing.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span style={{ color: 'var(--accent-red)' }} className="mt-0.5 text-xs">●</span>
                        <span className="v2-text-body text-sm" style={{ color: 'var(--text-muted)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {t.id === 'pro' ? (
                    <Button onClick={onUpgrade} className="w-full v2-btn-primary">
                      UPGRADE NOW
                    </Button>
                  ) : (
                    <Button disabled className="w-full v2-btn-outline opacity-50 cursor-not-allowed">
                      CURRENT PLAN
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-4">
            <button onClick={onSignOut} className="v2-text-label cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              ← Back to Sign In
            </button>
            <p className="v2-text-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
              CANCELL ANYTIME · NO CONTRACTS · 7-DAY FREE TRIAL FOR PRO
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
