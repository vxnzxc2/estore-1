import { PROMO_MESSAGES } from '../data'

export default function PromoMarquee() {
  // Duplicate for seamless loop
  const text = [...PROMO_MESSAGES, ...PROMO_MESSAGES].join('   •   ')

  return (
    <div className="bg-yellow-400 py-1.5 marquee-wrap border-b-2 border-yellow-500">
      <div className="animate-marquee inline-block text-gray-900 font-bold text-sm">
        {text}
      </div>
    </div>
  )
}
