import { X } from 'lucide-react'
import type { MembershipPlan } from '../types'
import { PLANS, PLAN_ICONS } from './SubscriptionTab'

interface Props {
  membership: MembershipPlan
  light?: boolean
  onSubscribePlan: (plan: MembershipPlan) => void
  onClose: () => void
}

const HEADER_COLORS: Record<MembershipPlan, string> = {
  Free: '#085041',
  Pro:  '#c2410c',
  Max:  '#4c1d95',
}

export default function SubscriptionPlansPanel({ membership, light, onSubscribePlan, onClose }: Props) {
  const bg    = light ? 'bg-white'        : 'bg-[#0d1424]'
  const hdr   = light ? 'border-gray-100' : 'border-white/5'
  const title = light ? 'text-gray-900'   : 'text-white'
  const sub   = light ? 'text-gray-400'   : 'text-slate-400'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop — dashboard visible behind it */}
      <div
        className={`absolute inset-0 ${light ? 'bg-black/20' : 'bg-black/50'} backdrop-blur-sm`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`relative ${bg} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr} shrink-0`}>
          <div>
            <h2
              className={`text-base font-bold ${title}`}
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Subscription Plans
            </h2>
            <p className={`${sub} text-xs`}>Choose the plan that fits you</p>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              light
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Plan cards */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {PLANS.map(plan => {
            const Icon   = PLAN_ICONS[plan.plan]
            const active = plan.plan === membership

            return (
              <div
                key={plan.plan}
                className={`rounded-3xl overflow-hidden border-2 transition-all ${
                  active
                    ? `${plan.accentBorder} ${light ? plan.accentBg : plan.accentBgDark}`
                    : light
                      ? 'border-gray-100 bg-gray-50'
                      : 'border-white/5 bg-slate-900/60'
                }`}
              >
                {/* Coloured header row */}
                <div
                  className="px-5 py-4 flex items-center gap-4"
                  style={{ background: HEADER_COLORS[plan.plan] }}
                >
                  <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-white text-base font-black uppercase tracking-widest"
                      style={{ fontFamily: 'Syne, sans-serif' }}
                    >
                      {plan.label}
                    </p>
                    <div className="flex items-baseline gap-0.5 mt-0.5">
                      <span className="text-white/70 text-xs">₱</span>
                      <span className="text-white font-black text-xl leading-none">{plan.amount}</span>
                      <span className="text-white/60 text-[11px] ml-1">/mo</span>
                    </div>
                  </div>
                  {active && (
                    <span className="shrink-0 text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>

                {/* Perks + action */}
                <div className="px-5 py-4">
                  <ul className="space-y-2 mb-4">
                    {plan.perks.map(perk => (
                      <li
                        key={perk}
                        className={`flex items-center gap-2.5 text-sm ${light ? 'text-gray-600' : 'text-slate-300'}`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${plan.accentText.replace('text-', 'bg-')}`} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { onSubscribePlan(plan.plan); onClose() }}
                    disabled={active}
                    className={`w-full py-3 rounded-2xl text-sm font-bold text-white transition-colors ${
                      active ? 'opacity-40 cursor-default bg-slate-400' : plan.btnBg
                    }`}
                  >
                    {active ? 'Current plan' : 'Select plan'}
                  </button>
                </div>
              </div>
            )
          })}

          {/* Cancel button */}
          <button
            onClick={onClose}
            className={`w-full rounded-3xl py-3.5 text-sm font-semibold transition-colors ${
              light
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
