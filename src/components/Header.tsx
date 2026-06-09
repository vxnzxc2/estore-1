import { Store, ShoppingCart, Clock } from 'lucide-react'

interface Props {
  totalQty: number
  time: Date
  onCartOpen: () => void
  onProfileOpen: () => void
  user: { name: string; walletBalance: number; points: number }
  light?: boolean
}

export default function Header({ totalQty, time, onCartOpen, onProfileOpen, user, light }: Props) {
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
              eStore
            </p>
          </div>
        </div>

        <div className={`hidden md:flex items-center gap-1.5 text-xs ${sub}`}>
          <Clock size={11} strokeWidth={2} className={clock} />
          <span className="tabular-nums font-medium" style={{ color: light ? '#92400e' : '#fbbf24' }}>
            {time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <button onClick={onProfileOpen}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-colors ${light ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-slate-800/75 text-white hover:bg-slate-700'}`}>
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-[11px] font-semibold text-white">
            {user.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left leading-none">
            <p className="text-xs font-semibold">{user.name.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-300">₱{user.walletBalance.toFixed(2)} · {user.points} pts</p>
          </div>
        </button>

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
