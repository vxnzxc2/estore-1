import { useState } from 'react'
import { ShoppingCart, TriangleAlert, ImageOff, Check, Plus, Minus, Zap, Star, Tag, X } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  product: Product
  qty: number
  onAdd: (product: Product, qty: number) => void
  onBuyNow: (product: Product, qty: number) => void
  onRemove: (id: number) => void
  onQtyChange: (id: number, qty: number) => void
  light?: boolean
  highlight?: boolean
}

export default function ProductCard({
  product, qty, onAdd, onBuyNow, onRemove, onQtyChange, light, highlight,
}: Props) {
  const [imgError,   setImgError]   = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  // draft holds the raw string while user is typing in the modal stepper
  const [draft, setDraft] = useState<string | null>(null)

  const isKg = product.stockUnit === 'kg'
  const STEP = isKg ? 0.1 : 1
  const MIN  = isKg ? 0.1 : 1

  const remaining = parseFloat(Math.max(0, product.stock - qty).toFixed(2))
  const inCart    = qty > 0

  const fmtQty = (q: number) => isKg ? Number(q).toFixed(1) : String(Math.round(q))

  const isOut    = product.stock === 0
  const isMaxed  = !isOut && remaining <= 0
  const isLow    = !isOut && !isMaxed && remaining <= (isKg ? 1 : 5)

  // ── Card stepper (only visible when inCart) ───────────────────────────────
  const cardInc = () => {
    if (remaining <= 0) return
    onQtyChange(product.id, parseFloat(Math.min(qty + STEP, product.stock).toFixed(2)))
  }
  const cardDec = () => {
    const next = parseFloat((qty - STEP).toFixed(2))
    if (next < MIN) onRemove(product.id)
    else onQtyChange(product.id, next)
  }

  // ── Add to cart (first time) ──────────────────────────────────────────────
  const handleAddToCart = () => {
    if (isOut || remaining <= 0) return
    onAdd(product, STEP)
  }
  const handleBuyNow = () => {
    if (isOut) return
    if (inCart) onBuyNow(product, qty)
    else { onAdd(product, STEP); onBuyNow(product, STEP) }
  }

  // ── Modal stepper with draft input ───────────────────────────────────────
  const modalInc = () => {
    if (remaining <= 0) return
    const next = parseFloat(Math.min(qty + STEP, product.stock).toFixed(2))
    onQtyChange(product.id, next)
    setDraft(fmtQty(next))
  }
  const modalDec = () => {
    const next = parseFloat((qty - STEP).toFixed(2))
    if (next < MIN) { onRemove(product.id); setDraft('0') }
    else { onQtyChange(product.id, next); setDraft(fmtQty(next)) }
  }
  const modalHandleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(isKg ? /[^0-9.]/g : /[^0-9]/g, '')
    setDraft(raw)
  }
  const modalCommit = () => {
    if (draft === null) return
    const val = isKg ? parseFloat(draft) : parseInt(draft)
    if (!val || val <= 0) { onRemove(product.id); setDraft('0'); return }
    const clamped = parseFloat(Math.min(Math.max(val, MIN), product.stock).toFixed(2))
    if (!inCart) onAdd(product, clamped)
    else onQtyChange(product.id, clamped)
    setDraft(fmtQty(clamped))
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const card   = highlight
    ? light ? 'bg-amber-50 border-amber-300 shadow-lg' : 'bg-amber-500/10 border-amber-500/50 shadow-lg'
    : light ? 'bg-white border-gray-200 shadow-sm'     : 'bg-slate-800/90 border-slate-700/60'
  const nameC  = light ? 'text-gray-900' : 'text-white'
  const sub    = light ? 'text-gray-400' : 'text-slate-500'
  const qtyBox = light ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-600'
  const qtyBtn = (disabled: boolean) =>
    `w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${disabled
      ? 'opacity-30 cursor-not-allowed'
      : light
        ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300'
        : 'text-slate-400 hover:bg-slate-700 hover:text-white active:bg-slate-600'}`

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────────── */}
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
          {product.isBestseller && (
            <span className="bg-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
              <Star size={8} strokeWidth={3} fill="white" /> Best
            </span>
          )}
          {product.isPromo && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
              <Tag size={8} strokeWidth={3} /> Promo
            </span>
          )}
          {product.isNew && (
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
          {imgError
            ? <div className={`w-full h-full flex items-center justify-center ${light ? 'bg-gray-100 text-gray-300' : 'bg-slate-700 text-slate-500'}`}><ImageOff size={28} strokeWidth={1.5} /></div>
            : <img src={product.image} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />}
          <div className={`absolute inset-0 bg-gradient-to-t ${light ? 'from-white/50' : 'from-slate-900/70'} via-transparent to-transparent`} />
        </button>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          <button onClick={() => setShowDetail(true)} className="text-left">
            <p className={`font-semibold ${nameC} text-xs sm:text-sm leading-snug line-clamp-2 hover:text-amber-500 transition-colors`}>
              {product.name}
            </p>
            <p className={`${sub} text-[10px] mt-0.5`}>{product.category}</p>
          </button>

          {/* Price + stock */}
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
                {isKg ? `${remaining}kg` : remaining} left
              </span>
            ) : (
              <span className={`text-[10px] ${sub}`}>{isKg ? `${remaining} kg` : remaining} left</span>
            )}
          </div>

          {/* ── Stepper (only when in cart) OR action buttons ── */}
          {inCart ? (
            /* Cart stepper row */
            <div className={`flex items-center gap-1.5 ${qtyBox} border rounded-xl overflow-hidden px-1`}>
              <button onClick={cardDec} className={qtyBtn(false)}>
                {qty <= MIN ? <X size={11} strokeWidth={2.5} /> : <Minus size={11} strokeWidth={2.5} />}
              </button>
              <span className={`flex-1 text-center text-sm font-bold tabular-nums ${light ? 'text-gray-800' : 'text-white'}`}>
                {fmtQty(qty)}{isKg ? ' kg' : ''}
              </span>
              <button onClick={cardInc} disabled={isMaxed} className={qtyBtn(isMaxed)}>
                <Plus size={11} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => onRemove(product.id)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ml-0.5 transition-colors ${
                  light ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                }`}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            /* Add to Cart + Buy buttons */
            <div className="flex gap-1.5">
              <button
                onClick={handleAddToCart}
                disabled={isOut}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20`}
              >
                <ShoppingCart size={11} strokeWidth={2.5} /> Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOut}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 active:scale-95 ${
                  light ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-600 hover:bg-slate-500 text-white'
                }`}
              >
                <Zap size={11} strokeWidth={2.5} /> Buy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${light ? 'bg-white' : 'bg-slate-800'} rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up sm:animate-fade-up max-h-[85vh] flex flex-col`}>

            {/* Header image */}
            <div className="relative h-52 bg-gray-100 shrink-0">
              {imgError
                ? <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={48} strokeWidth={1} /></div>
                : <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setShowDetail(false)} className="absolute top-3 right-3 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center">✕</button>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <p className="text-white font-bold text-xl leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>{product.name}</p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Price + availability */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>₱{product.price}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  isOut ? 'bg-red-500/10 text-red-500' : isMaxed ? 'bg-amber-500/10 text-amber-500' : isLow ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {isOut ? 'Out of stock' : isMaxed ? 'Max in cart' : isLow ? `Only ${isKg ? `${remaining} kg` : remaining} left!` : `${isKg ? `${remaining} kg` : remaining} available`}
                </span>
              </div>

              {/* Detail grid */}
              <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl ${light ? 'bg-gray-50' : 'bg-slate-900/50'}`}>
                <div>
                  <p className={`text-xs ${sub} mb-0.5`}>Category</p>
                  <p className={`text-sm font-semibold ${nameC}`}>{product.category}</p>
                </div>
                <div>
                  <p className={`text-xs ${sub} mb-0.5`}>Total stock</p>
                  <p className={`text-sm font-semibold ${nameC}`}>{isKg ? `${product.stock} kg` : `${product.stock} units`}</p>
                </div>
                {inCart && (
                  <div>
                    <p className={`text-xs ${sub} mb-0.5`}>In your cart</p>
                    <p className="text-sm font-semibold text-amber-500">{isKg ? `${Number(qty).toFixed(1)} kg` : `${qty} units`}</p>
                  </div>
                )}
                {product.badge && (
                  <div>
                    <p className={`text-xs ${sub} mb-0.5`}>Badge</p>
                    <p className="text-sm font-semibold text-amber-500">{product.badge}</p>
                  </div>
                )}
                {product.barcode && (
                  <div className="col-span-2">
                    <p className={`text-xs ${sub} mb-0.5`}>Barcode</p>
                    <p className={`text-xs font-mono ${light ? 'text-gray-700' : 'text-slate-300'}`}>{product.barcode}</p>
                  </div>
                )}
              </div>

              {/* Modal stepper with draft input — always visible in modal */}
              <div className={`flex items-center ${qtyBox} border rounded-xl overflow-hidden`}>
                <button onClick={modalDec} disabled={!inCart} className={`w-12 h-12 flex items-center justify-center transition-colors ${qtyBtn(!inCart)}`}>
                  <Minus size={16} strokeWidth={2.5} />
                </button>
                <div className="flex-1 flex items-center justify-center gap-1">
                  <input
                    type="text"
                    inputMode={isKg ? 'decimal' : 'numeric'}
                    value={draft !== null ? draft : (inCart ? fmtQty(qty) : '0')}
                    onChange={modalHandleInput}
                    onFocus={() => setDraft(inCart ? fmtQty(qty) : '')}
                    onBlur={modalCommit}
                    onKeyDown={e => e.key === 'Enter' && modalCommit()}
                    className={`w-16 text-center text-lg font-bold bg-transparent outline-none tabular-nums ${
                      inCart ? (light ? 'text-gray-800' : 'text-white') : (light ? 'text-gray-300' : 'text-slate-600')
                    }`}
                  />
                  {isKg && <span className={`text-sm font-medium ${sub}`}>kg</span>}
                </div>
                <button onClick={modalInc} disabled={isOut || isMaxed} className={`w-12 h-12 flex items-center justify-center transition-colors ${qtyBtn(isOut || isMaxed)}`}>
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
              <p className={`text-[10px] ${sub} text-center -mt-2`}>
                Max: {isKg ? `${product.stock} kg` : `${product.stock} units`} · tap number to type
              </p>

              {/* Modal action buttons */}
              <div className="flex gap-2">
                {!inCart ? (
                  <button
                    onClick={() => { handleAddToCart(); }}
                    disabled={isOut}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 shadow-lg shadow-amber-500/20"
                  >
                    <ShoppingCart size={15} strokeWidth={2.5} /> Add to Cart
                  </button>
                ) : (
                  <button
                    onClick={() => { onRemove(product.id); setShowDetail(false) }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold ${
                      light ? 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100' : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    Remove from Cart
                  </button>
                )}
                <button
                  onClick={() => { handleBuyNow(); setShowDetail(false) }}
                  disabled={isOut}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 ${light ? 'bg-slate-800 text-white' : 'bg-slate-600 text-white'}`}
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
