import { Package, Truck, MapPin, Check, Clock } from 'lucide-react'
import type { Order } from '../types'

interface Props {
  order: Order
  light?: boolean
}

export default function OrderTracker({ order, light }: Props) {
  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-400' : 'text-slate-400'
  const bg = light ? 'bg-gray-50' : 'bg-slate-900/30'
  const border = light ? 'border-gray-200' : 'border-white/10'

  const stages = [
    {
      id: 'pending',
      label: 'Order Placed',
      icon: Package,
      color: 'text-blue-500',
      bgColor: light ? 'bg-blue-50' : 'bg-blue-500/10',
      timestamp: order.placedAt,
      description: 'Your order has been placed'
    },
    {
      id: 'processing',
      label: 'Processing',
      icon: Truck,
      color: 'text-yellow-500',
      bgColor: light ? 'bg-yellow-50' : 'bg-yellow-500/10',
      timestamp: order.processingAt,
      description: 'We are preparing your order'
    },
    {
      id: 'shipped',
      label: 'Shipped',
      icon: MapPin,
      color: 'text-purple-500',
      bgColor: light ? 'bg-purple-50' : 'bg-purple-500/10',
      timestamp: order.shippedAt,
      description: 'Your order is on the way'
    },
    {
      id: 'delivered',
      label: 'Delivered',
      icon: Check,
      color: 'text-green-500',
      bgColor: light ? 'bg-green-50' : 'bg-green-500/10',
      timestamp: order.deliveredAt,
      description: 'Order delivered'
    },
  ]

  const currentStageIndex = stages.findIndex(s => s.id === (order.orderStatus || 'pending'))
  const isDelivered = order.orderStatus === 'delivered'

  const getTimeDisplay = (timestamp?: string) => {
    if (!timestamp) return 'Pending'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`rounded-2xl border p-4 space-y-4 ${bg} ${border}`}>
      {/* Status Header */}
      <div>
        <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-2`}>Order Status</p>
        <p className={`text-sm font-bold ${title}`}>
          {isDelivered ? '✓ Delivered' : `Currently ${stages[currentStageIndex]?.label || 'Processing'}`}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isActive = currentStageIndex >= index
          const isCompleted = currentStageIndex > index
          const Icon = stage.icon

          return (
            <div key={stage.id}>
              <div className="flex gap-3">
                {/* Timeline Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive
                        ? `${stage.bgColor} border-current ${stage.color}`
                        : light
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={14} strokeWidth={3} className={stage.color} />
                    ) : isActive ? (
                      <Icon size={14} strokeWidth={2.5} className={stage.color} />
                    ) : (
                      <Icon size={14} strokeWidth={2} className={light ? 'text-gray-400' : 'text-slate-600'} />
                    )}
                  </div>
                  {index < stages.length - 1 && (
                    <div
                      className={`w-0.5 h-8 mt-1 ${
                        isActive ? 'bg-blue-500' : light ? 'bg-gray-200' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 pt-0.5">
                  <p
                    className={`text-sm font-semibold transition-colors ${
                      isActive ? stage.color : light ? 'text-gray-500' : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className={`text-xs ${sub}`}>{stage.description}</p>
                  {stage.timestamp && (
                    <p className={`text-[10px] ${sub} mt-0.5 flex items-center gap-1`}>
                      <Clock size={10} /> {getTimeDisplay(stage.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delivery Info */}
      {order.fulfillment && (
        <div
          className={`mt-4 pt-4 border-t ${border} text-xs space-y-1`}
        >
          <p className={`font-medium ${title}`}>
            {order.fulfillment === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
          </p>
          {order.fulfillment === 'delivery' && (
            <p className={sub}>
              {isDelivered ? 'Delivered to your address' : 'Will be delivered to your location'}
            </p>
          )}
          {order.fulfillment === 'pickup' && (
            <p className={sub}>Available for pickup at store</p>
          )}
        </div>
      )}
    </div>
  )
}
