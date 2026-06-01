import { useState } from 'react'
import { Star, Package, ChevronDown, Send, Plane, Rocket } from 'lucide-react'
import type { MembershipPlan } from '../types'

interface PlanMeta {
  plan: MembershipPlan
  label: string
  amount: string
  perks: string[]
  headerBg: string
  iconBg: string
  accentText: string
  accentBorder: string
  accentBg: string
  accentBgDark: string
  btnBg: string
}

export const PLANS: PlanMeta[] = [
  {
    plan: 'Free', label: 'Tingi', amount: '0', perks: ['Browse products', 'Basic cart', 'Pick-up only'],
    headerBg: 'bg-[#085041]', iconBg: 'bg-white/15', accentText: 'text-[#1d9e75]', accentBorder: 'border-[#0f6e56]',
    accentBg: 'bg-[#e1f5ee]', accentBgDark: 'bg-[#1d9e75]/10', btnBg: 'bg-[#1d9e75] hover:bg-[#0f6e56]',
  },
  {
    plan: 'Pro', label: 'Suki', amount: '99', perks: ['Priority orders', 'Suki discounts', 'Home delivery'],
    headerBg: 'bg-[#c2410c]', iconBg: 'bg-white/15', accentText: 'text-[#f97316]', accentBorder: 'border-[#f97316]',
    accentBg: 'bg-[#fff7ed]', accentBgDark: 'bg-[#f97316]/10', btnBg: 'bg-[#f97316] hover:bg-[#ea580c]',
  },
  {
    plan: 'Max', label: 'VIP Suki', amount: '299', perks: ['All Suki perks', 'Utang credit line', 'Exclusive deals'],
    headerBg: 'bg-[#4c1d95]', iconBg: 'bg-white/15', accentText: 'text-[#7c3aed]', accentBorder: 'border-[#7c3aed]',
    accentBg: 'bg-[#f5f3ff]', accentBgDark: 'bg-[#7c3aed]/10', btnBg: 'bg-[#7c3aed] hover:bg-[#6d28d9]',
  },
]

export const PLAN_ICONS: Record<string, any> = { Free: Send, Pro: Plane, Max: Rocket }

const ACTIVE_LABEL: Record<MembershipPlan, string> = { Free: 'Tingi active', Pro: 'Suki active', Max: 'VIP active' }

interface Props {
  light: boolean
  membership: MembershipPlan
  onSubscribePlan: (plan: MembershipPlan) => void
  onOpenPlansModal?: () => void
}

export default function SubscriptionTab({ light, membership, onSubscribePlan, onOpenPlansModal }: Props) {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer')
  const [plansOpen, setPlansOpen] = useState(false)

  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-400' : 'text-slate-400'

  function tabCls(tab: 'buyer' | 'seller') {
    const base = 'px-5 py-1.5 rounded-xl text-xs font-semibold transition-colors'
    return activeTab === tab
      ? `${base} bg-amber-500 text-white`
      : `${base} ${light ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-slate-200'}`
  }

  function renderPlans(icon: any) {
    return (
      <>
        <button
          type="button"
          onClick={() => { if (onOpenPlansModal) { onOpenPlansModal(); } else setPlansOpen(o => !o) }}
          aria-expanded={plansOpen}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all mb-3 ${light ? 'bg-white border-gray-100 hover:border-amber-400' : 'bg-slate-900/60 border-white/5 hover:border-amber-500/50'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${light ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
            {icon === 'star' ? <Star size={18} className="text-amber-500" strokeWidth={2} /> : <Package size={18} className="text-amber-500" strokeWidth={2} />}
          </div>
          <div className="flex-1 text-left">
            <p className={`text-sm font-semibold ${title}`}>Subscription plans</p>
            <p className={`text-xs ${sub}`}>Tingi · Suki · VIP Suki — tap to view</p>
          </div>
          <span className="shrink-0 text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full">{ACTIVE_LABEL[membership]}</span>
          <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${sub} ${plansOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
        </button>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${plansOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2 items-stretch">
            {PLANS.map(({ plan, label, amount, perks, headerBg, iconBg, accentText, accentBorder, accentBg, accentBgDark, btnBg }) => {
              const active = plan === membership
              const Icon = PLAN_ICONS[plan]
              return (
                <div
                  key={plan}
                  onClick={() => onSubscribePlan(plan)}
                  className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer flex flex-col min-h-[220px] sm:min-h-[260px] ${active ? accentBorder : (light ? 'border-gray-100' : 'border-white/5')} ${active ? (light ? accentBg : accentBgDark) : (light ? 'bg-white' : 'bg-slate-900/60')} hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20`}
                >
                  <div className={`${headerBg} px-4 py-5 sm:py-6 text-center`}> 
                    <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-3`}>
                      <Icon size={22} className="text-white" strokeWidth={2} />
                    </div>
                    <p className="text-white text-lg sm:text-xl font-black uppercase tracking-widest" style={{ fontFamily: 'Syne, sans-serif' }}>{label}</p>
                    {active && <span className="inline-block mt-2 text-[10px] font-bold bg-white/20 text-white px-3 py-1 rounded-full">Active</span>}
                  </div>

                  <div className="px-4 py-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className={`flex items-end gap-2 mb-3`}> 
                        <div className={`text-2xl font-black ${accentText}`}>
                          ₱{amount}
                        </div>
                        <div className={`text-[10px] ${sub} mb-0.5`}>/mo</div>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {perks.map(perk => (
                          <li key={perk} className={`flex items-start gap-2 text-sm ${sub}`}>
                            <span className={`w-2.5 h-2.5 rounded-full mt-1 ${accentText.replace('text-', 'bg-')}`} />
                            <span className="leading-snug">{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onSubscribePlan(plan) }}
                        className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-colors ${active ? 'bg-white/10 text-white/90 cursor-default' : btnBg}`}
                      >
                        {active ? 'Current plan' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="px-5 pt-5 pb-2">
      <p className={`text-xs font-semibold ${light ? 'text-gray-400' : 'text-slate-500'} uppercase tracking-widest mb-1`}>Subscription</p>
      <p className={`text-xs ${sub} mb-3`}>Manage your plan for buyer or seller.</p>

      <div className={`flex gap-1 p-1 rounded-2xl w-fit mb-4 ${light ? 'bg-gray-100' : 'bg-slate-800/60'}`}>
        <button className={tabCls('buyer')} onClick={() => setActiveTab('buyer')}>Buyer</button>
        <button className={tabCls('seller')} onClick={() => setActiveTab('seller')}>Seller</button>
      </div>

      {activeTab === 'buyer' ? renderPlans('star') : renderPlans('package')}
    </div>
  )
}
