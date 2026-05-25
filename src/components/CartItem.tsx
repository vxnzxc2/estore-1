import { Minus, Plus, X, ImageOff } from 'lucide-react'
import { useState } from 'react'
import type { CartItem as CartItemType } from '../types'

interface Props {
  item: CartItemType
  onQtyChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
  light?: boolean
}

export default function CartItem({ item, onQtyChange, onRemove, light }: Props) {
  const [imgError, setImgError] = useState(false)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const val = raw === '' ? 1 : parseInt(raw)
    if (val < 1) return onQtyChange(item.id, 1)
    onQtyChange(item.id, val)
  }

  const row    = light ? 'bg-gray-50 border-gray-200'      : 'bg-slate-800/60 border-white/5'
  const name   = light ? 'text-gray-900'                   : 'text-white'
  const sub    = light ? 'text-gray-400'                   : 'text-slate-500'
  const price  = light ? 'text-amber-600'                  : 'text-amber-400'
  const qtyBox = light ? 'bg-white border-gray-300'        : 'bg-slate-900/80 border-slate-600/60'
  const qtyBtn = light ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-700' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
  const qtyTxt = light ? 'text-gray-800'                   : 'text-white'
  const del    = light ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-600 hover:text-red-400 hover:bg-red-500/10'

  return (
    <div className={`flex items-center gap-3 ${row} rounded-xl p-3 border transition-colors`}>
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {imgError ? (
          <div className={`w-full h-full flex items-center justify-center ${light ? 'text-gray-300' : 'text-slate-500'}`}>
            <ImageOff size={18} strokeWidth={1.5} />
          </div>
        ) : (
          <img src={item.image} alt={item.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${name} text-xs leading-snug truncate`}>{item.name}</p>
        <p className={`${sub} text-[11px] mt-0.5`}>₱{item.price} each</p>
        <p className={`${price} font-bold text-sm mt-1`}>₱{item.price * item.qty}</p>
      </div>

      {/* Qty - inline editable input */}
      <div className={`flex items-center ${qtyBox} border rounded-xl overflow-hidden`}>
        <button
          onClick={() => onQtyChange(item.id, Math.max(1, item.qty - 1))}
          className={`w-8 h-8 flex items-center justify-center ${qtyBtn} transition-colors`}
        >
          <Minus size={11} strokeWidth={3} />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={item.qty}
          onChange={handleInput}
          className={`w-8 text-center font-bold text-sm ${qtyTxt} bg-transparent outline-none tabular-nums py-1`}
        />
        <button
          onClick={() => onQtyChange(item.id, item.qty + 1)}
          className={`w-8 h-8 flex items-center justify-center ${qtyBtn} transition-colors`}
        >
          <Plus size={11} strokeWidth={3} />
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className={`w-7 h-7 rounded-md flex items-center justify-center ${del} transition-colors`}
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  )
}
