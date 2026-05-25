import { useState } from 'react'
import { ShoppingCart, TriangleAlert, ImageOff, Check } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  product: Product
  qty: number
  onAdd: (product: Product, qty: number) => void
  onRemove: (id: number) => void
  light?: boolean
}

export default function ProductCard({ product, qty, onAdd, light }: Props) {
  const [added,    setAdded]    = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleAdd = () => {
    onAdd(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const inCart = qty > 0
  const card   = light ? 'bg-white border-gray-200 shadow-sm'   : 'bg-slate-800/80 border-slate-700/60'
  const name   = light ? 'text-gray-900'                         : 'text-white'
  const cat    = light ? 'text-gray-400'                         : 'text-slate-500'
  const stock  = light ? 'text-gray-400'                         : 'text-slate-500'

  return (
    <div className={`product-card relative rounded-2xl overflow-hidden border ${card} flex flex-col group transition-colors duration-300`}>

      {product.badge && (
        <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
          {product.badge}
        </span>
      )}

      {inCart && (
        <span className="absolute top-3 right-3 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
          <ShoppingCart size={10} strokeWidth={3} /> {qty}
        </span>
      )}

      <div className="img-zoom relative h-40 overflow-hidden bg-gray-100">
        {imgError ? (
          <div className={`w-full h-full flex items-center justify-center ${light ? 'bg-gray-100 text-gray-300' : 'bg-slate-700 text-slate-500'}`}>
            <ImageOff size={36} strokeWidth={1.5} />
          </div>
        ) : (
          <img src={product.image} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${light ? 'from-white/40' : 'from-slate-900/70'} via-transparent to-transparent`} />
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <p className={`font-semibold ${name} text-sm leading-snug`}>{product.name}</p>
          <p className={`${cat} text-xs mt-0.5`}>{product.category}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>
            ₱{product.price}
          </span>
          {product.stock <= 5 ? (
            <span className="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
              <TriangleAlert size={10} strokeWidth={2} /> {product.stock} left
            </span>
          ) : (
            <span className={`text-[10px] ${stock}`}>{product.stock} in stock</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            added
              ? 'bg-green-500 text-white'
              : light
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md shadow-amber-500/20'
          }`}
        >
          {added
            ? <><Check size={14} strokeWidth={3} /> Added!</>
            : <><ShoppingCart size={14} strokeWidth={2.5} /> Add to Cart</>}
        </button>
      </div>
    </div>
  )
}
