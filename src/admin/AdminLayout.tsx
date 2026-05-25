import { useState } from 'react'
import { LayoutDashboard, Package, Tag, LogOut, Menu, Store, ChevronRight, History } from 'lucide-react'

interface Props {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  productCount: number
  categoryCount: number
  lowStockCount: number
  orderCount: number
  light?: boolean
}

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'products',   label: 'Products',   icon: Package },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'history',    label: 'History',    icon: History },
]

export default function AdminLayout({ children, activeTab, onTabChange, onLogout, productCount, categoryCount, lowStockCount, orderCount, light }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const sidebar   = light ? 'bg-white border-r border-gray-200'               : 'bg-slate-900 border-r border-white/5'
  const logoSep   = light ? 'border-b border-gray-100'                        : 'border-b border-white/5'
  const titleCl   = light ? 'text-gray-900'                                   : 'text-white'
  const subCl     = light ? 'text-gray-400'                                   : 'text-slate-500'
  const navBase   = light ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
  const navActive = light ? 'bg-amber-50 text-amber-600 border border-amber-200'  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  const topbar    = light ? 'border-b border-gray-200 bg-gray-50'             : 'border-b border-white/5 bg-slate-900/50'
  const main      = light ? 'bg-gray-50'                                      : 'bg-[#080c14]'
  const breadSep  = light ? 'text-gray-300'                                   : 'text-slate-600'
  const breadAct  = light ? 'text-amber-600'                                  : 'text-amber-400'
  const statVal   = light ? 'text-gray-900'                                   : 'text-white'
  const statText  = light ? 'text-gray-400'                                   : 'text-slate-500'
  const botBdr    = light ? 'border-gray-100'                                 : 'border-white/5'

  return (
    <div className={`flex h-screen transition-colors duration-300 ${main}`}>
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-300 ${sidebar} flex flex-col shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 ${logoSep}`}>
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Store size={16} className="text-white" strokeWidth={2.5} />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className={`${titleCl} font-bold text-sm truncate`} style={{ fontFamily: 'Syne, sans-serif' }}>Aling Ronan's</p>
              <p className={`${subCl} text-[10px] uppercase tracking-wider`}>Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => onTabChange(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${activeTab === id ? navActive : navBase}`}>
              <Icon size={17} strokeWidth={2} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && id === 'products' && lowStockCount > 0 && (
                <span className="ml-auto bg-red-500/20 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{lowStockCount} low</span>
              )}
              {sidebarOpen && id === 'history' && orderCount > 0 && (
                <span className="ml-auto bg-amber-500/20 text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{orderCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className={`px-2 py-4 border-t ${botBdr} flex flex-col gap-1`}>
          <button onClick={() => setSidebarOpen(o => !o)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full ${navBase}`}>
            <Menu size={17} strokeWidth={2} className="shrink-0" />
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button onClick={onLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all ${light ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'}`}>
            <LogOut size={17} strokeWidth={2} className="shrink-0" />
            {sidebarOpen && <span>Back to Store</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`flex items-center justify-between px-6 py-4 ${topbar} shrink-0`}>
          <div className="flex items-center gap-2 text-sm">
            <span className={`${statVal} font-medium`}>Admin</span>
            <ChevronRight size={14} strokeWidth={2} className={breadSep} />
            <span className={`${breadAct} capitalize`}>{activeTab}</span>
          </div>
          <div className={`flex items-center gap-4 text-xs ${statText}`}>
            <span><span className={`${statVal} font-semibold`}>{productCount}</span> products</span>
            <span><span className={`${statVal} font-semibold`}>{categoryCount}</span> categories</span>
            <span><span className={`${statVal} font-semibold`}>{orderCount}</span> orders</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
