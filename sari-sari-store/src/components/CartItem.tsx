import type { CartItem as CartItemType } from '../types'

interface Props {
  item: CartItemType
  onInc: (id: number) => void
  onDec: (id: number) => void
  onRemove: (id: number) => void
}

export default function CartItem({ item, onInc, onDec, onRemove }: Props) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm border border-yellow-100">
      <span className="text-2xl">{item.emoji}</span>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-xs truncate">{item.name}</p>
        <p className="text-red-600 font-extrabold text-sm">₱{item.price * item.qty}</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onDec(item.id)}
          className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center hover:bg-red-200 text-sm transition-colors"
        >
          −
        </button>
        <span className="w-5 text-center font-bold text-sm text-gray-700">{item.qty}</span>
        <button
          onClick={() => onInc(item.id)}
          className="w-6 h-6 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center hover:bg-green-200 text-sm transition-colors"
        >
          +
        </button>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="text-gray-300 hover:text-red-400 transition-colors text-base ml-1"
        aria-label={`Remove ${item.name}`}
      >
        ✕
      </button>
    </div>
  )
}
