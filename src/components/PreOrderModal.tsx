import { useState } from 'react'
import { X, AlertTriangle, Plus, Minus, ImageOff } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  product: Product
  light?: boolean
  onConfirm: (product: Product, qty: number) => void
  onCancel: () => void
}

export default function PreOrderModal({ product, light, onConfirm, onCancel }: Props) {
  const [qty, setQty] = useState(1)
  const [imgError, setImgError] = useState(false)

  const bg = light ? 'bg-white border-gray-200 shadow-2xl' : 'bg-slate-800 border-white/10 shadow-2xl'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-400' : 'text-slate-400'
  const sep = light ? 'border-gray-100' : 'border-white/10'
  const inp = light ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-400' : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500/60'
  const rowBg = light ? 'bg-gray-50' : 'bg-slate-900/50'

  const isKg = product.stockUnit === 'kg'
  const STEP = isKg ? 0.1 : 1
  const MIN = isKg ? 0.1 : 1

  const total = product.price * qty

  const handleQtyChange = (newQty: number) => {
    if (isKg) {
      setQty(parseFloat(Math.max(MIN, newQty).toFixed(1)))
    } else {
      setQty(Math.max(MIN, Math.floor(newQty)))
    }
  }

  const handleConfirm = () => {
    onConfirm(product, qty)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`${bg} border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden animate-slide-up sm:animate-fade-up max-h-[90vh] sm:max-h-[92vh] flex flex-col`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
              <AlertTriangle size={18} className="text-blue-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
                Pre-Order
              </h2>
              <p className={`text-xs ${sub}`}>Reserve this item now</p>
            </div>
          </div>
          <button onClick={onCancel} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Info banner */}
          <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs ${light ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}>
            <AlertTriangle size={13} className="shrink-0 mt-0.5" strokeWidth={2} />
            <p>This item is currently out of stock. Pre-order now to secure yours when it arrives!</p>
          </div>

          {/* Product details */}
          <div className={`rounded-2xl border overflow-hidden ${light ? 'border-gray-200 bg-white' : 'border-white/10 bg-slate-900/40'}`}>
            {/* Product image */}
            <div className="h-40 bg-gray-100 overflow-hidden">
              {imgError ? (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageOff size={40} strokeWidth={1.5} />
                </div>
              ) : (
                <img src={product.image} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Product info */}
            <div className={`p-4 space-y-2 ${rowBg}`}>
              <p className={`font-semibold ${title} text-base line-clamp-2`}>{product.name}</p>
              <p className={`text-xs ${sub}`}>{product.category}</p>
              <p className="text-lg font-bold text-blue-500" style={{ fontFamily: 'Syne, sans-serif' }}>
                ₱{product.price}
                {isKg && <span className="text-xs font-medium text-blue-400">/kg</span>}
              </p>
            </div>
          </div>

          {/* Quantity selector */}
          <div>
            <label className={`text-xs font-medium ${sub} mb-2.5 block`}>Quantity</label>
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${light ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-slate-900/40'}`}>
              <button
                onClick={() => handleQtyChange(qty - STEP)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${light ? 'border-gray-200 bg-white hover:bg-gray-100 text-gray-600' : 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <div className="flex-1 text-center">
                <p className={`text-2xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>
                  {isKg ? qty.toFixed(1) : Math.round(qty)}
                </p>
                <p className={`text-xs ${sub}`}>
                  {isKg ? 'kg' : 'units'}
                </p>
              </div>
              <button
                onClick={() => handleQtyChange(qty + STEP)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${light ? 'border-gray-200 bg-white hover:bg-gray-100 text-gray-600' : 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Price breakdown */}
          <div className={`rounded-2xl border overflow-hidden ${light ? 'border-gray-200' : 'border-white/10'}`}>
            <div className={`px-4 py-3 space-y-2 ${rowBg}`}>
              <div className="flex justify-between text-sm">
                <span className={sub}>Price per unit</span>
                <span className={`font-semibold ${title}`}>₱{product.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={sub}>Quantity</span>
                <span className={`font-semibold ${title}`}>{isKg ? qty.toFixed(1) : Math.round(qty)} {isKg ? 'kg' : 'units'}</span>
              </div>
              <div className={`border-t ${sep} pt-2`}>
                <div className="flex justify-between">
                  <p className="text-sm font-bold text-blue-500">Total</p>
                  <p className="text-xl font-bold text-blue-500" style={{ fontFamily: 'Syne, sans-serif' }}>
                    ₱{total.toLocaleString('en-PH', { minimumFractionDigits: isKg ? 2 : 0, maximumFractionDigits: isKg ? 2 : 0 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action buttons */}
        <div className={`flex gap-2 px-4 sm:px-5 py-4 sm:py-4 border-t ${sep} shrink-0 bg-opacity-50`}>
          <button
            onClick={onCancel}
            className={`flex-1 py-3 sm:py-3 px-3 rounded-xl text-sm sm:text-sm font-semibold transition-colors ${light ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 sm:py-3 px-3 rounded-xl text-sm sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-colors active:scale-95"
          >
            Pre-Order Now
          </button>
        </div>

      </div>
    </div>
  )
}
