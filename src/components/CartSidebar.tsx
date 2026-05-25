import { X, ShoppingCart, ShoppingBag, Check, Trash2, Truck, Tag } from 'lucide-react'
import type { CartItem as CartItemType } from '../types'
import CartItemRow from './CartItem'

interface Props {
  cart: CartItemType[]
  onQtyChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
  onClear: () => void
  onClose: () => void
  onPlaceOrder: () => void
  light?: boolean
}

export default function CartSidebar({ cart, onQtyChange, onRemove, onClear, onClose, onPlaceOrder, light }: Props) {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)
  const total    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const freeAt   = 500
  const toFree   = Math.max(0, freeAt - total)
  const progress = Math.min((total / freeAt) * 100, 100)

  const panel    = light ? 'bg-white border-l border-gray-200'             : 'bg-[#0d1424] border-l border-white/5'
  const hdr      = light ? 'border-b border-gray-100'                      : 'border-b border-white/5'
  const iconBox  = light ? 'bg-amber-50'                                   : 'bg-amber-500/10'
  const title    = light ? 'text-gray-900'                                 : 'text-white'
  const sub      = light ? 'text-gray-400'                                 : 'text-slate-500'
  const closeBtn = light ? 'bg-gray-100 hover:bg-gray-200 text-gray-500'  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
  const promoBar = light ? 'border-b border-gray-100 bg-gray-50'          : 'border-b border-white/5 bg-slate-900/40'
  const trackBg  = light ? 'bg-gray-200'                                  : 'bg-slate-700'
  const footer   = light ? 'border-t border-gray-100 bg-gray-50'         : 'border-t border-white/5 bg-slate-900/60'
  const sepLine  = light ? 'border-gray-200'                              : 'border-white/5'
  const subText  = light ? 'text-gray-500'                                : 'text-slate-400'
  const clearBtn = light ? 'text-gray-400 hover:text-red-500'             : 'text-slate-500 hover:text-red-400'

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className={`absolute inset-0 ${light ? 'bg-black/20' : 'bg-black/70'} backdrop-blur-sm`} onClick={onClose} />
      <div className={`animate-slide-right relative ${panel} w-full max-w-[400px] h-full flex flex-col shadow-2xl overflow-hidden`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 ${hdr}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${iconBox} flex items-center justify-center`}>
              <ShoppingCart size={16} className="text-amber-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Your Cart</h2>
              <p className={`${sub} text-xs`}>{totalQty} item{totalQty !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg ${closeBtn} flex items-center justify-center transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Delivery progress */}
        {cart.length > 0 && (
          <div className={`px-6 py-3 ${promoBar}`}>
            {toFree > 0 ? (
              <p className={`text-xs ${sub} mb-2 flex items-center gap-1.5`}>
                <Truck size={12} strokeWidth={2} className="text-amber-500" />
                Add <span className="text-amber-500 font-semibold">₱{toFree}</span> more for free delivery
              </p>
            ) : (
              <p className="text-xs text-green-500 font-semibold mb-2 flex items-center gap-1.5">
                <Truck size={12} strokeWidth={2} /> Free delivery unlocked!
              </p>
            )}
            <div className={`h-1.5 ${trackBg} rounded-full overflow-hidden`}>
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
              <ShoppingBag size={56} strokeWidth={1} className={light ? 'text-gray-200' : 'text-slate-700'} />
              <div className="text-center">
                <p className={`font-semibold ${title} text-base`}>Your cart is empty</p>
                <p className={`${sub} text-sm mt-1`}>Add some products to get started</p>
              </div>
              <button onClick={onClose} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
                Browse Products
              </button>
            </div>
          ) : (
            cart.map(item => (
              <CartItemRow key={item.id} item={item} onQtyChange={onQtyChange} onRemove={onRemove} light={light} />
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className={`${footer} px-6 py-5 flex flex-col gap-4`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={subText}>Subtotal</span>
                <span className={`${subText} font-medium`}>₱{total}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`${subText} flex items-center gap-1.5`}><Tag size={12} strokeWidth={2} /> Delivery</span>
                <span className={total >= freeAt ? 'text-green-500 font-medium text-xs' : `${subText} font-medium`}>
                  {total >= freeAt ? 'FREE' : '₱50'}
                </span>
              </div>
              <div className={`pt-2 border-t ${sepLine} flex items-center justify-between`}>
                <span className={`${title} font-bold`}>Total</span>
                <span className={`${light ? 'text-amber-600' : 'text-amber-400'} font-bold text-xl`} style={{ fontFamily: 'Syne, sans-serif' }}>
                  ₱{total >= freeAt ? total : total + 50}
                </span>
              </div>
            </div>
            <button onClick={onPlaceOrder}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all">
              <Check size={16} strokeWidth={3} /> Place Order
            </button>
            <button onClick={onClear}
              className={`${clearBtn} text-xs font-medium text-center flex items-center justify-center gap-1.5 transition-colors`}>
              <Trash2 size={12} strokeWidth={2} /> Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
