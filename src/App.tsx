import { useState, useEffect, useRef } from 'react'
import { Search, X, PartyPopper } from 'lucide-react'
import type { CartItem, Product, UserProfile, MembershipPlan } from './types'
import { useStore } from './store'
import { useStockSync } from './hooks/useStockSync'
import Header                 from './components/Header'
import CategoryFilter         from './components/CategoryFilter'
import ProductCard            from './components/ProductCard'
import CartSidebar            from './components/CartSidebar'
import Footer                 from './components/Footer'
import BottomNav              from './components/BottomNav'
import SettingsPanel          from './components/SettingsPanel'
import { PLANS, PLAN_ICONS }  from './components/SubscriptionTab'
import SubscriptionPlansPanel from './components/SubscriptionPlansPanel'
import StoreLocator           from './components/StoreLocator'
import ProfilePanel           from './components/ProfilePanel'
import BarcodeScanner         from './components/BarcodeScanner'
import ScanResult             from './components/ScanResult'
import ActivityScreen         from './components/ActivityScreen'
import NotificationsPanel     from './components/NotificationsPanel'
import Calculator             from './components/Calculator'
import LoginPage              from './admin/LoginPage'
import AdminPanel             from './admin/AdminPanel'
import SupportAbout           from './components/SupportAbout'
import TopUpWalletModal       from './components/TopUpWalletModal'
import AdvanceOrderModal      from './components/AdvanceOrderModal'

export default function App() {
  const {
    products, categories, orders, announcements, advanceOrders, preOrders,
    addProduct, updateStock, removeProduct, updateProduct,
    addCategory, removeCategory, placeOrder, cancelOrder,
    placeAdvanceOrder, payAdvanceDeposit, cancelAdvanceOrder,
    placePreOrder, cancelPreOrder,
    addAnnouncement, removeAnnouncement,
  } = useStore()

  const [cart,              setCart]              = useState<CartItem[]>([])
  const [category,          setCategory]          = useState('All')
  const [search,            setSearch]            = useState('')
  const [cartOpen,          setCartOpen]          = useState(false)
  const [orderPlaced,       setOrderPlaced]       = useState(false)
  const [time,              setTime]              = useState(new Date())
  const [adminMode,         setAdminMode]         = useState(false)
  const [loggedIn,          setLoggedIn]          = useState(false)
  const [light,             setLight]             = useState(false)
  const [showScanner,       setShowScanner]       = useState(false)
  const [showProfile,       setShowProfile]       = useState(false)
  const [showSupport,       setShowSupport]       = useState(false)
  const [walletTopUpAmount, setWalletTopUpAmount] = useState<number | null>(null)
  const [showAdvanceOrder,  setShowAdvanceOrder]  = useState(false)
  const [user,              setUser]              = useState<UserProfile>({
    id: 'user-1',
    name: 'Ana Reyes',
    email: 'ana.reyes@example.com',
    phone: '0917 123 4567',
    membership: 'Free',
    walletBalance: 450.25,
    points: 0,
  })
  const [scanResult,        setScanResult]        = useState<{ barcode: string; product: Product | null } | null>(null)
  const [showSettings,      setShowSettings]      = useState(false)
  const [showPlansModal,    setShowPlansModal]    = useState(false)
  const [showLocator,       setShowLocator]       = useState(false)
  const [showActivity,      setShowActivity]      = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCalculator,    setShowCalculator]    = useState(false)
  const [searchFocus,       setSearchFocus]       = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const { pushStockUpdate } = useStockSync(products, (id, stock) => {
    updateStock(id, stock)
  })

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const addToCart = (product: Product, qty: number = 1, isPreOrder: boolean = false) =>
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) {
        const newQty = product.stock === 0 ? ex.qty + qty : Math.min(i.qty + qty, product.stock)
        return prev.map(i => i.id === product.id ? { ...i, qty: newQty, isPreOrder: isPreOrder || i.isPreOrder } : i)
      }
      return [...prev, { ...product, qty, isPreOrder }]
    })

  const setQty = (id: number, qty: number) =>
    setCart(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) {
        return prev.map(i => i.id === id
          ? { ...i, qty: Math.min(Math.max(qty, i.stockUnit === 'kg' ? 0.1 : 1), i.stock) }
          : i
        )
      }
      const product = products.find(p => p.id === id)
      if (!product || qty <= 0) return prev
      return [...prev, { ...product, qty: Math.min(Math.max(qty, product.stockUnit === 'kg' ? 0.1 : 1), product.stock) }]
    })

  const removeItem     = (id: number)    => setCart(prev => prev.filter(i => i.id !== id))
  const removeSelected = (ids: number[]) => setCart(prev => prev.filter(i => !ids.includes(i.id)))
  const clearCart      = ()              => setCart([])

  const buyNow = (product: Product, qty: number) => {
    const newStock = Math.max(0, product.stock - qty)
    updateStock(product.id, newStock)
    pushStockUpdate(product.id, newStock)
    addToCart(product, qty)
    setCartOpen(true)
  }

  const preOrder = (product: Product, qty: number) => {
    addToCart(product, qty, true)
    setCartOpen(true)
  }

  const handlePlaceOrder = (method: string, fulfillment: string, payLaterTerm?: number, dueDays?: number) => {
    const hasPreOrders = cart.some(i => i.isPreOrder)
    const regularItems = cart.filter(i => !i.isPreOrder)

    // Handle pre-orders
    if (hasPreOrders && dueDays) {
      placePreOrder(cart, method, dueDays)
      setOrderPlaced(true)
      setCart([])
      setCartOpen(false)
      setShowActivity(true)
      setTimeout(() => setOrderPlaced(false), 3500)
      return
    }

    // Handle regular orders
    regularItems.forEach(item => {
      const current = products.find(p => p.id === item.id)
      if (current && current.stock > 0) {
        const newStock = Math.max(0, current.stock - item.qty)
        updateStock(item.id, newStock)
        pushStockUpdate(item.id, newStock)
      }
    })

    const orderId     = `ORD-${Date.now()}`
    const cartTotal   = regularItems.reduce((sum, i) => sum + i.price * i.qty, 0)
    const deliveryFee = fulfillment === 'pickup' ? 0 : cartTotal >= 1000 ? 0 : 50

    fetch('http://localhost:3001/api/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId, items: regularItems, total: cartTotal, deliveryFee,
        grandTotal: cartTotal + deliveryFee, placedAt: new Date().toISOString(),
        status: 'completed', method, fulfillment,
      }),
    }).catch(() => {})

    placeOrder(regularItems, method, fulfillment, payLaterTerm)

    const earnedPoints = Math.floor(cartTotal / 100)
    if (earnedPoints > 0) {
      setUser(prev => ({ ...prev, points: prev.points + earnedPoints }))
      addAnnouncement({
        title:   'Points earned',
        message: `You earned ${earnedPoints} point${earnedPoints === 1 ? '' : 's'} from your purchase!`,
      })
    }

    setOrderPlaced(true)
    setCart([])
    setCartOpen(false)
    setShowActivity(true)
    setTimeout(() => setOrderPlaced(false), 3500)
  }

  const handlePlaceAdvanceOrder = (order: Parameters<typeof placeAdvanceOrder>[0]) => {
    placeAdvanceOrder(order)
    setShowAdvanceOrder(false)
    setShowActivity(true)
  }

  const handlePayAdvanceDeposit = (id: string) => {
    const order = advanceOrders.find(o => o.id === id)
    if (order) {
      order.items.forEach(item => {
        const current = products.find(p => p.id === item.id)
        if (current) {
          const newStock = Math.max(0, current.stock - item.qty)
          updateStock(item.id, newStock)
          pushStockUpdate(item.id, newStock)
        }
      })
    }
    payAdvanceDeposit(id)
  }

  const handleCancelAdvanceOrder = (id: string) => cancelAdvanceOrder(id)

  const handleBarcodeDetected = (barcode: string) => {
    setShowScanner(false)
    setScanResult({ barcode, product: products.find(p => p.barcode === barcode) ?? null })
  }

  const handleCancelOrder = (id: string) => cancelOrder(id)

  const handleRedeemPoints = (points: number) => {
    if (points <= 0) return
    setUser(prev => ({ ...prev, walletBalance: prev.walletBalance + points, points: 0 }))
    addAnnouncement({
      title:   'Points redeemed',
      message: `You redeemed ${points} point${points === 1 ? '' : 's'} for ₱${points}.`,
    })
  }

  const handleRequestWalletTopUp = (amount: number) => setWalletTopUpAmount(amount)

  const handleWalletTopUpConfirm = (method: string) => {
    if (!walletTopUpAmount || walletTopUpAmount < 50) return
    setUser(prev => ({ ...prev, walletBalance: prev.walletBalance + walletTopUpAmount }))
    addAnnouncement({
      title:   'Wallet funded',
      message: `₱${walletTopUpAmount} has been added to your wallet via ${method}.`,
    })
    setWalletTopUpAmount(null)
  }

  const handleSubscribePlan = (plan: MembershipPlan) => {
    setShowSettings(false)
    setUser(prev => ({ ...prev, membership: plan }))
    addAnnouncement({
      title:   plan === 'Free' ? 'Plan updated' : 'Membership activated',
      message: plan === 'Free'
        ? 'You are now on the Free plan.'
        : `You are now on the ${plan} plan with premium benefits.`,
    })
  }

  const allCats  = ['All', ...categories]
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)

  const pendingAdvanceDeposits = advanceOrders.filter(
    o => o.status === 'pending' && !o.depositPaid
  ).length
  const activityBadge = totalQty + pendingAdvanceDeposits

  const filtered = products.filter(p => {
    const matchCat =
      category === 'All'          ? true :
      category === '__new'        ? !!p.isNew :
      category === '__promo'      ? !!p.isPromo :
      category === '__bestseller' ? !!p.isBestseller :
      p.category === category
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  useEffect(() => {
    if (search && filtered.length > 0) {
      const el = document.getElementById(`product-${filtered[0].id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [search])

  const adminContent = adminMode ? (
    !loggedIn ? (
      <LoginPage onLogin={() => setLoggedIn(true)} onCancel={() => setAdminMode(false)} light={light} />
    ) : (
      <AdminPanel
        products={products} categories={categories} orders={orders} announcements={announcements}
        onAddProduct={addProduct} onUpdateStock={updateStock}
        onRemoveProduct={removeProduct} onUpdateProduct={updateProduct}
        onAddCategory={addCategory} onRemoveCategory={removeCategory}
        onAddAnnouncement={addAnnouncement} onRemoveAnnouncement={removeAnnouncement}
        onExit={() => { setAdminMode(false); setLoggedIn(false) }}
        light={light}
      />
    )
  ) : null

  const bg     = light ? 'bg-gray-50'      : 'bg-[#080c14]'
  const text   = light ? 'text-gray-900'   : 'text-white'
  const sub    = light ? 'text-gray-500'   : 'text-slate-400'
  const card   = light ? 'bg-white'        : 'bg-slate-800/80'
  const border = light ? 'border-gray-200' : 'border-slate-700/60'

  return (
    <>
      {adminContent}
      {!adminContent && (
        <div className={`min-h-screen ${bg} pb-28 transition-colors duration-300`}>

          {showProfile && (
            <ProfilePanel
              user={user} light={light}
              onClose={() => setShowProfile(false)}
              onRequestTopUp={handleRequestWalletTopUp}
              onRedeemPoints={handleRedeemPoints}
            />
          )}

          {orderPlaced && (
            <div className="animate-fade-up fixed top-4 left-4 right-4 z-50 bg-green-500 text-white font-semibold px-5 py-3.5 rounded-2xl shadow-2xl text-sm flex items-center gap-3 max-w-sm mx-auto">
              <PartyPopper size={18} strokeWidth={2} /> Order placed! Salamat, suki! View it in Activity.
            </div>
          )}

          <Header
            totalQty={totalQty} time={time}
            onCartOpen={() => setCartOpen(true)}
            onProfileOpen={() => setShowProfile(true)}
            user={user} light={light}
          />

          <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-5">

            <div className="mb-4">
              <h2 className={`text-2xl sm:text-3xl font-bold ${text} tracking-tight`} style={{ fontFamily: 'Syne, sans-serif' }}>
                Our Products
              </h2>
              <p className={`${sub} text-xs sm:text-sm mt-0.5`}>FREE delivery on ₱1000+ · Fresh stocks daily</p>
            </div>

            <div className={`flex items-center gap-2.5 ${card} border ${border} rounded-xl px-3.5 py-2.5 mb-4 transition-all ${searchFocus ? 'ring-2 ring-amber-400/50' : ''}`}>
              <Search size={15} className={`${sub} shrink-0`} strokeWidth={2} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search product name or category…"
                value={search}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                onChange={e => setSearch(e.target.value)}
                className={`flex-1 outline-none text-sm bg-transparent ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`}
              />
              {search && (
                <button onClick={() => setSearch('')} className={`${sub} hover:text-red-400 transition-colors`}>
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {search && filtered.length > 0 && searchFocus && (
              <div className={`mb-3 rounded-2xl border ${border} ${card} overflow-hidden shadow-xl`}>
                {filtered.slice(0, 5).map(p => (
                  <button key={p.id}
                    onMouseDown={() => {
                      setSearch(p.name)
                      setTimeout(() => {
                        document.getElementById(`product-${p.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }, 100)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${light ? 'hover:bg-gray-50 border-b border-gray-100 last:border-0' : 'hover:bg-slate-700/40 border-b border-white/5 last:border-0'} transition-colors`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${text} truncate`}>{p.name}</p>
                      <p className={`text-xs ${sub}`}>{p.category} · ₱{p.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mb-4">
              <CategoryFilter active={category} categories={allCats} onChange={setCategory} light={light} />
            </div>

            <div className="mb-4">
              <span className={`${sub} text-xs`}>
                <span className={`${text} font-semibold`}>{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
                {category !== 'All' && <> in <span className="text-amber-500 font-semibold">{{
                  '__new': 'New Items', '__promo': 'Promos', '__bestseller': 'Bestsellers'
                }[category] ?? category}</span></>}
                {search && <> · "<span className="text-amber-500 font-semibold">{search}</span>"</>}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  qty={cart.find(i => i.id === p.id)?.qty ?? 0}
                  onAdd={addToCart}
                  onBuyNow={buyNow}
                  onRemove={removeItem}
                  onQtyChange={setQty}
                  onPreOrder={preOrder}
                  light={light}
                  highlight={!!search && (
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.category.toLowerCase().includes(search.toLowerCase())
                  )}
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

          <BottomNav
            totalQty={activityBadge}
            unreadNotifs={announcements.length}
            light={light}
            onActivity={() => setShowActivity(true)}
            onNotifications={() => setShowNotifications(true)}
            onScan={() => setShowScanner(true)}
            onCalculator={() => setShowCalculator(true)}
            onSettings={() => setShowSettings(true)}
          />

          {showSettings && (
            <SettingsPanel
              light={light} membership={user.membership}
              onToggleLight={() => setLight(l => !l)}
              onOpenAdmin={() => { setShowSettings(false); setAdminMode(true) }}
              onOpenProfile={() => { setShowSettings(false); setShowProfile(true) }}
              onClose={() => setShowSettings(false)}
              onOpenPlansModal={() => { setShowSettings(false); setShowPlansModal(true) }}
              onOpenStoreLocator={() => { setShowSettings(false); setShowLocator(true) }}
              onOpenHistory={() => { setShowSettings(false); setShowActivity(true) }}
              onOpenSupport={() => { setShowSettings(false); setShowSupport(true) }}
            />
          )}

          {showPlansModal && (
            <SubscriptionPlansPanel
              membership={user.membership} light={light}
              onSubscribePlan={plan => { handleSubscribePlan(plan); setShowPlansModal(false) }}
              onClose={() => setShowPlansModal(false)}
            />
          )}

          {walletTopUpAmount !== null && (
            <TopUpWalletModal
              amount={walletTopUpAmount} light={light}
              onConfirm={handleWalletTopUpConfirm}
              onCancel={() => setWalletTopUpAmount(null)}
            />
          )}

          {showLocator && <StoreLocator onClose={() => setShowLocator(false)} light={light} />}
          {showScanner && <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} light={light} />}

          {scanResult && (
            <ScanResult
              product={scanResult.product} barcode={scanResult.barcode}
              onAddToCart={(product, qty) => { addToCart(product, qty); setScanResult(null) }}
              onBuyNow={(product, qty)    => { buyNow(product, qty);    setScanResult(null) }}
              onScanAgain={() => { setScanResult(null); setShowScanner(true) }}
              onClose={() => setScanResult(null)}
              light={light}
            />
          )}

          {showActivity && (
            <ActivityScreen
              cart={cart}
              orders={orders}
              advanceOrders={advanceOrders}
              light={light}
              onClose={() => setShowActivity(false)}
              onOpenCart={() => setCartOpen(true)}
              onCancelOrder={handleCancelOrder}
              onPayDeposit={handlePayAdvanceDeposit}
              onCancelAdvanceOrder={handleCancelAdvanceOrder}
              onNewAdvanceOrder={() => { setShowActivity(false); setShowAdvanceOrder(true) }}
            />
          )}

          {showNotifications && (
            <NotificationsPanel
              announcements={announcements} light={light}
              onClose={() => setShowNotifications(false)}
            />
          )}

          {showSupport && <SupportAbout onClose={() => setShowSupport(false)} light={light} />}

          {showCalculator && <Calculator light={light} onClose={() => setShowCalculator(false)} />}

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

          {showAdvanceOrder && (
            <AdvanceOrderModal
              products={products}
              light={light}
              onConfirm={handlePlaceAdvanceOrder}
              onCancel={() => setShowAdvanceOrder(false)}
            />
          )}

        </div>
      )}
    </>
  )
}
