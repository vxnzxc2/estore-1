import { useState, useEffect } from 'react'
import { Search, X, PartyPopper } from 'lucide-react'
import type { CartItem, Product } from './types'
import { useStore } from './store'
import Header         from './components/Header'
import CategoryFilter from './components/CategoryFilter'
import ProductCard    from './components/ProductCard'
import CartSidebar    from './components/CartSidebar'
import Footer         from './components/Footer'
import BottomNav      from './components/BottomNav'
import BarcodeScanner from './components/BarcodeScanner'
import ScanResult     from './components/ScanResult'
import LoginPage      from './admin/LoginPage'
import AdminPanel     from './admin/AdminPanel'

export default function App() {
  const {
    products, categories, orders,
    addProduct, updateStock, removeProduct, updateProduct,
    addCategory, removeCategory, placeOrder,
  } = useStore()

  const [cart,        setCart]        = useState<CartItem[]>([])
  const [category,    setCategory]    = useState('All')
  const [search,      setSearch]      = useState('')
  const [cartOpen,    setCartOpen]    = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [time,        setTime]        = useState(new Date())
  const [adminMode,   setAdminMode]   = useState(false)
  const [loggedIn,    setLoggedIn]    = useState(false)
  const [light,       setLight]       = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [scanResult,  setScanResult]  = useState<{ barcode: string; product: Product | null } | null>(null)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = (product: Product, qty: number = 1) =>
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty }]
    })

  const setQty          = (id: number, qty: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  const removeItem      = (id: number)              => setCart(prev => prev.filter(i => i.id !== id))
  const removeSelected  = (ids: number[])           => setCart(prev => prev.filter(i => !ids.includes(i.id)))
  const clearCart       = ()                        => setCart([])

  // Buy Now — add to cart then open cart
  const buyNow = (product: Product, qty: number) => {
    addToCart(product, qty)
    setCartOpen(true)
  }

  const handlePlaceOrder = () => {
    placeOrder(cart)
    setOrderPlaced(true)
    setCart([])
    setCartOpen(false)
    setTimeout(() => setOrderPlaced(false), 3500)
  }

  const handleBarcodeDetected = (barcode: string) => {
    setShowScanner(false)
    setScanResult({ barcode, product: products.find(p => p.barcode === barcode) ?? null })
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  if (adminMode) {
    if (!loggedIn) return (
      <LoginPage onLogin={() => setLoggedIn(true)} onCancel={() => setAdminMode(false)} light={light} />
    )
    return (
      <AdminPanel
        products={products} categories={categories} orders={orders}
        onAddProduct={addProduct} onUpdateStock={updateStock}
        onRemoveProduct={removeProduct} onUpdateProduct={updateProduct}
        onAddCategory={addCategory} onRemoveCategory={removeCategory}
        onExit={() => { setAdminMode(false); setLoggedIn(false) }}
        light={light}
      />
    )
  }

  // ── Store ─────────────────────────────────────────────────────────────────
  const allCats  = ['All', ...categories]
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)
  const filtered = products.filter(p => {
    const matchCat    = category === 'All' || p.category === category
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const bg     = light ? 'bg-gray-50'      : 'bg-[#080c14]'
  const text   = light ? 'text-gray-900'   : 'text-white'
  const sub    = light ? 'text-gray-500'   : 'text-slate-400'
  const card   = light ? 'bg-white'        : 'bg-slate-800/80'
  const border = light ? 'border-gray-200' : 'border-slate-700/60'

  return (
    <div className={`min-h-screen ${bg} pb-28 transition-colors duration-300`}>

      {/* Toast */}
      {orderPlaced && (
        <div className="animate-fade-up fixed top-4 left-4 right-4 z-50 bg-green-500 text-white font-semibold px-5 py-3.5 rounded-2xl shadow-2xl text-sm flex items-center gap-3 max-w-sm mx-auto">
          <PartyPopper size={18} strokeWidth={2} /> Order placed! Salamat, suki!
        </div>
      )}

      <Header totalQty={totalQty} time={time} onCartOpen={() => setCartOpen(true)} light={light} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-5">

        {/* Page title */}
        <div className="mb-5">
          <h2 className={`text-2xl sm:text-3xl font-bold ${text} tracking-tight`} style={{ fontFamily: 'Syne, sans-serif' }}>
            Our Products
          </h2>
          <p className={`${sub} text-xs sm:text-sm mt-0.5`}>Fresh stocks everyday · FREE delivery on ₱1000+</p>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2.5 ${card} border ${border} rounded-xl px-3.5 py-2.5 mb-4`}>
          <Search size={15} className={`${sub} shrink-0`} strokeWidth={2} />
          <input type="text" placeholder="Search products…" value={search}
            onChange={e => setSearch(e.target.value)}
            className={`flex-1 outline-none text-sm bg-transparent ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`} />
          {search && (
            <button onClick={() => setSearch('')} className={`${sub} hover:text-red-400 transition-colors`}>
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Categories - horizontal scroll */}
        <div className="mb-4">
          <CategoryFilter active={category} categories={allCats} onChange={setCategory} light={light} />
        </div>

        {/* Count */}
        <div className="mb-4">
          <span className={`${sub} text-xs`}>
            <span className={`${text} font-semibold`}>{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
            {category !== 'All' && <> in <span className="text-amber-500 font-semibold">{category}</span></>}
            {search && <> · "<span className="text-amber-500 font-semibold">{search}</span>"</>}
          </span>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              qty={cart.find(i => i.id === p.id)?.qty ?? 0}
              onAdd={addToCart}
              onBuyNow={buyNow}
              onRemove={removeItem}
              light={light}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-20 gap-3">
              <Search size={40} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
              <p className={`font-semibold ${sub}`}>No products found</p>
              <button onClick={() => { setSearch(''); setCategory('All') }} className="text-amber-500 text-sm font-medium hover:underline">
                Clear filters
              </button>
            </div>
          )}
        </div>

        <Footer light={light} />
      </main>

      {/* Bottom Nav */}
      <BottomNav
        totalQty={totalQty}
        light={light}
        onCartOpen={() => setCartOpen(true)}
        onScan={() => setShowScanner(true)}
        onSettings={() => setAdminMode(true)}
        onToggleLight={() => setLight(l => !l)}
      />

      {/* Scanner */}
      {showScanner && (
        <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} light={light} />
      )}

      {/* Scan result */}
      {scanResult && (
        <ScanResult
          product={scanResult.product}
          barcode={scanResult.barcode}
          onAddToCart={(product, qty) => { addToCart(product, qty); setScanResult(null) }}
          onBuyNow={(product, qty) => { buyNow(product, qty); setScanResult(null) }}
          onScanAgain={() => { setScanResult(null); setShowScanner(true) }}
          onClose={() => setScanResult(null)}
          light={light}
        />
      )}

      {/* Cart */}
      {cartOpen && (
        <CartSidebar
          cart={cart}
          onQtyChange={setQty}
          onRemove={removeItem}
          onRemoveSelected={removeSelected}
          onClear={clearCart}
          onClose={() => setCartOpen(false)}
          onPlaceOrder={handlePlaceOrder}
          light={light}
        />
      )}
    </div>
  )
}
