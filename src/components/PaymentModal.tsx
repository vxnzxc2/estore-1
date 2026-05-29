import { useState } from 'react'
import { X, CreditCard, Smartphone, Clock, Check, Truck, Store, ChevronRight, Banknote, MapPin, Map } from 'lucide-react'
import MapPicker from './MapPicker'

interface Props {
  total: number
  grandTotal: number
  deliveryFee: number
  onConfirm: (method: string, fulfillment: string) => void
  onCancel: () => void
  light?: boolean
}

const PAYMENT_METHODS = [
  { id: 'cash',   label: 'Cash',          icon: Banknote,   color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-500/10',  desc: 'Pay in cash on delivery or pickup' },
  { id: 'gcash',  label: 'GCash',         icon: Smartphone, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10',    desc: 'Pay via GCash QR or number'        },
  { id: 'maya',   label: 'Maya',          icon: Smartphone, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-500/10',  desc: 'Pay via Maya wallet'               },
  { id: 'card',   label: 'Credit / Debit',icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10',desc: 'Visa, Mastercard, JCB'             },
  { id: 'later',  label: 'Pay Later',     icon: Clock,      color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10',desc: 'Pay when you receive / pick up'    },
]

export default function PaymentModal({ total, grandTotal, deliveryFee, onConfirm, onCancel, light }: Props) {
  const [method,      setMethod]      = useState('')
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery')
  const [step,        setStep]        = useState<'method' | 'confirm'>('method')
  const [address,     setAddress]     = useState('')
  const [pinCoords,   setPinCoords]   = useState<{ lat: number; lng: number } | null>(null)
  const [showMap,     setShowMap]     = useState(false)

  const bg     = light ? 'bg-white border-gray-200 shadow-2xl'  : 'bg-slate-800 border-white/10 shadow-2xl'
  const title  = light ? 'text-gray-900'  : 'text-white'
  const sub    = light ? 'text-gray-400'  : 'text-slate-400'
  const sep    = light ? 'border-gray-100': 'border-white/10'
  const selBdr = light ? 'border-amber-400 bg-amber-50' : 'border-amber-500 bg-amber-500/10'
  const unselBdr=light ? 'border-gray-200 hover:border-gray-300' : 'border-slate-700 hover:border-slate-500'

  const selectedPayment = PAYMENT_METHODS.find(m => m.id === method)

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`${bg} border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up sm:animate-fade-up max-h-[90vh] flex flex-col`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
            {step === 'method' ? 'Checkout' : 'Confirm Order'}
          </h2>
          <button onClick={onCancel} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500' : 'bg-slate-700 text-slate-400'}`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {step === 'method' ? (
            <>
              {/* Fulfillment */}
              <div>
                <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-3`}>How do you want to get your order?</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'delivery', label: 'Delivery',  icon: Truck,  desc: deliveryFee === 0 ? 'FREE' : `+₱${deliveryFee}` },
                    { id: 'pickup',   label: 'Pick Up',   icon: Store,  desc: 'At the store' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setFulfillment(opt.id as any)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${fulfillment === opt.id ? selBdr : unselBdr}`}>
                      <opt.icon size={22} className={fulfillment === opt.id ? 'text-amber-500' : sub} strokeWidth={1.5} />
                      <p className={`font-semibold text-sm ${fulfillment === opt.id ? 'text-amber-500' : title}`}>{opt.label}</p>
                      <p className={`text-xs ${fulfillment === opt.id ? 'text-amber-500/70' : sub}`}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery address — shown only when delivery is selected */}
              {fulfillment === 'delivery' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-semibold ${sub} uppercase tracking-wider`}>Delivery Address</p>
                    <button type="button" onClick={() => setShowMap(true)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        pinCoords
                          ? 'bg-amber-500 text-white'
                          : light ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                      }`}>
                      <Map size={12} strokeWidth={2} />
                      {pinCoords ? 'Pin set ✓' : 'Pin on Map'}
                    </button>
                  </div>
                  <div className={`flex items-start gap-2.5 rounded-2xl border-2 px-3.5 py-3 transition-all ${address ? selBdr : unselBdr}`}>
                    <MapPin size={16} className={`mt-0.5 shrink-0 ${address ? 'text-amber-500' : sub}`} strokeWidth={2} />
                    <textarea
                      rows={2}
                      placeholder="Enter your full delivery address…"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className={`flex-1 bg-transparent outline-none text-sm resize-none ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`}
                    />
                  </div>
                  {pinCoords && (
                    <p className={`text-[10px] ${sub} mt-1.5 font-mono flex items-center gap-1`}>
                      <MapPin size={9} strokeWidth={2} className="text-amber-500" />
                      {pinCoords.lat.toFixed(6)}, {pinCoords.lng.toFixed(6)}
                      <button type="button" onClick={() => { setPinCoords(null) }}
                        className="ml-1 text-red-400 hover:text-red-500">✕</button>
                    </p>
                  )}
                </div>
              )}

              {/* Payment method */}
              <div>
                <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-3`}>Payment Method</p>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} onClick={() => setMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${method === m.id ? selBdr : unselBdr}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.bg}`}>
                        <m.icon size={18} className={m.color} strokeWidth={2} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold text-sm ${method === m.id ? 'text-amber-500' : title}`}>{m.label}</p>
                        <p className={`text-xs ${sub}`}>{m.desc}</p>
                      </div>
                      {method === m.id && <Check size={16} className="text-amber-500 shrink-0" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className={`p-4 rounded-2xl ${light ? 'bg-gray-50' : 'bg-slate-900/60'} space-y-2`}>
                <div className="flex justify-between text-sm">
                  <span className={sub}>Subtotal</span>
                  <span className={title}>₱{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={sub}>{fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                  <span className={fulfillment === 'pickup' || deliveryFee === 0 ? 'text-green-500 font-medium' : `${sub}`}>
                    {fulfillment === 'pickup' ? 'FREE (self-pickup)' : deliveryFee === 0 ? 'FREE' : `₱${deliveryFee}`}
                  </span>
                </div>
                <div className={`pt-2 border-t ${sep} flex justify-between font-bold`}>
                  <span className={title}>Total</span>
                  <span className="text-amber-500 text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                    ₱{fulfillment === 'pickup' ? total : grandTotal}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Confirm step */
            <div className="space-y-4 text-center py-2">
              <div className={`w-16 h-16 rounded-2xl ${light ? 'bg-amber-50' : 'bg-amber-500/10'} flex items-center justify-center mx-auto`}>
                {selectedPayment && <selectedPayment.icon size={32} className="text-amber-500" strokeWidth={1.5} />}
              </div>
              <div>
                <p className={`font-bold ${title} text-lg`} style={{ fontFamily: 'Syne, sans-serif' }}>Confirm your order?</p>
                <p className={`${sub} text-sm mt-1`}>Payment via <span className="text-amber-500 font-semibold">{selectedPayment?.label}</span></p>
                <p className={`${sub} text-sm`}>{fulfillment === 'pickup' ? '📍 Store Pick Up' : '🚚 Delivery'}</p>
                {fulfillment === 'delivery' && address && (
                  <p className={`${sub} text-xs mt-1 flex items-center justify-center gap-1`}>
                    <MapPin size={11} strokeWidth={2} /> {address}
                  </p>
                )}
                {fulfillment === 'delivery' && pinCoords && (
                  <p className={`${sub} text-[10px] mt-0.5 font-mono`}>
                    📍 {pinCoords.lat.toFixed(5)}, {pinCoords.lng.toFixed(5)}
                  </p>
                )}
              </div>
              <div className={`p-4 rounded-2xl border ${light ? 'border-gray-100 bg-gray-50' : 'border-white/5 bg-slate-900/40'} text-left space-y-1.5`}>
                <div className="flex justify-between text-sm">
                  <span className={sub}>Subtotal</span><span className={title}>₱{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={sub}>{fulfillment === 'pickup' ? 'Pickup fee' : 'Delivery'}</span>
                  <span className={fulfillment === 'pickup' || deliveryFee === 0 ? 'text-green-500 font-medium' : `${sub}`}>
                    {fulfillment === 'pickup' ? 'FREE' : deliveryFee === 0 ? 'FREE' : `₱${deliveryFee}`}
                  </span>
                </div>
                <div className={`pt-2 border-t ${sep} flex justify-between font-bold text-base`}>
                  <span className={title}>Grand Total</span>
                  <span className="text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>
                    ₱{fulfillment === 'pickup' ? total : grandTotal}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className={`px-5 py-4 border-t ${sep} shrink-0 flex gap-2`}>
          {step === 'method' ? (
            <>
              <button onClick={onCancel} className={`flex-1 py-3 rounded-xl text-sm font-medium ${light ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'} transition-colors`}>
                Cancel
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!method || (fulfillment === 'delivery' && !address.trim())}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-500/20">
                Continue <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep('method')} className={`flex-1 py-3 rounded-xl text-sm font-medium ${light ? 'bg-gray-100 text-gray-600' : 'bg-slate-700 text-slate-300'} transition-colors`}>
                Back
              </button>
              <button onClick={() => onConfirm(method, fulfillment)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors shadow-lg shadow-amber-500/20">
                <Check size={15} strokeWidth={3} /> Yes, Order!
              </button>
            </>
          )}
        </div>
      </div>
    </div>

    {/* Map picker overlay */}
    {showMap && (
      <MapPicker
        initialAddress={address}
        light={light}
        onConfirm={(addr, coords) => {
          setAddress(addr)
          setPinCoords(coords)
          setShowMap(false)
        }}
        onClose={() => setShowMap(false)}
      />
    )}
    </>
  )
}
