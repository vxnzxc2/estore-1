import { ShoppingCart, ScanLine, Settings } from 'lucide-react'

interface Props {
  totalQty: number
  onCartOpen: () => void
  onScan: () => void
  onSettings: () => void
}

export default function BottomNav({ totalQty, onCartOpen, onScan, onSettings }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-white/5 shadow-2xl safe-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">

        {/* Cart */}
        <button onClick={onCartOpen}
          className="flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl relative text-gray-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400 transition-colors">
          <div className="relative">
            <ShoppingCart size={24} strokeWidth={2} />
            {totalQty > 0 && (
              <span className="animate-badge-pop absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalQty > 9 ? '9+' : totalQty}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        {/* Scan — center */}
        <button onClick={onScan} className="flex flex-col items-center gap-1 -mt-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all">
            <ScanLine size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold text-amber-500">Scan</span>
        </button>

        {/* Settings */}
        <button onClick={onSettings}
          className="flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl text-gray-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400 transition-colors">
          <Settings size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </nav>
  )
}
