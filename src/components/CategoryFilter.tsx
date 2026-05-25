import { Store, Cookie, GlassWater, ShoppingBag, FlaskConical, Sparkles, Package, Candy, Tag } from 'lucide-react'
import type { ReactNode } from 'react'

const ICON_MAP: Record<string, ReactNode> = {
  'All':           <Store        size={14} strokeWidth={2} />,
  'Snacks':        <Cookie       size={14} strokeWidth={2} />,
  'Drinks':        <GlassWater   size={14} strokeWidth={2} />,
  'Canned Goods':  <ShoppingBag  size={14} strokeWidth={2} />,
  'Condiments':    <FlaskConical size={14} strokeWidth={2} />,
  'Personal Care': <Sparkles     size={14} strokeWidth={2} />,
  'Sachets':       <Package      size={14} strokeWidth={2} />,
  'Candy':         <Candy        size={14} strokeWidth={2} />,
}

interface Props {
  active: string
  categories: string[]
  onChange: (cat: string) => void
  light?: boolean
}

export default function CategoryFilter({ active, categories, onChange, light }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map(cat => {
        const isActive = active === cat
        const icon = ICON_MAP[cat] ?? <Tag size={14} strokeWidth={2} />
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? light
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 font-semibold'
                  : 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 font-semibold'
                : light
                  ? 'bg-white text-gray-500 border border-gray-200 hover:border-amber-400 hover:text-amber-600'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:border-amber-500/40 hover:text-amber-400'
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
