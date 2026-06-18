import { useState } from 'react'
import { Plus, Minus, Search, X } from 'lucide-react'
import type { Product } from '../types'

interface Props {
  products: Product[]
  onUpdateStock: (id: number, stock: number) => void
  light?: boolean
}

export default function StockManagement({ products, onUpdateStock, light }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || p.category === category
    return matchSearch && matchCategory
  })

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditValue(String(product.stock))
  }

  const handleSave = (productId: number) => {
    const newStock = parseInt(editValue) || 0
    onUpdateStock(productId, Math.max(0, newStock))
    setEditingId(null)
  }

  const handleAdjust = (productId: number, delta: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    const newStock = Math.max(0, product.stock + delta)
    onUpdateStock(productId, newStock)
  }

  const bg = light ? 'bg-gray-50' : 'bg-[#0f172a]'
  const card = light ? 'bg-white border border-gray-200' : 'bg-slate-800/60 border border-white/5'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-500' : 'text-slate-400'
  const inp = light ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400' : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500'
  const rowH = light ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20'
  const btn = light
    ? 'bg-white border border-gray-200 hover:bg-gray-50'
    : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'

  return (
    <div className={`min-h-screen ${bg} p-4 md:p-6`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>
            📦 Stock Management
          </h1>
          <p className={`${sub} text-sm mt-1`}>Easily add or reduce product quantities</p>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className={`${card} rounded-xl p-3 flex items-center gap-2`}>
            <Search size={18} className={sub} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`flex-1 bg-transparent outline-none text-sm ${light ? 'text-gray-900 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`}
            />
            {search && (
              <button onClick={() => setSearch('')} className={sub}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-amber-500 text-white'
                    : light
                      ? 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-amber-500/40'
                }`}
              >
                {cat === 'all' ? '📦 All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className={`${card} rounded-xl p-8 col-span-full text-center`}>
              <p className={`${sub} text-sm`}>No products found</p>
            </div>
          ) : (
            filtered.map(product => (
              <div key={product.id} className={`${card} rounded-xl p-4 space-y-3`}>

                {/* Product Header */}
                <div className="flex items-start gap-3">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-300" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className={`${title} font-semibold text-sm truncate`}>{product.name}</h3>
                    <p className={`${sub} text-xs`}>{product.category}</p>
                  </div>
                </div>

                {/* Stock Display/Edit */}
                {editingId === product.id ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditValue(v => String(Math.max(0, (parseInt(v) || 0) - 1)))}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border font-semibold transition-colors shrink-0 ${
                          light
                            ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-750'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                        }`}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                        className={`flex-1 border rounded-lg px-3 py-2 text-center text-lg font-bold outline-none transition-colors ${inp}`}
                      />
                      <button
                        type="button"
                        onClick={() => setEditValue(v => String((parseInt(v) || 0) + 1))}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border font-semibold transition-colors shrink-0 ${
                          light
                            ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-750'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                        }`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(product.id)}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={`flex-1 ${btn} text-sm font-medium rounded-lg transition-colors`}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Current Stock Display */}
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${light ? 'bg-gray-50' : 'bg-slate-700/30'}`}>
                      <span className={`text-xs font-medium ${sub}`}>Current Stock:</span>
                      <span className={`text-2xl font-bold ${
                        product.stock === 0
                          ? 'text-red-500'
                          : product.stock <= 5
                            ? 'text-orange-500'
                            : 'text-green-500'
                      }`}>
                        {product.stock}
                      </span>
                    </div>

                    {/* Quick Adjust Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdjust(product.id, -1)}
                        className={`flex-1 flex items-center justify-center gap-1 ${btn} py-2 rounded-lg font-semibold transition-colors`}>
                        <Minus size={16} />
                        <span className="text-sm">−1</span>
                      </button>
                      <button
                        onClick={() => handleAdjust(product.id, 1)}
                        className={`flex-1 flex items-center justify-center gap-1 ${btn} py-2 rounded-lg font-semibold transition-colors`}>
                        <Plus size={16} />
                        <span className="text-sm">+1</span>
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(product)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                      Edit Quantity
                    </button>
                  </div>
                )}

                {/* Stock Status */}
                <div className={`text-xs font-semibold px-2 py-1 rounded-lg w-fit ${
                  product.stock === 0
                    ? 'bg-red-500/10 text-red-500'
                    : product.stock <= 5
                      ? 'bg-orange-500/10 text-orange-500'
                      : 'bg-green-500/10 text-green-500'
                }`}>
                  {product.stock === 0 ? '❌ Out of Stock' : product.stock <= 5 ? '⚠️ Low Stock' : '✅ In Stock'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
