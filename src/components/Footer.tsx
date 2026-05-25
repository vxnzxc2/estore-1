import { Store, MapPin, Phone, Heart, Star, Clock } from 'lucide-react'

interface Props { light?: boolean }

export default function Footer({ light }: Props) {
  const bg     = light ? 'bg-white border border-gray-200'       : 'bg-slate-800/50 border border-white/5'
  const title  = light ? 'text-gray-900'                         : 'text-white'
  const sub    = light ? 'text-gray-400'                         : 'text-slate-400'
  const muted  = light ? 'text-gray-300'                         : 'text-slate-500'
  const badge  = light ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-slate-700/50 border-white/5 text-slate-300'
  const accent = light ? 'text-amber-600'                        : 'text-amber-400'

  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 pb-6">
      <div className={`rounded-2xl ${bg} px-8 py-8 transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Aling Ronan's</p>
              <p className={`${muted} text-xs`}>Est. 1993 · Family Owned</p>
            </div>
          </div>
          <div className={`flex flex-col gap-2 text-sm ${sub}`}>
            <div className="flex items-center gap-2"><MapPin size={13} strokeWidth={2} className={accent} /><span>Blk 3 Lot 5, Sampaguita St., Maynila</span></div>
            <div className="flex items-center gap-2"><Phone size={13} strokeWidth={2} className={accent} /><span>0912-345-6789 · GCash & Palengke Pay</span></div>
            <div className="flex items-center gap-2"><Clock size={13} strokeWidth={2} className={accent} /><span>Open daily 6:00 AM – 10:00 PM</span></div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { icon: <Star  size={11} strokeWidth={2} />, label: '30+ Years of Service' },
              { icon: <Heart size={11} strokeWidth={2} />, label: 'Family Business'       },
            ].map(({ icon, label }) => (
              <span key={label} className={`flex items-center gap-2 text-xs ${badge} border px-3 py-1.5 rounded-lg`}>
                <span className={accent}>{icon}</span>{label}
              </span>
            ))}
          </div>
        </div>
        <div className={`mt-6 pt-5 border-t ${light ? 'border-gray-100' : 'border-white/5'} flex items-center justify-between`}>
          <p className={`${muted} text-xs`}>© 2024 Tindahan ni Aling Ronan. All rights reserved.</p>
          <p className={`${muted} text-xs`}>🇵🇭 Proudly Pinoy</p>
        </div>
      </div>
    </footer>
  )
}
