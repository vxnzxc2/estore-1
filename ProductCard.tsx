import { useState } from 'react'
import { ShoppingCart, TriangleAlert, ImageOff, Check, Plus, Minus, Zap, Star, Tag } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  product: Product
  qty: number
  onAdd: (product: Product, qty: number) => void
  onBuyNow: (product: Product, qty: number) => void
  onRemove: (id: number) => void
  light?: boolean
  highlight?: boolean
}

export default function ProductCard({ product, qty, onAdd, onBuyNow, light, highlight }: Props) {
  const [inputQty, setInputQty] = useState(1)
  const [added,    setAdded]    = useState(false)
  const [imgError, setImgError] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const inc = () => setInputQty(q => Math.min(q + 1, product.stock))
  const dec = () => setInputQty(q => Math.max(q - 1, 1))
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const val = raw === '' ? 1 : Math.min(parseInt(raw), product.stock)
    setInputQty(Math.max(1, val))
  }

  const handleAdd = () => {
    if (product.stock === 0) return
    onAdd(product, inputQty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const handleBuy = () => {
    if (product.stock === 0) return
    onBuyNow(product, inputQty)
  }

  const inCart = qty > 0
  const isBestSeller = product.category === 'Best Sellers'
  const isPromo      = product.category === 'Promos'
  const isNew        = product.category === 'New Arrivals'

  const card   = highlight
    ? light ? 'bg-amber-50 border-amber-300 shadow-lg shadow-amber-100' : 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
    : light ? 'bg-white border-gray-200 shadow-sm' : 'bg-slate-800/90 border-slate-700/60'
  const name   = light ? 'text-gray-900' : 'text-white'
  const sub    = light ? 'text-gray-400' : 'text-slate-500'
  const qtyBox = light ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-600'
  const qtyBtn = light ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30' : 'text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30'

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
            <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-md">New!</span>
          )}
        </div>
        {inCart && (
          <span className="absolute top-2 right-2 z-10 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
            <ShoppingCart size={8} strokeWidth={3} /> {qty}
          </span>
        )}

        {/* Image - tappable to show detail */}
        <button className="img-zoom relative h-32 sm:h-36 overflow-hidden bg-gray-100 w-full" onClick={() => setShowDetail(true)}>
          {imgError ? (
            <div className={`w-full h-full flex items-center justify-center ${light ? 'bg-gray-100 text-gray-300' : 'bg-slate-700 text-slate-500'}`}>
              <ImageOff size={28} strokeWidth={1.5} />
            </div>
          ) : (
            <img src={product.image} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
          )}
          <div className={`absolute inset-0 bg-gradient-to-t ${light ? 'from-white/50' : 'from-slate-900/70'} via-transparent to-transparent`} />
        </button>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          <button onClick={() => setShowDetail(true)} className="text-left">
            <p className={`font-semibold ${name} text-xs sm:text-sm leading-snug line-clamp-2 hover:text-amber-500 transition-colors`}>{product.name}</p>
            <p className={`${sub} text-[10px] mt-0.5`}>{product.category}</p>
          </button>

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>₱{product.price}</span>
            {product.stock === 0 ? (
              <span className="text-[10px] text-red-500 font-semibold">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-semibold">
                <TriangleAlert size={9} strokeWidth={2} /> {product.stock} left
              </span>
            ) : (
              <span className={`text-[10px] ${sub}`}>{product.stock} left</span>
            )}
          </div>

          {/* Qty stepper */}
          <div className={`flex items-center ${qtyBox} border rounded-xl overflow-hidden`}>
            <button onClick={dec} disabled={inputQty <= 1}
              className={`w-9 h-9 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed shrink-0`}>
              <Minus size={13} strokeWidth={2.5} />
            </button>
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={inputQty} onChange={handleInput}
              className={`flex-1 text-center text-sm font-bold bg-transparent outline-none tabular-nums py-1 ${light ? 'text-gray-800' : 'text-white'}`} />
            <button onClick={inc} disabled={inputQty >= product.stock}
              className={`w-9 h-9 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed shrink-0`}>
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5">
            <button onClick={handleAdd} disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                added ? 'bg-green-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20'
              }`}>
              {added ? <><Check size={11} strokeWidth={3} /> Added!</> : <><ShoppingCart size={11} strokeWidth={2.5} /> Cart</>}
            </button>
            <button onClick={handleBuy} disabled={product.stock === 0}
              className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 active:scale-95 ${light ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}>
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
                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={48} strokeWidth={1} /></div>
              ) : (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setShowDetail(false)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center">
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <p className="text-white font-bold text-xl leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>{product.name}</p>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>₱{product.price}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${product.stock === 0 ? 'bg-red-500/10 text-red-500' : product.stock <= 5 ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                  {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                </span>
              </div>
              <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl ${light ? 'bg-gray-50' : 'bg-slate-900/50'}`}>
                <div><p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>Category</p><p className={`text-sm font-semibold ${light ? 'text-gray-800' : 'text-white'}`}>{product.category}</p></div>
                <div><p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>Stock</p><p className={`text-sm font-semibold ${light ? 'text-gray-800' : 'text-white'}`}>{product.stock} units</p></div>
                {product.badge && <div><p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>Badge</p><p className="text-sm font-semibold text-amber-500">{product.badge}</p></div>}
                {product.barcode && <div><p className={`text-xs ${light ? 'text-gray-400' : 'text-slate-500'} mb-0.5`}>Barcode</p><p className={`text-xs font-mono ${light ? 'text-gray-700' : 'text-slate-300'}`}>{product.barcode}</p></div>}
              </div>
              {/* Qty & buttons */}
              <div className={`flex items-center ${qtyBox} border rounded-xl overflow-hidden`}>
                <button onClick={dec} disabled={inputQty <= 1} className={`w-12 h-12 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed`}><Minus size={16} strokeWidth={2.5} /></button>
                <input type="text" inputMode="numeric" value={inputQty} onChange={handleInput}
                  className={`flex-1 text-center text-lg font-bold bg-transparent outline-none tabular-nums ${light ? 'text-gray-800' : 'text-white'}`} />
                <button onClick={inc} disabled={inputQty >= product.stock} className={`w-12 h-12 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed`}><Plus size={16} strokeWidth={2.5} /></button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { handleAdd(); setShowDetail(false) }} disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 shadow-lg shadow-amber-500/20">
                  <ShoppingCart size={15} strokeWidth={2.5} /> Add to Cart
                </button>
                <button onClick={() => { handleBuy(); setShowDetail(false) }} disabled={product.stock === 0}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 ${light ? 'bg-slate-800 text-white' : 'bg-slate-600 text-white'}`}>
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
