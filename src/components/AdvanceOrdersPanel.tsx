import { useState, useEffect } from 'react'
import {
  X, Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  ShoppingBag, Wallet, ChevronRight, ImageOff, Check,
  Package, Ban, Timer
} from 'lucide-react'
import type { AdvanceOrder } from './AdvanceOrderModal'

interface Props {
  orders: AdvanceOrder[]
  light?: boolean
  onClose: () => void
  onPayDeposit: (id: string) => void
  onCancelOrder: (id: string) => void
}

function CountdownTimer({ dueDate, light }: { dueDate: string; light?: boolean }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const calc = () => {
      const now  = Date.now()
      const due  = new Date(dueDate).getTime()
      const diff = due - now

      if (diff <= 0) {
        setTimeLeft('Overdue')
        setExpired(true)
        setUrgent(false)
        return
      }

      setExpired(false)
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (diff < 24 * 60 * 60 * 1000) {
        setUrgent(true)
        setTimeLeft(`${hours}h ${mins}m`)
      } else {
        setUrgent(false)
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        setTimeLeft(`${days}d ${hours % 24}h`)
      }
    }
    calc()
    const interval = setInterval(calc, 60_000)
    return () => clearInterval(interval)
  }, [dueDate])

  if (expired) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg">
        <Timer size={10} strokeWidth={2.5} /> Overdue
      </span>
    )
  }

  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${
      urgent
        ? 'text-orange-500 bg-orange-500/10 animate-pulse'
        : light ? 'text-gray-500 bg-gray-100' : 'text-slate-400 bg-slate-700'
    }`}>
      <Clock size={10} strokeWidth={2.5} /> {timeLeft}
    </span>
  )
}

function OrderCard({ order, light, onPayDeposit, onCancelOrder }: {
  order: AdvanceOrder; light?: boolean;
  onPayDeposit: (id: string) => void;
  onCancelOrder: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false)
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set())
  const [confirmCancel, setConfirmCancel] = useState(false)

  const title  = light ? 'text-gray-900' : 'text-white'
  const sub    = light ? 'text-gray-400' : 'text-slate-400'
  const sepB   = light ? 'border-gray-100' : 'border-white/5'
  const rowBg  = light ? 'bg-gray-50'     : 'bg-slate-900/30'

  const dueDateDisplay = new Date(order.dueDate).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
  const createdDisplay = new Date(order.createdAt).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric'
  })

  const STATUS_CONFIG = {
    pending:   { label: 'Awaiting Deposit', color: 'text-amber-500',  bg: light ? 'bg-amber-50'  : 'bg-amber-500/10',  icon: Clock        },
    confirmed: { label: 'Confirmed',         color: 'text-green-500',  bg: light ? 'bg-green-50'  : 'bg-green-500/10',  icon: CheckCircle  },
    cancelled: { label: 'Cancelled',         color: 'text-red-500',    bg: light ? 'bg-red-50'    : 'bg-red-500/10',    icon: XCircle      },
    completed: { label: 'Completed',         color: 'text-blue-500',   bg: light ? 'bg-blue-50'   : 'bg-blue-500/10',   icon: CheckCircle  },
  }
  const sc = STATUS_CONFIG[order.status]
  const StatusIcon = sc.icon
  const isOverdue = !order.depositPaid && new Date(order.dueDate) < new Date()
  const canPayDeposit = order.status === 'pending' && !order.depositPaid
  const canCancel = order.status === 'pending' || order.status === 'confirmed'

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      order.status === 'cancelled' ? light ? 'border-red-100 opacity-70' : 'border-red-500/10 opacity-70' :
      order.status === 'confirmed' ? light ? 'border-green-200' : 'border-green-500/20' :
      isOverdue ? light ? 'border-red-200' : 'border-red-500/20' :
      light ? 'border-gray-200' : 'border-white/5'
    }`}>
      {/* Card header */}
      <button onClick={() => setExpanded(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${light ? 'bg-white hover:bg-gray-50' : 'bg-slate-800/60 hover:bg-slate-700/40'}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sc.bg}`}>
          <StatusIcon size={16} className={sc.color} strokeWidth={2} />
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
            Created {createdDisplay} · {order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₱{order.total.toLocaleString('en-PH')}
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

      {/* Expanded content */}
      {expanded && (
        <div className={`border-t ${sepB}`}>

          {/* Due date banner */}
          {order.status === 'pending' && !order.depositPaid && (
            <div className={`px-4 py-2.5 flex items-center gap-2 text-xs ${
              isOverdue
                ? light ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-400'
                : light ? 'bg-amber-50 text-amber-700' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {isOverdue
                ? <><XCircle size={12} strokeWidth={2} /> Deposit overdue — order will be cancelled</>
                : <><Clock size={12} strokeWidth={2} /> Pay deposit by <strong>{dueDateDisplay}</strong> to confirm this order</>
              }
            </div>
          )}

          {/* Items list */}
          <div className={`px-4 py-3 ${rowBg}`}>
            <p className={`text-[10px] font-semibold ${sub} uppercase tracking-wider mb-2`}>Items</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const imgErr = imgErrors.has(item.id)
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 ${light ? 'bg-gray-200' : 'bg-slate-700'}`}>
                      {imgErr || !item.image
                        ? <div className="w-full h-full flex items-center justify-center"><ImageOff size={12} className={sub} strokeWidth={1.5} /></div>
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
                Deposit (50%) {order.depositPaid ? '✓ Paid' : ''}
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
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-purple-500 hover:bg-purple-400 text-white transition-colors shadow-md shadow-purple-500/20">
                  <Wallet size={13} strokeWidth={2.5} /> Pay Deposit ₱{order.deposit.toLocaleString('en-PH')}
                </button>
              )}
              {canCancel && !confirmCancel && (
                <button onClick={() => setConfirmCancel(true)}
                  className={`${canPayDeposit ? '' : 'flex-1'} flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${light ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'}`}>
                  <Ban size={12} strokeWidth={2} /> Cancel
                </button>
              )}
              {confirmCancel && (
                <>
                  <p className={`flex-1 text-xs ${sub} flex items-center gap-1`}><AlertTriangle size={11} className="text-red-500" strokeWidth={2} /> Cancel this order?</p>
                  <button onClick={() => { onCancelOrder(order.id); setConfirmCancel(false) }}
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

export default function AdvanceOrdersPanel({ orders, light, onClose, onPayDeposit, onCancelOrder }: Props) {
  const [tab, setTab] = useState<'active' | 'history'>('active')

  const bg      = light ? 'bg-white'        : 'bg-[#0d1424]'
  const overlay = light ? 'bg-black/20'     : 'bg-black/60'
  const hdr     = light ? 'border-gray-100' : 'border-white/5'
  const title   = light ? 'text-gray-900'   : 'text-white'
  const sub     = light ? 'text-gray-400'   : 'text-slate-400'

  const activeOrders  = orders.filter(o => o.status === 'pending' || o.status === 'confirmed')
  const historyOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'completed')

  const pendingDeposits = orders.filter(o => o.status === 'pending' && !o.depositPaid).length

  const activeTab = (active: boolean) =>
    active ? 'text-purple-500 border-b-2 border-purple-500 font-semibold' : `${sub} border-b-2 border-transparent hover:text-purple-400`

  const displayed = tab === 'active' ? activeOrders : historyOrders

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={onClose} />
      <div
        role="dialog" aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`animate-slide-right relative ${bg} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-purple-50' : 'bg-purple-500/10'}`}>
              <Calendar size={18} className="text-purple-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Advance Orders</h2>
              <p className={`${sub} text-xs`}>{activeOrders.length} active · {historyOrders.length} past</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingDeposits > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingDeposits}
              </span>
            )}
            <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-colors`}>
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {activeOrders.length > 0 && (
          <div className={`grid grid-cols-3 gap-px border-b ${hdr} ${light ? 'bg-gray-100' : 'bg-slate-700'}`}>
            {[
              { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-amber-500' },
              { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: 'text-green-500' },
              { label: 'Unpaid', value: pendingDeposits, color: 'text-red-500' },
            ].map(s => (
              <div key={s.label} className={`flex flex-col items-center py-2.5 ${light ? 'bg-white' : 'bg-[#0d1424]'}`}>
                <p className={`text-base font-bold ${s.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                <p className={`text-[10px] ${sub}`}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className={`flex border-b ${hdr} shrink-0`}>
          <button onClick={() => setTab('active')} className={`flex-1 text-sm py-3 transition-colors ${activeTab(tab === 'active')}`}>
            Active {activeOrders.length > 0 && `(${activeOrders.length})`}
          </button>
          <button onClick={() => setTab('history')} className={`flex-1 text-sm py-3 transition-colors ${activeTab(tab === 'history')}`}>
            History {historyOrders.length > 0 && `(${historyOrders.length})`}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 text-center">
              {tab === 'active'
                ? <Package size={40} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
                : <ShoppingBag size={40} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
              }
              <p className={`font-semibold ${sub} text-sm`}>
                {tab === 'active' ? 'No active advance orders' : 'No order history yet'}
              </p>
              <p className={`${sub} text-xs`}>
                {tab === 'active' ? 'Tap the calendar button to create one' : 'Completed and cancelled orders appear here'}
              </p>
            </div>
          ) : (
            displayed
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(order => (
                <OrderCard key={order.id} order={order} light={light}
                  onPayDeposit={onPayDeposit} onCancelOrder={onCancelOrder} />
              ))
          )}
        </div>
      </div>
    </div>
  )
}
