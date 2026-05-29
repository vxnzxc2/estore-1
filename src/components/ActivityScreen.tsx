import { useState } from 'react'
import { X, ShoppingBag, Clock, ImageOff, ChevronRight, Package, Truck, Store, CreditCard, Smartphone, Banknote } from 'lucide-react'
import type { CartItem, Order } from '../types'

interface Props {
  cart: CartItem[]
  orders: Order[]
  light?: boolean
  onClose: () => void
  onOpenCart: () => void
}

const METHOD_ICON: Record<string, React.ReactNode> = {
  cash:  <Banknote  size={11} strokeWidth={2} className="text-green-600" />,
  gcash: <Smartphone size={11} strokeWidth={2} className="text-blue-500" />,
  maya:  <Smartphone size={11} strokeWidth={2} className="text-green-500" />,
  card:  <CreditCard size={11} strokeWidth={2} className="text-purple-500" />,
  later: <Clock      size={11} strokeWidth={2} className="text-orange-500" />,
}

function CartThumb({ item, light, sub }: { item: CartItem; light?: boolean; sub: string }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div className={`flex items-center gap-3 py-2`}>
      <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${light ? 'bg-gray-100' : 'bg-slate-700'}`}>
        {imgErr || !item.image
          ? <div className="w-full h-full flex items-center justify-center"><ImageOff size={13} className={sub} strokeWidth={1.5} /></div>
          : <img src={item.image} alt={item.name} onError={() => setImgErr(true)} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${light ? 'text-gray-900' : 'text-white'}`}>{item.name}</p>
        <p className={`text-xs ${sub}`}>₱{item.price} × {item.qty}</p>
      </div>
      <p className="text-amber-500 text-sm font-bold shrink-0">₱{item.price * item.qty}</p>
    </div>
  )
}

function OrderRow({ order, light }: { order: Order; light?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set())
  const sub   = light ? 'text-gray-400' : 'text-slate-400'
  const title = light ? 'text-gray-900' : 'text-white'
  const sepB  = light ? 'border-gray-100' : 'border-white/5'
  const date  = new Date(order.placedAt)

  return (
    <div className={`border-b ${sepB} last:border-0`}>
      <button onClick={() => setExpanded(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${light ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20'}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${light ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
          <ShoppingBag size={15} className="text-amber-500" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${title}`}>#{order.id.slice(-6).toUpperCase()}</p>
          <div className={`flex items-center gap-1.5 flex-wrap mt-0.5`}>
            <p className={`text-[10px] ${sub}`}>
              {date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
              {' · '}
              {date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
            </p>
            {order.method && (
              <span className={`flex items-center gap-0.5 text-[10px] ${sub}`}>
                {METHOD_ICON[order.method] ?? null}
              </span>
            )}
            {order.fulfillment && (
              <span className={`flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-md ${light ? 'bg-gray-100 text-gray-500' : 'bg-slate-700 text-slate-400'}`}>
                {order.fulfillment === 'pickup' ? <Store size={9} strokeWidth={2} /> : <Truck size={9} strokeWidth={2} />}
                <span className="ml-0.5 capitalize">{order.fulfillment}</span>
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-amber-500 font-bold text-sm">₱{order.grandTotal}</p>
          <p className={`text-[10px] ${sub}`}>{order.items.reduce((s, i) => s + i.qty, 0)} items</p>
        </div>
        <ChevronRight size={14} className={`${sub} shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} strokeWidth={2} />
      </button>

      {expanded && (
        <div className={`px-4 pb-3 ${light ? 'bg-gray-50' : 'bg-slate-900/30'}`}>
          <div className={`space-y-2 pt-2 border-t ${sepB}`}>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 ${light ? 'bg-gray-200' : 'bg-slate-700'}`}>
                  {imgErrors.has(item.id) || !item.image
                    ? <div className="w-full h-full flex items-center justify-center"><ImageOff size={11} className={sub} strokeWidth={1.5} /></div>
                    : <img src={item.image} alt={item.name} onError={() => setImgErrors(s => new Set([...s, item.id]))} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${title}`}>{item.name}</p>
                  <p className={`text-[10px] ${sub}`}>₱{item.price} × {item.qty}</p>
                </div>
                <p className="text-amber-500 text-xs font-bold shrink-0">₱{item.price * item.qty}</p>
              </div>
            ))}
          </div>
          <div className={`mt-2 pt-2 border-t ${sepB} flex justify-between text-xs font-bold`}>
            <span className={title}>Total</span>
            <span className="text-amber-500">₱{order.grandTotal}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ActivityScreen({ cart, orders, light, onClose, onOpenCart }: Props) {
  const [tab, setTab] = useState<'history' | 'pending'>('history')

  const bg      = light ? 'bg-white'        : 'bg-[#0d1424]'
  const overlay = light ? 'bg-black/20'     : 'bg-black/60'
  const hdr     = light ? 'border-gray-100' : 'border-white/5'
  const title   = light ? 'text-gray-900'   : 'text-white'
  const sub     = light ? 'text-gray-400'   : 'text-slate-400'
  const card    = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const activeTab = (active: boolean) =>
    active ? 'text-amber-500 border-b-2 border-amber-500 font-semibold' : `${sub} border-b-2 border-transparent hover:text-amber-400`

  const cartTotal    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartQty      = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`animate-slide-right relative ${bg} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
          <div>
            <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Activity</h2>
            <p className={`${sub} text-xs`}>Your orders & purchase history</p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${hdr}`}>
          {[
            { key: 'history', label: 'History' },
            { key: 'pending', label: `Pending${cartQty > 0 ? ` (${cartQty})` : ''}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 text-sm py-3 transition-colors ${activeTab(tab === t.key)}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* History tab */}
          {tab === 'history' && (
            orders.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3 px-5">
                <ShoppingBag size={40} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
                <p className={`font-semibold ${sub} text-sm`}>No orders yet</p>
                <p className={`${sub} text-xs text-center`}>Completed orders will appear here</p>
              </div>
            ) : (
              <div className={`${card} mx-4 my-4 rounded-2xl overflow-hidden`}>
                {orders.map(order => (
                  <OrderRow key={order.id} order={order} light={light} />
                ))}
              </div>
            )
          )}

          {/* Pending tab */}
          {tab === 'pending' && (
            cart.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3 px-5">
                <Package size={40} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
                <p className={`font-semibold ${sub} text-sm`}>No pending orders</p>
                <p className={`${sub} text-xs text-center`}>Add items to your cart to create a pending order</p>
              </div>
            ) : (
              <div className="px-4 py-4 space-y-3">
                {/* Pending order card */}
                <div className={`${card} rounded-2xl overflow-hidden`}>
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${hdr}`}>
                    <div>
                      <p className={`text-xs font-bold ${title}`}>Current Order</p>
                      <p className={`text-[10px] ${sub}`}>{cartQty} item{cartQty !== 1 ? 's' : ''} · ₱{cartTotal}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${light ? 'bg-orange-50 text-orange-500' : 'bg-orange-500/10 text-orange-400'}`}>
                      Pending
                    </span>
                  </div>
                  <div className="px-4 divide-y divide-gray-100 dark:divide-white/5">
                    {cart.map(item => (
                      <CartThumb key={item.id} item={item} light={light} sub={sub} />
                    ))}
                  </div>
                  <div className={`px-4 py-3 border-t ${hdr}`}>
                    <button onClick={() => { onClose(); onOpenCart() }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors shadow-lg shadow-amber-500/20">
                      <ShoppingBag size={15} strokeWidth={2.5} /> View Cart & Checkout
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
