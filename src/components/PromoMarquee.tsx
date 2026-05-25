import { PROMO_MESSAGES } from '../data'
import { Zap } from 'lucide-react'

export default function PromoMarquee() {
  const text = [...PROMO_MESSAGES, ...PROMO_MESSAGES].join('     ·     ')
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 marquee-wrap flex items-center gap-3">
      <div className="shrink-0 flex items-center gap-1.5 bg-amber-500 px-3 py-0.5 text-slate-900 text-[10px] font-bold tracking-widest uppercase z-10">
        <Zap size={10} strokeWidth={3} />
        PROMO
      </div>
      <div className="animate-marquee inline-block text-amber-400/80 font-medium text-xs tracking-wide">
        {text}
      </div>
    </div>
  )
}
