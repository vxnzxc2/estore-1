import { useState } from 'react'
import type { Product } from '../types'

interface Props {
  product: Product
  qty: number
  onAdd: (product: Product) => void
}

export default function ProductCard({ product, qty, onAdd }: Props) {
  const [bouncing, setBouncing] = useState(false)

  const handleAdd = () => {
    onAdd(product)
    setBouncing(true)
    setTimeout(() => setBouncing(false), 300)
  }

  return (
    <div className="card-hover relative rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white flex flex-col">
      {/* Badge */}
      {product.badge && (
        <span className="animate-pulse-badge absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wide">
          {product.badge}
        </span>
      )}

      {/* Emoji tile */}
      <div className={`${product.color} stripe-bg flex items-center justify-center h-24 text-5xl`}>
        <span className="drop-shadow-lg">{product.emoji}</span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="font-bold text-gray-800 text-sm leading-tight">{product.name}</p>
        <p className="text-xs text-gray-400">{product.category}</p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            className="text-lg font-extrabold text-red-600"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            ₱{product.price}
          </span>

          <button
            onClick={handleAdd}
            className="btn-add relative bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-full w-9 h-9 flex items-center justify-center text-xl shadow-md transition-colors"
            style={bouncing ? { transform: 'scale(1.3)' } : {}}
            aria-label={`Add ${product.name} to cart`}
          >
            {qty > 0
              ? <span className="text-base font-extrabold">{qty}</span>
              : '+'}
          </button>
        </div>

        {product.stock <= 5 && (
          <p className="text-[10px] text-red-400 font-semibold">⚠️ {product.stock} nalang!</p>
        )}
      </div>
    </div>
  )
}
