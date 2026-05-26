import { ShoppingCart, ScanLine, Settings, Sun, Moon } from 'lucide-react'

interface Props {
  totalQty: number
  light: boolean
  onCartOpen: () => void
  onScan: () => void
  onSettings: () => void
  onToggleLight: () => void
}

export default function BottomNav({ totalQty, light, onCartOpen, onScan, onSettings, onToggleLight }: Props) {
  const bg      = light ? 'bg-white border-t border-gray-200 shadow-lg' : 'bg-slate-900 border-t border-white/5 shadow-2xl'
  const btnBase = light ? 'text-gray-400 hover:text-gray-900 active:text-amber-600' : 'text-slate-500 hover:text-white active:text-amber-400'
  const btnAct  = light ? 'text-amber-600' : 'text-amber-400'

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-30 ${bg} bottom-nav transition-colors duration-300`}>
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">

        {/* Cart */}
        <button onClick={onCartOpen}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl relative transition-colors ${btnBase}`}>
          <div className="relative">
            <ShoppingCart size={22} strokeWidth={2} />
            {totalQty > 0 && (
              <span className="animate-badge-pop absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalQty > 9 ? '9+' : totalQty}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        {/* Scan — center prominent button */}
        <button onClick={onScan}
          className="btn-press flex flex-col items-center gap-1 -mt-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-colors">
            <ScanLine size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-semibold ${btnAct}`}>Scan</span>
        </button>

        {/* Right side group */}
        <div className="flex items-center gap-1">
          {/* Light/Dark toggle */}
          <button onClick={onToggleLight}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${btnBase}`}>
            {light
              ? <Moon size={22} strokeWidth={2} />
              : <Sun  size={22} strokeWidth={2} />}
            <span className="text-[10px] font-medium">{light ? 'Dark' : 'Light'}</span>
          </button>

          {/* Settings */}
          <button onClick={onSettings}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${btnBase}`}>
            <Settings size={22} strokeWidth={2} />
            <span className="text-[10px] font-medium">Admin</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
