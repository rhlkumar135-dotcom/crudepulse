import { TrendingUp, Radar, Wrench, Clock, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PriceNewsChart } from '@/components/modules/PriceNews'
import { DisruptionRadar } from '@/components/modules/DisruptionRadar'
import { RigCountChart } from '@/components/modules/RigCount'
import { ReservesClock } from '@/components/modules/ReservesClock'

function ErrorWrap({ name, children }: { name: string; children: React.ReactNode }) {
  return <>{children}</>
}

export function V1Page() {
  return (
    <div className="p-4 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Link to="/" className="text-[9px] text-muted hover:text-amber font-mono transition-colors">← HOME</Link>
        <span className="text-border">·</span>
        <span className="text-[9px] text-amber font-mono font-semibold">V1 QUICK TOUR</span>
        <span className="text-border">·</span>
        <span className="text-[8px] text-muted/50 font-mono">4 modules · free tier</span>
      </div>

      <div className="glass-card overflow-hidden mb-3">
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center"><TrendingUp size={14} className="text-bg" /></div>
          <h2 className="text-sm font-semibold text-text-bright">Price & News Timeline</h2>
          <span className="text-[9px] font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">LIVE</span>
        </div>
        <div className="px-5 pb-4"><PriceNewsChart /></div>
      </div>

      <div className="grid grid-cols-12 gap-3 mb-3">
        <div className="col-span-5">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-red/10 flex items-center justify-center"><Radar size={14} className="text-red" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Disruption Radar</h2>
              <span className="text-[9px] font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><DisruptionRadar /></div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center"><Wrench size={14} className="text-teal" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Rig Count</h2>
              <span className="text-[9px] font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><RigCountChart /></div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center"><Clock size={14} className="text-blue-400" /></div>
              <h2 className="text-sm font-semibold text-text-bright">Reserves</h2>
              <span className="text-[9px] font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <div className="px-5 pb-4 flex-1 min-h-0 overflow-auto"><ReservesClock /></div>
          </div>
        </div>
      </div>

      <div className="text-center py-4">
        <Link to="/v2" className="text-[10px] text-amber font-mono hover:underline">Upgrade to V2 → Full 10-module dashboard</Link>
      </div>
    </div>
  )
}
