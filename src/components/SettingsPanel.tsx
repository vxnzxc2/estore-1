import { X, Sun, Moon, Shield, Lock, Store, MapPin, ChevronRight, Info, History, HelpCircle, User } from 'lucide-react'

import type { MembershipPlan } from '../types'
import SubscriptionTab from './SubscriptionTab'

interface Props {
  light: boolean
  membership: MembershipPlan
  onToggleLight: () => void
  onOpenAdmin: () => void
  onOpenProfile: () => void
  onSubscribePlan: (plan: MembershipPlan) => void
  onOpenPlansModal?: () => void
  onClose: () => void
  onOpenStoreLocator: () => void
  onOpenHistory: () => void
  onOpenSupport: () => void
}

export default function SettingsPanel({ light, membership, onToggleLight, onOpenAdmin, onOpenProfile, onSubscribePlan, onOpenPlansModal, onClose, onOpenStoreLocator, onOpenHistory, onOpenSupport }: Props) {
  const bg      = light ? 'bg-white'       : 'bg-[#0d1424]'
  const overlay = light ? 'bg-black/20'    : 'bg-black/60'
  const hdr     = light ? 'border-gray-100': 'border-white/5'
  const title   = light ? 'text-gray-900'  : 'text-white'
  const sub     = light ? 'text-gray-400'  : 'text-slate-400'
  const row     = light ? 'hover:bg-gray-50 border-gray-100' : 'hover:bg-slate-800/60 border-white/5'
  const sec     = light ? 'text-gray-400'  : 'text-slate-500'
  // accessibility: the toggle styling is derived from `light` above

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`animate-slide-right relative ${bg} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
          <div>
            <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Settings</h2>
            <p className={`${sub} text-xs`}>App preferences & store info</p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Profile first */}
          <div className="px-5 pt-5 pb-2">
            <button onClick={() => { onClose(); onOpenProfile() }}
              className={`w-full flex items-center gap-3 p-4 rounded-3xl border ${row} transition-colors`}> 
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${light ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
                <User size={20} className="text-blue-500" strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className={`font-semibold ${title} text-sm`}>My Profile</p>
                <p className={`${sub} text-xs`}>Wallet, points, and personal info</p>
              </div>
              <ChevronRight size={18} className={sub} strokeWidth={2} />
            </button>
          </div>

          <div className="px-5 pt-5 pb-2">
            <SubscriptionTab
              light={light}
              membership={membership}
              onSubscribePlan={onSubscribePlan}
              onOpenPlansModal={onOpenPlansModal}
            />
          </div>

          {/* Appearance */}
          <div className="px-5 pb-2">
            <p className={`text-xs font-semibold ${sec} uppercase tracking-widest mb-3`}>Appearance</p>
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${row} transition-colors`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
                  {light ? <Sun size={18} className="text-amber-500" strokeWidth={2} /> : <Moon size={18} className="text-amber-400" strokeWidth={2} />}
                </div>
                <div>
                  <p className={`font-semibold ${title} text-sm`}>{light ? 'Light Mode' : 'Dark Mode'}</p>
                  <p className={`${sub} text-xs`}>Tap to switch theme</p>
                </div>
              </div>
              {/* Toggle switch — right = dark mode ON, left = light mode (dark OFF) */}
              <button onClick={onToggleLight}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${!light ? 'bg-amber-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${!light ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Store */}
          <div className="px-5 pt-4 pb-2">
            <p className={`text-xs font-semibold ${sec} uppercase tracking-widest mb-3`}>Store</p>
            <div className="space-y-2">
              <button onClick={() => { onClose(); onOpenHistory() }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${row} transition-colors`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-purple-50' : 'bg-purple-500/10'}`}>
                  <History size={18} className="text-purple-500" strokeWidth={2} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold ${title} text-sm`}>Order History</p>
                  <p className={`${sub} text-xs`}>View all your past orders</p>
                </div>
                <ChevronRight size={16} className={sub} strokeWidth={2} />
              </button>

              <button onClick={onOpenStoreLocator}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${row} transition-colors`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
                  <MapPin size={18} className="text-blue-500" strokeWidth={2} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold ${title} text-sm`}>Find Nearest Store</p>
                  <p className={`${sub} text-xs`}>Locate Evaristo's near you</p>
                </div>
                <ChevronRight size={16} className={sub} strokeWidth={2} />
              </button>

              <button onClick={() => { onClose(); onOpenSupport() }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${row} transition-colors`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
                  <HelpCircle size={18} className="text-blue-500" strokeWidth={2} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold ${title} text-sm`}>Support & About</p>
                  <p className={`${sub} text-xs`}>Help, privacy, terms</p>
                </div>
                <ChevronRight size={16} className={sub} strokeWidth={2} />
              </button>

              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${light ? 'border-gray-100' : 'border-white/5'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
                  <Store size={18} className="text-amber-500" strokeWidth={2} />
                </div>
                <div>
                  <p className={`font-semibold ${title} text-sm`}>Evaristo's Main Branch</p>
                  <p className={`${sub} text-xs`}>Blk 3 Lot 5, Sampaguita St., Maynila</p>
                  <p className={`${sub} text-xs`}>Open 6AM – 10PM · 0912-345-6789</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin */}
          <div className="px-5 pt-4 pb-2">
            <p className={`text-xs font-semibold ${sec} uppercase tracking-widest mb-3`}>Administration</p>
            <button onClick={onOpenAdmin}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${row} transition-colors`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-red-50' : 'bg-red-500/10'}`}>
                <Shield size={18} className="text-red-500" strokeWidth={2} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold ${title} text-sm`}>Admin Panel</p>
                <p className={`${sub} text-xs`}>Manage products, stock & orders</p>
              </div>
              <div className="flex items-center gap-1">
                <Lock size={12} className={sub} strokeWidth={2} />
                <ChevronRight size={16} className={sub} strokeWidth={2} />
              </div>
            </button>
          </div>

          {/* About */}
          <div className="px-5 pt-4 pb-6">
            <p className={`text-xs font-semibold ${sec} uppercase tracking-widest mb-3`}>About</p>
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${light ? 'border-gray-100' : 'border-white/5'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-gray-50' : 'bg-slate-700'}`}>
                <Info size={18} className={sub} strokeWidth={2} />
              </div>
              <div>
                <p className={`font-semibold ${title} text-sm`}>Evaristo's Sari-Sari Store</p>
                <p className={`${sub} text-xs`}>Version 1.0.0 · Est. 1993</p>
                <p className={`${sub} text-xs`}>🇵🇭 Proudly Pinoy · Family Owned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
