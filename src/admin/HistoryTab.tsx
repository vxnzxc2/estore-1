import { useState, useMemo } from 'react'
import {
  ShoppingBag, Calendar, TrendingUp, Package,
  ChevronDown, ChevronRight, ImageOff, Clock,
  BarChart2, Layers, CreditCard, Smartphone, Truck, Store
} from 'lucide-react'
import type { Order } from '../types'

interface Props { orders: Order[]; light?: boolean }

type ViewMode = 'month' | 'week'

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getWeekRange(date: Date): string {
  const d   = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6)
  const fmt = (dt: Date) => dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

const METHOD_ICON: Record<string, React.ReactNode> = {
  gcash: <Smartphone size={12} strokeWidth={2} className="text-blue-500" />,
  maya:  <Smartphone size={12} strokeWidth={2} className="text-green-500" />,
  card:  <CreditCard size={12} strokeWidth={2} className="text-purple-500" />,
  later: <Clock      size={12} strokeWidth={2} className="text-orange-500" />,
}

function OrderItemRow({ item, light, sub, title }: { item: any; light?: boolean; sub: string; title: string }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${light ? 'bg-gray-200' : 'bg-slate-700'}`}>
        {imgErr || !item.image
          ? <div className="w-full h-full flex items-center justify-center"><ImageOff size={14} className={sub} strokeWidth={1.5} /></div>
          : <img src={item.image} alt={item.name} onError={() => setImgErr(true)} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${title} truncate`}>{item.name}</p>
        <p className={`text-xs ${sub}`}>₱{item.price} × {item.qty}</p>
      </div>
      <p className="text-amber-500 text-sm font-bold shrink-0">₱{item.price * item.qty}</p>
    </div>
  )
}

export default function HistoryTab({ orders, light }: Props) {
  const [view,          setView]          = useState<ViewMode>('month')
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const bg    = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const bg2   = light ? 'bg-gray-50'   : 'bg-slate-900/40'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-400' : 'text-slate-400'
  const rowH  = light ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20'
  const sep   = light ? 'divide-gray-100'  : 'divide-white/5'
  const sepB  = light ? 'border-gray-100'  : 'border-white/5'
  const togBtn = (active: boolean) => active
    ? 'bg-amber-500 text-white shadow-md'
    : light ? 'bg-white border border-gray-200 text-gray-500 hover:border-amber-400'
            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-amber-500/40'

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; subLabel: string; orders: Order[]; total: number }>()
    orders.forEach(order => {
      const date = new Date(order.placedAt)
      let key: string, label: string, subLabel: string
      if (view === 'month') {
        key      = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`
        label    = date.toLocaleDateString('en-PH', { month:'long', year:'numeric' })
        subLabel = ''
      } else {
        const wk = getWeekNumber(date)
        key      = `${date.getFullYear()}-W${String(wk).padStart(2,'0')}`
        label    = `Week ${wk}`
        subLabel = getWeekRange(date)
      }
      if (!map.has(key)) map.set(key, { label, subLabel, orders:[], total:0 })
      const g = map.get(key)!
      g.orders.push(order)
      g.total += order.grandTotal
    })
    return Array.from(map.entries()).sort(([a],[b]) => b.localeCompare(a)).map(([key,val]) => ({ key, ...val }))
  }, [orders, view])

  const totalRevenue  = orders.reduce((s,o) => s+o.grandTotal, 0)
  const totalOrders   = orders.length
  const totalItems    = orders.reduce((s,o) => s+o.items.reduce((si,i)=>si+i.qty,0), 0)
  const avgOrderValue = totalOrders ? Math.round(totalRevenue/totalOrders) : 0

  if (orders.length === 0) return (
    <div className="space-y-5">
      <div><h1 className={`text-xl font-bold ${title}`} style={{ fontFamily:'Syne,sans-serif' }}>Purchase History</h1><p className={`${sub} text-xs mt-0.5`}>Track all completed orders</p></div>
      <div className={`${bg} rounded-2xl p-16 flex flex-col items-center gap-4 text-center`}>
        <ShoppingBag size={48} strokeWidth={1} className={light?'text-gray-200':'text-slate-700'} />
        <p className={`font-semibold ${title}`}>No orders yet</p>
        <p className={`${sub} text-sm`}>Completed orders will appear here.</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-xl font-bold ${title}`} style={{ fontFamily:'Syne,sans-serif' }}>Purchase History</h1>
          <p className={`${sub} text-xs mt-0.5`}>{totalOrders} order{totalOrders!==1?'s':''} · all time</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/10">
          {(['month','week'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => { setView(v); setExpandedGroup(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${togBtn(view===v)}`}>
              {v==='month' ? <Calendar size={12} strokeWidth={2} /> : <Layers size={12} strokeWidth={2} />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Total Revenue',   value:`₱${totalRevenue.toLocaleString()}`, icon:TrendingUp,  color:'text-green-500',  iconBg:light?'bg-green-50':'bg-green-500/10'  },
          { label:'Total Orders',    value:totalOrders,                          icon:ShoppingBag, color:'text-blue-500',   iconBg:light?'bg-blue-50':'bg-blue-500/10'    },
          { label:'Items Sold',      value:totalItems,                           icon:Package,     color:'text-amber-500',  iconBg:light?'bg-amber-50':'bg-amber-500/10'  },
          { label:'Avg Order Value', value:`₱${avgOrderValue}`,                 icon:BarChart2,   color:'text-purple-500', iconBg:light?'bg-purple-50':'bg-purple-500/10'},
        ].map(({ label, value, icon:Icon, color, iconBg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center mb-2`}><Icon size={16} className={color} strokeWidth={2} /></div>
            <p className={`text-xl font-bold ${title}`} style={{ fontFamily:'Syne,sans-serif' }}>{value}</p>
            <p className={`${sub} text-xs mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Grouped orders */}
      <div className="space-y-3">
        {grouped.map(group => {
          const isExpanded = expandedGroup === group.key
          const groupOrders = group.orders.sort((a,b) => new Date(b.placedAt).getTime()-new Date(a.placedAt).getTime())
          return (
            <div key={group.key} className={`${bg} rounded-2xl overflow-hidden`}>
              <button onClick={() => setExpandedGroup(isExpanded?null:group.key)}
                className={`w-full flex items-center justify-between px-4 py-3.5 ${rowH} transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${light?'bg-amber-50':'bg-amber-500/10'}`}>
                    {view==='month' ? <Calendar size={15} className="text-amber-500" strokeWidth={2} /> : <Layers size={15} className="text-amber-500" strokeWidth={2} />}
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${title} text-sm`}>{group.label}</p>
                    {group.subLabel && <p className={`${sub} text-xs`}>{group.subLabel}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-amber-500 font-bold text-sm">₱{group.total.toLocaleString()}</p>
                    <p className={`${sub} text-xs`}>{group.orders.length} order{group.orders.length!==1?'s':''}</p>
                  </div>
                  {isExpanded ? <ChevronDown size={15} className={sub} strokeWidth={2} /> : <ChevronRight size={15} className={sub} strokeWidth={2} />}
                </div>
              </button>

              {isExpanded && (
                <div className={`border-t ${sepB} divide-y ${sep}`}>
                  {groupOrders.map(order => {
                    const isOrderExpanded = expandedOrder === order.id
                    const orderDate = new Date(order.placedAt)
                    return (
                      <div key={order.id}>
                        <button onClick={() => setExpandedOrder(isOrderExpanded?null:order.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 ${rowH} transition-colors`}>
                          <div className="flex items-center gap-3 text-left">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${light?'bg-gray-100':'bg-slate-700'}`}>
                              <ShoppingBag size={13} className={sub} strokeWidth={2} />
                            </div>
                            <div>
                              <p className={`text-xs font-medium ${title}`}>#{order.id.slice(-6).toUpperCase()}</p>
                              <div className={`flex items-center gap-1.5 ${sub} text-[10px] flex-wrap`}>
                                <Clock size={10} strokeWidth={2} />
                                {orderDate.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}
                                {' · '}{orderDate.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}
                                {order.method && <span className="flex items-center gap-0.5 ml-1">{METHOD_ICON[order.method]} {order.method}</span>}
                                {order.fulfillment && (
                                  <span className={`flex items-center gap-0.5 ${light?'bg-gray-100 text-gray-500':'bg-slate-700 text-slate-400'} px-1.5 py-0.5 rounded-md`}>
                                    {order.fulfillment==='pickup' ? <Store size={9} strokeWidth={2} /> : <Truck size={9} strokeWidth={2} />}
                                    {order.fulfillment}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className={`${title} font-semibold text-xs`}>₱{order.grandTotal}</p>
                              <p className={`${sub} text-[10px]`}>{order.items.reduce((s,i)=>s+i.qty,0)} items</p>
                            </div>
                            <span className="bg-green-500/10 text-green-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md">Done</span>
                            {isOrderExpanded ? <ChevronDown size={13} className={sub} strokeWidth={2} /> : <ChevronRight size={13} className={sub} strokeWidth={2} />}
                          </div>
                        </button>

                        {isOrderExpanded && (
                          <div className={`px-4 pb-4 ${light?'bg-gray-50':'bg-slate-900/30'}`}>
                            <div className="space-y-2 pt-3">
                              {order.items.map((item,idx) => (
                                <OrderItemRow key={idx} item={item} light={light} sub={sub} title={title} />
                              ))}
                            </div>
                            <div className={`mt-3 pt-3 border-t ${sepB} space-y-1`}>
                              <div className="flex justify-between text-xs"><span className={sub}>Subtotal</span><span className={sub}>₱{order.total}</span></div>
                              <div className="flex justify-between text-xs"><span className={sub}>Delivery</span><span className={order.deliveryFee===0?'text-green-500 text-xs font-medium':`${sub} text-xs`}>{order.deliveryFee===0?'FREE':`₱${order.deliveryFee}`}</span></div>
                              <div className="flex justify-between text-sm font-bold pt-1"><span className={title}>Grand Total</span><span className="text-amber-500">₱{order.grandTotal}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
