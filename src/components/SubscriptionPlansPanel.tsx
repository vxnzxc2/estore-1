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
  const title = light ? 'text-gray-900'   : 'text-white'
  const sub   = light ? 'text-gray-600'   : 'text-slate-300'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${light ? 'bg-black/20' : 'bg-black/50'} backdrop-blur-sm`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`relative ${bg} rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full`}
      >
        {/* Close button in upper right */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              light
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-6 pt-14">
          {/* Header */}
          <div className="text-center mb-8">
            <h2
              className={`text-xl sm:text-2xl font-bold ${title} mb-1`}
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Choose Your Plan
            </h2>
            <p className={`${sub} text-xs sm:text-sm`}>Select a membership that fits your needs</p>
          </div>

          {/* Plan cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PLANS.map(plan => {
              const Icon   = PLAN_ICONS[plan.plan]
              const active = plan.plan === membership

              return (
                <div
                  key={plan.plan}
                  className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer"
                  style={{
                    boxShadow: active ? `0 0 20px ${HEADER_COLORS[plan.plan]}40` : '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Colored header with icon and price */}
                  <div
                    className="relative px-6 pt-6 pb-12 text-white text-center"
                    style={{ background: HEADER_COLORS[plan.plan] }}
                  >
                    {/* Price badge at top */}
                    <div className="flex justify-center mb-4">
                      <div className={`${light ? 'bg-white' : 'bg-slate-700/80'} px-4 py-2 rounded-xl`}>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-xs font-semibold ${light ? 'text-gray-700' : 'text-white/70'}`}>₱</span>
                          <span className={`text-2xl font-black ${light ? 'text-gray-900' : 'text-white'}`}>{plan.amount}</span>
                          <span className={`text-xs ${light ? 'text-gray-500' : 'text-white/60'}`}>/mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mb-4">
                      <div className={`w-14 h-14 rounded-2xl ${plan.iconBg} flex items-center justify-center`}>
                        <Icon size={24} className="text-white" strokeWidth={2} />
                      </div>
                    </div>
                    <p
                      className="text-white text-xl font-black uppercase tracking-widest"
                      style={{ fontFamily: 'Syne, sans-serif' }}
                    >
                      {plan.label}
                    </p>
                  </div>

                  {/* Card body */}
                  <div className={`px-6 py-5 ${light ? 'bg-white' : 'bg-slate-800/50'}`}>

                    {/* Perks */}
                    <ul className="space-y-2 mb-5 mt-5">
                      {plan.perks.map(perk => (
                        <li key={perk} className={`flex items-start gap-3 text-xs sm:text-sm ${sub}`}>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 mt-1 ${plan.accentText.replace('text-', 'bg-')}`}
                          />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    <button
                      onClick={() => { onSubscribePlan(plan.plan); onClose() }}
                      disabled={active}
                      className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-colors ${
                        active ? 'opacity-50 cursor-default bg-slate-400' : plan.btnBg
                      }`}
                    >
                      {active ? 'Current' : 'SELECT'}
                    </button>

                    {/* Current badge */}
                    {active && (
                      <p className={`text-xs font-semibold text-center mt-2 ${plan.accentText}`}>
                        Current Plan
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
