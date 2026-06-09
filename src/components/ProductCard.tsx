import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { ShoppingCart, TriangleAlert, ImageOff, Plus, Minus, Zap, X } from 'lucide-react'
import type { Product } from '../types'
import PreOrderModal from './PreOrderModal'

interface Props {
  product: Product
  qty: number
  onAdd: (product: Product, qty: number) => void
  onBuyNow: (product: Product, qty: number) => void
  onRemove: (id: number) => void
  onQtyChange: (id: number, qty: number) => void
  onPreOrder?: (product: Product, qty: number) => void
  onLog?: (msg: string) => void
  onUpdateStock?: (id: number, stock: number) => void
  userRole?: 'owner' | 'employee' | 'buyer'
  light?: boolean
  highlight?: boolean
}

export default function ProductCard({
  product, qty, onAdd, onBuyNow, onRemove, onQtyChange, onPreOrder, onLog, onUpdateStock, userRole, light, highlight,
}: Props) {
  const [imgError,        setImgError]        = useState(false)
  const [showDetail,      setShowDetail]      = useState(false)
  const [spinnerActive,   setSpinnerActive]   = useState(false)
  const [localQty,        setLocalQty]        = useState(1)
  const [draft,           setDraft]           = useState<string | null>(null)
  const [showPreOrder,    setShowPreOrder]    = useState(false)
  const [showStockMgmt,   setShowStockMgmt]   = useState(false)
  const [stockEdit,       setStockEdit]       = useState(String(product.stock))

  const isStaff = userRole === 'owner' || userRole === 'employee'

  const isKg = product.stockUnit === 'kg'
  const STEP = isKg ? 0.1 : 1
  const MIN  = isKg ? 0.1 : 1

  // How many units are still available to add (not yet in cart)
  const remaining = parseFloat(Math.max(0, product.stock - qty).toFixed(2))
  const inCart    = qty > 0
  const isOut     = product.stock === 0
  const isMaxed   = !isOut && remaining <= 0
  const isLow     = !isOut && !isMaxed && remaining <= (isKg ? 1 : 5)

  const fmtQty = (q: number) => isKg ? Number(q).toFixed(1) : String(Math.round(q))

  const clamp = (q: number) =>
    parseFloat(Math.min(Math.max(q, MIN), Math.max(remaining, MIN)).toFixed(2))

  const normalizeLucideIcon = (name: string) => {
    if (!name) return 'Zap'
    if (LucideIcons[name as keyof typeof LucideIcons]) return name
    const normalized = name
      .split(/[-_\s]+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('')
    return LucideIcons[normalized as keyof typeof LucideIcons] ? normalized : 'Zap'
  }

  const renderLucideIcon = (name: string, props: any = {}) => {
    const normalized = normalizeLucideIcon(name)
    const Icon = LucideIcons[normalized as keyof typeof LucideIcons] as any
    return Icon ? <Icon {...props} /> : <Zap {...props} />
  }

  // ── Spinner +/- on the card ───────────────────────────────────────────────
  const spinnerInc = () => {
    if (remaining <= 0) return
    setLocalQty(q => clamp(parseFloat((q + STEP).toFixed(2))))
    setDraft(null)
  }
  const spinnerDec = () => {
    setLocalQty(q => {
      const next = parseFloat((q - STEP).toFixed(2))
      return next < MIN ? MIN : clamp(next)
    })
    setDraft(null)
  }
  const spinnerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value.replace(isKg ? /[^0-9.]/g : /[^0-9]/g, ''))
  }
  const spinnerCommit = () => {
    if (draft === null) return
    const val = isKg ? parseFloat(draft) : parseInt(draft)
    setLocalQty(!val || val < MIN ? MIN : clamp(val))
    setDraft(null)
  }

  // ── Cart button logic ─────────────────────────────────────────────────────
  // Not active  → show spinner (qty = 1), don't add yet
  // Active      → each tap adds +1 to localQty (like pressing +)
  const handleCartBtnClick = () => {
    if (isOut || isMaxed) return
    if (!spinnerActive) {
      setSpinnerActive(true)
      setLocalQty(clamp(STEP))
    } else {
      setLocalQty(q => clamp(parseFloat((q + STEP).toFixed(2))))
      setDraft(null)
    }
  }

  // Confirm spinner qty → push to cart
  const commitToCart = () => {
    if (isOut) return
    const final = clamp(localQty)
    if (!inCart) onAdd(product, final)
    else onQtyChange(product.id, parseFloat(Math.min(qty + final, product.stock).toFixed(2)))
    if (onLog) {
      const label = isKg ? `${Number(final).toFixed(1)} kg` : `${Math.round(final)}x`
      onLog(`Added ${label} ${product.name} to cart`)
    }
    setSpinnerActive(false)
    setLocalQty(STEP)
    setDraft(null)
  }

  // ── Buy button logic ──────────────────────────────────────────────────────
  // Not active  → show spinner (qty = 1), don't buy yet
  // Active      → buy immediately with localQty
  const handleBuyBtnClick = () => {
    if (isOut) return
    if (!spinnerActive) {
      setSpinnerActive(true)
      setLocalQty(clamp(STEP))
    } else {
      const final = clamp(localQty)
      if (!inCart) onAdd(product, final)
      else onQtyChange(product.id, parseFloat(Math.min(qty + final, product.stock).toFixed(2)))
      onBuyNow(product, final)
      if (onLog) {
        const label = isKg ? `${Number(final).toFixed(1)} kg` : `${Math.round(final)}x`
        onLog(`Bought ${label} ${product.name}`)
      }
      setSpinnerActive(false)
      setLocalQty(STEP)
      setDraft(null)
    }
  }

  const cancelSpinner = () => {
    setSpinnerActive(false)
    setLocalQty(STEP)
    setDraft(null)
  }

  // ── Modal stepper — edits the in-cart qty directly ────────────────────────
  const [modalDraft, setModalDraft] = useState<string | null>(null)

  const modalInc = () => {
    if (remaining <= 0) return
    onQtyChange(product.id, parseFloat(Math.min(qty + STEP, product.stock).toFixed(2)))
  }
  const modalDec = () => {
    const next = parseFloat((qty - STEP).toFixed(2))
    if (next < MIN) onRemove(product.id)
    else onQtyChange(product.id, next)
  }
  const modalCommit = () => {
    if (modalDraft === null) return
    const val = isKg ? parseFloat(modalDraft) : parseInt(modalDraft)
    if (!val || val <= 0) { onRemove(product.id); setModalDraft(null); return }
    const clamped = parseFloat(Math.min(Math.max(val, MIN), product.stock).toFixed(2))
    onQtyChange(product.id, clamped)
    setModalDraft(null)
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const card = highlight
    ? light ? 'bg-amber-50 border-amber-300 shadow-lg' : 'bg-amber-500/10 border-amber-500/50 shadow-lg'
    : light ? 'bg-white border-gray-200 shadow-sm'     : 'bg-slate-800/90 border-slate-700/60'
  const nameC  = light ? 'text-gray-900' : 'text-white'
  const sub    = light ? 'text-gray-400' : 'text-slate-500'
  const qtyBox = light ? 'bg-gray-100 border-gray-200' : 'bg-[#0d1424] border-slate-600'

  const iconBtn = (disabled: boolean) =>
    `flex items-center justify-center rounded-full w-9 h-9 shrink-0 transition-all active:scale-90 border ${
      disabled
        ? 'opacity-30 cursor-not-allowed border-transparent'
        : light
          ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100 shadow-sm'
          : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
    }`

  const modalBtn = (disabled: boolean) =>
    `w-12 h-12 flex items-center justify-center transition-colors ${
      disabled
        ? 'opacity-30 cursor-not-allowed'
        : light
          ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
    }`

  const spinnerDisplayVal = draft !== null ? draft : fmtQty(localQty)
  const spinnerMaxed      = localQty >= remaining && remaining > 0
  const spinnerAtMin      = localQty <= MIN

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div
        id={`product-${product.id}`}
        className={`product-card relative rounded-2xl overflow-hidden border-2 ${card} flex flex-col transition-all duration-300 ${highlight ? 'ring-2 ring-amber-400' : ''}`}
      >
        {/* Left badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.badge && (
            <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-md">
              {product.badge}
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
              {renderLucideIcon(product.isBestsellerIcon || 'Star', { size: 8, strokeWidth: 2.5, className: 'text-white' })}
              Best
            </span>
          )}
          {product.isPromo && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
              {renderLucideIcon(product.isPromoIcon || 'Flame', { size: 8, strokeWidth: 2.5, className: 'text-white' })}
              Promo
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
              {renderLucideIcon(product.isNewIcon || 'Zap', { size: 8, strokeWidth: 2.5, className: 'text-white' })}
              New!
            </span>
          )}
          {product.featuredTags?.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {(product.featuredTags || []).map(tag => (
                <span key={tag.id} className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                  {renderLucideIcon(tag.icon, { size: 8, strokeWidth: 2.5, className: 'text-white' })}
                  {tag.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Cart qty pill + staff stock mgmt top-right */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          {inCart && (
            <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-md flex items-center gap-0.5">
              <ShoppingCart size={8} strokeWidth={3} />
              {isKg ? `${Number(qty).toFixed(1)}kg` : qty}
            </span>
          )}
          {isStaff && (
            <button
              onClick={e => { e.stopPropagation(); setShowStockMgmt(true) }}
              className="bg-blue-500 hover:bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-md flex items-center gap-1 transition-colors"
              title="Manage stock"
            >
              📦 {product.stock}
            </button>
          )}
        </div>

        {/* Image */}
        <button
          className="img-zoom relative h-32 sm:h-36 overflow-hidden bg-gray-100 w-full"
          onClick={() => setShowDetail(true)}
        >
          {imgError
            ? <div className={`w-full h-full flex items-center justify-center ${light ? 'bg-gray-100 text-gray-300' : 'bg-slate-700 text-slate-500'}`}>
                <ImageOff size={28} strokeWidth={1.5} />
              </div>
            : <img src={product.image} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
          }
          <div className={`absolute inset-0 bg-gradient-to-t ${light ? 'from-white/50' : 'from-slate-900/70'} via-transparent to-transparent`} />
        </button>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1 gap-2">

          {/* Name + category */}
          <button onClick={() => setShowDetail(true)} className="text-left">
            <p className={`font-semibold ${nameC} text-xs sm:text-sm leading-snug line-clamp-2 hover:text-amber-500 transition-colors`}>
              {product.name}
            </p>
            <p className={`${sub} text-[10px] mt-0.5`}>{product.category}</p>
          </button>

          {/* Price + live remaining */}
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
              <span className={`text-[10px] ${sub}`}>
                {isKg ? `${remaining} kg` : remaining} left
              </span>
            )}
          </div>

          {/* ── Spinner + buttons pinned to bottom ── */}
          <div className="mt-auto flex flex-col gap-2">
          {spinnerActive && (
            <>
              <div className={`flex items-center gap-2 ${qtyBox} border rounded-2xl px-2 py-1.5`}>
                {/* − */}
                <button onClick={spinnerDec} disabled={spinnerAtMin} className={iconBtn(spinnerAtMin)}>
                  <Minus size={13} strokeWidth={2.5} />
                </button>

                {/* Editable number */}
                <div className="flex-1 flex items-center justify-center gap-0.5">
                  <input
                    type="text"
                    inputMode={isKg ? 'decimal' : 'numeric'}
                    value={spinnerDisplayVal}
                    onChange={spinnerInput}
                    onFocus={() => setDraft(fmtQty(localQty))}
                    onBlur={spinnerCommit}
                    onKeyDown={e => e.key === 'Enter' && spinnerCommit()}
                    className={`w-10 text-center text-base font-bold bg-transparent outline-none tabular-nums ${light ? 'text-gray-800' : 'text-white'}`}
                  />
                  {isKg && <span className={`text-[10px] font-medium ${sub}`}>kg</span>}
                </div>

                {/* + */}
                <button onClick={spinnerInc} disabled={spinnerMaxed || remaining <= 0} className={iconBtn(spinnerMaxed || remaining <= 0)}>
                  <Plus size={13} strokeWidth={2.5} />
                </button>

                {/* ✕ cancel */}
                <button
                  onClick={cancelSpinner}
                  className={`w-6 h-6 flex items-center justify-center rounded-full shrink-0 transition-colors ${
                    light ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-600 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
              <button
                onClick={commitToCart}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-xs transition-colors active:scale-95 shadow-md"
              >
                <Plus size={13} strokeWidth={2.5} />
                Add Product
              </button>
            </>
          )}

          {/* ── Staff: Stock Input | Buyers: Cart + Buy buttons ── */}
          {isStaff ? (
            <div className="space-y-2">
              {/* Status Badge */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                product.stock === 0
                  ? 'bg-red-500/10 text-red-500'
                  : product.stock <= 5
                    ? 'bg-orange-500/10 text-orange-500'
                    : 'bg-green-500/10 text-green-500'
              }`}>
                <span>{product.stock === 0 ? '❌ Out of Stock' : product.stock <= 5 ? '⚠️ Low Stock' : '✅ In Stock'}</span>
                <span className="font-bold text-sm">{product.stock}</span>
              </div>

              {/* Stock Input */}
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="0"
                  step={isKg ? '0.1' : '1'}
                  placeholder="Qty to add"
                  value={stockEdit}
                  onChange={e => setStockEdit(e.target.value)}
                  className={`flex-1 border rounded-xl px-3 py-2 text-sm font-semibold text-center outline-none transition-colors ${
                    light
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-slate-900 border-slate-600 text-white'
                  }`}
                />
                <button
                  onClick={() => {
                    const addQty = parseFloat(stockEdit) || 0;
                    if (addQty > 0 && onUpdateStock) {
                      onUpdateStock(product.id, product.stock + addQty);
                      setStockEdit('');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-xs transition-colors active:scale-95"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {isOut ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPreOrder(true) }}
                  disabled={!onPreOrder}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold transition-all active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={11} strokeWidth={2.5} />
                  Pre-Order Now
                </button>
              ) : (
                <div className="flex gap-1.5">
                  {/* Cart button */}
                  <button
                    onClick={spinnerActive ? commitToCart : handleCartBtnClick}
                    disabled={!spinnerActive && isMaxed}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                      spinnerActive
                        ? 'bg-green-500 hover:bg-green-400 text-white shadow-md shadow-green-500/20'
                        : 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20'
                    }`}
                  >
                    <ShoppingCart size={11} strokeWidth={2.5} />
                    {spinnerActive ? 'Add to Cart' : 'Cart'}
                  </button>

                  {/* Buy button */}
                  <button
                    onClick={handleBuyBtnClick}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all active:scale-95 ${
                      spinnerActive
                        ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20'
                        : light
                          ? 'bg-slate-800 hover:bg-slate-700 text-white'
                          : 'bg-slate-600 hover:bg-slate-500 text-white'
                    }`}
                  >
                    <Zap size={11} strokeWidth={2.5} /> Buy
                  </button>
                </div>
              )}
            </>
          )}
          </div>{/* end mt-auto wrapper */}

        </div>
      </div>

      {/* ── Pre-Order Modal ───────────────────────────────────────────────── */}
      {showPreOrder && (
        <PreOrderModal
          product={product}
          light={light}
          onConfirm={(p, preOrderQty) => {
            if (onPreOrder) {
              onPreOrder(p, preOrderQty)
            }
            setShowPreOrder(false)
          }}
          onCancel={() => setShowPreOrder(false)}
        />
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${light ? 'bg-white' : 'bg-slate-800'} rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up sm:animate-fade-up max-h-[85vh] flex flex-col`}>

            {/* Header image */}
            <div className="relative h-52 bg-gray-100 shrink-0">
              {imgError
                ? <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={48} strokeWidth={1} /></div>
                : <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center"
              >✕</button>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <p className="text-white font-bold text-xl leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {product.name}
                </p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Price + status */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>
                  ₱{product.price}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  isOut    ? 'bg-red-500/10 text-red-500'
                  : isMaxed ? 'bg-amber-500/10 text-amber-500'
                  : isLow   ? 'bg-orange-500/10 text-orange-500'
                  :           'bg-green-500/10 text-green-500'
                }`}>
                  {isOut    ? 'Out of stock'
                  : isMaxed  ? 'Max in cart'
                  : isLow    ? `Only ${isKg ? `${remaining} kg` : remaining} left!`
                  :            `${isKg ? `${remaining} kg` : remaining} available`}
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
                  <p className={`text-sm font-semibold ${nameC}`}>
                    {isKg ? `${product.stock} kg` : `${product.stock} units`}
                  </p>
                </div>
                {inCart && (
                  <div>
                    <p className={`text-xs ${sub} mb-0.5`}>In your cart</p>
                    <p className="text-sm font-semibold text-amber-500">
                      {isKg ? `${Number(qty).toFixed(1)} kg` : `${qty} units`}
                    </p>
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
                    <p className={`text-xs font-mono ${light ? 'text-gray-700' : 'text-slate-300'}`}>
                      {product.barcode}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal stepper — controls in-cart qty */}
              <div className={`flex items-center ${qtyBox} border rounded-xl overflow-hidden`}>
                <button onClick={modalDec} disabled={!inCart} className={modalBtn(!inCart)}>
                  <Minus size={16} strokeWidth={2.5} />
                </button>
                <div className="flex-1 flex items-center justify-center gap-1">
                  <input
                    type="text"
                    inputMode={isKg ? 'decimal' : 'numeric'}
                    value={modalDraft !== null ? modalDraft : (inCart ? fmtQty(qty) : '0')}
                    onChange={e => setModalDraft(e.target.value.replace(isKg ? /[^0-9.]/g : /[^0-9]/g, ''))}
                    onFocus={() => setModalDraft(inCart ? fmtQty(qty) : '')}
                    onBlur={modalCommit}
                    onKeyDown={e => e.key === 'Enter' && modalCommit()}
                    className={`w-16 text-center text-lg font-bold bg-transparent outline-none tabular-nums ${
                      inCart
                        ? light ? 'text-gray-800' : 'text-white'
                        : light ? 'text-gray-300' : 'text-slate-600'
                    }`}
                  />
                  {isKg && <span className={`text-sm font-medium ${sub}`}>kg</span>}
                </div>
                <button onClick={modalInc} disabled={isOut || isMaxed} className={modalBtn(isOut || isMaxed)}>
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
              <p className={`text-[10px] ${sub} text-center -mt-2`}>
                Max: {isKg ? `${product.stock} kg` : `${product.stock} units`} · tap number to type
              </p>

              {/* Modal action buttons */}
              {isOut ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetail(false)
                    setShowPreOrder(true)
                  }}
                  disabled={!onPreOrder}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={15} strokeWidth={2.5} /> Pre-Order Now
                </button>
              ) : (
                <div className="flex gap-2">
                  {!inCart ? (
                    <button
                      onClick={() => { commitToCart(); setShowDetail(false) }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20"
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
                    onClick={() => { handleBuyBtnClick(); setShowDetail(false) }}
                    className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold ${
                      light ? 'bg-slate-800 text-white' : 'bg-slate-600 text-white'
                    }`}
                  >
                    <Zap size={15} strokeWidth={2.5} /> Buy
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Stock Management Modal (Staff Only) ─────────────────────────── */}
      {isStaff && showStockMgmt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`${light ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'} rounded-2xl p-6 max-w-sm w-full space-y-4`}>
            <div>
              <h3 className={`text-lg font-bold ${light ? 'text-gray-900' : 'text-white'}`}>
                Manage Stock
              </h3>
              <p className={`text-sm ${light ? 'text-gray-500' : 'text-slate-400'} mt-1`}>
                {product.name}
              </p>
            </div>

            {/* Stock Display */}
            <div className={`p-4 rounded-xl ${light ? 'bg-gray-50' : 'bg-slate-700/30'}`}>
              <p className={`text-xs ${light ? 'text-gray-500' : 'text-slate-400'} mb-2`}>Current Stock</p>
              <p className="text-3xl font-bold text-amber-500">{product.stock}</p>
            </div>

            {/* Quick Adjust */}
            <div className="space-y-2">
              <p className={`text-xs font-semibold ${light ? 'text-gray-500' : 'text-slate-400'} uppercase`}>Quick Adjust</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onUpdateStock) onUpdateStock(product.id, Math.max(0, product.stock - 1));
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors ${
                    light
                      ? 'bg-white border border-gray-300 hover:bg-gray-50'
                      : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  <Minus size={16} /> 1
                </button>
                <button
                  onClick={() => {
                    if (onUpdateStock) onUpdateStock(product.id, product.stock + 1);
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors ${
                    light
                      ? 'bg-white border border-gray-300 hover:bg-gray-50'
                      : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  <Plus size={16} /> 1
                </button>
              </div>
            </div>

            {/* Manual Input */}
            <div className="space-y-2">
              <p className={`text-xs font-semibold ${light ? 'text-gray-500' : 'text-slate-400'} uppercase`}>Set Exact Quantity</p>
              <input
                type="number"
                min="0"
                value={stockEdit}
                onChange={e => setStockEdit(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-center text-lg font-bold outline-none transition-colors ${
                  light
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-slate-900 border-slate-600 text-white'
                }`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const newStock = parseInt(stockEdit) || 0;
                  if (onUpdateStock) onUpdateStock(product.id, Math.max(0, newStock));
                  setShowStockMgmt(false);
                  setStockEdit(String(product.stock));
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2 rounded-xl transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowStockMgmt(false);
                  setStockEdit(String(product.stock));
                }}
                className={`flex-1 border rounded-xl font-semibold py-2 transition-colors ${
                  light
                    ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    : 'border-slate-600 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
