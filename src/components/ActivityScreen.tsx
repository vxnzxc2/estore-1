import { useState, useEffect } from 'react'
import { X, ShoppingBag, Clock, ImageOff, ChevronRight, Package, Truck, Store, CreditCard, Smartphone, Banknote, Calendar, Wallet, AlertTriangle, CheckCircle, XCircle, Ban, Timer } from 'lucide-react'
import type { CartItem, Order } from '../types'
import type { AdvanceOrder } from './AdvanceOrderModal'

interface Props {
  cart: CartItem[]
  orders: Order[]
  advanceOrders: AdvanceOrder[]
  light?: boolean
  onClose: () => void
  onOpenCart: () => void
  onCancelOrder: (id: string) => void
  onPayDeposit: (id: string) => void
  onCancelAdvanceOrder: (id: string) => void
  onNewAdvanceOrder: () => void
}

const METHOD_ICON: Record<string, React.ReactNode> = {
  cash:  <Banknote  size={11} strokeWidth={2} className="text-green-600" />,
  gcash: <Smartphone size={11} strokeWidth={2} className="text-blue-500" />,
  maya:  <Smartphone size={11} strokeWidth={2} className="text-green-500" />,
  card:  <CreditCard size={11} strokeWidth={2} className="text-purple-500" />,
  later: <Clock      size={11} strokeWidth={2} className="text-orange-500" />,
}

// ── Countdown timer for advance orders ────────────────────────────────────────
function CountdownTimer({ dueDate, light }: { dueDate: string; light?: boolean }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent,   setUrgent]   = useState(false)
  const [expired,  setExpired]  = useState(false)

  useEffect(() => {
    const calc = () => {
      const diff = new Date(dueDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Overdue'); setExpired(true); setUrgent(false); return }
      setExpired(false)
      const hours = Math.floor(diff / 3_600_000)
      const mins  = Math.floor((diff % 3_600_000) / 60_000)
      if (diff < 86_400_000) { setUrgent(true); setTimeLeft(`${hours}h ${mins}m`) }
      else { setUrgent(false); setTimeLeft(`${Math.floor(diff / 86_400_000)}d ${hours % 24}h`) }
    }
    calc()
    const iv = setInterval(calc, 60_000)
    return () => clearInterval(iv)
  }, [dueDate])

  if (expired) return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg">
      <Timer size={10} strokeWidth={2.5} /> Overdue
    </span>
  )
  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${
      urgent ? 'text-orange-500 bg-orange-500/10 animate-pulse'
             : light ? 'text-gray-500 bg-gray-100' : 'text-slate-400 bg-slate-700'
    }`}>
      <Clock size={10} strokeWidth={2.5} /> {timeLeft}
    </span>
  )
}

// ── Advance order card ─────────────────────────────────────────────────────────
function AdvanceOrderCard({ order, light, onPayDeposit, onCancelAdvanceOrder }: {
  order: AdvanceOrder; light?: boolean
  onPayDeposit: (id: string) => void
  onCancelAdvanceOrder: (id: string) => void
}) {
  const [expanded,      setExpanded]      = useState(false)
  const [imgErrors,     setImgErrors]     = useState<Set<number>>(new Set())
  const [confirmCancel, setConfirmCancel] = useState(false)

  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-400' : 'text-slate-400'
  const sepB  = light ? 'border-gray-100' : 'border-white/5'
  const rowBg = light ? 'bg-gray-50'     : 'bg-slate-900/30'

  const dueDateDisplay = new Date(order.dueDate).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const STATUS_CONFIG = {
    pending:   { label: 'Awaiting Deposit', color: 'text-amber-500',  bg: light ? 'bg-amber-50'  : 'bg-amber-500/10',  Icon: Clock        },
    confirmed: { label: 'Confirmed',         color: 'text-green-500',  bg: light ? 'bg-green-50'  : 'bg-green-500/10',  Icon: CheckCircle  },
    cancelled: { label: 'Cancelled',         color: 'text-red-500',    bg: light ? 'bg-red-50'    : 'bg-red-500/10',    Icon: XCircle      },
    completed: { label: 'Completed',         color: 'text-blue-500',   bg: light ? 'bg-blue-50'   : 'bg-blue-500/10',   Icon: CheckCircle  },
  }
  const sc = STATUS_CONFIG[order.status]
  const isOverdue     = !order.depositPaid && new Date(order.dueDate) < new Date()
  const canPayDeposit = order.status === 'pending' && !order.depositPaid
  const canCancel     = order.status === 'pending' || order.status === 'confirmed'

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      order.status === 'cancelled' ? light ? 'border-red-100 opacity-70' : 'border-red-500/10 opacity-70' :
      order.status === 'confirmed' ? light ? 'border-green-200' : 'border-green-500/20' :
      isOverdue ? light ? 'border-red-200' : 'border-red-500/20' :
      light ? 'border-gray-200' : 'border-white/5'
    }`}>
      {/* Header row */}
      <button onClick={() => setExpanded(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${light ? 'bg-white hover:bg-gray-50' : 'bg-slate-800/60 hover:bg-slate-700/40'}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${sc.bg}`}>
          <sc.Icon size={15} className={sc.color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-xs font-bold ${title}`}>#{order.id.slice(-6).toUpperCase()}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${sc.color} ${sc.bg}`}>{sc.label}</span>
            {order.status === 'pending' && !order.depositPaid && !isOverdue && (
              <CountdownTimer dueDate={order.dueDate} light={light} />
            )}
          </div>
          <p className={`text-[10px] ${sub} mt-0.5`}>
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₱{order.total.toLocaleString('en-PH')} total
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-xs font-bold ${order.depositPaid ? 'text-green-500' : 'text-purple-500'}`}>
            ₱{order.deposit.toLocaleString('en-PH')}
          </p>
          <p className={`text-[10px] ${sub}`}>{order.depositPaid ? 'paid ✓' : 'deposit'}</p>
        </div>
        <ChevronRight size={14} className={`${sub} transition-transform ${expanded ? 'rotate-90' : ''}`} strokeWidth={2} />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className={`border-t ${sepB}`}>
          {/* Due date banner */}
          {order.status === 'pending' && !order.depositPaid && (
            <div className={`px-4 py-2 flex items-center gap-2 text-xs ${
              isOverdue
                ? light ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-400'
                : light ? 'bg-amber-50 text-amber-700' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {isOverdue
                ? <><XCircle size={11} strokeWidth={2} /> Deposit overdue — will be cancelled automatically</>
                : <><Clock size={11} strokeWidth={2} /> Pay deposit by <strong>{dueDateDisplay}</strong> to confirm</>
              }
            </div>
          )}

          {/* Items */}
          <div className={`px-4 py-3 ${rowBg}`}>
            <p className={`text-[10px] font-semibold ${sub} uppercase tracking-wider mb-2`}>Items reserved</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const imgErr = imgErrors.has(item.id)
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 ${light ? 'bg-gray-200' : 'bg-slate-700'}`}>
                      {imgErr || !item.image
                        ? <div className="w-full h-full flex items-center justify-center"><ImageOff size={11} className={sub} strokeWidth={1.5} /></div>
                        : <img src={item.image} alt={item.name}
                            onError={() => setImgErrors(s => new Set([...s, item.id]))}
                            className="w-full h-full object-cover" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${title} truncate`}>{item.name}</p>
                      <p className={`text-[10px] ${sub}`}>₱{item.price} × {item.qty}</p>
                    </div>
                    <p className="text-xs font-bold text-amber-500">₱{item.price * item.qty}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className={`px-4 py-3 border-t ${sepB} space-y-1.5`}>
            <div className="flex justify-between text-xs">
              <span className={sub}>Order total</span>
              <span className={`font-semibold ${title}`}>₱{order.total.toLocaleString('en-PH')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={`font-semibold ${order.depositPaid ? 'text-green-500' : 'text-purple-500'}`}>
                Deposit 50% {order.depositPaid ? '✓ Paid' : ''}
              </span>
              <span className={`font-bold ${order.depositPaid ? 'text-green-500' : 'text-purple-500'}`}>
                ₱{order.deposit.toLocaleString('en-PH')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={sub}>Remaining balance</span>
              <span className={`font-semibold ${title}`}>₱{(order.total - order.deposit).toLocaleString('en-PH')}</span>
            </div>
            {order.depositPaidAt && (
              <p className={`text-[10px] ${sub}`}>
                Deposit paid: {new Date(order.depositPaidAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {order.note && (
            <div className={`px-4 py-2.5 border-t ${sepB}`}>
              <p className={`text-[10px] ${sub} mb-0.5`}>Note</p>
              <p className={`text-xs ${title}`}>{order.note}</p>
            </div>
          )}

          {/* Actions */}
          {(canPayDeposit || canCancel) && (
            <div className={`px-4 py-3 border-t ${sepB} flex gap-2`}>
              {canPayDeposit && !confirmCancel && (
                <button onClick={() => onPayDeposit(order.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-purple-500 hover:bg-purple-400 text-white transition-colors shadow-md shadow-purple-500/20">
                  <Wallet size={12} strokeWidth={2.5} /> Pay Deposit ₱{order.deposit.toLocaleString('en-PH')}
                </button>
              )}
              {canCancel && !confirmCancel && (
                <button onClick={() => setConfirmCancel(true)}
                  className={`${canPayDeposit ? '' : 'flex-1'} flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    light ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  }`}>
                  <Ban size={11} strokeWidth={2} /> Cancel
                </button>
              )}
              {confirmCancel && (
                <>
                  <p className={`flex-1 text-xs ${sub} flex items-center gap-1`}>
                    <AlertTriangle size={11} className="text-red-500" strokeWidth={2} /> Cancel this order?
                  </p>
                  <button onClick={() => { onCancelAdvanceOrder(order.id); setConfirmCancel(false) }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors">
                    Yes
                  </button>
                  <button onClick={() => setConfirmCancel(false)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium ${light ? 'bg-gray-100 text-gray-600' : 'bg-slate-700 text-slate-300'} transition-colors`}>
                    No
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Regular order row (unchanged from original) ───────────────────────────────
function CartThumb({ item, light, sub }: { item: CartItem; light?: boolean; sub: string }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div className="flex items-center gap-3 py-2">
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

function OrderRow({ order, light, onRequestCancelOrder }: {
  order: Order; light?: boolean; onRequestCancelOrder: (id: string) => void
}) {
  const [expanded,   setExpanded]   = useState(false)
  const [imgErrors,  setImgErrors]  = useState<Set<number>>(new Set())
  const sub   = light ? 'text-gray-400' : 'text-slate-400'
  const title = light ? 'text-gray-900' : 'text-white'
  const sepB  = light ? 'border-gray-100' : 'border-white/5'
  const date  = new Date(order.placedAt)

  const statusStyles = order.status === 'cancelled'
    ? 'bg-red-500/10 text-red-400 border-red-500/15'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'

  return (
    <div className={`border-b ${sepB} last:border-0`}>
      <button onClick={() => setExpanded(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${light ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20'}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${light ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
          <ShoppingBag size={15} className="text-amber-500" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${title}`}>#{order.id.slice(-6).toUpperCase()}</p>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <p className={`text-[10px] ${sub}`}>
              {date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
              {' · '}{date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
            </p>
            {order.method && (
              <span className={`flex items-center gap-0.5 text-[10px] ${sub}`}>
                {METHOD_ICON[order.method] ?? null}
                <span className="capitalize">
                  {order.method === 'later' && order.payLaterTerm ? `later · ${order.payLaterTerm}m` : order.method}
                </span>
              </span>
            )}
            {order.fulfillment && (
              <span className={`flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-md ${light ? 'bg-gray-100 text-gray-500' : 'bg-slate-700 text-slate-400'}`}>
                {order.fulfillment === 'pickup' ? <Store size={9} strokeWidth={2} /> : <Truck size={9} strokeWidth={2} />}
                <span className="ml-0.5 capitalize">{order.fulfillment}</span>
              </span>
            )}
            <span className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${statusStyles}`}>
              {order.status === 'cancelled' ? 'Cancelled' : 'Completed'}
            </span>
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
                    : <img src={item.image} alt={item.name}
                        onError={() => setImgErrors(s => new Set([...s, item.id]))}
                        className="w-full h-full object-cover" />}
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
          {order.status !== 'cancelled' && (
            <div className="mt-3">
              <button onClick={() => onRequestCancelOrder(order.id)}
                className="w-full rounded-2xl bg-red-500/10 text-red-500 border border-red-500/15 py-2 text-sm font-semibold hover:bg-red-500/15 transition-colors">
                Cancel order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ActivityScreen({
  cart, orders, advanceOrders, light,
  onClose, onOpenCart, onCancelOrder,
  onPayDeposit, onCancelAdvanceOrder, onNewAdvanceOrder,
}: Props) {
  const [tab,           setTab]           = useState<'history' | 'pending' | 'reservations'>('history')
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)

  const bg      = light ? 'bg-white'        : 'bg-[#0d1424]'
  const overlay = light ? 'bg-black/20'     : 'bg-black/60'
  const hdr     = light ? 'border-gray-100' : 'border-white/5'
  const title   = light ? 'text-gray-900'   : 'text-white'
  const sub     = light ? 'text-gray-400'   : 'text-slate-400'
  const card    = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'

  const activeTab = (active: boolean) =>
    active
      ? 'text-amber-500 border-b-2 border-amber-500 font-semibold'
      : `${sub} border-b-2 border-transparent hover:text-amber-400`

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartQty   = cart.reduce((s, i) => s + i.qty, 0)

  const activeReservations = advanceOrders.filter(o => o.status === 'pending' || o.status === 'confirmed')
  const pendingDeposits    = advanceOrders.filter(o => o.status === 'pending' && !o.depositPaid).length

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={onClose} />
      <div
        role="dialog" aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`animate-slide-right relative ${bg} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
          <div>
            <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Activity</h2>
            <p className={`${sub} text-xs`}>Orders, reservations & cart</p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs — now 3 tabs */}
        <div className={`flex border-b ${hdr} shrink-0`}>
          <button onClick={() => setTab('history')}
            className={`flex-1 text-xs py-3 transition-colors ${activeTab(tab === 'history')}`}>
            History
          </button>
          <button onClick={() => setTab('reservations')}
            className={`flex-1 text-xs py-3 transition-colors relative ${activeTab(tab === 'reservations')}`}>
            Reservations
            {pendingDeposits > 0 && (
              <span className="absolute top-2 right-3 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {pendingDeposits > 9 ? '9+' : pendingDeposits}
              </span>
            )}
          </button>
          <button onClick={() => setTab('pending')}
            className={`flex-1 text-xs py-3 transition-colors ${activeTab(tab === 'pending')}`}>
            {`Pending${cartQty > 0 ? ` (${cartQty})` : ''}`}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── History tab ── */}
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
                  <OrderRow key={order.id} order={order} light={light} onRequestCancelOrder={setCancelOrderId} />
                ))}
              </div>
            )
          )}

          {/* ── Reservations tab ── */}
          {tab === 'reservations' && (
            <div className="px-4 py-4 space-y-3">
              {/* New advance order button */}
              <button
                onClick={() => { onClose(); onNewAdvanceOrder() }}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border-2 border-dashed transition-colors ${
                  light
                    ? 'border-purple-200 text-purple-600 hover:bg-purple-50'
                    : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/5'
                }`}>
                <Calendar size={15} strokeWidth={2} />
                New Advance Order
              </button>

              {/* Stats row */}
              {advanceOrders.length > 0 && (
                <div className={`grid grid-cols-3 gap-2`}>
                  {[
                    { label: 'Active',    value: activeReservations.length,                                            color: 'text-purple-500' },
                    { label: 'Unpaid',    value: pendingDeposits,                                                      color: 'text-red-500'    },
                    { label: 'Confirmed', value: advanceOrders.filter(o => o.status === 'confirmed').length,            color: 'text-green-500'  },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-2.5 text-center border ${light ? 'bg-white border-gray-200' : 'bg-slate-800/60 border-white/5'}`}>
                      <p className={`text-lg font-bold ${s.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                      <p className={`text-[10px] ${sub}`}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Active reservations */}
              {activeReservations.length > 0 && (
                <>
                  <p className={`text-[10px] font-semibold ${sub} uppercase tracking-wider`}>Active</p>
                  {activeReservations
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(order => (
                      <AdvanceOrderCard key={order.id} order={order} light={light}
                        onPayDeposit={onPayDeposit} onCancelAdvanceOrder={onCancelAdvanceOrder} />
                    ))
                  }
                </>
              )}

              {/* Past reservations */}
              {advanceOrders.filter(o => o.status === 'cancelled' || o.status === 'completed').length > 0 && (
                <>
                  <p className={`text-[10px] font-semibold ${sub} uppercase tracking-wider pt-1`}>Past</p>
                  {advanceOrders
                    .filter(o => o.status === 'cancelled' || o.status === 'completed')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(order => (
                      <AdvanceOrderCard key={order.id} order={order} light={light}
                        onPayDeposit={onPayDeposit} onCancelAdvanceOrder={onCancelAdvanceOrder} />
                    ))
                  }
                </>
              )}

              {advanceOrders.length === 0 && (
                <div className="flex flex-col items-center py-12 gap-3 text-center">
                  <Calendar size={40} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
                  <p className={`font-semibold ${sub} text-sm`}>No reservations yet</p>
                  <p className={`${sub} text-xs`}>Advance orders let you reserve items and pay 50% deposit to secure them</p>
                </div>
              )}
            </div>
          )}

          {/* ── Pending (cart) tab ── */}
          {tab === 'pending' && (
            cart.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3 px-5">
                <Package size={40} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
                <p className={`font-semibold ${sub} text-sm`}>No pending orders</p>
                <p className={`${sub} text-xs text-center`}>Add items to your cart to create a pending order</p>
              </div>
            ) : (
              <div className="px-4 py-4 space-y-3">
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

        {/* Cancel confirmation overlay */}
        {cancelOrderId && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setCancelOrderId(null)} />
            <div className={`relative w-full max-w-sm rounded-[28px] border px-5 py-5 shadow-2xl ${light ? 'bg-white border-gray-200' : 'bg-slate-950/95 border-white/10'}`}>
              <p className={`text-base font-semibold ${light ? 'text-gray-900' : 'text-white'}`}>Cancel order?</p>
              <p className={`mt-2 text-sm leading-6 ${light ? 'text-gray-500' : 'text-slate-400'}`}>
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setCancelOrderId(null)}
                  className={`flex-1 rounded-2xl border ${light ? 'border-slate-200/75 text-slate-700 hover:bg-slate-100' : 'border-slate-700/75 text-slate-200 hover:bg-slate-800'} bg-transparent py-3 text-sm font-semibold transition-colors`}>
                  Keep order
                </button>
                <button onClick={() => { if (cancelOrderId) { onCancelOrder(cancelOrderId); setCancelOrderId(null) } }}
                  className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-colors">
                  Yes, cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
