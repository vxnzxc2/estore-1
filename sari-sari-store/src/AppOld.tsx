import { useState, useEffect } from 'react'
import type { CartItem, Category, Product } from './types'
import { PRODUCTS } from './data'

import Header         from './components/Header'
import PromoMarquee   from './components/PromoMarquee'
import CategoryFilter from './components/CategoryFilter'
import ProductCard    from './components/ProductCard'
import CartSidebar    from './components/CartSidebar'
import Footer         from './components/Footer'

export default function App() {
  const [cart,         setCart]         = useState<CartItem[]>([])
  const [category,     setCategory]     = useState<Category>('All')
  const [search,       setSearch]       = useState('')
  const [cartOpen,     setCartOpen]     = useState(false)
  const [orderPlaced,  setOrderPlaced]  = useState(false)
  const [time,         setTime]         = useState(new Date())

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const incQty = (id: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i))

  const decQty = (id: number) =>
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      if (!item) return prev
      if (item.qty === 1) return prev.filter(i => i.id !== id)
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
    })

  const removeItem = (id: number) =>
    setCart(prev => prev.filter(i => i.id !== id))

  const clearCart = () => setCart([])

  const placeOrder = () => {
    setOrderPlaced(true)
    setCart([])
    setCartOpen(false)
    setTimeout(() => setOrderPlaced(false), 3500)
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)

  const filtered = PRODUCTS.filter(p => {
    const matchCat    = category === 'All' || p.category === category
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50 pb-10">
      {/* ── Order success toast ── */}
      {orderPlaced && (
        <div className="animate-pop fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl text-lg flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          Order placed! Salamat, suki!
          <span className="text-2xl">🎉</span>
        </div>
      )}

      {/* ── Header ── */}
      <Header
        totalQty={totalQty}
        time={time}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* ── Promo ticker ── */}
      <PromoMarquee />

      {/* ── Search ── */}
      <div className="max-w-6xl mx-auto px-4 mt-5">
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md border-2 border-yellow-200 px-4 py-2">
          <span className="text-xl">🔍</span>
          <input
            type="text"
            placeholder="Hanapin ang gusto mo… (e.g. Coke, Chippy, Nescafe)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-gray-700 text-sm font-semibold bg-transparent placeholder:text-gray-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-300 hover:text-red-400 transition-colors font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Category filter ── */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      {/* ── Result count ── */}
      <div className="max-w-6xl mx-auto px-4 mt-4 flex items-center gap-2 flex-wrap">
        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          {filtered.length} produkto
        </span>
        {category !== 'All' && (
          <span className="text-gray-400 text-sm">
            sa <span className="font-bold text-gray-600">{category}</span>
          </span>
        )}
        {search && (
          <span className="text-gray-400 text-sm">
            · hinahanap: <span className="font-bold text-gray-600">"{search}"</span>
          </span>
        )}
      </div>

      {/* ── Product grid ── */}
      <div className="max-w-6xl mx-auto px-4 mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            qty={cart.find(i => i.id === p.id)?.qty ?? 0}
            onAdd={addToCart}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-16 gap-3 text-gray-400">
            <span className="text-6xl">😢</span>
            <p className="font-bold text-lg">Wala pang ganyang produkto!</p>
            <button
              onClick={() => { setSearch(''); setCategory('All') }}
              className="bg-yellow-400 text-gray-800 font-bold px-5 py-2 rounded-full hover:bg-yellow-300 transition-colors"
            >
              Tignan lahat
            </button>
          </div>
        )}
      </div>

      {/* ── Cart sidebar ── */}
      {cartOpen && (
        <CartSidebar
          cart={cart}
          onInc={incQty}
          onDec={decQty}
          onRemove={removeItem}
          onClear={clearCart}
          onClose={() => setCartOpen(false)}
          onPlaceOrder={placeOrder}
        />
      )}

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
