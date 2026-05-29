import { Store, Cookie, GlassWater, ShoppingBag, FlaskConical, Sparkles, Package, Candy, Tag, Zap, Star, Flame } from 'lucide-react'
import type { ReactNode } from 'react'

const ICON_MAP: Record<string, ReactNode> = {
  'All':           <Store        size={13} strokeWidth={2} />,
  'Snacks':        <Cookie       size={13} strokeWidth={2} />,
  'Drinks':        <GlassWater   size={13} strokeWidth={2} />,
  'Canned Goods':  <ShoppingBag  size={13} strokeWidth={2} />,
  'Condiments':    <FlaskConical size={13} strokeWidth={2} />,
  'Personal Care': <Sparkles     size={13} strokeWidth={2} />,
  'Sachets':       <Package      size={13} strokeWidth={2} />,
  'Candy':         <Candy        size={13} strokeWidth={2} />,
}

// Special virtual-category tags managed by admin
export const SPECIAL_TAGS = [
  {
    id:        '__new',
    label:     'New Items',
    icon:      <Zap size={13} strokeWidth={2.5} />,
    activeClass: 'bg-green-500 text-white shadow-md shadow-green-500/20',
    inactiveLight: 'bg-white text-green-600 border border-green-200 hover:border-green-400',
    inactiveDark:  'bg-slate-800/80 text-green-400 border border-green-700/40 hover:border-green-500/60',
  },
  {
    id:        '__promo',
    label:     'Promos',
    icon:      <Flame size={13} strokeWidth={2.5} />,
    activeClass: 'bg-red-500 text-white shadow-md shadow-red-500/20',
    inactiveLight: 'bg-white text-red-500 border border-red-200 hover:border-red-400',
    inactiveDark:  'bg-slate-800/80 text-red-400 border border-red-700/40 hover:border-red-500/60',
  },
  {
    id:        '__bestseller',
    label:     'Bestsellers',
    icon:      <Star size={13} strokeWidth={2.5} fill="currentColor" />,
    activeClass: 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20',
    inactiveLight: 'bg-white text-yellow-600 border border-yellow-200 hover:border-yellow-400',
    inactiveDark:  'bg-slate-800/80 text-yellow-400 border border-yellow-700/40 hover:border-yellow-500/60',
  },
]

interface Props {
  active: string
  categories: string[]
  onChange: (cat: string) => void
  light?: boolean
}

export default function CategoryFilter({ active, categories, onChange, light }: Props) {
  const regularCats = categories.filter(c => c !== 'All')

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>

      {/* All — always first */}
      {categories.includes('All') && (() => {
        const isActive = active === 'All'
        return (
          <button
            onClick={() => onChange('All')}
            className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : light
                  ? 'bg-white text-gray-500 border border-gray-200 hover:border-amber-400 hover:text-amber-600'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-amber-500/40 hover:text-amber-400'
            }`}
          >
            {ICON_MAP['All']}
            <span>All</span>
          </button>
        )
      })()}

      {/* Special admin-curated tags */}
      {SPECIAL_TAGS.map(tag => {
        const isActive = active === tag.id
        return (
          <button
            key={tag.id}
            onClick={() => onChange(tag.id)}
            className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              isActive ? tag.activeClass : light ? tag.inactiveLight : tag.inactiveDark
            }`}
          >
            {tag.icon}
            <span>{tag.label}</span>
          </button>
        )
      })}

      {/* Divider */}
      <div className={`w-px self-stretch mx-0.5 ${light ? 'bg-gray-200' : 'bg-slate-700'}`} />

      {/* Regular categories (excluding All) */}
      {regularCats.map(cat => {
        const isActive = active === cat
        const icon = ICON_MAP[cat] ?? <Tag size={13} strokeWidth={2} />
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : light
                  ? 'bg-white text-gray-500 border border-gray-200 hover:border-amber-400 hover:text-amber-600'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-amber-500/40 hover:text-amber-400'
            }`}
          >
            {icon}
            <span>{cat}</span>
          </button>
        )
      })}
    </div>
  )
}
