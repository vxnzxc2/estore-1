import { useState } from 'react'
import { X, ShoppingCart, ShoppingBag, Check, Trash2, Truck, Tag, Square, CheckSquare, AlertTriangle } from 'lucide-react'
import type { CartItem as CartItemType } from '../types'

const FREE_DELIVERY_AT = 1000

interface Props {
  cart: CartItemType[]
  onQtyChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
  onRemoveSelected: (ids: number[]) => void
  onClear: () => void
  onClose: () => void
  onPlaceOrder: () => void
  light?: boolean
}

function CartItemRow({ item, selected, onSelect, onQtyChange, light }: {
  item: CartItemType
  selected: boolean
  onSelect: () => void
  onQtyChange: (id: number, qty: number) => void
  light?: boolean
}) {
  const [imgError, setImgError] = useState(false)

  const row    = light ? 'bg-white border-gray-200'      : 'bg-slate-800/60 border-white/5'
  const name   = light ? 'text-gray-900'                 : 'text-white'
  const sub    = light ? 'text-gray-400'                 : 'text-slate-500'
  const price  = light ? 'text-amber-600'                : 'text-amber-400'
  const qtyBox = light ? 'bg-gray-100 border-gray-200'   : 'bg-slate-900 border-slate-600'
  const qtyBtn = light ? 'text-gray-400 hover:bg-gray-200 hover:text-gray-700' : 'text-slate-400 hover:bg-slate-700 hover:text-white'

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const val = Math.max(1, raw === '' ? 1 : parseInt(raw))
    onQtyChange(item.id, val)
  }

  return (
    <div className={`flex items-center gap-2 ${row} rounded-xl p-2.5 border transition-colors`}>
      {/* Checkbox */}
      <button onClick={onSelect} className="shrink-0 text-amber-500">
        {selected
          ? <CheckSquare size={18} strokeWidth={2} />
          : <Square size={18} strokeWidth={1.5} className={light ? 'text-gray-300' : 'text-slate-600'} />}
      </button>

      {/* Image */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag size={16} strokeWidth={1.5} />
          </div>
        ) : (
          <img src={item.image} alt={item.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${name} text-xs truncate`}>{item.name}</p>
        <p className={`${price} font-bold text-sm`}>₱{item.price * item.qty}</p>
        <p className={`${sub} text-[10px]`}>₱{item.price} × {item.qty}</p>
      </div>

      {/* Qty */}
      <div className={`flex items-center ${qtyBox} border rounded-lg overflow-hidden shrink-0`}>
        <button onClick={() => onQtyChange(item.id, Math.max(1, item.qty - 1))}
          className={`w-7 h-7 flex items-center justify-center ${qtyBtn} transition-colors text-xs`}>−</button>
        <input type="text" inputMode="numeric" value={item.qty} onChange={handleInput}
          className={`w-7 text-center font-bold text-xs bg-transparent outline-none tabular-nums ${light ? 'text-gray-800' : 'text-white'}`} />
        <button onClick={() => onQtyChange(item.id, item.qty + 1)}
          className={`w-7 h-7 flex items-center justify-center ${qtyBtn} transition-colors text-xs`}>+</button>
      </div>
    </div>
  )
}

// Confirm dialog
function ConfirmDialog({ count, onConfirm, onCancel, light }: { count: number; onConfirm: () => void; onCancel: () => void; light?: boolean }) {
  const bg    = light ? 'bg-white border border-gray-200 shadow-2xl' : 'bg-slate-800 border border-white/10 shadow-2xl'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-500' : 'text-slate-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${bg} rounded-2xl p-6 w-full max-w-xs animate-fade-up`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-500" strokeWidth={2} />
          </div>
          <div>
            <p className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
              Remove {count} item{count !== 1 ? 's' : ''}?
            </p>
            <p className={`${sub} text-sm mt-1`}>Are you sure you want to remove the selected items from your cart?</p>
          </div>
          <div className="flex gap-2 w-full mt-1">
            <button onClick={onCancel}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${light ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors">
              Yes, Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Order confirm
function OrderConfirmDialog({ total, grandTotal, onConfirm, onCancel, light }: { total: number; grandTotal: number; onConfirm: () => void; onCancel: () => void; light?: boolean }) {
  const bg    = light ? 'bg-white border border-gray-200 shadow-2xl' : 'bg-slate-800 border border-white/10 shadow-2xl'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-500' : 'text-slate-400'
  const sep   = light ? 'border-gray-100' : 'border-white/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${bg} rounded-2xl p-6 w-full max-w-xs animate-fade-up`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
            <ShoppingCart size={28} className="text-amber-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className={`font-bold ${title} text-lg`} style={{ fontFamily: 'Syne, sans-serif' }}>Confirm Order</p>
            <p className={`${sub} text-sm mt-1`}>Are you sure you want to place this order?</p>
          </div>
          <div className={`w-full border-t border-b ${sep} py-3 space-y-1`}>
            <div className="flex justify-between text-sm">
              <span className={sub}>Subtotal</span>
              <span className={title}>₱{total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={sub}>Delivery</span>
              <span className={total >= FREE_DELIVERY_AT ? 'text-green-500 font-medium' : `${sub}`}>
                {total >= FREE_DELIVERY_AT ? 'FREE' : '₱50'}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span className={title}>Total</span>
              <span className="text-amber-500">₱{grandTotal}</span>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={onCancel}
              className={`flex-1 py-3 rounded-xl text-sm font-medium ${light ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'} transition-colors`}>
              No, Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors flex items-center justify-center gap-2">
              <Check size={15} strokeWidth={3} /> Yes, Order!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartSidebar({ cart, onQtyChange, onRemove, onRemoveSelected, onClear, onClose, onPlaceOrder, light }: Props) {
  const [selected,       setSelected]       = useState<Set<number>>(new Set())
  const [showDeleteConf, setShowDeleteConf] = useState(false)
  const [showOrderConf,  setShowOrderConf]  = useState(false)

  const totalQty   = cart.reduce((s, i) => s + i.qty, 0)
  const total      = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const toFree     = Math.max(0, FREE_DELIVERY_AT - total)
  const progress   = Math.min((total / FREE_DELIVERY_AT) * 100, 100)
  const deliveryFee = total >= FREE_DELIVERY_AT ? 0 : 50
  const grandTotal  = total + deliveryFee

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }
  const toggleAll = () => {
    setSelected(selected.size === cart.length ? new Set() : new Set(cart.map(i => i.id)))
  }

  const handleDeleteSelected = () => {
    onRemoveSelected([...selected])
    setSelected(new Set())
    setShowDeleteConf(false)
  }

  const handleConfirmOrder = () => {
    setShowOrderConf(false)
    onPlaceOrder()
  }

  const panel  = light ? 'bg-white'      : 'bg-[#0d1424]'
  const hdr    = light ? 'border-gray-100' : 'border-white/5'
  const title  = light ? 'text-gray-900' : 'text-white'
  const sub    = light ? 'text-gray-400' : 'text-slate-500'
  const closeB = light ? 'bg-gray-100 hover:bg-gray-200 text-gray-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
  const track  = light ? 'bg-gray-200'   : 'bg-slate-700'
  const footer = light ? 'bg-gray-50 border-t border-gray-100' : 'bg-slate-900/80 border-t border-white/5'
  const selBar = light ? 'bg-red-50 border border-red-100' : 'bg-red-500/10 border border-red-500/20'

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <div className={`absolute inset-0 ${light ? 'bg-black/20' : 'bg-black/60'} backdrop-blur-sm`} onClick={onClose} />

        <div className={`animate-slide-right relative ${panel} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3.5 border-b ${hdr} shrink-0`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${light ? 'bg-amber-50' : 'bg-amber-500/10'} flex items-center justify-center`}>
                <ShoppingCart size={14} className="text-amber-500" strokeWidth={2} />
              </div>
              <div>
                <h2 className={`font-bold ${title} text-sm`} style={{ fontFamily: 'Syne, sans-serif' }}>Your Cart</h2>
                <p className={`${sub} text-[10px]`}>{totalQty} item{totalQty !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {cart.length > 0 && (
                <button onClick={toggleAll}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${light ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                  {selected.size === cart.length ? 'Deselect' : 'Select All'}
                </button>
              )}
              <button onClick={onClose} className={`w-7 h-7 rounded-lg ${closeB} flex items-center justify-center transition-colors`}>
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Delete selected bar */}
          {selected.size > 0 && (
            <div className={`flex items-center justify-between px-4 py-2 ${selBar} shrink-0`}>
              <p className="text-red-500 text-xs font-medium">{selected.size} selected</p>
              <button onClick={() => setShowDeleteConf(true)}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Trash2 size={11} strokeWidth={2} /> Remove
              </button>
            </div>
          )}

          {/* Free delivery bar */}
          {cart.length > 0 && (
            <div className={`px-4 py-2.5 border-b ${hdr} shrink-0 ${light ? 'bg-amber-50/50' : 'bg-amber-500/5'}`}>
              {toFree > 0 ? (
                <p className={`text-xs ${sub} mb-1.5 flex items-center gap-1.5`}>
                  <Truck size={11} strokeWidth={2} className="text-amber-500" />
                  Add <span className="text-amber-500 font-semibold">₱{toFree}</span> more for FREE delivery
                </p>
              ) : (
                <p className="text-xs text-green-500 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Truck size={11} strokeWidth={2} /> 🎉 Free delivery unlocked!
                </p>
              )}
              <div className={`h-1.5 ${track} rounded-full overflow-hidden`}>
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
                <ShoppingBag size={48} strokeWidth={1} className={light ? 'text-gray-200' : 'text-slate-700'} />
                <div>
                  <p className={`font-semibold ${title} text-sm`}>Your cart is empty</p>
                  <p className={`${sub} text-xs mt-1`}>Add products to get started</p>
                </div>
                <button onClick={onClose} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors">
                  Browse Products
                </button>
              </div>
            ) : (
              cart.map(item => (
                <CartItemRow key={item.id} item={item} selected={selected.has(item.id)}
                  onSelect={() => toggleSelect(item.id)} onQtyChange={onQtyChange} light={light} />
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className={`${footer} px-4 py-4 flex flex-col gap-3 shrink-0`}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={sub}>Subtotal</span>
                  <span className={sub}>₱{total}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`${sub} flex items-center gap-1`}><Tag size={10} strokeWidth={2} /> Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-500 font-semibold text-xs' : `${sub} text-xs`}>
                    {deliveryFee === 0 ? 'FREE' : '₱50'}
                  </span>
                </div>
                <div className={`pt-1.5 border-t ${light ? 'border-gray-200' : 'border-white/10'} flex items-center justify-between`}>
                  <span className={`${title} font-bold text-sm`}>Total</span>
                  <span className={`${light ? 'text-amber-600' : 'text-amber-400'} font-bold text-lg`} style={{ fontFamily: 'Syne, sans-serif' }}>
                    ₱{grandTotal}
                  </span>
                </div>
              </div>

              <button onClick={() => setShowOrderConf(true)}
                className="btn-press w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20">
                <Check size={15} strokeWidth={3} /> Place Order
              </button>

              <button onClick={onClear}
                className={`${light ? 'text-gray-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'} text-xs font-medium text-center flex items-center justify-center gap-1.5 transition-colors`}>
                <Trash2 size={11} strokeWidth={2} /> Clear cart
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteConf && (
        <ConfirmDialog count={selected.size} onConfirm={handleDeleteSelected} onCancel={() => setShowDeleteConf(false)} light={light} />
      )}
      {showOrderConf && (
        <OrderConfirmDialog total={total} grandTotal={grandTotal} onConfirm={handleConfirmOrder} onCancel={() => setShowOrderConf(false)} light={light} />
      )}
    </>
  )
}
