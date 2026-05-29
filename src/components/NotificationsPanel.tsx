import { Bell, X, Megaphone } from 'lucide-react'
import type { Announcement } from '../types'

interface Props {
  announcements: Announcement[]
  light?: boolean
  onClose: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function NotificationsPanel({ announcements, light, onClose }: Props) {
  const bg      = light ? 'bg-white'        : 'bg-[#0d1424]'
  const overlay = light ? 'bg-black/20'     : 'bg-black/60'
  const hdr     = light ? 'border-gray-100' : 'border-white/5'
  const title   = light ? 'text-gray-900'   : 'text-white'
  const sub     = light ? 'text-gray-400'   : 'text-slate-400'
  const card    = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const sepB    = light ? 'border-gray-100' : 'border-white/5'

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
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${light ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
              <Bell size={16} className="text-blue-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Notifications</h2>
              <p className={`${sub} text-xs`}>{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 px-5">
              <Bell size={40} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
              <p className={`font-semibold ${sub} text-sm`}>No notifications</p>
              <p className={`${sub} text-xs text-center`}>Announcements from the store will appear here</p>
            </div>
          ) : (
            <div className={`${card} mx-4 my-4 rounded-2xl overflow-hidden`}>
              {announcements.map((a, idx) => (
                <div key={a.id} className={`flex items-start gap-3 px-4 py-4 ${idx < announcements.length - 1 ? `border-b ${sepB}` : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${light ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
                    <Megaphone size={16} className="text-amber-500" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${title}`}>{a.title}</p>
                    <p className={`text-xs ${sub} mt-1 leading-relaxed`}>{a.message}</p>
                    <p className={`text-[10px] ${sub} mt-2`}>{formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
