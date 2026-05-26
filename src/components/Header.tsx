import { Store, ShoppingCart, Clock } from 'lucide-react'

interface Props {
  totalQty: number
  time: Date
  onCartOpen: () => void
  light?: boolean
}

export default function Header({ totalQty, time, onCartOpen, light }: Props) {
  const bg    = light ? 'bg-white border-b border-gray-200 shadow-sm' : 'bg-slate-900/95 border-b border-white/5'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-400' : 'text-slate-500'
  const clock = light ? 'text-amber-600' : 'text-amber-400'
  const btn   = 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20'

  return (
    <header className={`${bg} glass px-4 py-0 sticky top-0 z-30 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3 h-14">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Store size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className={`${title} font-bold text-sm leading-none`} style={{ fontFamily: 'Syne, sans-serif' }}>
              Evaristo's
            </p>
            <p className={`${sub} text-[10px] tracking-widest uppercase`}>Sari-Sari Store</p>
          </div>
        </div>

        <div className={`hidden md:flex items-center gap-1.5 text-xs ${sub}`}>
          <Clock size={11} strokeWidth={2} className={clock} />
          <span className="tabular-nums font-medium" style={{ color: light ? '#92400e' : '#fbbf24' }}>
            {time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <button onClick={onCartOpen}
          className={`btn-press relative flex items-center gap-1.5 ${btn} font-semibold text-xs px-3 py-2 rounded-xl transition-colors`}>
          <ShoppingCart size={15} strokeWidth={2.5} />
          <span>Cart</span>
          {totalQty > 0 && (
            <span className="animate-badge-pop absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
              {totalQty > 9 ? '9+' : totalQty}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
