import { useState } from 'react'
import { Megaphone, Plus, Trash2, X, FileText } from 'lucide-react'
import type { Announcement } from '../types'

interface Props {
  announcements: Announcement[]
  onAdd: (a: Omit<Announcement, 'id' | 'createdAt'>) => void
  onRemove: (id: number) => void
  light?: boolean
}

const TEMPLATES = [
  { title: 'Store Hours Update', message: 'Our store hours have changed. We are now open from 6AM to 10PM daily. Thank you for your continued support!' },
  { title: 'Free Delivery Promo', message: '🚚 FREE delivery on orders ₱1000 and above! Order now and save on delivery fees.' },
  { title: 'New Arrivals', message: '🎉 New stocks just arrived! Fresh products are now available. Visit us or order online today.' },
  { title: 'Holiday Notice', message: '🏠 We will be closed on the upcoming holiday. Regular operations resume the next day. Salamat po!' },
  { title: 'Special Discount', message: '🔥 Special discount today only! Selected items are on sale. Hurry while stocks last!' },
  { title: 'Thank You Message', message: '💛 Maraming salamat sa inyong patuloy na suporta sa aming tindahan. Kami ay laging naglilingkod para sa inyo!' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AnnouncementsTab({ announcements, onAdd, onRemove, light }: Props) {
  const [showForm,       setShowForm]       = useState(false)
  const [title,          setTitle]          = useState('')
  const [message,        setMessage]        = useState('')
  const [confirmDel,     setConfirmDel]     = useState<number | null>(null)
  const [useTemplate,    setUseTemplate]    = useState(false)

  const title_c  = light ? 'text-gray-900' : 'text-white'
  const sub      = light ? 'text-gray-400' : 'text-slate-400'
  const card     = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const formBg   = light ? 'bg-amber-50 border border-amber-200' : 'bg-slate-800/80 border border-amber-500/20'
  const inp      = light ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-amber-400' : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500/60'
  const lbl      = light ? 'text-gray-500' : 'text-slate-400'
  const sepDiv   = light ? 'divide-gray-100' : 'divide-white/5'
  const rowH     = light ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20'
  const tplBtn   = (active: boolean) => active
    ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-600'
    : light ? 'border-gray-200 hover:border-amber-300 text-gray-600' : 'border-slate-700 hover:border-amber-500/40 text-slate-400'

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title)
    setMessage(tpl.message)
    setUseTemplate(false)
  }

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return
    onAdd({ title: title.trim(), message: message.trim() })
    setTitle('')
    setMessage('')
    setShowForm(false)
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className={`text-xl font-bold ${title_c}`} style={{ fontFamily: 'Syne, sans-serif' }}>Announcements</h1>
          <p className={`${sub} text-xs mt-0.5`}>{announcements.length} announcement{announcements.length !== 1 ? 's' : ''} sent</p>
        </div>
        <button onClick={() => { setShowForm(o => !o); setUseTemplate(false) }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 shrink-0">
          <Plus size={15} strokeWidth={2.5} /> New Announcement
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className={`${formBg} rounded-2xl p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-semibold ${title_c}`}>Create Announcement</h2>
            <button type="button" onClick={() => setShowForm(false)} className={`${sub} hover:text-red-400 transition-colors`}>
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Template toggle */}
          <button type="button" onClick={() => setUseTemplate(o => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${tplBtn(useTemplate)}`}>
            <FileText size={12} strokeWidth={2} /> Use Template
          </button>

          {/* Templates grid */}
          {useTemplate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATES.map(tpl => (
                <button key={tpl.title} type="button" onClick={() => handleApplyTemplate(tpl)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${light ? 'border-gray-200 hover:border-amber-400 bg-white' : 'border-slate-700 hover:border-amber-500/60 bg-slate-900/60'}`}>
                  <p className={`text-xs font-semibold ${title_c} mb-1`}>{tpl.title}</p>
                  <p className={`text-[11px] ${sub} line-clamp-2`}>{tpl.message}</p>
                </button>
              ))}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className={`text-xs ${lbl} mb-1 block`}>Title *</label>
              <input type="text" placeholder="e.g. Store Hours Update" value={title}
                onChange={e => setTitle(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
            </div>
            <div>
              <label className={`text-xs ${lbl} mb-1 block`}>Message *</label>
              <textarea rows={3} placeholder="Write your announcement here…" value={message}
                onChange={e => setMessage(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors resize-none ${inp}`} />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={handleSend} disabled={!title.trim() || !message.trim()}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
              <Megaphone size={14} strokeWidth={2.5} /> Send Announcement
            </button>
            <button onClick={() => { setShowForm(false); setTitle(''); setMessage('') }}
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${light ? 'border-gray-200 text-gray-500' : 'border-slate-600 text-slate-400'}`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Announcements list */}
      <div className={`${card} rounded-2xl overflow-hidden`}>
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-3">
            <Megaphone size={36} strokeWidth={1} className={light ? 'text-gray-300' : 'text-slate-700'} />
            <p className={`${sub} text-sm font-medium`}>No announcements yet</p>
            <p className={`${sub} text-xs`}>Create one to notify your customers</p>
          </div>
        ) : (
          <div className={`divide-y ${sepDiv}`}>
            {announcements.map(a => (
              <div key={a.id} className={`flex items-start gap-3 px-4 py-4 ${rowH} transition-colors`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${light ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
                  <Megaphone size={16} className="text-amber-500" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${title_c} truncate`}>{a.title}</p>
                  <p className={`text-xs ${sub} mt-0.5 line-clamp-2`}>{a.message}</p>
                  <p className={`text-[10px] ${sub} mt-1.5`}>{formatDate(a.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {confirmDel === a.id ? (
                    <>
                      <button onClick={() => { onRemove(a.id); setConfirmDel(null) }}
                        className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-semibold hover:bg-red-400">Del</button>
                      <button onClick={() => setConfirmDel(null)} className={sub}><X size={11} strokeWidth={2.5} /></button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDel(a.id)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${light ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'}`}>
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
