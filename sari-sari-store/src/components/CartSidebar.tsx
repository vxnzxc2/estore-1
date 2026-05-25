import type { CartItem as CartItemType } from '../types'
import CartItemRow from './CartItem'

interface Props {
  cart: CartItemType[]
  onInc: (id: number) => void
  onDec: (id: number) => void
  onRemove: (id: number) => void
  onClear: () => void
  onClose: () => void
  onPlaceOrder: () => void
}

export default function CartSidebar({
  cart, onInc, onDec, onRemove, onClear, onClose, onPlaceOrder,
}: Props) {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)
  const total    = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="cart-glow animate-slide-in relative bg-amber-50 w-full max-w-sm h-full flex flex-col shadow-2xl border-l-4 border-yellow-400 overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 stripe-bg text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-xl" style={{ fontFamily: "'Baloo 2', cursive" }}>
              🛒 Basket mo
            </h2>
            <p className="text-red-200 text-xs">
              {totalQty} item{totalQty !== 1 ? 's' : ''} sa basket
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-12">
              <span className="text-6xl">🛒</span>
              <p className="font-bold text-base">Walang laman ang basket!</p>
              <button
                onClick={onClose}
                className="bg-yellow-400 text-gray-800 font-bold px-5 py-2 rounded-full hover:bg-yellow-300 transition-colors text-sm"
              >
                Pumili ng produkto
              </button>
            </div>
          ) : (
            cart.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onInc={onInc}
                onDec={onDec}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t-2 border-yellow-200 bg-white px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold text-sm">
                Subtotal ({totalQty} items)
              </span>
              <span className="text-gray-400 text-sm">₱{total}</span>
            </div>

            {total >= 500 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 text-green-600 text-xs font-bold flex items-center gap-2">
                🎉 Libre ang delivery mo!
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-t border-dashed border-yellow-300">
              <span
                className="font-extrabold text-gray-800 text-lg"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                KABUUAN
              </span>
              <span
                className="font-extrabold text-red-600 text-2xl"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                ₱{total}
              </span>
            </div>

            <button
              onClick={onPlaceOrder}
              className="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-extrabold py-4 rounded-2xl shadow-lg text-lg transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              <span>✅</span> Mag-order na!
            </button>

            <button
              onClick={onClear}
              className="text-gray-400 text-xs hover:text-red-400 transition-colors font-semibold text-center"
            >
              I-clear ang basket
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
