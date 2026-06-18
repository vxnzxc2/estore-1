import { useState, useRef, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { Plus, Minus, Trash2, Edit3, Check, X, Search, ImageOff, ChevronDown, ChevronUp, Camera, Zap } from 'lucide-react'
import type { Product, FeaturedTag } from '../types'
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

const BLANK = {
  name: '', price: 0, category: '', image: '', badge: '', stock: 0,
  stockUnit: 'pcs' as 'pcs' | 'kg', barcode: '',
  isNew: false, isPromo: false, isBestseller: false,
  isNewIcon: 'Zap',
  isPromoIcon: 'Flame',
  isBestsellerIcon: 'Star',
  featuredTags: [] as FeaturedTag[],
}

const FEATURE_TAGS = [
  { key: 'isNew', label: 'New Item' },
  { key: 'isPromo', label: 'Promo' },
  { key: 'isBestseller', label: 'Bestseller' },
]

const ICON_OPTIONS = Object.keys(LucideIcons)
  .filter(name => /^[A-Z][A-Za-z0-9]+$/.test(name))
  .sort((a, b) => a.localeCompare(b))
  .map(name => ({ id: name, label: name }))

const normalizeLucideIcon = (name: string) => {
  if (!name) return 'Zap'
  if (LucideIcons[name as keyof typeof LucideIcons]) return name
  const normalized = name
    .split(/[-_\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
  return LucideIcons[normalized as keyof typeof LucideIcons] ? normalized : 'Zap'
}

const renderLucideIcon = (name: string, props: any = {}) => {
  const normalized = normalizeLucideIcon(name)
  const Icon = LucideIcons[normalized as keyof typeof LucideIcons] as any
  return Icon ? <Icon {...props} /> : <Zap {...props} />
}

const HAS_NATIVE_DETECTOR = typeof window !== 'undefined' && 'BarcodeDetector' in window

function BarcodePicker({ value, onChange, light }: { value: string; onChange: (v: string) => void; light?: boolean }) {
  const [cameraOpen, setCameraOpen] = useState(false)
  const [camReady,   setCamReady]   = useState(false)
  const [error,      setError]      = useState('')
  const scanRef   = useRef<HTMLDivElement>(null)
  const videoRef  = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    if (!cameraOpen) return

    setError('')
    setCamReady(false)

    if (HAS_NATIVE_DETECTOR) {
      if (!scanRef.current) return
      const vid = document.createElement('video')
      vid.playsInline = true
      vid.muted = true
      vid.style.cssText = 'width:100%;height:100%;object-fit:cover;'
      scanRef.current.appendChild(vid)
      videoRef.current = vid

      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
      }).then(stream => {
        streamRef.current = stream
        vid.srcObject = stream
        vid.play()
        setCamReady(true)

        const detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'code_39'],
        })
        const tick = async () => {
          try {
            const results = await detector.detect(vid)
            if (results.length > 0) { onChange(results[0].rawValue); setCameraOpen(false); return }
          } catch (_) {}
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      }).catch(err => {
        setError(pickerError(err))
      })

      return () => {
        cancelAnimationFrame(rafRef.current)
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        vid.remove()
        setCamReady(false)
      }
    } else {
      if (!scanRef.current) return

      const handler = (result: any) => {
        const code = result?.codeResult?.code
        if (code) { onChange(code); setCameraOpen(false) }
      }

      const tryInit = (useFacingEnv: boolean) => {
        const constraints: any = { width: { ideal: 640 }, height: { ideal: 480 } }
        if (useFacingEnv) constraints.facingMode = 'environment'

        try {
          Quagga.init({
            inputStream: { type: 'LiveStream', target: scanRef.current!, constraints },
            decoder: { readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader', 'upc_e_reader'] },
            locate: true,
            numOfWorkers: 0,
            frequency: 10,
          }, (err) => {
            if (err) {
              if (useFacingEnv) { tryInit(false); return }
              setError(pickerError(err)); return
            }
            Quagga.start()
            setCamReady(true)
          })
          Quagga.onDetected(handler)
        } catch (e) {
          setError(pickerError(e))
        }
      }

      tryInit(true)

      return () => {
        try { Quagga.offDetected(handler) } catch (_) {}
        try { Quagga.stop() } catch (_) {}
        setCamReady(false)
      }
    }
  }, [cameraOpen])

  function pickerError(err: any): string {
    const name = err?.name ?? String(err)
    if (name === 'NotAllowedError' || String(err).toLowerCase().includes('permission'))
      return 'Camera permission denied.'
    if (name === 'NotFoundError') return 'No camera found.'
    if (name === 'NotReadableError') return 'Camera in use by another app.'
    return 'Camera unavailable.'
  }

  const inputBorder = light
    ? 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400'
    : 'border-slate-600 bg-slate-900 text-white placeholder:text-slate-500'

  return (
    <div className="space-y-2">
      {/* ── Input row ── */}
      <div className={`flex items-center border rounded-xl overflow-hidden ${inputBorder}`}>
        {/* Camera icon — far left */}
        <button
          type="button"
          title={cameraOpen ? 'Close camera' : 'Scan barcode'}
          onClick={() => setCameraOpen(o => !o)}
          className={`flex items-center justify-center w-10 h-10 shrink-0 border-r transition-colors ${
            cameraOpen
              ? 'bg-amber-500 text-white border-amber-500'
              : light
                ? 'bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-500 border-gray-300'
                : 'bg-slate-800 text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 border-slate-700'
          }`}
        >
          <Camera size={15} strokeWidth={2} />
        </button>

        {/* Manual text input */}
        <input
          type="text"
          placeholder="Enter or scan barcode…"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-transparent outline-none font-mono"
        />

        {/* Clear */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={`flex items-center justify-center w-8 shrink-0 transition-colors ${
              light ? 'text-gray-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'
            }`}
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── Camera view — visible only when open ── */}
      {cameraOpen && (
        <div className={`relative rounded-xl overflow-hidden ${light ? 'bg-gray-100' : 'bg-slate-900'}`} style={{ height: 160 }}>
          <div ref={scanRef} className="w-full h-full" style={{ position: 'relative', overflow: 'hidden' }} />

          {/* Scan-line overlay */}
          {camReady && !error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-40 h-24">
                {(['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2',
                  'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'] as const
                ).map((cls, i) => (
                  <div key={i} className={`absolute w-5 h-5 border-amber-400 rounded-sm ${cls}`} />
                ))}
                <div className="absolute left-0 right-0 h-0.5 bg-amber-400 animate-scan-line opacity-80" />
              </div>
            </div>
          )}

          {/* Spinner while initialising */}
          {!camReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <p className="text-red-400 text-xs text-center">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProductsTab({ products, categories, onAdd, onRemove, onUpdate, light, initialFilter }: Props) {
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState(BLANK)
  const [editProduct, setEditProduct] = useState<number | null>(null)
  const [editForm,    setEditForm]    = useState<Partial<Product> & { badge?: string; barcode?: string }>({})
  const [search,      setSearch]      = useState('')
  const [newTagLabel, setNewTagLabel] = useState('')
  const [newTagIcon,  setNewTagIcon]  = useState<FeaturedTag['icon']>('Zap')
  const [newTagIconSearch, setNewTagIconSearch] = useState('')
  const [newTagIconOpen, setNewTagIconOpen] = useState(false)
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

  // Count alert (low + out-of-stock) products per category for sidebar badges
  const alertByCategory: Record<string, number> = {}
  for (const p of products) {
    if (p.stock <= 5) {
      alertByCategory[p.category] = (alertByCategory[p.category] ?? 0) + 1
    }
  }
  const totalAlerts = Object.values(alertByCategory).reduce((s, n) => s + n, 0)

  const handleAdd = () => {
    if (!form.name || !form.category || form.price <= 0) return
    onAdd({ ...form, price: Number(form.price), stock: Number(form.stock), badge: form.badge || null, barcode: form.barcode || undefined, stockUnit: form.stockUnit, featuredTags: form.featuredTags || [] })
    setForm(BLANK); setNewTagLabel(''); setNewTagIcon('Zap'); setShowForm(false)
  }

  const addFeaturedTag = () => {
    const label = newTagLabel.trim()
    if (!label) return
    const nextTag: FeaturedTag = {
      id: `${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      label,
      icon: newTagIcon,
    }
    setForm(f => ({ ...f, featuredTags: [...(f.featuredTags || []), nextTag] }))
    setNewTagLabel('')
    setNewTagIcon('Zap')
  }

  const startEdit = (p: Product) => {
    setEditProduct(p.id)
    setEditForm({
      name: p.name,
      price: p.price,
      category: p.category,
      image: p.image,
      badge: p.badge || '',
      stock: p.stock,
      stockUnit: p.stockUnit || 'pcs',
      barcode: p.barcode || '',
      isNew: p.isNew,
      isPromo: p.isPromo,
      isBestseller: p.isBestseller,
      isNewIcon: p.isNewIcon || 'Zap',
      isPromoIcon: p.isPromoIcon || 'Flame',
      isBestsellerIcon: p.isBestsellerIcon || 'Star',
      featuredTags: p.featuredTags || [],
    })
  }

  const saveEdit = (id: number) => {
    onUpdate(id, { ...editForm, badge: (editForm.badge as string) || null, price: Number(editForm.price), stock: Number(editForm.stock), featuredTags: editForm.featuredTags || [] })
    setEditProduct(null)
  }

  const toggleExpand = (id: number) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">

      {/* Left: Category sidebar */}
      <div className="md:w-44 shrink-0">
        <p className={`text-xs font-semibold ${sub} uppercase tracking-wider px-2 mb-2`}>Category</p>
        <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {['all', ...categories].map(cat => {
            const alertCount = cat === 'all' ? totalAlerts : (alertByCategory[cat] ?? 0)
            return (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`shrink-0 md:shrink text-left px-3 py-2 rounded-xl text-xs font-medium transition-all capitalize flex items-center justify-between gap-1.5 ${catBtn(catFilter === cat)}`}>
                <span className="truncate">{cat === 'all' ? 'All Products' : cat}</span>
                {alertCount > 0 && (
                  <span className="shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {alertCount}
                  </span>
                )}
              </button>
            )
          })}
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
              {/* Stock + unit picker */}
              <div className="sm:col-span-2">
                <label className={`text-xs ${lbl} mb-1 block`}>Stock *</label>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => setForm(f => {
                      const current = Number(f.stock) || 0
                      const step = f.stockUnit === 'kg' ? 0.1 : 1
                      return { ...f, stock: Math.max(0, parseFloat((current - step).toFixed(2))) }
                    })}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border font-semibold transition-colors shrink-0 ${
                      light
                        ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-750'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                    }`}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number" min="0"
                    step={form.stockUnit === 'kg' ? '0.01' : '1'}
                    placeholder={form.stockUnit === 'kg' ? '0.00' : '0'}
                    value={form.stock || ''}
                    onChange={e => setForm(f => ({ ...f, stock: form.stockUnit === 'kg' ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0 }))}
                    className={`flex-1 border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
                  <button
                    type="button"
                    onClick={() => setForm(f => {
                      const current = Number(f.stock) || 0
                      const step = f.stockUnit === 'kg' ? 0.1 : 1
                      return { ...f, stock: parseFloat((current + step).toFixed(2)) }
                    })}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border font-semibold transition-colors shrink-0 ${
                      light
                        ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-750'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                    }`}
                  >
                    <Plus size={16} />
                  </button>
                  <div className="flex rounded-xl overflow-hidden border shrink-0 ${light ? 'border-gray-300' : 'border-slate-600'}">
                    {(['pcs', 'kg'] as const).map(u => (
                      <button key={u} type="button" onClick={() => setForm(f => ({ ...f, stockUnit: u }))}
                        className={`px-3 py-2 text-xs font-semibold transition-colors ${
                          form.stockUnit === u
                            ? 'bg-amber-500 text-white'
                            : light ? 'bg-white text-gray-500 hover:bg-gray-50' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}>
                        {u === 'pcs' ? 'Pieces' : 'Kilos (kg)'}
                      </button>
                    ))}
                  </div>
                </div>
                {form.stockUnit === 'kg' && (
                  <p className={`text-[10px] ${sub} mt-1`}>Enter weight in kilograms (e.g. 5.5 for 5.5 kg)</p>
                )}
              </div>
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
              const isOut      = p.stock === 0
              const isLow      = !isOut && p.stock <= 5
              const rowAlert   = isOut
                ? light ? 'bg-red-50 border-l-4 border-l-red-400'   : 'bg-red-500/5 border-l-4 border-l-red-500'
                : isLow
                ? light ? 'bg-orange-50 border-l-4 border-l-orange-400' : 'bg-orange-500/5 border-l-4 border-l-orange-500'
                : ''

              return (
                <div key={p.id}>
                  {/* Row */}
                  <div
                    className={`flex sm:grid sm:grid-cols-[36px_1fr_72px_72px_90px_76px] items-center px-3 sm:px-4 py-3 ${rowH} ${rowAlert} transition-colors cursor-pointer gap-2 sm:gap-0`}
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
                              { key: 'badge', label: 'Badge'     },
                            ].map(({ key, label: lbl2 }) => (
                              <div key={key}>
                                <label className={`text-xs ${lbl} mb-1 block`}>{lbl2}</label>
                                <input type={key === 'price' ? 'number' : 'text'}
                                  value={(editForm as any)[key] ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
                              </div>
                            ))}
                            {/* Stock + unit picker */}
                            <div className="col-span-2 sm:col-span-3">
                              <label className={`text-xs ${lbl} mb-1 block`}>Stock</label>
                              <div className="flex gap-2 items-center">
                                <button
                                  type="button"
                                  onClick={() => setEditForm(f => {
                                    const current = Number(f.stock) || 0
                                    const step = (f.stockUnit || 'pcs') === 'kg' ? 0.1 : 1
                                    return { ...f, stock: Math.max(0, parseFloat((current - step).toFixed(2))) }
                                  })}
                                  className={`w-10 h-10 flex items-center justify-center rounded-xl border font-semibold transition-colors shrink-0 ${
                                    light
                                      ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-750'
                                      : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                                  }`}
                                >
                                  <Minus size={16} />
                                </button>
                                <input
                                  type="number" min="0"
                                  step={(editForm.stockUnit || 'pcs') === 'kg' ? '0.01' : '1'}
                                  value={editForm.stock ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, stock: (f.stockUnit || 'pcs') === 'kg' ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0 }))}
                                  className={`flex-1 border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`} />
                                <button
                                  type="button"
                                  onClick={() => setEditForm(f => {
                                    const current = Number(f.stock) || 0
                                    const step = (f.stockUnit || 'pcs') === 'kg' ? 0.1 : 1
                                    return { ...f, stock: parseFloat((current + step).toFixed(2)) }
                                  })}
                                  className={`w-10 h-10 flex items-center justify-center rounded-xl border font-semibold transition-colors shrink-0 ${
                                    light
                                      ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-750'
                                      : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                                  }`}
                                >
                                  <Plus size={16} />
                                </button>
                                <div className={`flex rounded-xl overflow-hidden border shrink-0 ${light ? 'border-gray-300' : 'border-slate-600'}`}>
                                  {(['pcs', 'kg'] as const).map(u => (
                                    <button key={u} type="button" onClick={() => setEditForm(f => ({ ...f, stockUnit: u }))}
                                      className={`px-3 py-2 text-xs font-semibold transition-colors ${
                                        (editForm.stockUnit || 'pcs') === u
                                          ? 'bg-amber-500 text-white'
                                          : light ? 'bg-white text-gray-500 hover:bg-gray-50' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                      }`}>
                                      {u === 'pcs' ? 'Pieces' : 'Kilos (kg)'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
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
