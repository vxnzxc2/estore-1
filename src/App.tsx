import { useState, useEffect } from 'react'
import { Search, X, PartyPopper, Settings, Sun, Moon, ScanLine } from 'lucide-react'
import type { CartItem, Product } from './types'
import { useStore } from './store'
import Header         from './components/Header'
import CategoryFilter from './components/CategoryFilter'
import ProductCard    from './components/ProductCard'
import CartSidebar    from './components/CartSidebar'
import Footer         from './components/Footer'
import BarcodeScanner from './components/BarcodeScanner'
import ScanResult     from './components/ScanResult'
import LoginPage      from './admin/LoginPage'
import AdminPanel     from './admin/AdminPanel'

export default function App() {
  const {
    products, categories, orders,
    addProduct, removeProduct, updateProduct,
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

  const setQty     = (id: number, qty: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  const removeItem = (id: number)              => setCart(prev => prev.filter(i => i.id !== id))
  const clearCart  = ()                        => setCart([])

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
      <div className={light ? 'light' : ''}>
        <LoginPage onLogin={() => setLoggedIn(true)} onCancel={() => setAdminMode(false)} light={light} />
      </div>
    )
    return (
      <div className={light ? 'light' : ''}>
        <AdminPanel
          products={products} categories={categories} orders={orders}
          onAddProduct={addProduct}
          onRemoveProduct={removeProduct} onUpdateProduct={updateProduct}
          onAddCategory={addCategory} onRemoveCategory={removeCategory}
          onExit={() => { setAdminMode(false); setLoggedIn(false) }}
          light={light}
        />
      </div>
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
  const inp    = light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'

  return (
    <div className={`min-h-screen ${bg} pb-16 transition-colors duration-300`}>

      {orderPlaced && (
        <div className="animate-fade-up fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white font-semibold px-6 py-3 rounded-2xl shadow-2xl text-sm flex items-center gap-3">
          <PartyPopper size={18} strokeWidth={2} /> Order placed! Salamat, suki!
        </div>
      )}

      <Header totalQty={totalQty} time={time} onCartOpen={() => setCartOpen(true)} light={light} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className={`text-3xl font-bold ${text} tracking-tight`} style={{ fontFamily: 'Syne, sans-serif' }}>
              Our Products
            </h2>
            <p className={`${sub} text-sm mt-1`}>Fresh stocks everyday — quality you can trust</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-500/20">
              <ScanLine size={15} strokeWidth={2} /> Scan
            </button>
            <button onClick={() => setLight(l => !l)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${light ? 'bg-white border-gray-200 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400'}`}>
              {light ? <Moon size={16} strokeWidth={2} /> : <Sun size={16} strokeWidth={2} />}
            </button>
            <button onClick={() => setAdminMode(true)}
              className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-medium transition-all ${light ? 'bg-white border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-500/40 hover:text-amber-400'}`}>
              <Settings size={15} strokeWidth={2} /> Admin
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-3 ${card} border ${border} rounded-xl px-4 py-2.5 mb-6`}>
          <Search size={16} className={`${sub} shrink-0`} strokeWidth={2} />
          <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
            className={`flex-1 outline-none text-sm bg-transparent ${inp}`} />
          {search && <button onClick={() => setSearch('')} className={`${sub} hover:text-red-400 transition-colors`}><X size={15} strokeWidth={2.5} /></button>}
        </div>

        {/* Categories */}
        <div className="mb-6">
          <CategoryFilter active={category} categories={allCats} onChange={setCategory} light={light} />
        </div>

        {/* Count */}
        <div className="mb-5">
          <span className={`${sub} text-sm`}>
            Showing <span className={`${text} font-semibold`}>{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
            {category !== 'All' && <> in <span className="text-amber-500 font-semibold">{category}</span></>}
            {search && <> for <span className="text-amber-500 font-semibold">"{search}"</span></>}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} qty={cart.find(i => i.id === p.id)?.qty ?? 0}
              onAdd={addToCart} onRemove={removeItem} light={light} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-24 gap-4">
              <Search size={48} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
              <p className={`font-semibold ${sub} text-lg`}>No products found</p>
              <button onClick={() => { setSearch(''); setCategory('All') }} className="text-amber-500 text-sm font-medium hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </main>

      {showScanner && <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} light={light} />}
      {scanResult && (
        <ScanResult product={scanResult.product} barcode={scanResult.barcode}
          onAddToCart={(product, qty) => { addToCart(product, qty); setScanResult(null) }}
          onScanAgain={() => { setScanResult(null); setShowScanner(true) }}
          onClose={() => setScanResult(null)} light={light} />
      )}
      {cartOpen && (
        <CartSidebar cart={cart} onQtyChange={setQty} onRemove={removeItem}
          onClear={clearCart} onClose={() => setCartOpen(false)} onPlaceOrder={handlePlaceOrder} light={light} />
      )}

      <Footer light={light} />
    </div>
  )
}
