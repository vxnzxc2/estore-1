import { CATEGORIES, CAT_COLORS, CAT_ICONS } from '../data'
import type { Category } from '../types'

interface Props {
  active: Category
  onChange: (cat: Category) => void
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-sm transition-all shadow-sm ${
            active === cat
              ? `${CAT_COLORS[cat]} shadow-md scale-105 ring-2 ring-offset-1 ring-yellow-300`
              : 'bg-white text-gray-500 border border-gray-200 hover:border-yellow-300'
          }`}
        >
          <span>{CAT_ICONS[cat]}</span>
          <span>{cat}</span>
        </button>
      ))}
    </div>
  )
}
