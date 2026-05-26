import { Store, MapPin, Phone, Clock } from 'lucide-react'

interface Props { light?: boolean }

export default function Footer({ light }: Props) {
  const bg    = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/50 border border-white/5'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-400' : 'text-slate-400'
  const muted = light ? 'text-gray-300' : 'text-slate-600'
  const acc   = light ? 'text-amber-600' : 'text-amber-400'

  return (
    <footer className="max-w-7xl mx-auto px-4 mt-10 mb-4">
      <div className={`rounded-2xl ${bg} px-5 py-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Store size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className={`font-bold ${title} text-sm`} style={{ fontFamily: 'Syne, sans-serif' }}>Evaristo's Sari-Sari Store</p>
            <p className={`${muted} text-xs`}>Est. 1993 · Family Owned · 🇵🇭 Proudly Pinoy</p>
          </div>
        </div>
        <div className={`space-y-1.5 text-xs ${sub}`}>
          <div className="flex items-center gap-2"><MapPin size={12} strokeWidth={2} className={acc} /><span>Blk 3 Lot 5, Sampaguita St., Maynila</span></div>
          <div className="flex items-center gap-2"><Phone size={12} strokeWidth={2} className={acc} /><span>0912-345-6789 · GCash & Palengke Pay</span></div>
          <div className="flex items-center gap-2"><Clock size={12} strokeWidth={2} className={acc} /><span>Open daily 6:00 AM – 10:00 PM</span></div>
        </div>
        <p className={`${muted} text-[10px] mt-4 pt-3 border-t ${light ? 'border-gray-100' : 'border-white/5'}`}>
          © 2024 Tindahan ni Evaristo. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
