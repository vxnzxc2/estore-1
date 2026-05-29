import { useEffect, useState } from 'react'
import { ShoppingCart, TriangleAlert, ImageOff, Check, Plus, Minus, Zap, Star, Tag } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  product: Product
  qty: number                                      // current cart qty for this product
  onAdd: (product: Product, qty: number) => void  // add N to cart
  onBuyNow: (product: Product, qty: number) => void
  onRemove: (id: number) => void                  // remove entirely from cart
  onQtyChange: (id: number, qty: number) => void  // set exact cart qty
  light?: boolean
  highlight?: boolean
}

export default function ProductCard({ product, qty, onAdd, onBuyNow, onRemove, onQtyChange, light, highlight }: Props) {
  const [added,      setAdded]      = useState(false)
  const [imgError,   setImgError]   = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const isKg = product.stockUnit === 'kg'
  const STEP = isKg ? 0.1 : 1
  const MIN  = isKg ? 0.1 : 1
  const [pendingQty, setPendingQty] = useState<number>(MIN)

  // remaining = stock not yet in cart
  const remaining = parseFloat(Math.max(0, product.stock - qty).toFixed(2))

  // The stepper shows cart qty when in cart; otherwise it shows pending qty
  const displayQty = qty > 0 ? qty : pendingQty

  const fmtQty = (q: number) => isKg ? Number(q).toFixed(1) : String(q)

  useEffect(() => {
    if (qty === 0) {
      setPendingQty(MIN)
    }
  }, [qty, MIN])

  // + button: if not in cart yet, bump pending qty; otherwise increment cart qty
  const inc = () => {
    if (remaining <= 0) return
    if (qty === 0) {
      setPendingQty(prev => Math.min(parseFloat((prev + STEP).toFixed(2)), product.stock))
    } else {
      onQtyChange(product.id, parseFloat(Math.min(qty + STEP, product.stock).toFixed(2)))
    }
  }

  // - button: decrement cart qty; if it hits 0 remove from cart
  const dec = () => {
    if (qty > 0) {
      const next = parseFloat((qty - STEP).toFixed(2))
      if (next < MIN) {
        onRemove(product.id)
      } else {
        onQtyChange(product.id, next)
      }
      return
    }

    setPendingQty(prev => Math.max(parseFloat((prev - STEP).toFixed(2)), MIN))
  }

  // Direct input change on the stepper
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isKg) {
      const raw = e.target.value.replace(/[^0-9.]/g, '')
      const val = parseFloat(raw) || 0
      if (qty === 0) {
        setPendingQty(Math.min(Math.max(val || MIN, MIN), product.stock))
        return
      }
      if (val === 0) { onRemove(product.id); return }
      onQtyChange(product.id, parseFloat(Math.min(Math.max(val, MIN), product.stock).toFixed(2)))
    } else {
      const raw = e.target.value.replace(/[^0-9]/g, '')
      const val = raw === '' ? 0 : parseInt(raw)
      if (qty === 0) {
        setPendingQty(Math.min(Math.max(val === 0 ? MIN : val, 1), product.stock))
        return
      }
      if (val === 0) { onRemove(product.id); return }
      onQtyChange(product.id, Math.min(Math.max(val, 1), product.stock))
    }
  }

  // Cart button (only shown when not yet in cart)
  const handleAddToCart = () => {
    if (product.stock === 0 || remaining <= 0) return
    onAdd(product, Math.min(pendingQty, product.stock))
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const handleBuy = () => {
    if (product.stock === 0) return
    onBuyNow(product, qty > 0 ? qty : Math.min(pendingQty, product.stock))
  }

  const inCart       = qty > 0
  const isBestSeller = !!product.isBestseller
  const isPromo      = !!product.isPromo
  const isNew        = !!product.isNew

  const lowThreshold = isKg ? 1 : 5
  const isOut        = product.stock === 0
  const isMaxed      = !isOut && remaining <= 0
  const isLow        = !isOut && !isMaxed && remaining <= lowThreshold

  const card   = highlight
    ? light
      ? 'bg-amber-50 border-amber-300 shadow-lg shadow-amber-100'
      : 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
    : light
      ? 'bg-white border-gray-200 shadow-sm'
      : 'bg-slate-800/90 border-slate-700/60'
  const name   = light ? 'text-gray-900' : 'text-white'
  const sub    = light ? 'text-gray-400' : 'text-slate-500'
  const qtyBox = light ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-600'
  const qtyBtn = light
    ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30'
    : 'text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30'

  return (
    <>
      <div
        id={`product-${product.id}`}
        className={`product-card relative rounded-2xl overflow-hidden border-2 ${card} flex flex-col transition-all duration-300 ${highlight ? 'ring-2 ring-amber-400' : ''}`}
      >
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.badge && (
            <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-md">
              {product.badge}
            </span>
          )}
          {isBestSeller && (
            <span className="bg-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
              <Star size={8} strokeWidth={3} fill="white" /> Best Seller
            </span>
          )}
          {isPromo && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
              <Tag size={8} strokeWidth={3} /> Promo
            </span>
          )}
          {isNew && (
            <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-md">
              New!
            </span>
          )}
        </div>

        {/* Image */}
        <button
          className="img-zoom relative h-32 sm:h-36 overflow-hidden bg-gray-100 w-full"
          onClick={() => setShowDetail(true)}
        >
          {imgError ? (
            <div className={`w-full h-full flex items-center justify-center ${light ? 'bg-gray-100 text-gray-300' : 'bg-slate-700 text-slate-500'}`}>
              <ImageOff size={28} strokeWidth={1.5} />
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          )}
          <div className={`absolute inset-0 bg-gradient-to-t ${light ? 'from-white/50' : 'from-slate-900/70'} via-transparent to-transparent`} />
        </button>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          <button onClick={() => setShowDetail(true)} className="text-left">
            <p className={`font-semibold ${name} text-xs sm:text-sm leading-snug line-clamp-2 hover:text-amber-500 transition-colors`}>
              {product.name}
            </p>
            <p className={`${sub} text-[10px] mt-0.5`}>{product.category}</p>
          </button>

          {/* Price + live remaining stock */}
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>
              ₱{product.price}
              {isKg && <span className="text-[10px] font-medium text-amber-400/80">/kg</span>}
            </span>

            {isOut ? (
              <span className="text-[10px] text-red-500 font-semibold">Out of stock</span>
            ) : isMaxed ? (
              <span className="text-[10px] text-amber-500 font-semibold">Max in cart</span>
            ) : isLow ? (
              <span className="flex items-center gap-0.5 text-[10px] text-orange-400 font-semibold">
                <TriangleAlert size={9} strokeWidth={2} />
                {isKg ? `${remaining}kg` : `${remaining}`} left
              </span>
            ) : (
              <span className={`text-[10px] ${sub}`}>
                {isKg ? `${remaining} kg` : `${remaining}`} left
              </span>
            )}
          </div>

          {/* Stepper — shows cart qty, + adds to cart, - removes from cart */}
          <div className={`flex items-center ${qtyBox} border rounded-xl overflow-hidden`}>
            <button
              onClick={dec}
              disabled={qty <= 0}
              className={`w-9 h-9 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed shrink-0`}
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>
            <div className="flex-1 min-w-0 w-0 flex items-center justify-center gap-0.5">
              <input
                type="text"
                inputMode={isKg ? 'decimal' : 'numeric'}
                pattern={isKg ? '[0-9.]*' : '[0-9]*'}
                value={inCart ? fmtQty(displayQty) : '0'}
                onChange={handleInput}
                className={`min-w-0 w-0 flex-1 text-center text-sm font-bold bg-transparent outline-none tabular-nums py-1 ${
                  inCart
                    ? light ? 'text-gray-800' : 'text-white'
                    : light ? 'text-gray-300' : 'text-slate-600'
                }`}
              />
              {isKg && (
                <span className={`text-[10px] font-medium pr-1 shrink-0 ${light ? 'text-gray-400' : 'text-slate-500'}`}>
                  kg
                </span>
              )}
            </div>
            <button
              onClick={inc}
              disabled={isOut || isMaxed}
              className={`w-9 h-9 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed shrink-0`}
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5">
            {!inCart ? (
              <button
                onClick={handleAddToCart}
                disabled={isOut}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20'
                }`}
              >
                {added
                  ? <><Check size={11} strokeWidth={3} /> Added!</>
                  : <><ShoppingCart size={11} strokeWidth={2.5} /> Add to Cart</>
                }
              </button>
            ) : (
              <button
                onClick={() => onRemove(product.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  light
                    ? 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                }`}
              >
                Remove
              </button>
            )}
            <button
              onClick={handleBuy}
              disabled={isOut}
              className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 active:scale-95 ${
                light ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-600 hover:bg-slate-500 text-white'
              }`}
            >
              <Zap size={11} strokeWidth={2.5} /> Buy
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${light ? 'bg-white' : 'bg-slate-800'} rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up sm:animate-fade-up max-h-[85vh] flex flex-col`}>

            <div className="relative h-52 bg-gray-100 shrink-0">
              {imgError ? (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageOff size={48} strokeWidth={1} />
                </div>
              ) : (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center"
              >
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <p className="text-white font-bold text-xl leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {product.name}
                </p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>
                  ₱{product.price}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  isOut    ? 'bg-red-500/10 text-red-500'
                  : isMaxed  ? 'bg-amber-500/10 text-amber-500'
                  : isLow    ? 'bg-orange-500/10 text-orange-500'
                  : 'bg-green-500/10 text-green-500'
                }`}>
                  {isOut    ? 'Out of stock'
                  : isMaxed  ? 'Max in cart'
                  : isLow    ? `Only ${isKg ? `${remaining} kg` : remaining} left!`
                  : `${isKg ? `${remaining} kg` : remaining} available`}
                </span>
              </div>

              <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl ${light ? 'bg-gray-50' : 'bg-slate-900/50'}`}>
                <div>
                  <p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>Category</p>
                  <p className={`text-sm font-semibold ${light ? 'text-gray-800' : 'text-white'}`}>{product.category}</p>
                </div>
                <div>
                  <p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>Total stock</p>
                  <p className={`text-sm font-semibold ${light ? 'text-gray-800' : 'text-white'}`}>
                    {isKg ? `${product.stock} kg` : `${product.stock} units`}
                  </p>
                </div>
                {inCart && (
                  <div>
                    <p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>In your cart</p>
                    <p className="text-sm font-semibold text-amber-500">
                      {isKg ? `${Number(qty).toFixed(1)} kg` : `${qty} units`}
                    </p>
                  </div>
                )}
                {product.badge && (
                  <div>
                    <p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>Badge</p>
                    <p className="text-sm font-semibold text-amber-500">{product.badge}</p>
                  </div>
                )}
                {product.barcode && (
                  <div className="col-span-2">
                    <p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>Barcode</p>
                    <p className={`text-xs font-mono ${light ? 'text-gray-700' : 'text-slate-300'}`}>{product.barcode}</p>
                  </div>
                )}
              </div>

              {/* Modal stepper — same behaviour: shows cart qty */}
              <div className={`flex items-center ${qtyBox} border rounded-xl overflow-hidden`}>
                <button
                  onClick={dec}
                  disabled={qty <= 0}
                  className={`w-12 h-12 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed`}
                >
                  <Minus size={16} strokeWidth={2.5} />
                </button>
                <div className="flex-1 min-w-0 w-0 flex items-center justify-center gap-1">
                  <input
                    type="text"
                    inputMode={isKg ? 'decimal' : 'numeric'}
                    value={inCart ? fmtQty(displayQty) : '0'}
                    onChange={handleInput}
                    className={`min-w-0 w-0 flex-1 text-center text-lg font-bold bg-transparent outline-none tabular-nums ${
                      inCart
                        ? light ? 'text-gray-800' : 'text-white'
                        : light ? 'text-gray-300' : 'text-slate-600'
                    }`}
                  />
                  {isKg && (
                    <span className={`text-sm font-medium pr-2 shrink-0 ${light ? 'text-gray-400' : 'text-slate-500'}`}>
                      kg
                    </span>
                  )}
                </div>
                <button
                  onClick={inc}
                  disabled={isOut || isMaxed}
                  className={`w-12 h-12 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed`}
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex gap-2">
                {!inCart ? (
                  <button
                    onClick={() => { handleAddToCart(); setShowDetail(false) }}
                    disabled={isOut}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 shadow-lg shadow-amber-500/20"
                  >
                    <ShoppingCart size={15} strokeWidth={2.5} /> Add to Cart
                  </button>
                ) : (
                  <button
                    onClick={() => { onRemove(product.id); setShowDetail(false) }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold ${
                      light
                        ? 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    Remove from Cart
                  </button>
                )}
                <button
                  onClick={() => { handleBuy(); setShowDetail(false) }}
                  disabled={isOut}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 ${
                    light ? 'bg-slate-800 text-white' : 'bg-slate-600 text-white'
                  }`}
                >
                  <Zap size={15} strokeWidth={2.5} /> Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
