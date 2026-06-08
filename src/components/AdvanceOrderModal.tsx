import { useState, useMemo } from 'react'
import {
  X, ShoppingBag, Calendar, Clock, AlertTriangle,
  Check, Plus, Minus, Search, ChevronRight, ImageOff,
  Wallet, Tag
} from 'lucide-react'
import type { Product } from '../types'

export interface AdvanceOrderItem {
  id: number
  name: string
  price: number
  qty: number
  image: string
  category: string
  stock: number
}

export interface AdvanceOrder {
  id: string
  items: AdvanceOrderItem[]
  total: number
  deposit: number           // 50% of total
  depositPaid: boolean
  depositPaidAt?: string
  dueDate: string           // ISO string — must pay deposit by this date
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  note?: string
}

interface Props {
  products: Product[]
  light?: boolean
  onConfirm: (order: Omit<AdvanceOrder, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

const MIN_DUE_DAYS = 1
const MAX_DUE_DAYS = 30

export default function AdvanceOrderModal({ products, light, onConfirm, onCancel }: Props) {
  const [step, setStep] = useState<'items' | 'summary'>('items')
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map())
  const [search, setSearch] = useState('')
  const [dueDays, setDueDays] = useState(3)
  const [note, setNote] = useState('')
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set())

  const bg    = light ? 'bg-white border-gray-200 shadow-2xl'  : 'bg-slate-800 border-white/10 shadow-2xl'
  const title = light ? 'text-gray-900'  : 'text-white'
  const sub   = light ? 'text-gray-400'  : 'text-slate-400'
  const sep   = light ? 'border-gray-100': 'border-white/10'
  const inp   = light ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-amber-400' : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500/60'
  const rowBg = light ? 'bg-gray-50'     : 'bg-slate-900/50'
  const cardBg = light ? 'bg-white border-gray-200 shadow-sm' : 'bg-slate-700/40 border-white/5'

  const availableProducts = products.filter(p => p.stock > 0)
  const filtered = availableProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const setQty = (id: number, qty: number) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const clamped = Math.min(Math.max(0, qty), product.stock)
    setSelectedItems(prev => {
      const next = new Map(prev)
      if (clamped === 0) next.delete(id)
      else next.set(id, clamped)
      return next
    })
  }

  const orderItems: AdvanceOrderItem[] = useMemo(() => {
    return Array.from(selectedItems.entries()).map(([id, qty]) => {
      const p = products.find(pr => pr.id === id)!
      return { id: p.id, name: p.name, price: p.price, qty, image: p.image, category: p.category, stock: p.stock }
    })
  }, [selectedItems, products])

  const total   = orderItems.reduce((s, i) => s + i.price * i.qty, 0)
  const deposit = Math.ceil(total * 0.5)

  const dueDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + dueDays)
    d.setHours(23, 59, 59, 0)
    return d.toISOString()
  }, [dueDays])

  const dueDateDisplay = new Date(dueDate).toLocaleDateString('en-PH', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  })

  const handleConfirm = () => {
    if (orderItems.length === 0) return
    onConfirm({
      items: orderItems,
      total,
      deposit,
      depositPaid: false,
      dueDate,
      status: 'pending',
      note: note.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`${bg} border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden animate-slide-up sm:animate-fade-up max-h-[92vh] flex flex-col`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-purple-50' : 'bg-purple-500/10'}`}>
              <Calendar size={18} className="text-purple-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
                Advance Order
              </h2>
              <p className={`text-xs ${sub}`}>Reserve items · Pay 50% deposit</p>
            </div>
          </div>
          <button onClick={onCancel} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Step indicator */}
        <div className={`flex items-center px-5 py-2.5 border-b ${sep} shrink-0 gap-3`}>
          {['Select Items', 'Review & Confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${light ? 'bg-gray-200' : 'bg-slate-700'}`} />}
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  (i === 0 && step === 'items') || (i === 1 && step === 'summary')
                    ? 'bg-purple-500 text-white'
                    : (i === 0 && step === 'summary')
                      ? 'bg-green-500 text-white'
                      : light ? 'bg-gray-200 text-gray-500' : 'bg-slate-700 text-slate-500'
                }`}>
                  {i === 0 && step === 'summary' ? <Check size={10} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${
                  (i === 0 && step === 'items') || (i === 1 && step === 'summary')
                    ? 'text-purple-500'
                    : sub
                }`}>{s}</span>
              </div>
            </div>
          ))}
          {orderItems.length > 0 && (
            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-lg ${light ? 'bg-purple-50 text-purple-600' : 'bg-purple-500/10 text-purple-400'}`}>
              {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {step === 'items' ? (
            <>
              {/* Info banner */}
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs ${light ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                <AlertTriangle size={13} className="shrink-0 mt-0.5" strokeWidth={2} />
                <p>Select the products you want to reserve. You'll pay <strong>50% deposit</strong> to secure your order. Remaining balance on pickup/delivery.</p>
              </div>

              {/* Search */}
              <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-colors ${inp}`}>
                <Search size={14} className={sub} strokeWidth={2} />
                <input type="text" placeholder="Search products…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`flex-1 text-sm bg-transparent outline-none ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`} />
                {search && <button onClick={() => setSearch('')}><X size={13} className={sub} /></button>}
              </div>

              {/* Product list */}
              <div className="space-y-2">
                {filtered.length === 0 && (
                  <p className={`text-center text-sm ${sub} py-8`}>No products found</p>
                )}
                {filtered.map(p => {
                  const qty = selectedItems.get(p.id) ?? 0
                  const imgErr = imgErrors.has(p.id)
                  return (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      qty > 0
                        ? light ? 'border-purple-300 bg-purple-50' : 'border-purple-500/30 bg-purple-500/5'
                        : light ? `border-gray-200 ${cardBg}` : `border-white/5 ${cardBg}`
                    }`}>
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {imgErr ? (
                          <div className="w-full h-full flex items-center justify-center"><ImageOff size={14} className={sub} strokeWidth={1.5} /></div>
                        ) : (
                          <img src={p.image} alt={p.name}
                            onError={() => setImgErrors(s => new Set([...s, p.id]))}
                            className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${title} truncate`}>{p.name}</p>
                        <p className={`text-xs ${sub}`}>{p.category}</p>
                        <p className="text-xs font-bold text-amber-500">₱{p.price} · {p.stock} in stock</p>
                      </div>
                      <div className={`flex items-center gap-1 rounded-xl overflow-hidden border ${light ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'}`}>
                        <button onClick={() => setQty(p.id, qty - 1)} disabled={qty === 0}
                          className={`w-8 h-8 flex items-center justify-center transition-colors text-sm disabled:opacity-30 ${light ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-slate-700 text-slate-300'}`}>−</button>
                        <span className={`w-7 text-center text-sm font-bold tabular-nums ${qty > 0 ? 'text-purple-500' : sub}`}>{qty}</span>
                        <button onClick={() => setQty(p.id, qty + 1)} disabled={qty >= p.stock}
                          className={`w-8 h-8 flex items-center justify-center transition-colors text-sm disabled:opacity-30 ${light ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-slate-700 text-slate-300'}`}>+</button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Due date picker */}
              {orderItems.length > 0 && (
                <div className={`p-4 rounded-2xl border ${light ? 'border-gray-200 bg-gray-50' : 'border-white/5 bg-slate-900/40'} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-purple-500" strokeWidth={2} />
                    <p className={`text-sm font-semibold ${title}`}>Deposit Due Date</p>
                  </div>
                  <p className={`text-xs ${sub}`}>You must pay the deposit within this many days, or the order will be automatically cancelled.</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDueDays(d => Math.max(MIN_DUE_DAYS, d - 1))}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${light ? 'border-gray-200 bg-white hover:bg-gray-100 text-gray-600' : 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <div className="flex-1 text-center">
                      <p className={`text-2xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>{dueDays}</p>
                      <p className={`text-xs ${sub}`}>day{dueDays !== 1 ? 's' : ''} · due {dueDateDisplay}</p>
                    </div>
                    <button onClick={() => setDueDays(d => Math.min(MAX_DUE_DAYS, d + 1))}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${light ? 'border-gray-200 bg-white hover:bg-gray-100 text-gray-600' : 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {[1, 3, 7, 14].map(d => (
                      <button key={d} onClick={() => setDueDays(d)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${dueDays === d ? 'bg-purple-500 text-white' : light ? 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300' : 'bg-slate-800 border border-slate-600 text-slate-400 hover:border-purple-500/40'}`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              {orderItems.length > 0 && (
                <div>
                  <label className={`text-xs font-medium ${sub} mb-1.5 block`}>Note (optional)</label>
                  <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Special instructions, delivery preference…"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-colors ${inp}`} />
                </div>
              )}
            </>
          ) : (
            <>
              {/* Summary step */}
              <div className={`p-4 rounded-2xl border ${light ? 'border-purple-200 bg-purple-50' : 'border-purple-500/20 bg-purple-500/5'} space-y-3`}>
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-purple-500" strokeWidth={2} />
                  <p className={`text-sm font-semibold ${title}`}>Order Summary</p>
                </div>
                <div className="space-y-1.5">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className={sub}>{item.name} × {item.qty}</span>
                      <span className={`font-semibold ${title}`}>₱{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment breakdown */}
              <div className={`rounded-2xl border overflow-hidden ${light ? 'border-gray-200' : 'border-white/10'}`}>
                <div className={`px-4 py-3 space-y-2 ${rowBg}`}>
                  <div className="flex justify-between text-sm">
                    <span className={sub}>Order total</span>
                    <span className={`font-semibold ${title}`}>₱{total.toLocaleString('en-PH')}</span>
                  </div>
                  <div className={`border-t ${sep} pt-2`}>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold text-purple-500">Deposit (50%)</p>
                        <p className={`text-xs ${sub}`}>Pay this now to secure order</p>
                      </div>
                      <p className="text-xl font-bold text-purple-500" style={{ fontFamily: 'Syne, sans-serif' }}>
                        ₱{deposit.toLocaleString('en-PH')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={sub}>Balance on delivery</span>
                    <span className={`font-semibold ${title}`}>₱{(total - deposit).toLocaleString('en-PH')}</span>
                  </div>
                </div>
                <div className={`px-4 py-3 border-t ${sep}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={13} className="text-red-500" strokeWidth={2} />
                    <p className="text-xs font-semibold text-red-500">Deposit due by: {dueDateDisplay}</p>
                  </div>
                  <p className={`text-xs ${sub}`}>If deposit is not paid by this date, the order will be automatically cancelled.</p>
                </div>
              </div>

              {/* Due date reminder */}
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs ${light ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                <AlertTriangle size={13} className="shrink-0 mt-0.5" strokeWidth={2} />
                <p>Make sure to pay <strong>₱{deposit.toLocaleString('en-PH')}</strong> within <strong>{dueDays} day{dueDays !== 1 ? 's' : ''}</strong>. After <strong>{dueDateDisplay}</strong>, this order will be cancelled if unpaid.</p>
              </div>

              {note && (
                <div className={`px-4 py-3 rounded-xl border ${light ? 'bg-gray-50 border-gray-200' : 'bg-slate-900/40 border-white/5'}`}>
                  <p className={`text-xs ${sub} mb-1`}>Note</p>
                  <p className={`text-sm ${title}`}>{note}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-4 border-t ${sep} shrink-0 flex gap-2`}>
          {step === 'items' ? (
            <>
              <button onClick={onCancel}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${light ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                Cancel
              </button>
              <button onClick={() => setStep('summary')} disabled={orderItems.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-purple-500 hover:bg-purple-400 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-500/20">
                Review Order <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep('items')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${light ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                Back
              </button>
              <button onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-purple-500 hover:bg-purple-400 text-white transition-colors shadow-lg shadow-purple-500/20">
                <Check size={15} strokeWidth={3} /> Place Advance Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
