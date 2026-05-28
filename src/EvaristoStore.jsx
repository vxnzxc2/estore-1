import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const INITIAL_CATEGORIES = ["Snacks","Drinks","Canned Goods","Condiments","Personal Care","Sachets","Candy","Vegetables"];

const INITIAL_PRODUCTS = [
  { id:1,  name:"Chippy BBQ",             price:15,  category:"Snacks",        image:"https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80", badge:"Paborito!", stock:20, description:"Classic Filipino corn snack with bold BBQ flavor. Crispy, savory, and perfect for snacking anytime.", barcode:"4800031102015", priceType:"fixed" },
  { id:2,  name:"Nova Country Cheddar",   price:12,  category:"Snacks",        image:"https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&q=80", badge:null,         stock:15, description:"Light and airy corn puffs with real cheddar cheese coating. A crowd favorite snack for all ages.", barcode:"4800888200016", priceType:"fixed" },
  { id:3,  name:"Skyflakes Crackers",     price:10,  category:"Snacks",        image:"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80", badge:null,         stock:25, description:"Thin, crispy crackers with a slightly sweet and savory flavor. Great with spreads or on their own.", barcode:"4800011100023", priceType:"fixed" },
  { id:4,  name:"Piattos Cheese",         price:20,  category:"Snacks",        image:"https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&q=80", badge:"Hot!",       stock:8,  description:"Thin potato crisps with irresistible cheese flavor. Premium snacking experience in every bite.", barcode:"4800888100017", priceType:"fixed" },
  { id:6,  name:"Coke Mismo",             price:18,  category:"Drinks",        image:"https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=80", badge:"Classic!",   stock:30, description:"The iconic Coca-Cola in the perfect single-serve glass bottle. Ice cold refreshment at its finest.", barcode:"5449000054227", priceType:"fixed" },
  { id:8,  name:"C2 Green Tea",           price:22,  category:"Drinks",        image:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80", badge:null,         stock:12, description:"Ready-to-drink green tea with a light, refreshing taste. Naturally antioxidant-rich beverage.", barcode:"4800146003028", priceType:"fixed" },
  { id:9,  name:"Milo Sachet (Hot)",      price:8,   category:"Drinks",        image:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80", badge:null,        stock:50, description:"Nutritious chocolate malt drink sachet. Just add hot water for a comforting energy-boosting drink.", barcode:"4800361048029", priceType:"fixed" },
  { id:11, name:"Century Tuna (185g)",    price:38,  category:"Canned Goods",  image:"https://images.unsplash.com/photo-1614579576272-b2a9e90df5d1?w=300&q=80", badge:"Sulit!",    stock:20, description:"Premium quality tuna packed in oil or water. Versatile protein source for quick and easy meals.", barcode:"4807777000010", priceType:"fixed" },
  { id:12, name:"Spam Lite",              price:95,  category:"Canned Goods",  image:"https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=300&q=80", badge:null,        stock:5,  description:"Lower sodium version of the beloved SPAM. Same great taste with 25% less sodium.", barcode:"37600177611", priceType:"fixed" },
  { id:15, name:"Datu Puti Suka",         price:25,  category:"Condiments",    image:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80", badge:null,        stock:12, description:"Traditional Filipino cane vinegar. Essential condiment for dipping, cooking, and food preservation.", barcode:"4800146001017", priceType:"fixed" },
  { id:17, name:"Knorr Magic Sarap",      price:12,  category:"Condiments",    image:"https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=300&q=80", badge:null,        stock:30, description:"All-purpose seasoning granules that enhance the natural flavor of any dish. The secret to delicious Filipino cooking.", barcode:"4800146002014", priceType:"fixed" },
  { id:18, name:"Lucky Me Pancit Canton", price:13,  category:"Condiments",    image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&q=80", badge:"Trending!", stock:40, description:"Popular instant noodle brand with chewy noodles and savory sauce. Quick and satisfying meal anytime.", barcode:"4800146003014", priceType:"fixed" },
  { id:19, name:"Safeguard Bar Soap",     price:42,  category:"Personal Care", image:"https://images.unsplash.com/photo-1607006483224-01e1d3fb09c1?w=300&q=80", badge:null,        stock:15, description:"Antibacterial soap that provides 10-hour germ protection. Trusted family soap for over 50 years.", barcode:"4902430719131", priceType:"fixed" },
  { id:22, name:"Nescafe 3-in-1",         price:8,   category:"Sachets",       image:"https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=300&q=80", badge:"Bestseller!",stock:60, description:"Convenient all-in-one coffee mix with coffee, creamer, and sugar. Perfect cup of coffee every time.", barcode:"4800361000010", priceType:"fixed" },
  { id:26, name:"White Rabbit Candy",     price:5,   category:"Candy",         image:"https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&q=80", badge:null,         stock:50, description:"Classic milk candy from China with edible rice paper wrapping. Creamy, sweet, and nostalgic treat.", barcode:"6912345678901", priceType:"fixed" },
  { id:28, name:"Flat Tops Choco",        price:5,   category:"Candy",         image:"https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300&q=80", badge:"Nostalgic!", stock:30, description:"Iconic Filipino chocolate candy. Rich milk chocolate in a distinctive flat-topped shape. Childhood favorite.", barcode:"4800031100011", priceType:"fixed" },
  { id:30, name:"Kamatis (Tomatoes)",     price:60,  category:"Vegetables",    image:"https://images.unsplash.com/photo-1546470427-1ec8f5e74e2c?w=300&q=80", badge:null,         stock:100, description:"Fresh, ripe local tomatoes. Perfect for sinigang, pakbet, and other Filipino dishes. Sold per kilogram.", barcode:"", priceType:"per_kilo" },
  { id:31, name:"Sibuyas (Onions)",       price:80,  category:"Vegetables",    image:"https://images.unsplash.com/photo-1508747703725-719777637510?w=300&q=80", badge:null,         stock:100, description:"Fresh red and white onions. Essential ingredient in almost every Filipino dish. Sold per kilogram.", barcode:"", priceType:"per_kilo" },
  { id:32, name:"Bawang (Garlic)",        price:120, category:"Vegetables",    image:"https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=300&q=80", badge:null,         stock:50, description:"Aromatic fresh garlic bulbs. The backbone of Filipino cooking, used in virtually every savory dish. Sold per kilogram.", barcode:"", priceType:"per_kilo" },
];

const PROMO_MESSAGES = [
  "🎉 Mabuhay sa Tindahan ni Evaristo!",
  "🚚 FREE delivery sa ₱1000+ na order!",
  "🔥 Bagong dating: Spam Lite at Gatorade Blue!",
  "⚡ Araw-araw mababang presyo!",
  "👊 Salamat sa inyong patuloy na suporta!",
];

const PRE_MADE_ANNOUNCEMENTS = [
  { id:"a1", title:"Store Holiday Hours", body:"We will be open from 8AM to 6PM on all public holidays. Thank you for understanding!" },
  { id:"a2", title:"Price Update Notice", body:"Due to supplier price changes, some product prices have been updated. Check our latest prices!" },
  { id:"a3", title:"New Arrivals!", body:"Fresh stocks of Spam Lite, Gatorade Blue, and seasonal vegetables are now available!" },
  { id:"a4", title:"Delivery Promo", body:"FREE delivery on orders ₱500 and above this weekend only! Order now!" },
  { id:"a5", title:"Store Maintenance", body:"Store will be closed for cleaning on Sunday 10PM-12MN. Thank you for your patience!" },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
let nextId = 100;
const genId = () => ++nextId;
const formatPrice = (n) => `₱${Number(n).toLocaleString()}`;
const now = () => new Date().toISOString();

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [light, setLight] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("shop");
  const [cartOpen, setCartOpen] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [time, setTime] = useState(new Date());
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollRef = useRef(null);
  const [pendingDetail, setPendingDetail] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleScroll = useCallback((e) => {
    const y = e.target.scrollTop;
    if (y > lastScrollY.current + 10) setNavVisible(false);
    else if (y < lastScrollY.current - 10) setNavVisible(true);
    lastScrollY.current = y;
  }, []);

  // Cart
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i);
      return [...prev, { ...product, qty: Math.min(qty, product.stock) }];
    });
  };
  const setQty = (id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i));
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const placeOrder = (method, fulfillment, address = "") => {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const deliveryFee = fulfillment === "pickup" ? 0 : total >= 1000 ? 0 : 50;
    const grandTotal = total + deliveryFee;
    const order = {
      id: `ORD-${Date.now()}`,
      items: cart.map(i => ({ ...i })),
      total, deliveryFee, grandTotal,
      placedAt: now(),
      status: method === "later" ? "pending" : "completed",
      method, fulfillment, address,
    };
    if (order.status === "pending") {
      setPendingOrders(prev => [order, ...prev]);
      const notif = { id: genId(), type: "order", title: "Order Placed!", body: `Order #${order.id.slice(-6)} is pending. Total: ${formatPrice(grandTotal)}`, at: now(), read: false };
      setNotifications(prev => [notif, ...prev]);
    } else {
      setOrders(prev => [order, ...prev]);
      const notif = { id: genId(), type: "order", title: "Order Confirmed!", body: `Order #${order.id.slice(-6)} placed successfully. Total: ${formatPrice(grandTotal)}`, at: now(), read: false };
      setNotifications(prev => [notif, ...prev]);
    }
    // Deduct stock
    setProducts(prev => prev.map(p => {
      const ci = cart.find(i => i.id === p.id);
      return ci ? { ...p, stock: Math.max(0, p.stock - ci.qty) } : p;
    }));
    setOrderPlaced(true);
    setCart([]);
    setCartOpen(false);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const completePending = (orderId) => {
    const o = pendingOrders.find(x => x.id === orderId);
    if (!o) return;
    setOrders(prev => [{ ...o, status: "completed" }, ...prev]);
    setPendingOrders(prev => prev.filter(x => x.id !== orderId));
  };

  const sendAnnouncement = (ann) => {
    const notif = { id: genId(), type: "announcement", title: ann.title, body: ann.body, at: now(), read: false };
    setNotifications(prev => [notif, ...prev]);
    setAnnouncements(prev => [{ ...ann, sentAt: now() }, ...prev]);
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  const allCats = ["All", ...categories];
  const filtered = products.filter(p => {
    const mc = category === "All" || p.category === category;
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const bg = light ? "bg-gray-50" : "bg-[#080c14]";
  const text = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-500" : "text-slate-400";
  const cardBg = light ? "bg-white" : "bg-slate-800/80";
  const border = light ? "border-gray-200" : "border-slate-700/60";
  const navBg = light ? "bg-white border-gray-200" : "bg-slate-900 border-white/5";

  if (adminMode) {
    if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} onCancel={() => setAdminMode(false)} light={light} />;
    return <AdminPanel products={products} categories={categories} orders={orders} pendingOrders={pendingOrders}
      onAddProduct={(p) => setProducts(prev => [...prev, { ...p, id: genId() }])}
      onUpdateProduct={(id, u) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...u } : p))}
      onRemoveProduct={(id) => setProducts(prev => prev.filter(p => p.id !== id))}
      onAddCategory={(n) => setCategories(prev => prev.includes(n) ? prev : [...prev, n])}
      onRemoveCategory={(n) => { setCategories(prev => prev.filter(c => c !== n)); setProducts(prev => prev.filter(p => p.category !== n)); }}
      onSendAnnouncement={sendAnnouncement}
      onCompletePending={completePending}
      onExit={() => { setAdminMode(false); setLoggedIn(false); }} light={light} />;
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`} style={{ paddingBottom: 80 }}>
      {orderPlaced && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-500 text-white font-semibold px-5 py-3.5 rounded-2xl shadow-2xl text-sm flex items-center gap-3 max-w-sm mx-auto animate-bounce">
          🎉 Order placed! Salamat, suki!
        </div>
      )}

      {/* Header */}
      <header className={`${light ? "bg-white border-b border-gray-200 shadow-sm" : "bg-slate-900/95 border-b border-white/5"} px-4 sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto flex items-center gap-3 h-14">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shrink-0">
              <span className="text-white text-sm">🏪</span>
            </div>
            <div>
              <p className={`${text} font-bold text-sm leading-none`} style={{ fontFamily: "Syne, sans-serif" }}>Evaristo's</p>
              <p className={`${sub} text-[10px] tracking-widest uppercase`}>Sari-Sari Store</p>
            </div>
          </div>
          <span className={`hidden md:block text-xs ${sub}`}>{time.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}</span>
          <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-colors shadow-md">
            🛒 <span>Cart</span>
            {totalQty > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{totalQty > 9 ? "9+" : totalQty}</span>}
          </button>
          <button onClick={() => setNotifications(prev => prev)} className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            onClick={() => setActiveTab("notifications")}>
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
        </div>
      </header>

      {/* Promo Ticker */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-1.5 overflow-hidden flex items-center gap-3">
        <div className="shrink-0 bg-amber-500 px-3 py-0.5 text-slate-900 text-[10px] font-bold tracking-widest uppercase z-10">⚡ PROMO</div>
        <div className="animate-marquee whitespace-nowrap text-amber-400/80 font-medium text-xs">
          {[...PROMO_MESSAGES, ...PROMO_MESSAGES].join("     ·     ")}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4"
        onScroll={handleScroll}
        style={{ overflowY: "auto" }}>

        {activeTab === "shop" && (
          <>
            <div className="mb-3">
              <h2 className={`text-2xl font-bold ${text}`} style={{ fontFamily: "Syne, sans-serif" }}>Our Products</h2>
              <p className={`${sub} text-xs mt-0.5`}>FREE delivery on ₱1000+ · Fresh stocks daily</p>
            </div>
            {/* Search */}
            <div className={`flex items-center gap-2.5 ${cardBg} border ${border} rounded-xl px-3.5 py-2.5 mb-4`}>
              <span className={`${sub} text-sm`}>🔍</span>
              <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
                className={`flex-1 outline-none text-sm bg-transparent ${light ? "text-gray-800 placeholder:text-gray-400" : "text-white placeholder:text-slate-500"}`} />
              {search && <button onClick={() => setSearch("")} className={`${sub} text-xs`}>✕</button>}
            </div>
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
              {allCats.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${category === cat ? "bg-amber-500 text-white shadow-md" : light ? "bg-white text-gray-500 border border-gray-200 hover:border-amber-400" : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-amber-500/40"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <p className={`${sub} text-xs mb-3`}><span className={`${text} font-semibold`}>{filtered.length}</span> products</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} qty={cart.find(i => i.id === p.id)?.qty ?? 0}
                  onAdd={addToCart} onBuyNow={(p2, q) => { addToCart(p2, q); setCartOpen(true); }}
                  onDetail={setDetailProduct} light={light} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full flex flex-col items-center py-20 gap-3">
                  <span className="text-4xl">😢</span>
                  <p className={`font-semibold ${sub}`}>No products found</p>
                  <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-amber-500 text-sm font-medium hover:underline">Clear filters</button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "activity" && (
          <ActivityTab pendingOrders={pendingOrders} orders={orders} onViewPending={(o) => setPendingDetail(o)}
            onComplete={completePending} onCartOpen={() => setCartOpen(true)} light={light} text={text} sub={sub} cardBg={cardBg} border={border} />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab notifications={notifications} onMarkAllRead={markAllRead} light={light} text={text} sub={sub} cardBg={cardBg} border={border} />
        )}

        {activeTab === "settings" && (
          <SettingsTab light={light} onToggleLight={() => setLight(l => !l)} onOpenAdmin={() => { setActiveTab("shop"); setAdminMode(true); }} onViewHistory={() => setHistoryOpen(true)} text={text} sub={sub} cardBg={cardBg} border={border} />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 ${navBg} border-t shadow-2xl transition-transform duration-300`}
        style={{ transform: navVisible ? "translateY(0)" : "translateY(100%)" }}>
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {[
            { id: "shop", icon: "🏪", label: "Shop" },
            { id: "activity", icon: "📋", label: "Activity" },
            { id: "calc", icon: "🧮", label: "Calc" },
            { id: "notifications", icon: "🔔", label: "Notifs", badge: unreadCount },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => tab.id === "calc" ? setShowCalc(true) : setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl relative transition-colors ${activeTab === tab.id && tab.id !== "calc" ? "text-amber-500" : light ? "text-gray-400 hover:text-amber-500" : "text-slate-500 hover:text-amber-400"}`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.badge > 0 && <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{tab.badge > 9 ? "9+" : tab.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Cart Sidebar */}
      {cartOpen && <CartSidebar cart={cart} onQtyChange={setQty} onRemove={removeItem} onClear={clearCart}
        onClose={() => setCartOpen(false)} onPlaceOrder={placeOrder} light={light} products={products} />}

      {/* Product Detail */}
      {detailProduct && <ProductDetailModal product={detailProduct} qty={cart.find(i => i.id === detailProduct.id)?.qty ?? 0}
        onAdd={addToCart} onBuyNow={(p, q) => { addToCart(p, q); setDetailProduct(null); setCartOpen(true); }}
        onClose={() => setDetailProduct(null)} light={light} />}

      {/* Calculator */}
      {showCalc && <CalculatorModal onClose={() => setShowCalc(false)} light={light} />}

      {/* Pending Order Detail */}
      {pendingDetail && <PendingDetailModal order={pendingDetail} onComplete={() => { completePending(pendingDetail.id); setPendingDetail(null); }}
        onClose={() => setPendingDetail(null)} light={light} />}

      {/* History Modal */}
      {historyOpen && <HistoryModal orders={orders} pendingOrders={pendingOrders} onClose={() => setHistoryOpen(false)} light={light} />}

      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-marquee { animation: marquee 20s linear infinite; display: inline-block; }
        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .animate-slide-right { animation: slideRight 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, qty, onAdd, onBuyNow, onDetail, light }) {
  const [inputQty, setInputQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const inc = () => setInputQty(q => Math.min(q + 1, product.stock));
  const dec = () => setInputQty(q => Math.max(q - 1, 1));

  const handleAdd = () => {
    if (!product.stock) return;
    onAdd(product, inputQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const card = light ? "bg-white border-gray-200 shadow-sm" : "bg-slate-800/90 border-slate-700/60";
  const nameC = light ? "text-gray-900" : "text-white";
  const subC = light ? "text-gray-400" : "text-slate-500";
  const qtyBx = light ? "bg-gray-100 border-gray-200" : "bg-slate-900 border-slate-600";
  const qtyBt = light ? "text-gray-500 hover:text-gray-800 hover:bg-gray-200 disabled:opacity-30" : "text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30";

  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 ${card} flex flex-col transition-all duration-200 hover:-translate-y-1`}>
      {product.badge && <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase">{product.badge}</span>}
      {product.priceType === "per_kilo" && <span className="absolute top-2 right-2 z-10 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg">/kg</span>}
      {qty > 0 && <span className="absolute bottom-2 right-2 z-10 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg">🛒{qty}</span>}
      <button className="relative h-32 overflow-hidden bg-gray-100 w-full" onClick={() => onDetail(product)}>
        {imgErr ? <div className={`w-full h-full flex items-center justify-center text-3xl ${light ? "bg-gray-100" : "bg-slate-700"}`}>📦</div>
          : <img src={product.image} alt={product.name} onError={() => setImgErr(true)} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />}
        <div className={`absolute inset-0 bg-gradient-to-t ${light ? "from-white/40" : "from-slate-900/60"} via-transparent to-transparent`} />
      </button>
      <div className="p-2.5 flex flex-col flex-1 gap-1.5">
        <button onClick={() => onDetail(product)} className="text-left">
          <p className={`font-semibold ${nameC} text-xs leading-snug line-clamp-2 hover:text-amber-500 transition-colors`}>{product.name}</p>
          <p className={`${subC} text-[10px]`}>{product.category}</p>
        </button>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-amber-500">{formatPrice(product.price)}{product.priceType === "per_kilo" ? "/kg" : ""}</span>
          {product.stock === 0 ? <span className="text-[10px] text-red-500 font-semibold">Out</span>
            : product.stock <= 5 ? <span className="text-[10px] text-orange-500 font-semibold">⚠️{product.stock}</span>
            : <span className={`text-[10px] ${subC}`}>{product.stock}{product.priceType === "per_kilo" ? "kg" : ""}</span>}
        </div>
        {/* Qty stepper */}
        <div className={`flex items-center ${qtyBx} border rounded-xl overflow-hidden`}>
          <button onClick={dec} disabled={inputQty <= 1} className={`w-8 h-8 flex items-center justify-center ${qtyBt} transition-colors text-sm font-bold disabled:cursor-not-allowed`}>−</button>
          <input type="text" inputMode="numeric" value={product.priceType === "per_kilo" ? `${inputQty}kg` : inputQty}
            onChange={e => { const v = parseInt(e.target.value.replace(/[^0-9]/g,"")); if (!isNaN(v)) setInputQty(Math.max(1, Math.min(v, product.stock))); }}
            className={`flex-1 text-center text-xs font-bold bg-transparent outline-none ${light ? "text-gray-800" : "text-white"}`} />
          <button onClick={inc} disabled={inputQty >= product.stock} className={`w-8 h-8 flex items-center justify-center ${qtyBt} transition-colors text-sm font-bold disabled:cursor-not-allowed`}>+</button>
        </div>
        <div className="flex gap-1">
          <button onClick={handleAdd} disabled={!product.stock}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 active:scale-95 ${added ? "bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-white shadow-md"}`}>
            {added ? "✓ Added!" : "🛒 Cart"}
          </button>
          <button onClick={() => onBuyNow(product, inputQty)} disabled={!product.stock}
            className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 active:scale-95 ${light ? "bg-slate-800 text-white" : "bg-slate-600 text-white"}`}>
            ⚡ Buy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL MODAL ─────────────────────────────────────────────────────
function ProductDetailModal({ product, qty, onAdd, onBuyNow, onClose, light }) {
  const [inputQty, setInputQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const bg = light ? "bg-white" : "bg-slate-800";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${bg} rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up max-h-[90vh] flex flex-col`}>
        <div className="relative h-52 bg-gray-100 shrink-0">
          {imgErr ? <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-100">📦</div>
            : <img src={product.image} alt={product.name} onError={() => setImgErr(true)} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center text-lg">✕</button>
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <p className="text-white font-bold text-xl leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>{product.name}</p>
            {product.priceType === "per_kilo" && <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Per Kilo</span>}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-500">{formatPrice(product.price)}{product.priceType === "per_kilo" ? "/kg" : ""}</span>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${product.stock === 0 ? "bg-red-500/10 text-red-500" : product.stock <= 5 ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"}`}>
              {product.stock === 0 ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock}${product.priceType === "per_kilo" ? "kg" : ""} in stock`}
            </span>
          </div>
          {product.description && (
            <div className={`p-3 rounded-2xl ${light ? "bg-gray-50" : "bg-slate-900/50"}`}>
              <p className={`text-sm ${sub} leading-relaxed`}>{product.description}</p>
            </div>
          )}
          <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl ${light ? "bg-gray-50" : "bg-slate-900/50"}`}>
            <div><p className={`text-xs ${sub} mb-0.5`}>Category</p><p className={`text-sm font-semibold ${title}`}>{product.category}</p></div>
            <div><p className={`text-xs ${sub} mb-0.5`}>Stock</p><p className={`text-sm font-semibold ${title}`}>{product.stock} {product.priceType === "per_kilo" ? "kg" : "units"}</p></div>
            {product.barcode && <div className="col-span-2"><p className={`text-xs ${sub} mb-0.5`}>Barcode</p><p className={`text-xs font-mono ${title}`}>{product.barcode}</p></div>}
          </div>
          {/* Qty */}
          <div className={`flex items-center ${light ? "bg-gray-100 border-gray-200" : "bg-slate-900 border-slate-600"} border rounded-xl overflow-hidden`}>
            <button onClick={() => setInputQty(q => Math.max(1, q - 1))} className={`w-12 h-12 flex items-center justify-center text-lg font-bold ${light ? "text-gray-500 hover:bg-gray-200" : "text-slate-400 hover:bg-slate-700"}`}>−</button>
            <span className={`flex-1 text-center font-bold text-lg ${title}`}>{inputQty}{product.priceType === "per_kilo" ? "kg" : ""}</span>
            <button onClick={() => setInputQty(q => Math.min(product.stock, q + 1))} className={`w-12 h-12 flex items-center justify-center text-lg font-bold ${light ? "text-gray-500 hover:bg-gray-200" : "text-slate-400 hover:bg-slate-700"}`}>+</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onAdd(product, inputQty); setAdded(true); setTimeout(() => setAdded(false), 1000); }} disabled={!product.stock}
              className={`flex-1 py-3.5 rounded-xl text-sm font-semibold shadow-lg disabled:opacity-40 ${added ? "bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-white"}`}>
              {added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
            </button>
            <button onClick={() => onBuyNow(product, inputQty)} disabled={!product.stock}
              className={`px-5 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 ${light ? "bg-slate-800 text-white" : "bg-slate-600 text-white"}`}>
              ⚡ Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CART SIDEBAR ─────────────────────────────────────────────────────────────
function CartSidebar({ cart, onQtyChange, onRemove, onClear, onClose, onPlaceOrder, light, products }) {
  const [showPayment, setShowPayment] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = total >= 1000 ? 0 : 50;
  const grandTotal = total + deliveryFee;
  const toFree = Math.max(0, 1000 - total);

  const panel = light ? "bg-white" : "bg-[#0d1424]";
  const hdr = light ? "border-gray-100" : "border-white/5";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-500";
  const footer = light ? "bg-gray-50 border-t border-gray-100" : "bg-slate-900/80 border-t border-white/5";

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <div className={`absolute inset-0 ${light ? "bg-black/20" : "bg-black/60"} backdrop-blur-sm`} onClick={onClose} />
        <div className={`animate-slide-right relative ${panel} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr}`}>
          <div className={`flex items-center justify-between px-4 py-3.5 border-b ${hdr} shrink-0`}>
            <div>
              <h2 className={`font-bold ${title} text-sm`} style={{ fontFamily: "Syne, sans-serif" }}>Your Cart 🛒</h2>
              <p className={`${sub} text-[10px]`}>{cart.reduce((s, i) => s + i.qty, 0)} items</p>
            </div>
            <button onClick={onClose} className={`w-7 h-7 rounded-lg ${light ? "bg-gray-100 text-gray-500" : "bg-slate-800 text-slate-400"} flex items-center justify-center`}>✕</button>
          </div>
          {/* Progress */}
          {cart.length > 0 && (
            <div className={`px-4 py-2.5 border-b ${hdr} shrink-0 ${light ? "bg-amber-50/50" : "bg-amber-500/5"}`}>
              <p className={`text-xs ${sub} mb-1.5`}>
                {toFree > 0 ? <>Add <span className="text-amber-500 font-semibold">₱{toFree}</span> more for FREE delivery</>
                  : <span className="text-green-500 font-semibold">🎉 Free delivery unlocked!</span>}
              </p>
              <div className={`h-1.5 ${light ? "bg-gray-200" : "bg-slate-700"} rounded-full overflow-hidden`}>
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min((total / 1000) * 100, 100)}%` }} />
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <span className="text-5xl">🛒</span>
                <p className={`font-semibold ${title} text-sm`}>Cart is empty</p>
                <button onClick={onClose} className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs">Browse Products</button>
              </div>
            ) : cart.map(item => (
              <CartItemRow key={item.id} item={item} onQtyChange={onQtyChange} onRemove={onRemove} light={light} maxQty={products.find(p => p.id === item.id)?.stock ?? item.stock} />
            ))}
          </div>
          {cart.length > 0 && (
            <div className={`${footer} px-4 py-4 flex flex-col gap-3 shrink-0`}>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs"><span className={sub}>Subtotal</span><span className={sub}>₱{total}</span></div>
                <div className="flex justify-between text-xs"><span className={sub}>Delivery</span><span className={deliveryFee === 0 ? "text-green-500 font-semibold text-xs" : `${sub} text-xs`}>{deliveryFee === 0 ? "FREE" : "₱50"}</span></div>
                <div className={`pt-1.5 border-t ${light ? "border-gray-200" : "border-white/10"} flex justify-between`}>
                  <span className={`${title} font-bold text-sm`}>Total</span>
                  <span className={`${light ? "text-amber-600" : "text-amber-400"} font-bold text-lg`}>₱{grandTotal}</span>
                </div>
              </div>
              <button onClick={() => setShowPayment(true)} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg active:scale-95 transition-all">
                ✓ Place Order
              </button>
              <button onClick={onClear} className={`text-xs font-medium text-center ${light ? "text-gray-400 hover:text-red-500" : "text-slate-500 hover:text-red-400"} transition-colors`}>🗑 Clear cart</button>
            </div>
          )}
        </div>
      </div>
      {showPayment && <PaymentModal total={total} grandTotal={grandTotal} deliveryFee={deliveryFee}
        onConfirm={(m, f, a) => { onPlaceOrder(m, f, a); setShowPayment(false); }}
        onCancel={() => setShowPayment(false)} light={light} />}
    </>
  );
}

function CartItemRow({ item, onQtyChange, onRemove, light, maxQty }) {
  const [imgErr, setImgErr] = useState(false);
  const row = light ? "bg-white border-gray-200" : "bg-slate-800/60 border-white/5";
  const name = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-500";
  const qtyBox = light ? "bg-gray-100 border-gray-200" : "bg-slate-900 border-slate-600";
  const qtyBtn = light ? "text-gray-400 hover:bg-gray-200 hover:text-gray-700" : "text-slate-400 hover:bg-slate-700 hover:text-white";
  return (
    <div className={`flex items-center gap-2 ${row} rounded-xl p-2.5 border`}>
      <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {imgErr ? <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
          : <img src={item.image} alt={item.name} onError={() => setImgErr(true)} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${name} text-xs truncate`}>{item.name}</p>
        <p className={`text-amber-500 font-bold text-sm`}>₱{item.price * item.qty}</p>
        <p className={`${sub} text-[10px]`}>₱{item.price} × {item.qty}{item.priceType === "per_kilo" ? "kg" : ""}</p>
      </div>
      <div className={`flex items-center ${qtyBox} border rounded-lg overflow-hidden shrink-0`}>
        <button onClick={() => onQtyChange(item.id, Math.max(1, item.qty - 1))} className={`w-7 h-7 flex items-center justify-center ${qtyBtn} transition-colors text-sm`}>−</button>
        <input type="text" inputMode="numeric" value={item.qty} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) onQtyChange(item.id, Math.max(1, Math.min(v, maxQty))); }}
          className={`w-7 text-center font-bold text-xs bg-transparent outline-none ${light ? "text-gray-800" : "text-white"}`} />
        <button onClick={() => onQtyChange(item.id, Math.min(maxQty, item.qty + 1))} className={`w-7 h-7 flex items-center justify-center ${qtyBtn} transition-colors text-sm`}>+</button>
      </div>
      <button onClick={() => onRemove(item.id)} className={`w-7 h-7 rounded-md flex items-center justify-center ${light ? "text-gray-300 hover:text-red-500 hover:bg-red-50" : "text-slate-600 hover:text-red-400 hover:bg-red-500/10"} transition-colors`}>✕</button>
    </div>
  );
}

// ─── PAYMENT MODAL ────────────────────────────────────────────────────────────
function PaymentModal({ total, grandTotal, deliveryFee, onConfirm, onCancel, light }) {
  const [method, setMethod] = useState("");
  const [fulfillment, setFulfillment] = useState("delivery");
  const [step, setStep] = useState("method");
  const [address, setAddress] = useState("");

  const bg = light ? "bg-white border-gray-200 shadow-2xl" : "bg-slate-800 border-white/10 shadow-2xl";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";
  const sep = light ? "border-gray-100" : "border-white/10";
  const sel = light ? "border-amber-400 bg-amber-50" : "border-amber-500 bg-amber-500/10";
  const unsel = light ? "border-gray-200 hover:border-amber-300" : "border-slate-700 hover:border-slate-500";
  const inp = light ? "bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-400" : "bg-slate-900 border-slate-600 text-white focus:border-amber-500/60";

  const METHODS = [
    { id: "cash",  label: "Cash Payment",   icon: "💵", desc: "Pay with cash on delivery/pickup" },
    { id: "gcash", label: "GCash",          icon: "📱", desc: "Pay via GCash QR or number" },
    { id: "maya",  label: "Maya",           icon: "💳", desc: "Pay via Maya wallet" },
    { id: "card",  label: "Credit / Debit", icon: "🏦", desc: "Visa, Mastercard, JCB" },
    { id: "later", label: "Pay Later",      icon: "⏰", desc: "Pay when you receive / pick up" },
  ];

  const actualGrandTotal = fulfillment === "pickup" ? total : grandTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${bg} border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up max-h-[90vh] flex flex-col`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <h2 className={`font-bold ${title} text-base`}>{step === "method" ? "Checkout" : "Confirm Order"}</h2>
          <button onClick={onCancel} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? "bg-gray-100 text-gray-500" : "bg-slate-700 text-slate-400"}`}>✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {step === "method" ? (
            <>
              <div>
                <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-3`}>Fulfillment</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{ id:"delivery",label:"Delivery",icon:"🚚",desc:deliveryFee===0?"FREE":`+₱${deliveryFee}`},{ id:"pickup",label:"Pick Up",icon:"🏪",desc:"At the store"}].map(o => (
                    <button key={o.id} onClick={() => setFulfillment(o.id)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${fulfillment===o.id?sel:unsel}`}>
                      <span className="text-2xl">{o.icon}</span>
                      <p className={`font-semibold text-sm ${fulfillment===o.id?"text-amber-500":title}`}>{o.label}</p>
                      <p className={`text-xs ${fulfillment===o.id?"text-amber-500/70":sub}`}>{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {fulfillment === "delivery" && (
                <div>
                  <label className={`text-xs font-semibold ${sub} uppercase tracking-wider block mb-2`}>Delivery Address</label>
                  <input type="text" placeholder="Enter your full address…" value={address} onChange={e => setAddress(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${inp}`} />
                </div>
              )}
              <div>
                <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-3`}>Payment Method</p>
                <div className="space-y-2">
                  {METHODS.map(m => (
                    <button key={m.id} onClick={() => setMethod(m.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${method===m.id?sel:unsel}`}>
                      <span className="text-2xl shrink-0">{m.icon}</span>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold text-sm ${method===m.id?"text-amber-500":title}`}>{m.label}</p>
                        <p className={`text-xs ${sub}`}>{m.desc}</p>
                      </div>
                      {method===m.id && <span className="text-amber-500 text-lg">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`p-4 rounded-2xl ${light?"bg-gray-50":"bg-slate-900/60"} space-y-2`}>
                <div className="flex justify-between text-sm"><span className={sub}>Subtotal</span><span className={title}>₱{total}</span></div>
                <div className="flex justify-between text-sm"><span className={sub}>{fulfillment==="pickup"?"Pickup":"Delivery"}</span><span className={fulfillment==="pickup"||deliveryFee===0?"text-green-500 font-medium":`${sub}`}>{fulfillment==="pickup"?"FREE":deliveryFee===0?"FREE":`₱${deliveryFee}`}</span></div>
                <div className={`pt-2 border-t ${sep} flex justify-between font-bold`}><span className={title}>Total</span><span className="text-amber-500 text-lg">₱{actualGrandTotal}</span></div>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center py-2">
              <span className="text-6xl block">🎉</span>
              <div>
                <p className={`font-bold ${title} text-lg`}>Confirm your order?</p>
                <p className={`${sub} text-sm mt-1`}>Payment: <span className="text-amber-500 font-semibold">{METHODS.find(m=>m.id===method)?.label}</span></p>
                <p className={`${sub} text-sm`}>{fulfillment==="pickup"?"📍 Store Pick Up":"🚚 Delivery"}{address?` · ${address}`:""}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${light?"border-gray-100 bg-gray-50":"border-white/5 bg-slate-900/40"} text-left space-y-1.5`}>
                <div className="flex justify-between text-sm"><span className={sub}>Subtotal</span><span className={title}>₱{total}</span></div>
                <div className="flex justify-between text-sm"><span className={sub}>Delivery</span><span className={fulfillment==="pickup"||deliveryFee===0?"text-green-500 font-medium":`${sub}`}>{fulfillment==="pickup"?"FREE":deliveryFee===0?"FREE":`₱${deliveryFee}`}</span></div>
                <div className={`pt-2 border-t ${sep} flex justify-between font-bold text-base`}><span className={title}>Grand Total</span><span className="text-amber-500">₱{actualGrandTotal}</span></div>
              </div>
            </div>
          )}
        </div>
        <div className={`px-5 py-4 border-t ${sep} shrink-0 flex gap-2`}>
          {step==="method" ? (
            <>
              <button onClick={onCancel} className={`flex-1 py-3 rounded-xl text-sm font-medium ${light?"bg-gray-100 text-gray-600":"bg-slate-700 text-slate-300"}`}>Cancel</button>
              <button onClick={() => setStep("confirm")} disabled={!method} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 shadow-lg">Continue →</button>
            </>
          ) : (
            <>
              <button onClick={() => setStep("method")} className={`flex-1 py-3 rounded-xl text-sm font-medium ${light?"bg-gray-100 text-gray-600":"bg-slate-700 text-slate-300"}`}>Back</button>
              <button onClick={() => onConfirm(method, fulfillment, address)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-lg">✓ Yes, Order!</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ACTIVITY TAB ─────────────────────────────────────────────────────────────
function ActivityTab({ pendingOrders, orders, onViewPending, onComplete, onCartOpen, light, text, sub, cardBg, border }) {
  const [tab, setTab] = useState("pending");

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${text}`} style={{ fontFamily: "Syne, sans-serif" }}>Activity</h2>
      </div>
      <div className="flex gap-2">
        {[{id:"pending",label:`Pending (${pendingOrders.length})`},{id:"history",label:`History (${orders.length})`}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab===t.id?"bg-amber-500 text-white shadow-md":light?"bg-white text-gray-500 border border-gray-200":"bg-slate-800/80 text-slate-400 border border-slate-700"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "pending" && (
        pendingOrders.length === 0 ? (
          <div className={`${cardBg} border ${border} rounded-2xl p-10 text-center`}>
            <span className="text-4xl block mb-3">📋</span>
            <p className={`font-semibold ${text} text-sm`}>No pending orders</p>
            <p className={`${sub} text-xs mt-1`}>Your pending orders will appear here</p>
            <button onClick={onCartOpen} className="mt-4 bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs">Shop Now</button>
          </div>
        ) : pendingOrders.map(o => (
          <div key={o.id} className={`${cardBg} border ${border} rounded-2xl p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className={`font-bold ${text} text-sm`}>#{o.id.slice(-6).toUpperCase()}</p>
                <p className={`${sub} text-xs`}>{new Date(o.placedAt).toLocaleDateString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
              </div>
              <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-md">⏳ Pending</span>
            </div>
            <div className="space-y-1 mb-3">
              {o.items.slice(0,3).map((item,i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className={sub}>{item.name} ×{item.qty}</span>
                  <span className={text}>₱{item.price*item.qty}</span>
                </div>
              ))}
              {o.items.length > 3 && <p className={`text-xs ${sub}`}>+{o.items.length-3} more items</p>}
            </div>
            <div className={`flex justify-between text-sm font-bold border-t ${light?"border-gray-100":"border-white/5"} pt-2 mb-3`}>
              <span className={text}>Grand Total</span>
              <span className="text-amber-500">₱{o.grandTotal}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onViewPending(o)} className={`flex-1 py-2 rounded-xl text-xs font-semibold ${light?"bg-gray-100 text-gray-700 hover:bg-gray-200":"bg-slate-700 text-slate-300 hover:bg-slate-600"} transition-colors`}>View Details</button>
              <button onClick={() => onComplete(o.id)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-green-500 hover:bg-green-400 text-white transition-colors">✓ Mark Complete</button>
            </div>
          </div>
        ))
      )}

      {tab === "history" && (
        orders.length === 0 ? (
          <div className={`${cardBg} border ${border} rounded-2xl p-10 text-center`}>
            <span className="text-4xl block mb-3">📦</span>
            <p className={`font-semibold ${text} text-sm`}>No orders yet</p>
            <p className={`${sub} text-xs mt-1`}>Completed orders will appear here</p>
          </div>
        ) : orders.map(o => (
          <div key={o.id} className={`${cardBg} border ${border} rounded-2xl p-4`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className={`font-bold ${text} text-sm`}>#{o.id.slice(-6).toUpperCase()}</p>
                <p className={`${sub} text-xs`}>{new Date(o.placedAt).toLocaleDateString("en-PH",{month:"short",day:"numeric"})}</p>
              </div>
              <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-md">✓ Done</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className={sub}>{o.items.reduce((s,i)=>s+i.qty,0)} items · {o.method}</span>
              <span className="text-amber-500">₱{o.grandTotal}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── NOTIFICATIONS TAB ────────────────────────────────────────────────────────
function NotificationsTab({ notifications, onMarkAllRead, light, text, sub, cardBg, border }) {
  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${text}`} style={{ fontFamily: "Syne, sans-serif" }}>Notifications</h2>
        {notifications.some(n => !n.read) && (
          <button onClick={onMarkAllRead} className="text-amber-500 text-xs font-semibold hover:underline">Mark all read</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className={`${cardBg} border ${border} rounded-2xl p-10 text-center`}>
          <span className="text-4xl block mb-3">🔔</span>
          <p className={`font-semibold ${text} text-sm`}>No notifications</p>
          <p className={`${sub} text-xs mt-1`}>Store announcements and order updates appear here</p>
        </div>
      ) : notifications.map(n => (
        <div key={n.id} className={`${cardBg} border ${border} rounded-2xl p-4 ${!n.read ? (light?"border-amber-300 bg-amber-50/50":"border-amber-500/30 bg-amber-500/5") : ""}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{n.type === "announcement" ? "📢" : n.type === "order" ? "🛒" : "🔔"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`font-semibold ${text} text-sm`}>{n.title}</p>
                {!n.read && <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0 mt-1.5" />}
              </div>
              <p className={`${sub} text-xs mt-0.5 leading-relaxed`}>{n.body}</p>
              <p className={`${sub} text-[10px] mt-1`}>{new Date(n.at).toLocaleDateString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ light, onToggleLight, onOpenAdmin, onViewHistory, text, sub, cardBg, border }) {
  return (
    <div className="space-y-5 pb-4">
      <h2 className={`text-2xl font-bold ${text}`} style={{ fontFamily: "Syne, sans-serif" }}>Settings</h2>

      {/* Appearance */}
      <div className={`${cardBg} border ${border} rounded-2xl p-4`}>
        <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-3`}>Appearance</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{light ? "☀️" : "🌙"}</span>
            <div>
              <p className={`font-semibold ${text} text-sm`}>{light ? "Light Mode" : "Dark Mode"}</p>
              <p className={`${sub} text-xs`}>Tap to switch theme</p>
            </div>
          </div>
          {/* Toggle - left=off, right=on */}
          <button onClick={onToggleLight}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${light ? "bg-amber-500" : "bg-slate-600"}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${light ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Store */}
      <div className={`${cardBg} border ${border} rounded-2xl p-4 space-y-3`}>
        <p className={`text-xs font-semibold ${sub} uppercase tracking-wider`}>Store</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div>
            <p className={`font-semibold ${text} text-sm`}>Evaristo's Main Branch</p>
            <p className={`${sub} text-xs`}>Blk 3 Lot 5, Sampaguita St., Maynila</p>
            <p className={`${sub} text-xs`}>Open 6AM – 10PM · 0912-345-6789</p>
          </div>
        </div>
      </div>

      {/* History */}
      <button onClick={onViewHistory} className={`w-full ${cardBg} border ${border} rounded-2xl p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <p className={`font-semibold ${text} text-sm`}>Order History</p>
            <p className={`${sub} text-xs`}>View all past orders & receipts</p>
          </div>
        </div>
        <span className={`${sub} text-sm`}>→</span>
      </button>

      {/* Admin */}
      <button onClick={onOpenAdmin} className={`w-full ${cardBg} border ${border} rounded-2xl p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <div className="text-left">
            <p className={`font-semibold ${text} text-sm`}>Admin Panel</p>
            <p className={`${sub} text-xs`}>Manage products, stock & orders</p>
          </div>
        </div>
        <span className={`${sub} text-sm`}>→</span>
      </button>

      <div className={`${cardBg} border ${border} rounded-2xl p-4`}>
        <p className={`font-semibold ${text} text-sm`}>Evaristo's Sari-Sari Store</p>
        <p className={`${sub} text-xs`}>Version 2.0.0 · Est. 1993 · 🇵🇭 Proudly Pinoy</p>
      </div>
    </div>
  );
}

// ─── CALCULATOR MODAL ─────────────────────────────────────────────────────────
function CalculatorModal({ onClose, light }) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [reset, setReset] = useState(false);

  const press = (val) => {
    if (val === "C") { setDisplay("0"); setPrev(null); setOp(null); setReset(false); return; }
    if (val === "±") { setDisplay(d => String(-parseFloat(d))); return; }
    if (val === "%") { setDisplay(d => String(parseFloat(d)/100)); return; }
    if (val === "=") {
      if (!op || prev === null) return;
      const a = parseFloat(prev), b = parseFloat(display);
      let r = op === "+" ? a+b : op === "−" ? a-b : op === "×" ? a*b : op === "÷" ? a/b : b;
      setDisplay(String(parseFloat(r.toFixed(10))));
      setPrev(null); setOp(null); setReset(true); return;
    }
    if (["+","−","×","÷"].includes(val)) {
      setPrev(display); setOp(val); setReset(true); return;
    }
    if (val === ".") {
      if (reset) { setDisplay("0."); setReset(false); return; }
      if (!display.includes(".")) setDisplay(d => d + ".");
      return;
    }
    if (reset) { setDisplay(val); setReset(false); }
    else setDisplay(d => d === "0" ? val : d + val);
  };

  const buttons = [
    ["C","±","%","÷"],["7","8","9","×"],["4","5","6","−"],["1","2","3","+"],["0",".","="]
  ];

  const bg = light ? "bg-white" : "bg-slate-900";
  const text = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${bg} rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xs overflow-hidden animate-slide-up`}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className={`font-bold ${text} text-base`}>🧮 Calculator</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light?"bg-gray-100 text-gray-500":"bg-slate-800 text-slate-400"}`}>✕</button>
        </div>
        <div className={`text-right px-5 py-4 border-b ${light?"border-gray-100":"border-white/5"}`}>
          <p className={`text-xs ${sub} mb-1`}>{prev ? `${prev} ${op}` : ""}</p>
          <p className={`text-4xl font-bold ${text} truncate`} style={{ fontFamily: "Syne, sans-serif" }}>{display.length > 10 ? parseFloat(display).toExponential(4) : display}</p>
        </div>
        <div className="p-4 grid grid-cols-4 gap-2">
          {buttons.flat().map((btn, i) => {
            const isZero = btn === "0";
            const isOp = ["+","−","×","÷","="].includes(btn);
            const isTop = ["C","±","%"].includes(btn);
            return (
              <button key={i} onClick={() => press(btn)}
                className={`${isZero ? "col-span-2" : ""} h-14 rounded-2xl font-semibold text-lg transition-all active:scale-95 ${
                  isOp ? "bg-amber-500 hover:bg-amber-400 text-white" :
                  isTop ? (light?"bg-gray-200 text-gray-700 hover:bg-gray-300":"bg-slate-700 text-slate-300 hover:bg-slate-600") :
                  (light?"bg-gray-100 text-gray-900 hover:bg-gray-200":"bg-slate-800 text-white hover:bg-slate-700")
                }`}>
                {btn}
              </button>
            );
          })}
        </div>
        <div className="px-4 pb-4">
          <p className={`text-xs ${sub} text-center`}>Also useful for price calculations per kilo 🥦</p>
        </div>
      </div>
    </div>
  );
}

// ─── PENDING DETAIL MODAL ─────────────────────────────────────────────────────
function PendingDetailModal({ order, onComplete, onClose, light }) {
  const bg = light ? "bg-white" : "bg-slate-800";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";
  const sep = light ? "border-gray-100" : "border-white/5";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${bg} rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up max-h-[85vh] flex flex-col`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <div>
            <h2 className={`font-bold ${title} text-base`}>Order #{order.id.slice(-6).toUpperCase()}</h2>
            <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-md">⏳ Pending</span>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light?"bg-gray-100 text-gray-500":"bg-slate-700 text-slate-400"}`}>✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className={`text-sm ${title}`}>{item.name} ×{item.qty}</span>
                <span className="text-amber-500 font-semibold text-sm">₱{item.price*item.qty}</span>
              </div>
            ))}
          </div>
          <div className={`border-t ${sep} pt-3 space-y-1`}>
            <div className="flex justify-between text-sm"><span className={sub}>Subtotal</span><span className={sub}>₱{order.total}</span></div>
            <div className="flex justify-between text-sm"><span className={sub}>Delivery</span><span className={order.deliveryFee===0?"text-green-500 text-sm":sub}>{order.deliveryFee===0?"FREE":`₱${order.deliveryFee}`}</span></div>
            <div className="flex justify-between font-bold text-base"><span className={title}>Grand Total</span><span className="text-amber-500">₱{order.grandTotal}</span></div>
          </div>
          <div className={`${light?"bg-gray-50":"bg-slate-900/50"} rounded-2xl p-3 text-xs ${sub} space-y-1`}>
            <p>📦 Method: <span className={title}>{order.method}</span></p>
            <p>🚚 Fulfillment: <span className={title}>{order.fulfillment}</span></p>
            {order.address && <p>📍 Address: <span className={title}>{order.address}</span></p>}
          </div>
        </div>
        <div className={`px-5 py-4 border-t ${sep} shrink-0 flex gap-2`}>
          <button onClick={onClose} className={`flex-1 py-3 rounded-xl text-sm font-medium ${light?"bg-gray-100 text-gray-600":"bg-slate-700 text-slate-300"}`}>Close</button>
          <button onClick={onComplete} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-green-500 hover:bg-green-400 text-white shadow-lg">✓ Mark Complete</button>
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY MODAL ────────────────────────────────────────────────────────────
function HistoryModal({ orders, pendingOrders, onClose, light }) {
  const bg = light ? "bg-white" : "bg-slate-900";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";
  const cardBg = light ? "bg-gray-50 border-gray-200" : "bg-slate-800/60 border-white/5";

  const totalRevenue = orders.reduce((s,o) => s+o.grandTotal, 0);
  const allOrders = [...pendingOrders, ...orders].sort((a,b) => new Date(b.placedAt)-new Date(a.placedAt));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${bg} rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden animate-slide-up max-h-[90vh] flex flex-col`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${light?"border-gray-100":"border-white/5"} shrink-0`}>
          <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: "Syne, sans-serif" }}>📊 Full Order History</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light?"bg-gray-100 text-gray-500":"bg-slate-800 text-slate-400"}`}>✕</button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-5 py-4 shrink-0">
          {[{label:"Total Orders",value:allOrders.length},{label:"Revenue",value:`₱${totalRevenue.toLocaleString()}`},{label:"Pending",value:pendingOrders.length}].map(s => (
            <div key={s.label} className={`${cardBg} border rounded-2xl p-3 text-center`}>
              <p className={`font-bold ${title} text-lg`}>{s.value}</p>
              <p className={`${sub} text-[10px]`}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-3">
          {allOrders.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl block mb-3">📦</span>
              <p className={`font-semibold ${title} text-sm`}>No orders yet</p>
            </div>
          ) : allOrders.map(o => (
            <div key={o.id} className={`${cardBg} border rounded-2xl p-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-bold ${title} text-sm`}>#{o.id.slice(-6).toUpperCase()}</p>
                  <p className={`${sub} text-xs`}>{new Date(o.placedAt).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${o.status==="completed"?"bg-green-500/10 text-green-500":"bg-orange-500/10 text-orange-500"}`}>{o.status==="completed"?"✓ Done":"⏳ Pending"}</span>
                  <p className="text-amber-500 font-bold text-sm mt-1">₱{o.grandTotal}</p>
                </div>
              </div>
              <p className={`${sub} text-xs mt-1`}>{o.items.reduce((s,i)=>s+i.qty,0)} items · {o.method} · {o.fulfillment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onCancel, light }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (!u || !p) return setErr("Please fill in all fields.");
    setLoading(true);
    setTimeout(() => {
      if (u === "admin" && p === "ronan123") onLogin();
      else { setErr("Invalid credentials."); setLoading(false); }
    }, 600);
  };

  const bg = light ? "bg-gray-50" : "bg-[#080c14]";
  const card = light ? "bg-white border border-gray-200 shadow-sm" : "bg-slate-800/60 border border-white/5";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-500";
  const inp = light ? "bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-400" : "bg-slate-900 border-slate-600 text-white focus:border-amber-500/60";

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-4`}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-xl text-2xl">🏪</div>
          <div className="text-center">
            <h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: "Syne, sans-serif" }}>Evaristo's</h1>
            <p className={`${sub} text-sm`}>Admin Panel</p>
          </div>
        </div>
        <div className={`${card} rounded-2xl p-6 space-y-4`}>
          <h2 className={`text-base font-semibold ${title}`}>Sign in</h2>
          <div>
            <label className={`text-xs ${sub} mb-1.5 block`}>Username</label>
            <input type="text" placeholder="admin" value={u} onChange={e => { setU(e.target.value); setErr(""); }} onKeyDown={e => e.key==="Enter"&&handle()}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${inp}`} />
          </div>
          <div>
            <label className={`text-xs ${sub} mb-1.5 block`}>Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="••••••••" value={p} onChange={e => { setP(e.target.value); setErr(""); }} onKeyDown={e => e.key==="Enter"&&handle()}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors pr-10 ${inp}`} />
              <button onClick={() => setShow(s => !s)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${sub}`}>{show ? "🙈" : "👁"}</button>
            </div>
          </div>
          {err && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"><span className="text-red-400 text-xs">⚠️ {err}</span></div>}
          <button onClick={handle} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-lg flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin">⌛</span> : "🔐 Sign In"}
          </button>
          <button onClick={onCancel} className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${light?"bg-gray-100 text-gray-600 hover:bg-gray-200":"bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>← Back to Store</button>
        </div>
        <p className={`text-center ${sub} text-xs mt-4`}>Default: <span className={title}>admin</span> / <span className={title}>ronan123</span></p>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ products, categories, orders, pendingOrders, onAddProduct, onUpdateProduct, onRemoveProduct, onAddCategory, onRemoveCategory, onSendAnnouncement, onCompletePending, onExit, light }) {
  const [tab, setTab] = useState("dashboard");

  const bg = light ? "bg-gray-50" : "bg-[#080c14]";
  const navBg = light ? "bg-white border-r border-gray-200" : "bg-slate-900 border-r border-white/5";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-500";
  const active = light ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  const inactive = light ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100" : "text-slate-400 hover:text-white hover:bg-slate-800";

  const TABS = [
    { id:"dashboard",label:"Dashboard",icon:"📊" },
    { id:"products",label:"Products",icon:"📦" },
    { id:"categories",label:"Categories",icon:"🏷" },
    { id:"announcements",label:"Announcements",icon:"📢" },
    { id:"history",label:"History",icon:"📋" },
  ];

  return (
    <div className={`min-h-screen ${bg} flex`}>
      {/* Sidebar */}
      <aside className={`${navBg} w-52 shrink-0 flex flex-col hidden md:flex`}>
        <div className={`flex items-center gap-2 px-4 py-4 border-b ${light?"border-gray-100":"border-white/5"}`}>
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white text-sm">🏪</div>
          <div>
            <p className={`${title} font-bold text-sm`}>Evaristo's</p>
            <p className={`${sub} text-[10px] uppercase tracking-wider`}>Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab===t.id?active:inactive}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className={`px-2 py-3 border-t ${light?"border-gray-100":"border-white/5"}`}>
          <button onClick={onExit} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${light?"text-gray-400 hover:text-red-500 hover:bg-red-50":"text-slate-500 hover:text-red-400 hover:bg-red-500/10"}`}>
            🚪 Back to Store
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30">
        <div className={`${navBg} px-4 py-3 flex items-center justify-between border-b ${light?"border-gray-200":"border-white/5"}`}>
          <p className={`${title} font-bold text-sm`}>Admin · {TABS.find(t=>t.id===tab)?.label}</p>
          <button onClick={onExit} className={`text-xs font-medium ${light?"text-gray-500":"text-slate-400"}`}>← Store</button>
        </div>
        <div className={`${navBg} flex overflow-x-auto px-2 py-2 gap-1 border-b ${light?"border-gray-100":"border-white/5"}`}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${tab===t.id?"bg-amber-500 text-white":light?"bg-white text-gray-500 border border-gray-200":"bg-slate-800 text-slate-400 border border-slate-700"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:pt-6 pt-28">
        {tab==="dashboard" && <AdminDashboard products={products} orders={orders} pendingOrders={pendingOrders} onNavigate={setTab} light={light} />}
        {tab==="products" && <AdminProducts products={products} categories={categories} onAdd={onAddProduct} onUpdate={onUpdateProduct} onRemove={onRemoveProduct} light={light} />}
        {tab==="categories" && <AdminCategories categories={categories} products={products} onAdd={onAddCategory} onRemove={onRemoveCategory} light={light} />}
        {tab==="announcements" && <AdminAnnouncements onSend={onSendAnnouncement} light={light} />}
        {tab==="history" && <AdminHistory orders={orders} pendingOrders={pendingOrders} onComplete={onCompletePending} light={light} />}
      </main>
    </div>
  );
}

function AdminDashboard({ products, orders, pendingOrders, onNavigate, light }) {
  const bg = light ? "bg-white border border-gray-200 shadow-sm" : "bg-slate-800/60 border border-white/5";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";
  const revenue = orders.reduce((s,o) => s+o.grandTotal, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outStock = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-5">
      <div><h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: "Syne, sans-serif" }}>Dashboard</h1><p className={`${sub} text-xs mt-0.5`}>Overview of your store</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label:"Total Products", value:products.length, icon:"📦", nav:"products" },
          { label:"Total Revenue", value:`₱${revenue.toLocaleString()}`, icon:"💰", nav:"history" },
          { label:"Total Orders", value:orders.length, icon:"🛒", nav:"history" },
          { label:"Pending Orders", value:pendingOrders.length, icon:"⏳", nav:"history" },
          { label:"Low Stock", value:lowStock.length, icon:"⚠️", nav:"products" },
          { label:"Out of Stock", value:outStock.length, icon:"❌", nav:"products" },
        ].map(s => (
          <button key={s.label} onClick={() => onNavigate(s.nav)} className={`${bg} rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform`}>
            <span className="text-2xl block mb-2">{s.icon}</span>
            <p className={`text-xl font-bold ${title}`}>{s.value}</p>
            <p className={`${sub} text-xs mt-0.5`}>{s.label}</p>
          </button>
        ))}
      </div>
      {(lowStock.length > 0 || outStock.length > 0) && (
        <div className={`${bg} rounded-2xl p-4`}>
          <h2 className={`text-sm font-semibold ${title} mb-3`}>⚠️ Needs Attention</h2>
          <div className="space-y-2">
            {[...outStock, ...lowStock].slice(0,5).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <span className={`text-sm ${title}`}>{p.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${p.stock===0?"bg-red-500/10 text-red-500":"bg-orange-500/10 text-orange-500"}`}>{p.stock===0?"Out":p.stock+" left"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminProducts({ products, categories, onAdd, onUpdate, onRemove, light }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name:"", price:0, category:"", image:"", badge:"", stock:0, barcode:"", description:"", priceType:"fixed" });
  const [editForm, setEditForm] = useState({});
  const [scanMode, setScanMode] = useState(false);

  const bg = light ? "bg-white border border-gray-200 shadow-sm" : "bg-slate-800/60 border border-white/5";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";
  const inp = light ? "bg-white border-gray-300 text-gray-900 focus:border-amber-400" : "bg-slate-900 border-slate-600 text-white focus:border-amber-500/60";
  const sel = light ? "bg-white border-gray-300 text-gray-900" : "bg-slate-900 border-slate-600 text-white";

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.name || !form.category || form.price <= 0) return;
    onAdd({ ...form, price: Number(form.price), stock: Number(form.stock), badge: form.badge || null });
    setForm({ name:"", price:0, category:"", image:"", badge:"", stock:0, barcode:"", description:"", priceType:"fixed" });
    setShowForm(false);
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setEditForm({ name:p.name, price:p.price, category:p.category, image:p.image, badge:p.badge||"", stock:p.stock, barcode:p.barcode||"", description:p.description||"", priceType:p.priceType||"fixed" });
  };

  const saveEdit = () => {
    onUpdate(editId, { ...editForm, price: Number(editForm.price), stock: Number(editForm.stock), badge: editForm.badge||null });
    setEditId(null);
  };

  const FormFields = ({ data, onChange, isEdit }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { key:"name", label:"Product Name *", type:"text" },
        { key:"price", label:`Price (₱) *${data.priceType==="per_kilo"?" /kg":""}`, type:"number" },
        { key:"stock", label:`Stock *${data.priceType==="per_kilo"?" (kg)":""}`, type:"number" },
        { key:"badge", label:"Badge", type:"text" },
      ].map(f => (
        <div key={f.key}>
          <label className={`text-xs ${sub} mb-1 block`}>{f.label}</label>
          <input type={f.type} value={data[f.key]||""} onChange={e => onChange({ ...data, [f.key]: e.target.value })}
            className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
        </div>
      ))}
      <div>
        <label className={`text-xs ${sub} mb-1 block`}>Category *</label>
        <select value={data.category} onChange={e => onChange({ ...data, category: e.target.value })}
          className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${sel}`}>
          <option value="">Select…</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className={`text-xs ${sub} mb-1 block`}>Price Type</label>
        <select value={data.priceType||"fixed"} onChange={e => onChange({ ...data, priceType: e.target.value })}
          className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${sel}`}>
          <option value="fixed">Fixed Price</option>
          <option value="per_kilo">Per Kilo</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={`text-xs ${sub} mb-1 block`}>Image URL</label>
        <input type="text" value={data.image||""} onChange={e => onChange({ ...data, image: e.target.value })}
          className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
      </div>
      <div className="sm:col-span-2">
        <label className={`text-xs ${sub} mb-1 block`}>Description</label>
        <textarea value={data.description||""} onChange={e => onChange({ ...data, description: e.target.value })} rows={3}
          className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors resize-none ${inp}`} placeholder="Product description…" />
      </div>
      <div className="sm:col-span-2">
        <label className={`text-xs ${sub} mb-1.5 block`}>Barcode</label>
        <div className="flex gap-2">
          <input type="text" value={data.barcode||""} onChange={e => onChange({ ...data, barcode: e.target.value })}
            className={`flex-1 border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} placeholder="Scan or type barcode…" />
          <button type="button" onClick={() => setScanMode(!scanMode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${scanMode?"bg-amber-500 text-white border-amber-500":light?"bg-white border-gray-300 text-gray-600 hover:border-amber-400":"bg-slate-800 border-slate-600 text-slate-400 hover:border-amber-500/40"}`}>
            📷 Cam
          </button>
        </div>
        {scanMode && (
          <div className={`mt-2 p-3 rounded-xl border ${light?"bg-amber-50 border-amber-200":"bg-amber-500/10 border-amber-500/20"}`}>
            <p className={`text-xs ${sub}`}>📷 Camera scanning coming soon. Please use a physical barcode scanner or type the code manually above. The barcode field accepts input from USB/Bluetooth scanners automatically.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: "Syne, sans-serif" }}>Products</h1>
          <p className={`${sub} text-xs`}>{filtered.length} of {products.length}</p>
        </div>
        <button onClick={() => setShowForm(o => !o)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-lg">
          ＋ Add Product
        </button>
      </div>

      {showForm && (
        <div className={`${bg} rounded-2xl p-4 space-y-3 border-2 border-amber-500/30`}>
          <h2 className={`text-sm font-semibold ${title}`}>New Product</h2>
          <FormFields data={form} onChange={setForm} />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-sm">✓ Save</button>
            <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-xl text-sm border transition-colors ${light?"border-gray-200 text-gray-500":"border-slate-600 text-slate-400"}`}>Cancel</button>
          </div>
        </div>
      )}

      <div className={`flex items-center gap-2.5 ${light?"bg-white border-gray-200":"bg-slate-800/80 border-slate-700/60"} border rounded-xl px-3.5 py-2.5`}>
        <span>🔍</span>
        <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
          className={`flex-1 outline-none text-sm bg-transparent ${light?"text-gray-800 placeholder:text-gray-400":"text-white placeholder:text-slate-500"}`} />
      </div>

      <div className={`${bg} rounded-2xl overflow-hidden`}>
        {filtered.length === 0 ? <p className={`${sub} text-sm text-center py-10`}>No products found</p> : filtered.map(p => (
          <div key={p.id} className={`border-b ${light?"border-gray-100":"border-white/5"} last:border-0`}>
            {editId === p.id ? (
              <div className={`p-4 ${light?"bg-amber-50":"bg-amber-500/5"}`}>
                <FormFields data={editForm} onChange={setEditForm} />
                <div className="flex gap-2 mt-3">
                  <button onClick={saveEdit} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-sm">✓ Save</button>
                  <button onClick={() => setEditId(null)} className={`px-4 py-2 rounded-xl text-sm border ${light?"border-gray-200 text-gray-500":"border-slate-600 text-slate-400"}`}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className={`flex items-center gap-3 px-4 py-3 ${light?"hover:bg-gray-50":"hover:bg-slate-700/20"} transition-colors`}>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${title} text-sm font-medium truncate`}>{p.name}</p>
                  <p className={`${sub} text-xs`}>{p.category} · {formatPrice(p.price)}{p.priceType==="per_kilo"?"/kg":""} · {p.stock}{p.priceType==="per_kilo"?" kg":" units"}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${p.stock===0?"bg-red-500/10 text-red-500":p.stock<=5?"bg-orange-500/10 text-orange-500":"bg-green-500/10 text-green-500"}`}>{p.stock===0?"Out":p.stock<=5?"Low":"OK"}</span>
                <button onClick={() => startEdit(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${light?"text-gray-400 hover:text-gray-900 hover:bg-gray-100":"text-slate-400 hover:text-white hover:bg-slate-700"} transition-colors`}>✏️</button>
                <button onClick={() => onRemove(p.id)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${light?"text-gray-300 hover:text-red-500 hover:bg-red-50":"text-slate-500 hover:text-red-400 hover:bg-red-500/10"} transition-colors`}>🗑</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCategories({ categories, products, onAdd, onRemove, light }) {
  const [newCat, setNewCat] = useState("");
  const [err, setErr] = useState("");
  const bg = light ? "bg-white border border-gray-200 shadow-sm" : "bg-slate-800/60 border border-white/5";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";
  const inp = light ? "bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-400" : "bg-slate-900 border-slate-600 text-white focus:border-amber-500/60";

  return (
    <div className="space-y-5">
      <div><h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: "Syne, sans-serif" }}>Categories</h1><p className={`${sub} text-xs`}>{categories.length} categories</p></div>
      <div className={`${bg} rounded-2xl p-5`}>
        <h2 className={`text-base font-semibold ${title} mb-4`}>＋ Add Category</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="e.g. Frozen Foods" value={newCat} onChange={e => { setNewCat(e.target.value); setErr(""); }} onKeyDown={e => e.key==="Enter"&&(() => { if (!newCat.trim()) return setErr("Enter a name."); if (categories.some(c => c.toLowerCase()===newCat.trim().toLowerCase())) return setErr("Already exists."); onAdd(newCat.trim()); setNewCat(""); })()} className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${inp}`} />
          <button onClick={() => { if (!newCat.trim()) return setErr("Enter a name."); if (categories.some(c => c.toLowerCase()===newCat.trim().toLowerCase())) return setErr("Already exists."); onAdd(newCat.trim()); setNewCat(""); }} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg">Add</button>
        </div>
        {err && <p className="text-red-500 text-xs mt-2">⚠️ {err}</p>}
      </div>
      <div className={`${bg} rounded-2xl overflow-hidden`}>
        {categories.map(cat => {
          const count = products.filter(p => p.category === cat).length;
          return (
            <div key={cat} className={`flex items-center justify-between px-5 py-3.5 border-b ${light?"border-gray-100 hover:bg-gray-50":"border-white/5 hover:bg-slate-700/20"} transition-colors`}>
              <div>
                <p className={`${title} text-sm font-medium`}>{cat}</p>
                <p className={`${sub} text-xs`}>{count} product{count!==1?"s":""}</p>
              </div>
              <button onClick={() => onRemove(cat)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${light?"text-gray-300 hover:text-red-500 hover:bg-red-50":"text-slate-500 hover:text-red-400 hover:bg-red-500/10"} transition-colors`}>🗑</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminAnnouncements({ onSend, light }) {
  const [custom, setCustom] = useState({ title: "", body: "" });
  const [sent, setSent] = useState([]);
  const [selectedPre, setSelectedPre] = useState(null);

  const bg = light ? "bg-white border border-gray-200 shadow-sm" : "bg-slate-800/60 border border-white/5";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";
  const inp = light ? "bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-400" : "bg-slate-900 border-slate-600 text-white focus:border-amber-500/60";

  const handleSend = (ann) => {
    onSend(ann);
    setSent(prev => [{ ...ann, sentAt: new Date().toISOString() }, ...prev]);
  };

  return (
    <div className="space-y-5">
      <div><h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: "Syne, sans-serif" }}>Announcements</h1><p className={`${sub} text-xs`}>Send notifications to customers</p></div>

      <div className={`${bg} rounded-2xl p-5 space-y-3`}>
        <h2 className={`text-sm font-semibold ${title} flex items-center gap-2`}>📋 Pre-made Announcements</h2>
        <div className="space-y-2">
          {PRE_MADE_ANNOUNCEMENTS.map(ann => (
            <div key={ann.id} className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedPre===ann.id?(light?"border-amber-400 bg-amber-50":"border-amber-500 bg-amber-500/10"):(light?"border-gray-200 hover:border-amber-300":"border-slate-700 hover:border-amber-500/40")}`}
              onClick={() => { setSelectedPre(ann.id); setCustom({ title: ann.title, body: ann.body }); }}>
              <p className={`font-semibold ${title} text-sm`}>{ann.title}</p>
              <p className={`${sub} text-xs mt-0.5`}>{ann.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${bg} rounded-2xl p-5 space-y-3`}>
        <h2 className={`text-sm font-semibold ${title}`}>✏️ Compose Announcement</h2>
        <div>
          <label className={`text-xs ${sub} mb-1 block`}>Title</label>
          <input type="text" value={custom.title} onChange={e => { setCustom(c => ({...c, title: e.target.value})); setSelectedPre(null); }}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${inp}`} placeholder="Announcement title…" />
        </div>
        <div>
          <label className={`text-xs ${sub} mb-1 block`}>Message</label>
          <textarea value={custom.body} onChange={e => { setCustom(c => ({...c, body: e.target.value})); setSelectedPre(null); }} rows={3}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none ${inp}`} placeholder="Write your announcement…" />
        </div>
        <button onClick={() => { if (!custom.title || !custom.body) return; handleSend(custom); setCustom({ title:"", body:"" }); setSelectedPre(null); }}
          disabled={!custom.title || !custom.body}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl text-sm shadow-lg disabled:opacity-40">
          📢 Send Announcement
        </button>
      </div>

      {sent.length > 0 && (
        <div className={`${bg} rounded-2xl p-5`}>
          <h2 className={`text-sm font-semibold ${title} mb-3`}>✓ Recently Sent</h2>
          <div className="space-y-2">
            {sent.slice(0,5).map((s,i) => (
              <div key={i} className={`${light?"bg-green-50 border-green-100":"bg-green-500/5 border-green-500/20"} border rounded-xl p-3`}>
                <p className={`font-semibold ${title} text-sm`}>{s.title}</p>
                <p className={`${sub} text-xs`}>{new Date(s.sentAt).toLocaleTimeString("en-PH",{hour:"2-digit",minute:"2-digit"})}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminHistory({ orders, pendingOrders, onComplete, light }) {
  const bg = light ? "bg-white border border-gray-200 shadow-sm" : "bg-slate-800/60 border border-white/5";
  const title = light ? "text-gray-900" : "text-white";
  const sub = light ? "text-gray-400" : "text-slate-400";
  const revenue = orders.reduce((s,o) => s+o.grandTotal, 0);
  const allOrders = [...pendingOrders.map(o => ({...o})), ...orders].sort((a,b) => new Date(b.placedAt)-new Date(a.placedAt));

  return (
    <div className="space-y-4">
      <div><h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: "Syne, sans-serif" }}>Order History</h1></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{label:"Revenue",v:`₱${revenue.toLocaleString()}`},{label:"Orders",v:orders.length},{label:"Items Sold",v:orders.reduce((s,o)=>s+o.items.reduce((si,i)=>si+i.qty,0),0)},{label:"Pending",v:pendingOrders.length}].map(s => (
          <div key={s.label} className={`${bg} rounded-2xl p-4`}><p className={`text-xl font-bold ${title}`}>{s.v}</p><p className={`${sub} text-xs mt-0.5`}>{s.label}</p></div>
        ))}
      </div>
      <div className="space-y-3">
        {allOrders.length === 0 ? <div className={`${bg} rounded-2xl p-10 text-center`}><p className={`${sub}`}>No orders yet</p></div>
          : allOrders.map(o => (
            <div key={o.id} className={`${bg} rounded-2xl p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className={`font-bold ${title} text-sm`}>#{o.id.slice(-6).toUpperCase()}</p>
                  <p className={`${sub} text-xs`}>{new Date(o.placedAt).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"})}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${o.status==="completed"?"bg-green-500/10 text-green-500":"bg-orange-500/10 text-orange-500"}`}>{o.status==="completed"?"✓ Done":"⏳ Pending"}</span>
                  <p className="text-amber-500 font-bold text-sm mt-1">₱{o.grandTotal}</p>
                </div>
              </div>
              <p className={`${sub} text-xs`}>{o.items.reduce((s,i)=>s+i.qty,0)} items · {o.method} · {o.fulfillment}</p>
              {o.status === "pending" && (
                <button onClick={() => onComplete(o.id)} className="mt-2 w-full py-2 rounded-xl text-xs font-semibold bg-green-500 hover:bg-green-400 text-white">✓ Mark Complete</button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
