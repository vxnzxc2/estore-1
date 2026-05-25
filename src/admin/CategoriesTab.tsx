import { useState } from 'react'
import { Plus, Trash2, Tag, X, Check, AlertTriangle } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  categories: string[]
  products: Product[]
  onAdd: (name: string) => void
  onRemove: (name: string) => void
  light?: boolean
}

export default function CategoriesTab({ categories, products, onAdd, onRemove, light }: Props) {
  const [newCat,     setNewCat]     = useState('')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [error,      setError]      = useState('')

  const countFor   = (cat: string) => products.filter(p => p.category === cat).length
  const card       = light ? 'bg-white border border-gray-200 shadow-sm'      : 'bg-slate-800/60 border border-white/5'
  const title      = light ? 'text-gray-900'                                  : 'text-white'
  const sub        = light ? 'text-gray-400'                                  : 'text-slate-400'
  const inp        = light ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-amber-400' : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500/60'
  const rowHover   = light ? 'hover:bg-gray-50'                               : 'hover:bg-slate-700/20'
  const sep        = light ? 'divide-gray-100'                                : 'divide-white/5'
  const hdrBorder  = light ? 'border-b border-gray-100'                       : 'border-b border-white/5'
  const hdrText    = light ? 'text-gray-400'                                  : 'text-slate-500'
  const iconBg     = light ? 'bg-amber-50'                                    : 'bg-amber-500/10'
  const rowText    = light ? 'text-gray-900'                                  : 'text-white'
  const rowSub     = light ? 'text-gray-400'                                  : 'text-slate-400'
  const delBtn     = light ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'

  const handleAdd = () => {
    const name = newCat.trim()
    if (!name) return setError('Please enter a category name.')
    if (categories.some(c => c.toLowerCase() === name.toLowerCase())) return setError('Category already exists.')
    onAdd(name); setNewCat(''); setError('')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>Categories</h1>
        <p className={`${sub} text-sm mt-1`}>{categories.length} categories</p>
      </div>

      <div className={`${card} rounded-2xl p-5`}>
        <h2 className={`text-base font-semibold ${title} mb-4 flex items-center gap-2`}>
          <Plus size={16} className="text-amber-500" strokeWidth={2.5} /> Add New Category
        </h2>
        <div className="flex gap-3">
          <input type="text" placeholder="e.g. Frozen Foods" value={newCat}
            onChange={e => { setNewCat(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${inp}`} />
          <button onClick={handleAdd}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20">
            <Plus size={16} strokeWidth={2.5} /> Add
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertTriangle size={12} strokeWidth={2} />{error}</p>}
      </div>

      <div className={`${card} rounded-2xl overflow-hidden`}>
        <div className={`grid grid-cols-[1fr_100px_120px] text-xs ${hdrText} uppercase tracking-wider px-5 py-3 ${hdrBorder}`}>
          <span>Category</span><span>Products</span><span className="text-right">Actions</span>
        </div>
        <div className={`divide-y ${sep}`}>
          {categories.length === 0 && <p className={`${sub} text-sm text-center py-10`}>No categories yet</p>}
          {categories.map(cat => {
            const count = countFor(cat)
            return (
              <div key={cat} className={`grid grid-cols-[1fr_100px_120px] items-center px-5 py-3.5 ${rowHover} transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Tag size={14} className="text-amber-500" strokeWidth={2} />
                  </div>
                  <span className={`${rowText} text-sm font-medium`}>{cat}</span>
                </div>
                <span className={`${rowSub} text-sm`}>{count} product{count !== 1 ? 's' : ''}</span>
                <div className="flex items-center justify-end gap-2">
                  {confirmDel === cat ? (
                    <div className="flex items-center gap-2">
                      {count > 0 && <span className="text-[10px] text-orange-500 flex items-center gap-1"><AlertTriangle size={10} strokeWidth={2} />{count} will be removed</span>}
                      <button onClick={() => { onRemove(cat); setConfirmDel(null) }}
                        className="text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-lg font-semibold hover:bg-red-400 transition-colors flex items-center gap-1">
                        <Check size={11} strokeWidth={3} /> Confirm
                      </button>
                      <button onClick={() => setConfirmDel(null)} className={`${light ? 'text-gray-400 hover:text-gray-700' : 'text-slate-500 hover:text-white'}`}>
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDel(cat)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg ${delBtn} transition-colors`}>
                      <Trash2 size={15} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
