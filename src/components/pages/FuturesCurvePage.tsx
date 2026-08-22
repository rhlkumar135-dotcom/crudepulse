import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

interface FuturesPoint { month: string; price: number }

export default function FuturesCurvePage() {
  const [data, setData] = useState<{ wti: FuturesPoint[]; brent: FuturesPoint[]; shape: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/futures')
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Failed')
        setData(body)
      } catch (e: any) { setError(e.message) }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [])

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
  if (error) return <div className="p-6 text-red text-sm font-mono">{error}</div>
  if (!data) return null

  const merged = data.wti.map((w, i) => ({
    month: w.month,
    WTI: w.price,
    Brent: data.brent[i]?.price || 0,
    Spread: +(data.brent[i]?.price - w.price).toFixed(2),
  }))

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Futures Curve</h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-amber to-transparent mt-1" />
        </div>
        <Badge className={data.shape === 'contango' ? 'bg-green/10 text-green border-green/20' : data.shape === 'backwardation' ? 'bg-red/10 text-red border-red/20' : 'bg-white/5 text-muted border-border'}>
          {data.shape === 'contango' ? <TrendingUp size={12} className="mr-1" /> : data.shape === 'backwardation' ? <TrendingDown size={12} className="mr-1" /> : null}
          {data.shape.toUpperCase()}
        </Badge>
      </div>

      <Card className="bg-bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-muted">WTI vs Brent Forward Curve (9 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={merged}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#888' }} />
              <Tooltip contentStyle={{ background: '#141E2C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Legend />
              <Line type="monotone" dataKey="WTI" stroke="#F5A623" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Brent" stroke="#00D4AA" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {merged.map(m => (
          <Card key={m.month} className="bg-bg-card border-border p-3">
            <div className="text-[10px] font-mono text-muted mb-1">{m.month}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-amber">${m.WTI}</span>
              <ArrowRight size={10} className="text-muted/40" />
              <span className="text-sm font-mono text-green-400">${m.Brent}</span>
            </div>
            <div className={`text-[10px] font-mono mt-1 ${m.Spread > 0 ? 'text-cyan' : 'text-magenta'}`}>
              Spread: ${m.Spread > 0 ? '+' : ''}{m.Spread}
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-bg-card border-border p-4">
        <p className="text-xs text-muted leading-relaxed">
          {data.shape === 'contango'
            ? 'Contango: Future prices exceed spot prices, indicating expected supply surplus or storage costs. Traders can profit by buying spot and selling futures.'
            : data.shape === 'backwardation'
            ? 'Backwardation: Spot prices exceed futures, indicating tight current supply or expected demand surge. Signals market urgency for immediate delivery.'
            : 'Flat curve: Spot and futures prices are aligned, indicating balanced supply-demand expectations.'}
        </p>
      </Card>
    </div>
  )
}
