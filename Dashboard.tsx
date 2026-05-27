import { Package, Tag, TrendingDown, CheckCircle, AlertTriangle, XCircle, ShoppingBag, TrendingUp } from 'lucide-react'
import type { Product, Order } from '../types'

interface Props {
  products: Product[]
  categories: string[]
  orders: Order[]
  light?: boolean
  onNavigate?: (tab: string, filter?: string) => void
}

export default function Dashboard({ products, categories, orders, light, onNavigate }: Props) {
  const inStock    = products.filter(p => p.stock > 5)
  const lowStock   = products.filter(p => p.stock > 0 && p.stock <= 5)
  const outOfStock = products.filter(p => p.stock === 0)
  const revenue    = orders.reduce((s, o) => s + o.grandTotal, 0)

  const card  = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-400' : 'text-slate-400'
  const track = light ? 'bg-gray-200'   : 'bg-slate-700'
  const sep   = light ? 'border-gray-100' : 'border-white/5'

  const stats = [
    { label: 'Total Products', value: products.length,              icon: Package,     bg: light?'bg-amber-50':'bg-amber-500/10',  color:'text-amber-500',  onClick: ()=>onNavigate?.('products'),       hint:'View all →' },
    { label: 'Categories',     value: categories.length,            icon: Tag,         bg: light?'bg-purple-50':'bg-purple-500/10',color:'text-purple-500', onClick: ()=>onNavigate?.('categories'),     hint:'Manage →'   },
    { label: 'Low Stock',      value: lowStock.length,              icon: TrendingDown,bg: light?'bg-orange-50':'bg-orange-500/10',color:'text-orange-500', onClick: ()=>onNavigate?.('products','low'), hint:'View low →'  },
    { label: 'Out of Stock',   value: outOfStock.length,            icon: XCircle,     bg: light?'bg-red-50':'bg-red-500/10',      color:'text-red-500',    onClick: ()=>onNavigate?.('products','out'), hint:'Fix now →'   },
    { label: 'Total Revenue',  value:`₱${revenue.toLocaleString()}`,icon: TrendingUp,  bg: light?'bg-green-50':'bg-green-500/10',  color:'text-green-500',  onClick: ()=>onNavigate?.('history'),        hint:'View orders→'},
    { label: 'Total Orders',   value: orders.length,                icon: ShoppingBag, bg: light?'bg-blue-50':'bg-blue-500/10',    color:'text-blue-500',   onClick: ()=>onNavigate?.('history'),        hint:'View all →' },
  ]

  const needsAttention = [...outOfStock, ...lowStock]
  const recentOrders   = [...orders].sort((a,b)=>new Date(b.placedAt).getTime()-new Date(a.placedAt).getTime()).slice(0,5)

  return (
    <div className="space-y-5">
      <div>
        <h1 className={`text-xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h1>
        <p className={`${sub} text-xs mt-0.5`}>Overview of your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, bg, color, onClick, hint }) => (
          <button key={label} onClick={onClick}
            className={`${card} rounded-2xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] group`}>
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
              <Icon size={18} className={color} strokeWidth={2} />
            </div>
            <p className={`text-xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
            <p className={`${sub} text-xs mt-0.5`}>{label}</p>
            <p className={`text-[10px] mt-1.5 ${color} opacity-0 group-hover:opacity-100 transition-opacity font-medium`}>{hint}</p>
          </button>
        ))}
      </div>

      {/* MERGED: Stock Status + Needs Attention */}
      <div className={`${card} rounded-2xl p-4`}>
        <h2 className={`text-sm font-semibold ${title} mb-4 flex items-center gap-2`}>
          <AlertTriangle size={15} className="text-orange-500" strokeWidth={2} /> Stock Overview & Attention
        </h2>

        {/* Status bars */}
        <div className="space-y-2 mb-4">
          {[
            { label:'In Stock',    items:inStock,    icon:CheckCircle,   color:'text-green-500',  dot:'bg-green-500',  onClick:()=>onNavigate?.('products','in') },
            { label:'Low Stock',   items:lowStock,   icon:AlertTriangle, color:'text-orange-500', dot:'bg-orange-500', onClick:()=>onNavigate?.('products','low') },
            { label:'Out of Stock',items:outOfStock, icon:XCircle,       color:'text-red-500',    dot:'bg-red-500',    onClick:()=>onNavigate?.('products','out') },
          ].map(({ label, items, icon: Icon, color, dot, onClick }) => (
            <button key={label} onClick={onClick}
              className={`flex items-center gap-2.5 w-full rounded-xl px-2 py-1.5 ${light ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20'} transition-colors`}>
              <Icon size={14} className={color} strokeWidth={2} />
              <span className={`${sub} text-xs w-24 text-left`}>{label}</span>
              <div className={`flex-1 ${track} rounded-full h-1.5 overflow-hidden`}>
                <div className={`h-full ${dot} rounded-full transition-all`}
                  style={{ width: `${products.length ? (items.length/products.length)*100 : 0}%` }} />
              </div>
              <span className={`${sub} text-xs w-6 text-right`}>{items.length}</span>
            </button>
          ))}
        </div>

        {/* Attention items merged below */}
        {needsAttention.length > 0 && (
          <>
            <div className={`border-t ${sep} pt-3`}>
              <p className={`text-xs font-semibold text-orange-500 mb-2 flex items-center gap-1.5`}>
                <AlertTriangle size={12} strokeWidth={2} /> Needs Immediate Attention ({needsAttention.length})
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {needsAttention.map(p => (
                  <div key={p.id} className={`flex items-center justify-between py-2 border-b ${sep} last:border-0`}>
                    <div>
                      <p className={`${title} text-xs font-medium`}>{p.name}</p>
                      <p className={`${sub} text-[10px]`}>{p.category}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${p.stock === 0 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className={`${card} rounded-2xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-semibold ${title} flex items-center gap-2`}>
              <ShoppingBag size={14} className="text-amber-500" strokeWidth={2} /> Recent Orders
            </h2>
            <button onClick={() => onNavigate?.('history')} className="text-xs text-amber-500 hover:underline font-medium">View all →</button>
          </div>
          <div className="space-y-0">
            {recentOrders.map(order => (
              <div key={order.id} className={`flex items-center justify-between py-2.5 border-b ${sep} last:border-0`}>
                <div>
                  <p className={`${title} text-xs font-medium`}>#{order.id.slice(-6).toUpperCase()}</p>
                  <p className={`${sub} text-[10px]`}>
                    {new Date(order.placedAt).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}
                    {' · '}{order.items.reduce((s,i)=>s+i.qty,0)} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber-500 font-semibold text-sm">₱{order.grandTotal}</p>
                  <span className="bg-green-500/10 text-green-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md">Done</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
