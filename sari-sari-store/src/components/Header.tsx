interface Props {
  totalQty: number
  time: Date
  onCartOpen: () => void
}

export default function Header({ totalQty, time, onCartOpen }: Props) {
  return (
    <header className="banner-glow bg-red-600 stripe-bg text-white px-4 py-3 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        {/* Branding */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-3xl animate-float">🏪</span>
          <div>
            <h1
              className="text-xl font-extrabold leading-none tracking-wide"
              style={{ fontFamily: "'Baloo 2', cursive", textShadow: '1px 2px 0 rgba(0,0,0,0.25)' }}
            >
              Tindahan ni Aling Rosa
            </h1>
            <p className="text-red-200 text-[11px] font-semibold tracking-widest uppercase">
              Sari-Sari Store · Est. 1993
            </p>
          </div>
        </div>

        {/* Clock */}
        <div className="hidden md:flex flex-col items-end gap-0.5">
          <span className="text-yellow-300 font-bold text-sm">
            {time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-red-200 text-xs">
            {time.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Cart button */}
        <button
          onClick={onCartOpen}
          className="relative bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-extrabold px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-xl">🛒</span>
          <span className="font-bold text-sm">Basket</span>
          {totalQty > 0 && (
            <span className="absolute -top-2 -right-2 animate-pulse-badge bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              {totalQty}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
