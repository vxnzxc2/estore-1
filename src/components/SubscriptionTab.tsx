import { ChevronRight } from 'lucide-react'
import { Send, Plane, Rocket } from 'lucide-react'
import type { MembershipPlan } from '../types'

// ─── Exported types & constants (used by App and SubscriptionPlansPanel) ──────

export interface PlanMeta {
  plan: MembershipPlan
  label: string
  price: string
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
    plan: 'Free',
    label: 'Tingi',
    price: '₱0 / mo',
    amount: '0',
    perks: ['Browse products', 'Basic cart', 'Pick-up only'],
    headerBg: 'bg-[#085041]',
    iconBg: 'bg-white/15',
    accentText: 'text-[#1d9e75]',
    accentBorder: 'border-[#0f6e56]',
    accentBg: 'bg-[#e1f5ee]',
    accentBgDark: 'bg-[#1d9e75]/10',
    btnBg: 'bg-[#1d9e75] hover:bg-[#0f6e56]',
  },
  {
    plan: 'Pro',
    label: 'Suki',
    price: '₱99 / mo',
    amount: '99',
    perks: ['Priority orders', 'Suki discounts', 'Home delivery'],
    headerBg: 'bg-[#c2410c]',
    iconBg: 'bg-white/15',
    accentText: 'text-[#f97316]',
    accentBorder: 'border-[#f97316]',
    accentBg: 'bg-[#fff7ed]',
    accentBgDark: 'bg-[#f97316]/10',
    btnBg: 'bg-[#f97316] hover:bg-[#ea580c]',
  },
  {
    plan: 'Max',
    label: 'VIP Suki',
    price: '₱299 / mo',
    amount: '299',
    perks: ['All Suki perks', 'Utang credit line', 'Exclusive deals'],
    headerBg: 'bg-[#4c1d95]',
    iconBg: 'bg-white/15',
    accentText: 'text-[#7c3aed]',
    accentBorder: 'border-[#7c3aed]',
    accentBg: 'bg-[#f5f3ff]',
    accentBgDark: 'bg-[#7c3aed]/10',
    btnBg: 'bg-[#7c3aed] hover:bg-[#6d28d9]',
  },
]

export const PLAN_ICONS: Record<MembershipPlan, React.ComponentType<any>> = {
  Free: Send,
  Pro:  Plane,
  Max:  Rocket,
}

const HEADER_COLORS: Record<MembershipPlan, string> = {
  Free: '#085041',
  Pro:  '#c2410c',
  Max:  '#4c1d95',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  light: boolean
  membership: MembershipPlan
  onOpenPlansModal?: () => void
}

export default function SubscriptionTab({ light, membership, onOpenPlansModal }: Props) {
  const plan  = PLANS.find(p => p.plan === membership)!
  const Icon  = PLAN_ICONS[membership]
  const title = light ? 'text-gray-900'  : 'text-white'
  const sub   = light ? 'text-gray-400'  : 'text-slate-400'
  const sec   = light ? 'text-gray-400'  : 'text-slate-500'
  const row   = light
    ? 'hover:bg-gray-50 border-gray-100'
    : 'hover:bg-slate-800/60 border-white/5'

  return (
    <div>
      <p className={`text-xs font-semibold ${sec} uppercase tracking-widest mb-3`}>Subscription</p>
      <button
        type="button"
        onClick={onOpenPlansModal}
        className={`w-full flex items-center gap-3 p-4 rounded-3xl border ${row} transition-colors`}
      >
        {/* Plan icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: HEADER_COLORS[membership] }}
        >
          <Icon size={20} className="text-white" strokeWidth={2} />
        </div>

        {/* Info */}
        <div className="flex-1 text-left">
          <p className={`font-semibold ${title} text-sm`}>{plan.label} Plan</p>
          <p className={`${sub} text-xs`}>{plan.perks.slice(0, 2).join(' · ')}</p>
        </div>

        {/* Active badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.accentText} ${light ? plan.accentBg : plan.accentBgDark}`}>
          Active
        </span>

        <ChevronRight size={16} className={sub} strokeWidth={2} />
      </button>
    </div>
  )
}
