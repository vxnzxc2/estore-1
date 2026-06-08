import { X } from 'lucide-react'
import type { Order } from '../types'
import OrderTracker from './OrderTracker'

interface Props {
  order: Order
  onClose: () => void
  light?: boolean
}

export default function OrderStatusModal({ order, onClose, light }: Props) {
  const bg = light ? 'bg-white border-gray-200 shadow-2xl' : 'bg-slate-800 border-white/10 shadow-2xl'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-400' : 'text-slate-400'
  const sep = light ? 'border-gray-100' : 'border-white/10'

  const date = new Date(order.placedAt)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`${bg} border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up sm:animate-fade-up max-h-[90vh] flex flex-col`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <div>
            <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
              Order #{order.id.slice(-6).toUpperCase()}
            </h2>
            <p className={`text-xs ${sub}`}>
              {date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              light
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <OrderTracker order={order} light={light} />
        </div>

      </div>
    </div>
  )
}
