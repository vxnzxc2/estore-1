import { useState, useMemo } from 'react'
import { X, Banknote, Smartphone, CreditCard, Clock, Check, AlertTriangle } from 'lucide-react'
import type { CartItem } from '../types'

interface Props {
  preOrderItems: CartItem[]
  total: number
  onConfirm: (method: string, dueDays: number) => void
  onCancel: () => void
  light?: boolean
}

const DUE_DAYS = 7

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash on Delivery', icon: Banknote, color: 'text-green-600', desc: 'Pay deposit via GCash/Maya' },
  { id: 'gcash', label: 'GCash', icon: Smartphone, color: 'text-blue-500', desc: 'Scan QR code to pay deposit' },
  { id: 'maya', label: 'Maya', icon: Smartphone, color: 'text-pink-500', desc: 'Pay deposit via Maya wallet' },
  { id: 'card', label: 'Debit/Credit Card', icon: CreditCard, color: 'text-purple-500', desc: 'Pay deposit with your card' },
]

export default function PreOrderPaymentModal({ preOrderItems, total, onConfirm, onCancel, light }: Props) {
  const [selectedMethod, setSelectedMethod] = useState('')
  const [step, setStep] = useState<'method' | 'confirm'>('method')

  const bg = light ? 'bg-white border-gray-200 shadow-2xl' : 'bg-slate-800 border-white/10 shadow-2xl'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-400' : 'text-slate-400'
  const sep = light ? 'border-gray-100' : 'border-white/10'
  const selBdr = light ? 'border-blue-400 bg-blue-50' : 'border-blue-500 bg-blue-500/10'
  const unselBdr = light ? 'border-gray-200 hover:border-gray-300' : 'border-slate-700 hover:border-slate-500'
  const rowBg = light ? 'bg-gray-50' : 'bg-slate-900/50'

  const downPayment = Math.ceil(total * 0.5)
  const balanceDue = total - downPayment
  const selectedPayment = PAYMENT_METHODS.find(m => m.id === selectedMethod)

  const dueDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + DUE_DAYS)
    return d
  }, [])

  const dueDateDisplay = dueDate.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const handleContinue = () => {
    if (selectedMethod) {
      setStep('confirm')
    }
  }

  const handleConfirm = () => {
    onConfirm(selectedMethod, DUE_DAYS)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`${bg} border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up sm:animate-fade-up max-h-[90vh] flex flex-col`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <div>
            <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
              Pre-Order Payment
            </h2>
            <p className={`text-xs ${sub}`}>Pay 50% down payment to secure order</p>
          </div>
          <button onClick={onCancel} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500' : 'bg-slate-700 text-slate-400'}`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {step === 'method' ? (
            <>
              {/* Info Banner */}
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs ${light ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}>
                <AlertTriangle size={13} className="shrink-0 mt-0.5" strokeWidth={2} />
                <p>Pay <strong>50% down payment now</strong> to reserve these items. Pay the remaining <strong>50% when items are in stock</strong>.</p>
              </div>

              {/* Order Summary */}
              <div className={`rounded-xl border p-4 space-y-2 ${light ? 'bg-gray-50 border-gray-200' : 'bg-slate-900/30 border-white/10'}`}>
                <div className="space-y-1">
                  {preOrderItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className={sub}>{item.name} × {item.qty}</span>
                      <span className={`font-semibold ${title}`}>₱{(item.price * item.qty).toLocaleString('en-PH')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className={`rounded-xl border overflow-hidden ${light ? 'border-gray-200' : 'border-white/10'}`}>
                <div className={`px-4 py-3 space-y-2 ${rowBg}`}>
                  <div className="flex justify-between text-sm">
                    <span className={sub}>Order Total</span>
                    <span className={`font-semibold ${title}`}>₱{total.toLocaleString('en-PH')}</span>
                  </div>
                  <div className={`border-t ${sep} pt-2`}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-blue-500">Down Payment (50%)</p>
                        <p className={`text-xs ${sub}`}>Pay now to secure</p>
                      </div>
                      <p className="text-lg font-bold text-blue-500" style={{ fontFamily: 'Syne, sans-serif' }}>
                        ₱{downPayment.toLocaleString('en-PH')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-3 space-y-2 ${light ? 'bg-gray-50' : 'bg-slate-800/40'}`}>
                  <div className="flex justify-between text-sm">
                    <span className={sub}>Balance Due</span>
                    <span className={`font-semibold ${title}`}>₱{balanceDue.toLocaleString('en-PH')}</span>
                  </div>
                  <p className={`text-xs ${sub}`}>Pay when items are back in stock</p>
                </div>
              </div>

              {/* Due Date Info */}
              <div className={`p-4 rounded-2xl border ${light ? 'border-gray-200 bg-gray-50' : 'border-white/5 bg-slate-900/40'} space-y-2`}>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" strokeWidth={2} />
                  <p className={`text-sm font-semibold ${title}`}>Down Payment Due Date</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>
                    {DUE_DAYS} days
                  </p>
                  <p className={`text-xs ${sub} mt-1`}>Due by {dueDateDisplay}</p>
                </div>
                <p className={`text-xs ${sub} text-center`}>Pay the down payment within 1 week or the pre-order will be automatically cancelled.</p>
              </div>

              {/* Payment Methods */}
              <div>
                <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-3`}>Payment Method</p>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${
                        selectedMethod === method.id ? selBdr : unselBdr
                      }`}
                    >
                      <method.icon size={18} className={method.color} strokeWidth={2} />
                      <div className="text-left flex-1">
                        <p className={`font-semibold text-sm ${title}`}>{method.label}</p>
                        <p className={`text-xs ${sub}`}>{method.desc}</p>
                      </div>
                      {selectedMethod === method.id && <Check size={18} className="text-blue-500 shrink-0" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!selectedMethod}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition-colors active:scale-95"
              >
                Continue to Payment
              </button>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className={`flex items-start gap-3 px-4 py-3 rounded-xl ${light ? 'bg-green-50 border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                <Check size={16} className="text-green-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <div className="text-sm">
                  <p className={light ? 'text-green-800 font-semibold' : 'text-green-400 font-semibold'}>
                    Ready to pay down payment?
                  </p>
                  <p className={light ? 'text-green-700 text-xs' : 'text-green-400/80 text-xs'}>
                    You'll pay ₱{downPayment.toLocaleString('en-PH')} now via {selectedPayment?.label}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {preOrderItems.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${light ? 'bg-gray-50 border-gray-200' : 'bg-slate-800/40 border-white/5'}`}>
                    <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${title} truncate`}>{item.name}</p>
                      <p className={`text-xs ${sub}`}>Qty: {item.qty}</p>
                    </div>
                    <p className="font-bold text-blue-500">₱{(item.price * item.qty).toLocaleString('en-PH')}</p>
                  </div>
                ))}
              </div>

              {/* Confirm Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-colors active:scale-95"
                >
                  <Check size={14} className="inline mr-2" strokeWidth={3} />
                  Confirm Down Payment
                </button>
                <button
                  onClick={() => setStep('method')}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${light ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                  Back
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  )
}
