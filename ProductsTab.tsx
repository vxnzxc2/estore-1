import { useState, useRef } from 'react'
import { Plus, Trash2, Edit3, Check, X, Search, ImageOff, ChevronDown, ChevronUp, Camera, Keyboard } from 'lucide-react'
import type { Product } from '../types'
import Quagga from '@ericblade/quagga2'

interface Props {
  products: Product[]
  categories: string[]
  onAdd: (product: Omit<Product, 'id'>) => void
  onUpdateStock: (id: number, stock: number) => void
  onRemove: (id: number) => void
  onUpdate: (id: number, updates: Partial<Product>) => void
  light?: boolean
  initialFilter?: string
}

const BLANK = { name: '', price: 0, category: '', image: '', badge: '', stock: 0, barcode: '' }

function BarcodePicker({ value, onChange, light }: { value: string; onChange: (v: string) => void; light?: boolean }) {
  const [mode, setMode] = useState<'manual' | 'camera'>('manual')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const scanRef = useRef<HTMLDivElement>(null)

  const inp = light
    ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-amber-400'
    : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500/60'

  const startCamera = () => {
    if (!scanRef.current) return
    setError('')
    setScanning(true)
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: scanRef.current,
        constraints: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      },
      decoder: { readers: ['ean_reader','ean_8_reader','code_128_reader','upc_reader','upc_e_reader'] },
      locate: true,
      numOfWorkers: 2,
      frequency: 10,
    }, (err) => {
      if (err) { setError('Could not access camera.'); setScanning(false); return }
      Quagga.start()
    })
    Quagga.onDetected((result) => {
      const code = result?.codeResult?.code
      if (code) {
        onChange(code)
        stopCamera()
        setMode('manual')
      }
    })
  }

  const stopCamera = () => {
    try { Quagga.stop() } catch (_) {}
    setScanning(false)
  }

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex gap-1">
        <button type="button" onClick={() => { setMode('manual'); stopCamera() }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-amber-500 text-white'
              : light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}>
          <Keyboard size={12} strokeWidth={2} /> Manual
        </button>
        <button type="button" onClick={() => { setMode('camera'); startCamera() }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === 'camera'
              ? 'bg-amber-500 text-white'
              : light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}>
          <Camera size={12} strokeWidth={2} /> Camera
        </button>
      </div>

      {mode === 'manual' && (
        <input type="text" placeholder="e.g. 4800888036929" value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
      )}

      {mode === 'camera' && (
        <div className="space-y-2">
          <div className={`relative rounded-xl overflow-hidden ${light ? 'bg-gray-100' : 'bg-slate-900'}`} style={{ height: 160 }}>
            <div ref={scanRef} className="w-full h-full" style={{ position: 'relative', overflow: 'hidden' }} />
            {scanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-40 h-24">
                  {[['top-0 left-0 border-t-2 border-l-2'], ['top-0 right-0 border-t-2 border-r-2'],
                    ['bottom-0 left-0 border-b-2 border-l-2'], ['bottom-0 right-0 border-b-2 border-r-2']
                  ].map(([cls], i) => <div key={i} className={`absolute w-5 h-5 border-amber-400 rounded-sm ${cls}`} />)}
                  <div className="absolute left-0 right-0 h-0.5 bg-amber-400 animate-scan-line opacity-80" />
                </div>
              </div>
            )}
            {!scanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <p className="text-red-400 text-xs text-center">{error}</p>
              </div>
            )}
          </div>
          {value && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${light ? 'bg-green-50' : 'bg-green-500/10'}`}>
              <Check size={13} className="text-green-500" strokeWidth={3} />
              <p className={`text-xs font-mono font-bold ${light ? 'text-green-700' : 'text-green-400'}`}>{value}</p>
            </div>
          )}
          <button type="button" onClick={stopCamera}
            className={`w-full text-xs py-2 rounded-lg transition-colors ${light ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            Cancel Camera
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProductsTab({ products, categories, onAdd, onUpdateStock, onRemove, onUpdate, light, initialFilter }: Props) {
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState(BLANK)
  const [editProduct, setEditProduct] = useState<number | null>(null)
  const [editForm,    setEditForm]    = useState<Partial<Product> & { badge?: string; barcode?: string }>({})
  const [search,      setSearch]      = useState('')
  const [stockFilter, setStockFilter] = useState(initialFilter || 'all')
  const [imgErrors,   setImgErrors]   = useState<Set<number>>(new Set())
  const [confirmDel,  setConfirmDel]  = useState<number | null>(null)
  const [expanded,    setExpanded]    = useState<Set<number>>(new Set())
  const [catFilter,   setCatFilter]   = useState('all')

  const card   = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const formBg = light ? 'bg-amber-50 border border-amber-200' : 'bg-slate-800/80 border border-amber-500/20'
  const title  = light ? 'text-gray-900' : 'text-white'
  const sub    = light ? 'text-gray-400' : 'text-slate-400'
  const lbl    = light ? 'text-gray-500' : 'text-slate-400'
  const inp    = light ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-amber-400' : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500/60'
  const sel    = light ? 'bg-white border-gray-300 text-gray-900 focus:border-amber-400' : 'bg-slate-900 border-slate-600 text-white focus:border-amber-500/60'
  const rowH   = light ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20'
  const sepDiv = light ? 'divide-gray-100' : 'divide-white/5'
  const hdrBdr = light ? 'border-b border-gray-100' : 'border-b border-white/5'
  const hdrTxt = light ? 'text-gray-400' : 'text-slate-500'
  const rowN   = light ? 'text-gray-900' : 'text-white'
  const rowS   = light ? 'text-gray-400' : 'text-slate-500'
  const editBg = light ? 'bg-gray-50' : 'bg-slate-700/30'
  const actBtn = light ? 'text-gray-400 hover:text-gray-900 hover:bg-gray-100' : 'text-slate-400 hover:text-white hover:bg-slate-700'
  const delBtn = light ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
  const srchBg = light ? 'bg-white border-gray-200' : 'bg-slate-800/80 border-slate-700/60'
  const filterBtn = (active: boolean) => active
    ? 'bg-amber-500 text-white'
    : light ? 'bg-white border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-500'
            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-amber-500/40 hover:text-amber-400'
  const catBtn = (active: boolean) => active
    ? 'bg-amber-500 text-white font-semibold shadow-sm'
    : light ? 'text-gray-600 hover:bg-gray-100' : 'text-slate-400 hover:bg-slate-800'

  const filtered = products.filter(p => {
    const matchSearch  = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    const matchStock   = stockFilter === 'all' ? true : stockFilter === 'in' ? p.stock > 5 : stockFilter === 'low' ? p.stock > 0 && p.stock <= 5 : p.stock === 0
    const matchCat     = catFilter === 'all' || p.category === catFilter
    return matchSearch && matchStock && matchCat
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
    onUpdate(id, { ...editForm, badge: (editForm.badge as string) || null, price: Number(editForm.price), stock: Number(editForm.stock) })
    setEditProduct(null)
  }

  const toggleExpand = (id: number) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">

      {/* Left: Category sidebar */}
      <div className="md:w-44 shrink-0">
        <p className={`text-xs font-semibold ${sub} uppercase tracking-wider px-2 mb-2`}>Category</p>
        <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {['all', ...categories].map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`shrink-0 md:shrink text-left px-3 py-2 rounded-xl text-xs font-medium transition-all capitalize ${catBtn(catFilter === cat)}`}>
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Main */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className={`text-xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>Products</h1>
            <p className={`${sub} text-xs mt-0.5`}>{filtered.length} of {products.length}</p>
          </div>
          <button onClick={() => setShowForm(o => !o)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 shrink-0">
            <Plus size={15} strokeWidth={2.5} /> Add Product
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className={`${formBg} rounded-2xl p-4 space-y-3`}>
            <h2 className={`text-sm font-semibold ${title}`}>New Product</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'name',  label: 'Product Name *', placeholder: 'e.g. Chippy BBQ', type: 'text'   },
                { key: 'price', label: 'Price (₱) *',    placeholder: '0',               type: 'number' },
                { key: 'stock', label: 'Stock *',         placeholder: '0',               type: 'number' },
                { key: 'badge', label: 'Badge',           placeholder: 'e.g. Bestseller!',type: 'text'   },
                { key: 'image', label: 'Image URL',       placeholder: 'https://...',     type: 'text', full: true },
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
              <div className="sm:col-span-2">
                <label className={`text-xs ${lbl} mb-1 block`}>Barcode</label>
                <BarcodePicker value={form.barcode} onChange={v => setForm(f => ({ ...f, barcode: v }))} light={light} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAdd} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <Check size={14} strokeWidth={3} /> Save
              </button>
              <button onClick={() => { setShowForm(false); setForm(BLANK) }}
                className={`px-4 py-2 rounded-xl text-sm border transition-colors ${light ? 'border-gray-200 text-gray-500' : 'border-slate-600 text-slate-400'}`}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + stock filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className={`flex items-center gap-2 ${srchBg} border rounded-xl px-3 py-2 flex-1 min-w-40`}>
            <Search size={14} className={`${sub} shrink-0`} strokeWidth={2} />
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className={`flex-1 outline-none text-sm bg-transparent ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`} />
            {search && <button onClick={() => setSearch('')}><X size={13} className={sub} /></button>}
          </div>
          <div className="flex gap-1 flex-wrap">
            {[{key:'all',label:'All'},{key:'in',label:'In Stock'},{key:'low',label:'Low'},{key:'out',label:'Out'}].map(({key,label}) => (
              <button key={key} onClick={() => setStockFilter(key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${filterBtn(stockFilter===key)}`}>{label}</button>
            ))}
          </div>
        </div>

        {/* Product list */}
        <div className={`${card} rounded-2xl overflow-hidden`}>
          {/* Table header - hidden on mobile */}
          <div className={`hidden sm:grid grid-cols-[36px_1fr_72px_72px_90px_76px] text-xs ${hdrTxt} uppercase tracking-wider px-4 py-3 ${hdrBdr}`}>
            <span /><span>Product</span><span>Price</span><span>Stock</span><span>Status</span><span className="text-right">Actions</span>
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
                  {/* Row */}
                  <div
                    className={`flex sm:grid sm:grid-cols-[36px_1fr_72px_72px_90px_76px] items-center px-3 sm:px-4 py-3 ${rowH} transition-colors cursor-pointer gap-2 sm:gap-0`}
                    onClick={() => !isEditing && toggleExpand(p.id)}>

                    {/* Thumb */}
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {imgErrors.has(p.id) || !p.image ? (
                        <div className={`w-full h-full flex items-center justify-center ${light ? 'text-gray-300' : 'text-slate-500'}`}><ImageOff size={13} strokeWidth={1.5} /></div>
                      ) : (
                        <img src={p.image} alt={p.name} onError={() => setImgErrors(s => new Set([...s, p.id]))} className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0 pr-2 flex items-center gap-1.5">
                      {isExpanded ? <ChevronUp size={12} className="text-amber-500 shrink-0" strokeWidth={2} /> : <ChevronDown size={12} className={`${sub} shrink-0`} strokeWidth={2} />}
                      <div className="min-w-0">
                        <p className={`${rowN} text-xs sm:text-sm font-medium truncate`}>{p.name}</p>
                        <p className={`${rowS} text-[10px] truncate`}>{p.category}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <span className="hidden sm:block text-amber-500 font-semibold text-sm">₱{p.price}</span>

                    {/* Stock */}
                    <span className="hidden sm:block text-sm font-medium" style={{ color: light ? '#1e293b' : '#e2e8f0' }}>{p.stock}</span>

                    {/* Status */}
                    <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-lg w-fit ${
                      p.stock === 0 ? 'bg-red-500/10 text-red-500' : p.stock <= 5 ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {p.stock === 0 ? 'Out' : p.stock <= 5 ? 'Low' : 'In stock'}
                    </span>

                    {/* Mobile price/status */}
                    <div className="sm:hidden flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-amber-500 font-bold text-sm">₱{p.price}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${p.stock === 0 ? 'bg-red-500/10 text-red-500' : p.stock <= 5 ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                        {p.stock === 0 ? 'Out' : p.stock <= 5 ? `${p.stock} left` : `${p.stock}`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 justify-end shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { startEdit(p); setExpanded(s => new Set([...s, p.id])) }}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg ${actBtn} transition-colors`}>
                        <Edit3 size={13} strokeWidth={2} />
                      </button>
                      {confirmDel === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { onRemove(p.id); setConfirmDel(null) }}
                            className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-semibold hover:bg-red-400">Del</button>
                          <button onClick={() => setConfirmDel(null)} className={sub}><X size={11} strokeWidth={2.5} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(p.id)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg ${delBtn} transition-colors`}>
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded edit */}
                  {isExpanded && (
                    <div className={`px-4 pb-4 pt-2 ${editBg} border-t ${light ? 'border-gray-100' : 'border-white/5'}`}>
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { key: 'name',  label: 'Name'      },
                              { key: 'price', label: 'Price (₱)' },
                              { key: 'stock', label: 'Stock'     },
                              { key: 'badge', label: 'Badge'     },
                            ].map(({ key, label: lbl2 }) => (
                              <div key={key}>
                                <label className={`text-xs ${lbl} mb-1 block`}>{lbl2}</label>
                                <input type={key === 'price' || key === 'stock' ? 'number' : 'text'}
                                  value={(editForm as any)[key] ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
                              </div>
                            ))}
                            <div>
                              <label className={`text-xs ${lbl} mb-1 block`}>Category</label>
                              <select value={editForm.category || ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${sel}`}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="col-span-2 sm:col-span-3">
                              <label className={`text-xs ${lbl} mb-1 block`}>Image URL</label>
                              <input type="text" value={editForm.image || ''} onChange={e => setEditForm(f => ({ ...f, image: e.target.value }))}
                                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
                            </div>
                            <div className="col-span-2 sm:col-span-3">
                              <label className={`text-xs ${lbl} mb-1.5 block`}>Barcode</label>
                              <BarcodePicker
                                value={editForm.barcode || ''}
                                onChange={v => setEditForm(f => ({ ...f, barcode: v }))}
                                light={light}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(p.id)}
                              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                              <Check size={13} strokeWidth={3} /> Save
                            </button>
                            <button onClick={() => setEditProduct(null)}
                              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${light ? 'border-gray-200 text-gray-500' : 'border-slate-600 text-slate-400'}`}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          {[{label:'Price',value:`₱${p.price}`},{label:'Stock',value:p.stock},{label:'Badge',value:p.badge||'—'},{label:'Barcode',value:p.barcode||'—'},{label:'Category',value:p.category}].map(({label,value}) => (
                            <div key={label}>
                              <p className={`text-xs ${sub} mb-0.5`}>{label}</p>
                              <p className={`${rowN} font-medium text-sm`}>{String(value)}</p>
                            </div>
                          ))}
                          <div className="col-span-2 sm:col-span-4 pt-1">
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
