import { useState } from 'react'
import { CheckSquare, Square, ShoppingBag } from 'lucide-react'
import type { CartItem as CartItemType } from '../types'

// Replace the CartItemRow component inside src/components/CartSidebar.tsx
// This is the full CartItemRow function only — paste it over the existing one

export default function CartItemRow({ item, selected, onSelect, onQtyChange, light }: {
  item: CartItemType; selected: boolean; onSelect: () => void
  onQtyChange: (id: number, qty: number) => void; light?: boolean
}) {
  const [imgError, setImgError] = useState(false)
  // draft string so user can type freely; committed on blur/enter
  const [draft, setDraft] = useState<string | null>(null)

  const isKg = item.stockUnit === 'kg'
  const STEP = isKg ? 0.1 : 1
  const MIN  = isKg ? 0.1 : 1

  const row    = light ? 'bg-white border-gray-200'    : 'bg-slate-800/60 border-white/5'
  const name   = light ? 'text-gray-900'               : 'text-white'
  const sub    = light ? 'text-gray-400'               : 'text-slate-500'
  const price  = light ? 'text-amber-600'              : 'text-amber-400'
  const qtyBox = light ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-600'
  const qtyBtn = light ? 'text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30' : 'text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30'

  const fmtQty = (q: number) => isKg ? Number(q).toFixed(1) : String(Math.round(q))

  const inc = () => {
    const next = parseFloat(Math.min(item.qty + STEP, item.stock).toFixed(2))
    onQtyChange(item.id, next)
    setDraft(fmtQty(next))
  }
  const dec = () => {
    const next = parseFloat((item.qty - STEP).toFixed(2))
    onQtyChange(item.id, Math.max(next, MIN))
    setDraft(fmtQty(Math.max(next, MIN)))
  }

  const commit = () => {
    if (draft === null) return
    const val = isKg ? parseFloat(draft) : parseInt(draft)
    if (!val || val < MIN) {
      // revert to current qty — parent handles removal via − button
      onQtyChange(item.id, MIN)
      setDraft(fmtQty(MIN))
      return
    }
    // IMPORTANT: clamp to item.stock so user cannot exceed stock
    const clamped = parseFloat(Math.min(Math.max(val, MIN), item.stock).toFixed(2))
    onQtyChange(item.id, clamped)
    setDraft(fmtQty(clamped))
  }

  const displayVal = draft !== null ? draft : fmtQty(item.qty)

  return (
    <div className={`flex items-center gap-2 ${row} rounded-xl p-2.5 border transition-colors`}>
      <button onClick={onSelect} className="shrink-0 text-amber-500">
        {selected
          ? <CheckSquare size={18} strokeWidth={2} />
          : <Square size={18} strokeWidth={1.5} className={light ? 'text-gray-300' : 'text-slate-600'} />}
      </button>

      {/* Thumbnail */}
      <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {imgError
          ? <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={14} strokeWidth={1.5} /></div>
          : <img src={item.image} alt={item.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />}
      </div>

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${name} text-xs truncate`}>{item.name}</p>
        <p className={`${price} font-bold text-sm`}>
          ₱{isKg ? (item.price * item.qty).toFixed(2) : (item.price * item.qty)}
        </p>
        <p className={`${sub} text-[10px]`}>
          ₱{item.price} × {isKg ? `${Number(item.qty).toFixed(1)} kg` : item.qty}
          {' · '}
          <span className={item.qty >= item.stock ? 'text-amber-500 font-semibold' : ''}>
            max {isKg ? `${item.stock} kg` : item.stock}
          </span>
        </p>
      </div>

      {/* Qty stepper — capped at item.stock */}
      <div className={`flex items-center ${qtyBox} border rounded-lg overflow-hidden shrink-0`}>
        <button
          onClick={dec}
          disabled={item.qty <= MIN}
          className={`w-7 h-7 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed text-sm`}
        >−</button>
        <input
          type="text"
          inputMode={isKg ? 'decimal' : 'numeric'}
          value={displayVal}
          onChange={e => setDraft(e.target.value.replace(isKg ? /[^0-9.]/g : /[^0-9]/g, ''))}
          onFocus={() => setDraft(fmtQty(item.qty))}
          onBlur={commit}
          onKeyDown={e => e.key === 'Enter' && commit()}
          className={`w-10 text-center font-bold text-xs bg-transparent outline-none tabular-nums py-1 ${light ? 'text-gray-800' : 'text-white'}`}
        />
        <button
          onClick={inc}
          disabled={item.qty >= item.stock}
          className={`w-7 h-7 flex items-center justify-center ${qtyBtn} transition-colors disabled:cursor-not-allowed text-sm`}
        >+</button>
      </div>
    </div>
  )
}
