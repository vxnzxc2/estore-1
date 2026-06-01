import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Calculator, Check, AlertTriangle, Clock, ChevronDown } from 'lucide-react'

interface Props {
  total: number
  initialTerm?: number
  onConfirm: (term: number) => void
  onCancel: () => void
  light?: boolean
}

const RATE = 0.0395 // 3.95% per month simple interest

const TERM_OPTIONS = [
  { value: 1, label: '1 month' },
  { value: 2, label: '2 months' },
  { value: 3, label: '3 months' },
]

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PayLaterModal({ total, initialTerm, onConfirm, onCancel, light }: Props) {
  const [term,        setTerm]        = useState(initialTerm ?? 1)
  const [step,        setStep]        = useState<'choose' | 'confirm'>('choose')
  const [dropOpen,    setDropOpen]    = useState(false)

  const monthlyPrincipal = total / term
  const monthlyInterest  = total * RATE
  const monthlyPayment   = monthlyPrincipal + monthlyInterest
  const totalPaid        = monthlyPayment * term
  const totalInterest    = totalPaid - total

  const bg    = light ? 'bg-white border-gray-200 shadow-2xl'  : 'bg-slate-800 border-white/10 shadow-2xl'
  const title = light ? 'text-gray-900'  : 'text-white'
  const sub   = light ? 'text-gray-400'  : 'text-slate-400'
  const sep   = light ? 'border-gray-100': 'border-white/10'
  const rowBg = light ? 'bg-gray-50'     : 'bg-slate-900/50'
  const badge = light ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'

  const dropBase  = light
    ? 'bg-white border-gray-300 text-gray-900 hover:border-amber-400'
    : 'bg-slate-900 border-slate-600 text-white hover:border-amber-500/60'
  const dropMenu  = light
    ? 'bg-white border-gray-200 shadow-lg'
    : 'bg-slate-800 border-slate-700 shadow-xl'
  const dropItem  = (active: boolean) => active
    ? light ? 'bg-amber-50 text-amber-600 font-semibold' : 'bg-amber-500/10 text-amber-400 font-semibold'
    : light ? 'text-gray-700 hover:bg-gray-50' : 'text-slate-300 hover:bg-slate-700/50'

  const selectedLabel = TERM_OPTIONS.find(o => o.value === term)?.label ?? '1 month'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={`${bg} border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-slide-up sm:animate-fade-up max-h-[92vh] flex flex-col`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${sep} shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
              <Clock size={18} className="text-amber-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
                Pay Later
              </h2>
              <p className={`text-xs ${sub}`}>Split your bill into monthly payments</p>
            </div>
          </div>
          <button onClick={onCancel} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {step === 'choose' ? (
            <>
              {/* Purchase total */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${rowBg}`}>
                <span className={`text-sm ${sub}`}>Purchase total</span>
                <span className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: light ? '#d97706' : '#fbbf24' }}>
                  {fmt(total)}
                </span>
              </div>

              {/* Interest info */}
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl ${badge} text-xs`}>
                <AlertTriangle size={13} className="shrink-0 mt-0.5" strokeWidth={2} />
                <p>Simple interest of <strong>3.95% per month</strong> on the original amount. Max term is 3 months.</p>
              </div>

              {/* Dropdown term selector */}
              <div>
                <label className={`text-xs font-semibold ${sub} uppercase tracking-wider block mb-2`}>
                  Choose payment term
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropOpen(o => !o)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${dropBase} ${dropOpen ? (light ? 'border-amber-400' : 'border-amber-500/60') : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${light ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400'}`}>
                        {term}
                      </div>
                      <span className="text-sm font-semibold">{selectedLabel}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      strokeWidth={2.5}
                      className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''} ${light ? 'text-gray-400' : 'text-slate-500'}`}
                    />
                  </button>

                  {dropOpen && (
                    <div className={`absolute top-full mt-1.5 left-0 right-0 z-20 rounded-xl border overflow-hidden ${dropMenu}`}>
                      {TERM_OPTIONS.map(opt => {
                        const mp = total / opt.value + total * RATE
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setTerm(opt.value); setDropOpen(false) }}
                            className={`w-full flex items-center justify-between px-4 py-3 transition-colors border-b last:border-0 ${light ? 'border-gray-100' : 'border-white/5'} ${dropItem(term === opt.value)}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                                term === opt.value
                                  ? light ? 'bg-amber-200 text-amber-700' : 'bg-amber-500/30 text-amber-400'
                                  : light ? 'bg-gray-100 text-gray-500' : 'bg-slate-700 text-slate-400'
                              }`}>
                                {opt.value}
                              </div>
                              <span className="text-sm">{opt.label}</span>
                            </div>
                            <span className="text-xs" style={{ color: light ? '#d97706' : '#fbbf24' }}>
                              {fmt(mp)}/mo
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Live breakdown */}
              <div>
                <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-3`}>Payment breakdown</p>
                <div className={`rounded-2xl border ${light ? 'border-gray-200' : 'border-white/10'} overflow-hidden`}>

                  {/* Step-by-step math */}
                  <div className={`px-4 py-3 space-y-2 border-b ${sep} ${rowBg}`}>
                    <div className="flex justify-between text-xs">
                      <span className={sub}>Monthly principal ({fmt(total)} ÷ {term})</span>
                      <span className={`font-medium ${title}`}>{fmt(monthlyPrincipal)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={sub}>Monthly interest ({fmt(total)} × 3.95%)</span>
                      <span className="font-medium text-amber-500">{fmt(monthlyInterest)}</span>
                    </div>
                  </div>

                  {/* Monthly payment highlight */}
                  <div className={`px-4 py-3.5 flex items-center justify-between border-b ${sep}`}>
                    <div>
                      <p className={`text-xs ${sub}`}>Monthly payment</p>
                      <p className="text-xl font-bold mt-0.5" style={{ fontFamily: 'Syne, sans-serif', color: light ? '#1e293b' : '#f1f5f9' }}>
                        {fmt(monthlyPayment)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${sub}`}>× {term} {term === 1 ? 'month' : 'months'}</p>
                      <p className="text-xs mt-1 font-semibold" style={{ color: light ? '#d97706' : '#fbbf24' }}>
                        {fmt(totalPaid)} total
                      </p>
                    </div>
                  </div>

                  {/* Monthly schedule */}
                  {[...Array(term)].map((_, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm border-b last:border-0 ${sep}`}>
                      <span className={sub}>Month {i + 1}</span>
                      <span className={`font-medium ${title}`}>{fmt(monthlyPayment)}</span>
                    </div>
                  ))}

                  {/* Total interest */}
                  <div className={`px-4 py-3 flex items-center justify-between ${rowBg}`}>
                    <span className={`text-xs ${sub}`}>Total interest cost</span>
                    <span className="text-xs font-semibold text-amber-500">+{fmt(totalInterest)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Confirm step */
            <div className="space-y-4 text-center py-2">
              <div className={`w-16 h-16 rounded-2xl ${light ? 'bg-amber-50' : 'bg-amber-500/10'} flex items-center justify-center mx-auto`}>
                <Calculator size={32} className="text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className={`font-bold ${title} text-lg`} style={{ fontFamily: 'Syne, sans-serif' }}>Confirm Pay Later?</p>
                <p className={`${sub} text-sm mt-1`}>
                  Splitting into <span className="text-amber-500 font-semibold">{term} monthly payment{term > 1 ? 's' : ''}</span>
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${light ? 'border-gray-100 bg-gray-50' : 'border-white/5 bg-slate-900/40'} text-left space-y-2`}>
                <div className="flex justify-between text-sm">
                  <span className={sub}>Monthly payment</span>
                  <span className={`font-semibold ${title}`}>{fmt(monthlyPayment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={sub}>Number of months</span>
                  <span className={`font-semibold ${title}`}>{term}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={sub}>Total interest</span>
                  <span className="font-semibold text-amber-500">+{fmt(totalInterest)}</span>
                </div>
                <div className={`pt-2 border-t ${sep} flex justify-between font-bold text-base`}>
                  <span className={title}>Total amount</span>
                  <span className="text-amber-500" style={{ fontFamily: 'Syne, sans-serif' }}>{fmt(totalPaid)}</span>
                </div>
              </div>
              <p className={`text-xs ${sub} px-2`}>
                First payment of <strong className={title}>{fmt(monthlyPayment)}</strong> is due on your next billing cycle.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-4 border-t ${sep} shrink-0 flex gap-2`}>
          {step === 'choose' ? (
            <>
              <button onClick={onCancel}
                className={`flex-1 py-3 rounded-xl text-sm font-medium ${light ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'} transition-colors`}>
                Cancel
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors shadow-lg shadow-amber-500/20">
                Review plan <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep('choose')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium ${light ? 'bg-gray-100 text-gray-600' : 'bg-slate-700 text-slate-300'} transition-colors`}>
                <ChevronLeft size={15} strokeWidth={2.5} /> Back
              </button>
              <button onClick={() => onConfirm(term)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors shadow-lg shadow-amber-500/20">
                <Check size={15} strokeWidth={3} /> Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
