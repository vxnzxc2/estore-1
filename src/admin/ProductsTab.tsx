import { useState } from 'react'
import { Plus, Trash2, Edit3, Check, X, Search, ImageOff, ChevronDown, ChevronUp } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  products: Product[]
  categories: string[]
  onAdd: (product: Omit<Product, 'id'>) => void
  onRemove: (id: number) => void
  onUpdate: (id: number, updates: Partial<Product>) => void
  light?: boolean
  initialFilter?: string
}

const BLANK = { name: '', price: 0, category: '', image: '', badge: '', stock: 0, barcode: '' }

export default function ProductsTab({ products, categories, onAdd, onRemove, onUpdate, light, initialFilter }: Props) {
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState(BLANK)
  const [editProduct, setEditProduct] = useState<number | null>(null)
  const [editForm,    setEditForm]    = useState<Partial<Product> & { badge?: string }>({})
  const [search,      setSearch]      = useState('')
  const [stockFilter, setStockFilter] = useState(initialFilter || 'all')
  const [imgErrors,   setImgErrors]   = useState<Set<number>>(new Set())
  const [confirmDel,  setConfirmDel]  = useState<number | null>(null)
  const [expanded,    setExpanded]    = useState<Set<number>>(new Set())

  // ── Styles ────────────────────────────────────────────────────────────────
  const card   = light ? 'bg-white border border-gray-200 shadow-sm'       : 'bg-slate-800/60 border border-white/5'
  const formBg = light ? 'bg-amber-50 border border-amber-200'             : 'bg-slate-800/80 border border-amber-500/20'
  const title  = light ? 'text-gray-900'                                   : 'text-white'
  const sub    = light ? 'text-gray-400'                                   : 'text-slate-400'
  const lbl    = light ? 'text-gray-500'                                   : 'text-slate-400'
  const inp    = light ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-amber-400' : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500/60'
  const sel    = light ? 'bg-white border-gray-300 text-gray-900 focus:border-amber-400' : 'bg-slate-900 border-slate-600 text-white focus:border-amber-500/60'
  const rowH   = light ? 'hover:bg-gray-50'                                : 'hover:bg-slate-700/20'
  const sepDiv = light ? 'divide-gray-100'                                 : 'divide-white/5'
  const hdrBdr = light ? 'border-b border-gray-100'                        : 'border-b border-white/5'
  const hdrTxt = light ? 'text-gray-400'                                   : 'text-slate-500'
  const rowN   = light ? 'text-gray-900'                                   : 'text-white'
  const rowS   = light ? 'text-gray-400'                                   : 'text-slate-500'
  const editBg = light ? 'bg-gray-50'                                      : 'bg-slate-700/30'
  const actBtn = light ? 'text-gray-400 hover:text-gray-900 hover:bg-gray-100' : 'text-slate-400 hover:text-white hover:bg-slate-700'
  const delBtn = light ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
  const srchBg = light ? 'bg-white border-gray-200'                        : 'bg-slate-800/80 border-slate-700/60'
  const filterBtn = (active: boolean) => active
    ? 'bg-amber-500 text-white'
    : light ? 'bg-white border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-500'
            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-amber-500/40 hover:text-amber-400'

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    const matchStock  = stockFilter === 'all' ? true
                      : stockFilter === 'in'  ? p.stock > 5
                      : stockFilter === 'low' ? p.stock > 0 && p.stock <= 5
                      : p.stock === 0
    return matchSearch && matchStock
  })

  const handleAdd = () => {
    if (!form.name || !form.category || form.price <= 0) return
    onAdd({ ...form, price: Number(form.price), stock: Number(form.stock), badge: form.badge || null, barcode: form.barcode || undefined })
    setForm(BLANK); setShowForm(false)
  }

  const startEdit = (p: Product) => {
    setEditProduct(p.id)
    setEditForm({ name: p.name, price: p.price, category: p.category, image: p.image, badge: p.badge || '', stock: p.stock, barcode: p.barcode || '' })
  }

  const saveEdit = (id: number) => {
    onUpdate(id, { ...editForm, badge: editForm.badge || null, price: Number(editForm.price), stock: Number(editForm.stock) })
    setEditProduct(null)
  }

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <div className="flex gap-5 h-full">

      {/* ── Left: Categories sidebar ── */}
      <div className="w-44 shrink-0 space-y-1">
        <p className={`text-xs font-semibold ${sub} uppercase tracking-wider px-2 mb-3`}>Filter by Category</p>
        {['all', ...categories].map(cat => (
          <button key={cat} onClick={() => setSearch(cat === 'all' ? '' : cat)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              (cat === 'all' && search === '') || search === cat
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : light
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-slate-400 hover:bg-slate-800'
            }`}>
            {cat === 'all' ? 'All Products' : cat}
          </button>
        ))}
      </div>

      {/* ── Right: Main content ── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>Products</h1>
            <p className={`${sub} text-sm mt-0.5`}>{filtered.length} of {products.length} products</p>
          </div>
          <button onClick={() => setShowForm(o => !o)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 shrink-0">
            <Plus size={16} strokeWidth={2.5} /> Add Product
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className={`${formBg} rounded-2xl p-5 space-y-4`}>
            <h2 className={`text-base font-semibold ${title}`}>New Product</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'name',    label: 'Product Name *', placeholder: 'e.g. Chippy BBQ',       type: 'text'   },
                { key: 'price',   label: 'Price (₱) *',    placeholder: '0',                      type: 'number' },
                { key: 'stock',   label: 'Stock *',         placeholder: '0',                      type: 'number' },
                { key: 'badge',   label: 'Badge',           placeholder: 'e.g. Bestseller!',       type: 'text'   },
                { key: 'barcode', label: 'Barcode',         placeholder: 'e.g. 4800888036929',     type: 'text'   },
                { key: 'image',   label: 'Image URL',       placeholder: 'https://...',            type: 'text', full: true },
              ].map(({ key, label: lbl2, placeholder, type, full }) => (
                <div key={key} className={full ? 'sm:col-span-2' : ''}>
                  <label className={`text-xs ${lbl} mb-1 block`}>{lbl2}</label>
                  <input type={type} placeholder={placeholder} value={(form as any)[key] || ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
                </div>
              ))}
              <div>
                <label className={`text-xs ${lbl} mb-1 block`}>Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${sel}`}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <Check size={15} strokeWidth={3} /> Save Product
              </button>
              <button onClick={() => { setShowForm(false); setForm(BLANK) }}
                className={`px-4 py-2 rounded-xl text-sm border transition-colors ${light ? 'border-gray-200 text-gray-500 hover:text-gray-900' : 'border-slate-600 text-slate-400 hover:text-white'}`}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + stock filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className={`flex items-center gap-2 ${srchBg} border rounded-xl px-3 py-2 flex-1 min-w-48`}>
            <Search size={14} className={`${sub} shrink-0`} strokeWidth={2} />
            <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
              className={`flex-1 outline-none text-sm bg-transparent ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`} />
            {search && <button onClick={() => setSearch('')}><X size={13} className={sub} /></button>}
          </div>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'in',  label: 'In Stock' },
              { key: 'low', label: 'Low' },
              { key: 'out', label: 'Out' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setStockFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterBtn(stockFilter === key)}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Product list - dropdown style */}
        <div className={`${card} rounded-2xl overflow-hidden`}>
          <div className={`grid grid-cols-[40px_1fr_80px_80px_100px_80px] text-xs ${hdrTxt} uppercase tracking-wider px-4 py-3 ${hdrBdr}`}>
            <span />
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className={`divide-y ${sepDiv}`}>
            {filtered.length === 0 && (
              <p className={`${sub} text-sm text-center py-10`}>No products found</p>
            )}

            {filtered.map(p => {
              const isExpanded = expanded.has(p.id)
              const isEditing  = editProduct === p.id

              return (
                <div key={p.id}>
                  {/* Product row */}
                  <div className={`grid grid-cols-[40px_1fr_80px_80px_100px_80px] items-center px-4 py-3 ${rowH} transition-colors cursor-pointer`}
                    onClick={() => !isEditing && toggleExpand(p.id)}>

                    {/* Thumbnail */}
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {imgErrors.has(p.id) || !p.image ? (
                        <div className={`w-full h-full flex items-center justify-center ${light ? 'text-gray-300' : 'text-slate-500'}`}>
                          <ImageOff size={13} strokeWidth={1.5} />
                        </div>
                      ) : (
                        <img src={p.image} alt={p.name} onError={() => setImgErrors(s => new Set([...s, p.id]))} className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Name */}
                    <div className="min-w-0 pr-2 flex items-center gap-2">
                      {isExpanded ? <ChevronUp size={13} className="text-amber-500 shrink-0" strokeWidth={2} /> : <ChevronDown size={13} className={`${sub} shrink-0`} strokeWidth={2} />}
                      <div className="min-w-0">
                        <p className={`${rowN} text-sm font-medium truncate`}>{p.name}</p>
                        <p className={`${rowS} text-xs truncate`}>{p.category}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <span className="text-amber-500 font-semibold text-sm">₱{p.price}</span>

                    {/* Stock */}
                    <span className={`${rowN} text-sm font-medium`}>{p.stock}</span>

                    {/* Status */}
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg w-fit ${
                      p.stock === 0 ? 'bg-red-500/10 text-red-500'
                      : p.stock <= 5 ? 'bg-orange-500/10 text-orange-500'
                      : 'bg-green-500/10 text-green-500'
                    }`}>
                      {p.stock === 0 ? 'Out' : p.stock <= 5 ? 'Low' : 'In stock'}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { startEdit(p); setExpanded(s => new Set([...s, p.id])) }}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg ${actBtn} transition-colors`}>
                        <Edit3 size={13} strokeWidth={2} />
                      </button>
                      {confirmDel === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { onRemove(p.id); setConfirmDel(null) }}
                            className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-semibold hover:bg-red-400">
                            Delete
                          </button>
                          <button onClick={() => setConfirmDel(null)} className={`${sub} hover:text-red-500`}><X size={12} strokeWidth={2.5} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(p.id)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg ${delBtn} transition-colors`}>
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown edit form */}
                  {isExpanded && (
                    <div className={`px-4 pb-4 pt-2 ${editBg} border-t ${light ? 'border-gray-100' : 'border-white/5'}`}>
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { key: 'name',    label: 'Name'      },
                              { key: 'price',   label: 'Price (₱)' },
                              { key: 'stock',   label: 'Stock'     },
                              { key: 'badge',   label: 'Badge'     },
                              { key: 'barcode', label: 'Barcode'   },
                            ].map(({ key, label: lbl2 }) => (
                              <div key={key}>
                                <label className={`text-xs ${lbl} mb-1 block`}>{lbl2}</label>
                                <input
                                  type={key === 'price' || key === 'stock' ? 'number' : 'text'}
                                  value={(editForm as any)[key] ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`}
                                />
                              </div>
                            ))}
                            <div>
                              <label className={`text-xs ${lbl} mb-1 block`}>Category</label>
                              <select value={editForm.category || ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${sel}`}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="sm:col-span-3">
                              <label className={`text-xs ${lbl} mb-1 block`}>Image URL</label>
                              <input type="text" value={editForm.image || ''}
                                onChange={e => setEditForm(f => ({ ...f, image: e.target.value }))}
                                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(p.id)}
                              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                              <Check size={14} strokeWidth={3} /> Save Changes
                            </button>
                            <button onClick={() => setEditProduct(null)}
                              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${light ? 'border-gray-200 text-gray-500' : 'border-slate-600 text-slate-400'}`}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Read-only expanded view */
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          {[
                            { label: 'Price',    value: `₱${p.price}` },
                            { label: 'Stock',    value: p.stock },
                            { label: 'Badge',    value: p.badge || '—' },
                            { label: 'Barcode',  value: p.barcode || '—' },
                            { label: 'Category', value: p.category },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className={`text-xs ${sub} mb-0.5`}>{label}</p>
                              <p className={`${rowN} font-medium`}>{String(value)}</p>
                            </div>
                          ))}
                          <div className="sm:col-span-4">
                            <p className={`text-xs ${sub} mb-0.5`}>Image URL</p>
                            <p className={`${rowN} text-xs font-mono truncate`}>{p.image || '—'}</p>
                          </div>
                          <div className="sm:col-span-4 pt-1">
                            <button onClick={() => startEdit(p)}
                              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                              <Edit3 size={13} strokeWidth={2.5} /> Edit Product
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
