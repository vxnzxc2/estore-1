import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Check, ImageOff, ScanLine, X } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  product: Product | null
  barcode: string
  onAddToCart: (product: Product, qty: number) => void
  onScanAgain: () => void
  onClose: () => void
  light?: boolean
}

export default function ScanResult({ product, barcode, onAddToCart, onScanAgain, onClose, light }: Props) {
  const [qty,      setQty]      = useState(1)
  const [added,    setAdded]    = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleAdd = () => {
    if (!product || qty === 0) return
    onAddToCart(product, qty)
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1200)
  }

  const overlay = light ? 'bg-black/30' : 'bg-black/60'
  const card    = light ? 'bg-white border border-gray-200 shadow-2xl' : 'bg-slate-800 border border-white/10 shadow-2xl'
  const title   = light ? 'text-gray-900' : 'text-white'
  const sub     = light ? 'text-gray-400' : 'text-slate-400'
  const qtyBox  = light ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-600'
  const qtyBtn  = light ? 'text-gray-400 hover:text-gray-800 hover:bg-gray-200 disabled:opacity-30' : 'text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30'
  const qtyTxt  = light ? 'text-gray-800' : 'text-white'
  const scanBtn = light ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 ${overlay} backdrop-blur-sm`}>
      <div className={`${card} rounded-2xl w-full max-w-sm overflow-hidden`}>

        {product ? (
          <>
            {/* Product found */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              {imgError || !product.image ? (
                <div className={`w-full h-full flex items-center justify-center ${light ? 'text-gray-300' : 'text-slate-600'}`}>
                  <ImageOff size={48} strokeWidth={1} />
                </div>
              ) : (
                <img src={product.image} alt={product.name} onError={() => setImgError(true)}
                  className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check size={10} strokeWidth={3} /> Product Found
                  </span>
                  {product.badge && (
                    <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                      {product.badge}
                    </span>
                  )}
                </div>
                <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {product.name}
                </p>
              </div>
              <button onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${sub} text-xs`}>{product.category}</p>
                  <p className="text-amber-500 font-bold text-2xl" style={{ fontFamily: 'Syne, sans-serif' }}>₱{product.price}</p>
                </div>
                <div className="text-right">
                  <p className={`${sub} text-xs`}>In stock</p>
                  <p className={`${title} font-semibold text-sm`}>{product.stock} units</p>
                </div>
              </div>

              {/* Barcode info */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${light ? 'bg-gray-50' : 'bg-slate-900/60'}`}>
                <ScanLine size={14} className="text-amber-500 shrink-0" strokeWidth={2} />
                <p className={`${sub} text-xs font-mono`}>Barcode: {barcode}</p>
              </div>

              {/* Qty */}
              <div className="flex items-center gap-3">
                <span className={`${sub} text-sm shrink-0`}>Quantity:</span>
                <div className={`flex items-center ${qtyBox} border rounded-xl overflow-hidden flex-1`}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                    className={`w-10 h-10 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed`}>
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className={`flex-1 text-center font-bold text-base ${qtyTxt} tabular-nums`}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}
                    className={`w-10 h-10 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed`}>
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={product.stock === 0}
                  className={`btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${
                    added ? 'bg-green-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20'
                  }`}>
                  {added ? <><Check size={15} strokeWidth={3} /> Added!</> : <><ShoppingCart size={15} strokeWidth={2.5} /> Add to Cart</>}
                </button>
                <button onClick={onScanAgain}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${scanBtn}`}>
                  <ScanLine size={15} strokeWidth={2} /> Scan Again
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Product not found */
          <>
            <div className="p-6 flex flex-col items-center gap-4 text-center">
              <button onClick={onClose}
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'} transition-colors`}>
                <X size={15} strokeWidth={2.5} />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <ScanLine size={32} className="text-red-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className={`font-bold ${title} text-lg`} style={{ fontFamily: 'Syne, sans-serif' }}>Product Not Found</p>
                <p className={`${sub} text-sm mt-1`}>No product matched this barcode.</p>
                <p className={`font-mono text-xs mt-2 px-3 py-1.5 rounded-lg ${light ? 'bg-gray-100 text-gray-500' : 'bg-slate-900 text-slate-400'}`}>
                  {barcode}
                </p>
              </div>
              <p className={`text-xs ${sub}`}>
                Go to <span className="text-amber-500 font-semibold">Admin → Products → Edit</span> and assign this barcode to a product.
              </p>
              <div className="flex gap-2 w-full">
                <button onClick={onScanAgain}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20">
                  <ScanLine size={15} strokeWidth={2} /> Scan Again
                </button>
                <button onClick={onClose}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${scanBtn}`}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
