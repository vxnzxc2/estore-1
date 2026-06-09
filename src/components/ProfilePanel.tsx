import { useState } from 'react'
import { CreditCard, X, ShieldCheck, Sparkles } from 'lucide-react'
import type { UserProfile } from '../types'

interface Props {
  user: UserProfile
  light?: boolean
  onClose: () => void
  onRequestTopUp: (amount: number) => void
  onRedeemPoints: (points: number) => void
}

export default function ProfilePanel({ user, light, onClose, onRequestTopUp, onRedeemPoints }: Props) {
  const [customAmount, setCustomAmount] = useState('')
  const customValue = Math.max(0, Math.floor(Number(customAmount) || 0))
  const customValid = customValue >= 50
  const bg      = light ? 'bg-white' : 'bg-[#0d1424]'
  const hdr     = light ? 'border-gray-100' : 'border-white/5'
  const title   = light ? 'text-gray-900' : 'text-white'
  const sub     = light ? 'text-gray-400' : 'text-slate-400'
  const row     = light ? 'bg-gray-50 border-gray-100' : 'bg-slate-900/60 border-white/5'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className={`absolute inset-0 ${light ? 'bg-black/20' : 'bg-black/60'} backdrop-blur-sm`} onClick={onClose} />
      <div className={`relative ${bg} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
          <div>
            <h2 className={`text-base font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>My Profile</h2>
            <p className={`${sub} text-xs`}>Personal info and wallet</p>
          </div>
          <button onClick={onClose} className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className={`rounded-3xl border ${hdr} p-5 ${bg}`}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-3xl bg-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-amber-500/20">
                {user.name.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-semibold ${title}`}>{user.name}</p>
                <p className={`${sub} text-xs`}>{user.email}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className={`${sub}`}>Phone</span>
                <span className={`${title} font-semibold`}>{user.phone}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className={`${sub}`}>Member</span>
                <span className={`font-semibold ${light ? 'text-amber-600' : 'text-amber-400'}`}>{user.membership}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border ${hdr} p-5 ${row}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.16em] font-semibold ${sub}`}>Points</p>
                <p className={`mt-2 font-semibold text-2xl ${light ? 'text-gray-900' : 'text-white'}`}>{user.points}</p>
                <p className={`mt-1 text-xs ${sub}`}>Earn 1 point for every ₱100 spent.</p>
              </div>
              <div className={`w-12 h-12 rounded-3xl flex items-center justify-center ${light ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-300'}`}>
                <Sparkles size={20} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-4">
              <button type="button" onClick={() => onRedeemPoints(user.points)} disabled={user.points === 0}
                className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${user.points === 0 ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-400'}`}>
                Redeem all points
              </button>
              <p className={`mt-2 text-xs ${sub}`}>Redeem points at 1 point = ₱1 wallet credit.</p>
            </div>
          </div>

          <div className={`rounded-3xl border ${hdr} p-5 ${row}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.16em] font-semibold ${sub}`}>Wallet Balance</p>
                <p className={`mt-2 font-semibold text-2xl ${light ? 'text-gray-900' : 'text-white'}`}>
                  ₱{user.walletBalance.toFixed(2)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-3xl flex items-center justify-center ${light ? 'bg-amber-50 text-amber-500' : 'bg-amber-500/10 text-amber-400'}`}>
                <CreditCard size={20} strokeWidth={2.2} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className={`text-[10px] uppercase tracking-[0.16em] font-semibold ${sub}`}>
                  Enter desired top-up amount
                </label>
                <div className="mt-2 flex gap-2 items-stretch">
                  <div className="relative flex-1">
                    <span className={`pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm ${light ? 'text-gray-500' : 'text-slate-400'}`}>
                      ₱
                    </span>
                    <input
                      type="number"
                      min="50"
                      step="1"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      placeholder="Amount"
                      className={`w-full rounded-2xl border pl-10 pr-4 py-3 text-sm ${light ? 'bg-white border-gray-200 text-gray-900' : 'bg-slate-900/70 border-white/10 text-white'} focus:outline-none focus:ring-2 focus:ring-amber-400/30`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (customValid) {
                        onRequestTopUp(customValue)
                        setCustomAmount('')
                      }
                    }}
                    disabled={!customValid}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${customValid ? 'bg-amber-500 text-white hover:bg-amber-400' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}>
                    Add
                  </button>
                </div>
                <p className={`mt-2 text-xs ${sub}`}>
                  Minimum top-up amount is ₱50. You can also choose a preset amount below if you prefer.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[100, 250, 500].map(amount => (
                  <button key={amount} type="button" onClick={() => onRequestTopUp(amount)}
                    className="rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-500 py-3 font-semibold hover:bg-amber-500/10 transition-colors">
                    +₱{amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border ${hdr} p-5 ${bg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${light ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-300'} flex items-center justify-center`}>
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
              <div>
                <p className={`font-semibold ${title}`}>Safe, local checkout</p>
                <p className={`${sub} text-xs mt-1`}>Your wallet stays with you for everyday purchases.</p>
              </div>
            </div>
            <div className={`mt-4 rounded-3xl border ${light ? 'border-gray-200' : 'border-white/5'} p-4 ${light ? 'bg-slate-50' : 'bg-slate-900/60'}`}>
              <p className={`text-xs ${sub} mb-2`}>Quick tip</p>
              <p className={`text-sm ${title}`}>Use wallet balance to speed up checkout and keep track of everyday expenses.</p>
            </div>
          </div>

          <button onClick={onClose} className="w-full rounded-3xl py-3.5 font-semibold bg-amber-500 text-white hover:bg-amber-400 transition-colors">
            Close profile
          </button>
        </div>
      </div>
    </div>
  )
}
