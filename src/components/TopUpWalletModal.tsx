import { useState } from 'react'
import { X, CreditCard, Smartphone, Clock, Check, Banknote } from 'lucide-react'

interface Props {
  amount: number
  onConfirm: (method: string) => void
  onCancel: () => void
  light?: boolean
}

const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Cash',          icon: Banknote,   color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-500/10',  desc: 'Bring cash to our store' },
  { id: 'gcash', label: 'GCash',         icon: Smartphone, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10',    desc: 'Transfer via GCash'        },
  { id: 'maya',  label: 'Maya',          icon: Smartphone, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-500/10',  desc: 'Transfer via Maya'        },
  { id: 'card',  label: 'Credit / Debit',icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10',desc: 'Visa, Mastercard, JCB'    },
]

export default function TopUpWalletModal({ amount, onConfirm, onCancel, light }: Props) {
  const [method, setMethod] = useState('')

  const bg      = light ? 'bg-white border-gray-200 shadow-2xl'  : 'bg-slate-800 border-white/10 shadow-2xl'
  const title   = light ? 'text-gray-900'  : 'text-white'
  const sub     = light ? 'text-gray-400'  : 'text-slate-400'
  const sep     = light ? 'border-gray-100': 'border-white/10'
  const selBdr  = light ? 'border-amber-400 bg-amber-50' : 'border-amber-500 bg-amber-500/10'
  const unselBdr= light ? 'border-gray-200 hover:border-gray-300' : 'border-slate-700 hover:border-slate-500'

  const selectedPayment = PAYMENT_METHODS.find(m => m.id === method)
  const chosenMethod = method || 'cash'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`${bg} border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up sm:animate-fade-up max-h-[90vh] flex flex-col`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <div>
            <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Add Wallet Funds</h2>
            <p className={`${sub} text-xs mt-0.5`}>Choose your payment method</p>
          </div>
          <button onClick={onCancel} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500' : 'bg-slate-700 text-slate-400'}`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Amount display */}
          <div className={`p-4 rounded-2xl ${light ? 'bg-amber-50' : 'bg-amber-500/10'} border ${light ? 'border-amber-100' : 'border-amber-500/20'} text-center`}>
            <p className={`text-xs ${sub} uppercase tracking-wider mb-1`}>Amount to add</p>
            <p className="text-3xl font-bold text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>₱{amount.toFixed(2)}</p>
          </div>

          {/* Payment methods */}
          <div>
            <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-3`}>Select Payment Method</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)}
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
              <span className={sub}>Amount</span>
              <span className={title}>₱{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={sub}>Processing fee</span>
              <span className="text-green-500 font-medium">FREE</span>
            </div>
            <div className={`pt-2 border-t ${sep} flex justify-between font-bold`}>
              <span className={title}>You'll receive</span>
              <span className="text-amber-500 text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                ₱{amount.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-5 py-4 border-t ${sep} shrink-0 flex gap-2`}>
          <button onClick={onCancel} className={`flex-1 py-3 rounded-xl text-sm font-medium ${light ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'} transition-colors`}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(chosenMethod)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors shadow-lg shadow-amber-500/20">
            <Check size={15} strokeWidth={3} /> Confirm Payment
          </button>
        </div>
      </div>
    </div>
  )
}
