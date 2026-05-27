import { Store, Cookie, GlassWater, ShoppingBag, FlaskConical, Sparkles, Package, Candy, Tag } from 'lucide-react'
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

interface Props {
  active: string
  categories: string[]
  onChange: (cat: string) => void
  light?: boolean
}

export default function CategoryFilter({ active, categories, onChange, light }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      {categories.map(cat => {
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
