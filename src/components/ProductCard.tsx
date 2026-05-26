import { useState } from 'react'
import { ShoppingCart, TriangleAlert, ImageOff, Check, Plus, Minus, Zap } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  product: Product
  qty: number
  onAdd: (product: Product, qty: number) => void
  onBuyNow: (product: Product, qty: number) => void
  onRemove: (id: number) => void
  light?: boolean
}

export default function ProductCard({ product, qty, onAdd, onBuyNow, light }: Props) {
  const [inputQty, setInputQty] = useState(1)
  const [added,    setAdded]    = useState(false)
  const [imgError, setImgError] = useState(false)

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
  const card   = light ? 'bg-white border-gray-200 shadow-sm'  : 'bg-slate-800/90 border-slate-700/60'
  const name   = light ? 'text-gray-900'                       : 'text-white'
  const sub    = light ? 'text-gray-400'                       : 'text-slate-500'
  const qtyBox = light ? 'bg-gray-100 border-gray-200'         : 'bg-slate-900 border-slate-600'
  const qtyBtn = light ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30' : 'text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30'

  return (
    <div className={`product-card relative rounded-2xl overflow-hidden border ${card} flex flex-col`}>
      {product.badge && (
        <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-md">
          {product.badge}
        </span>
      )}
      {inCart && (
        <span className="absolute top-2 right-2 z-10 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
          <ShoppingCart size={8} strokeWidth={3} /> {qty}
        </span>
      )}

      {/* Image */}
      <div className="img-zoom relative h-32 sm:h-36 overflow-hidden bg-gray-100">
        {imgError ? (
          <div className={`w-full h-full flex items-center justify-center ${light ? 'bg-gray-100 text-gray-300' : 'bg-slate-700 text-slate-500'}`}>
            <ImageOff size={28} strokeWidth={1.5} />
          </div>
        ) : (
          <img src={product.image} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${light ? 'from-white/50' : 'from-slate-900/70'} via-transparent to-transparent`} />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <p className={`font-semibold ${name} text-xs sm:text-sm leading-snug line-clamp-2`}>{product.name}</p>
          <p className={`${sub} text-[10px] mt-0.5`}>{product.category}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>
            ₱{product.price}
          </span>
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
            className={`w-8 h-8 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed shrink-0`}>
            <Minus size={12} strokeWidth={2.5} />
          </button>
          <input
            type="text" inputMode="numeric" pattern="[0-9]*"
            value={inputQty}
            onChange={handleInput}
            className={`flex-1 text-center text-sm font-bold bg-transparent outline-none tabular-nums py-1 ${light ? 'text-gray-800' : 'text-white'}`}
          />
          <button onClick={inc} disabled={inputQty >= product.stock}
            className={`w-8 h-8 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed shrink-0`}>
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* Buttons row */}
        <div className="flex gap-1.5">
          <button onClick={handleAdd} disabled={product.stock === 0}
            className={`btn-press flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              added ? 'bg-green-500 text-white' : light ? 'bg-amber-500 hover:bg-amber-400 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-900'
            }`}>
            {added ? <><Check size={11} strokeWidth={3} /> Added!</> : <><ShoppingCart size={11} strokeWidth={2.5} /> Cart</>}
          </button>
          <button onClick={handleBuy} disabled={product.stock === 0}
            className={`btn-press flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              light ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-600 hover:bg-slate-500 text-white'
            }`}>
            <Zap size={11} strokeWidth={2.5} /> Buy
          </button>
        </div>
      </div>
    </div>
  )
}
