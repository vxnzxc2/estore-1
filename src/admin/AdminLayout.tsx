import { useState } from 'react'
import { LayoutDashboard, Package, Tag, LogOut, Menu, Store, ChevronRight, History, X, Megaphone, Users } from 'lucide-react'

interface Props {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  productCount: number
  categoryCount: number
  lowStockCount: number
  orderCount: number
  announcementCount: number
  light?: boolean
}

const NAV = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'stock',         label: 'Stock',         icon: Package },
  { id: 'products',      label: 'Products',      icon: Package },
  { id: 'categories',    label: 'Categories',    icon: Tag },
  { id: 'employees',     label: 'Employees',     icon: Users },
  { id: 'buyers',        label: 'Buyers',        icon: Users },
  { id: 'history',       label: 'History',       icon: History },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
]

export default function AdminLayout({ children, activeTab, onTabChange, onLogout, productCount, categoryCount, lowStockCount, orderCount, announcementCount, light }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebar   = light ? 'bg-white border-r border-gray-200'          : 'bg-slate-900 border-r border-white/5'
  const overlay   = 'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden'
  const logoSep   = light ? 'border-b border-gray-100'                   : 'border-b border-white/5'
  const titleCl   = light ? 'text-gray-900'                              : 'text-white'
  const subCl     = light ? 'text-gray-400'                              : 'text-slate-500'
  const navBase   = light ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
  const navActive = light ? 'bg-amber-50 text-amber-600 border border-amber-200'  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  const topbar    = light ? 'border-b border-gray-200 bg-white'          : 'border-b border-white/5 bg-slate-900'
  const main      = light ? 'bg-gray-50'                                 : 'bg-[#080c14]'
  const statVal   = light ? 'text-gray-900'                              : 'text-white'
  const statText  = light ? 'text-gray-400'                              : 'text-slate-500'
  const botBdr    = light ? 'border-gray-100'                            : 'border-white/5'

  return (
    <div className={`flex h-screen ${main} overflow-hidden`}>

      {/* Mobile overlay */}
      {sidebarOpen && <div className={overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 md:z-auto inset-y-0 left-0
        w-56 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebar} flex flex-col shrink-0
      `}>
        <div className={`flex items-center justify-between gap-3 px-4 py-4 ${logoSep}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Store size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`${titleCl} font-bold text-sm`} style={{ fontFamily: 'Syne, sans-serif' }}>eStore</p>
              <p className={`${subCl} text-[10px] uppercase tracking-wider`}>Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { onTabChange(id); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${activeTab === id ? navActive : navBase}`}>
              <Icon size={16} strokeWidth={2} className="shrink-0" />
              <span>{label}</span>
              {id === 'products' && lowStockCount > 0 && (
                <span className="ml-auto bg-red-500/20 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{lowStockCount}</span>
              )}
              {id === 'history' && orderCount > 0 && (
                <span className="ml-auto bg-amber-500/20 text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{orderCount}</span>
              )}
              {id === 'announcements' && announcementCount > 0 && (
                <span className="ml-auto bg-blue-500/20 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{announcementCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={`px-2 py-3 border-t ${botBdr}`}>
          <button onClick={onLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all ${light ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'}`}>
            <LogOut size={16} strokeWidth={2} className="shrink-0" />
            <span>Back to Store</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className={`flex items-center gap-3 px-4 py-3 ${topbar} shrink-0`}>
          <button onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Menu size={20} className={statText} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-1.5 text-sm flex-1">
            <span className={`${statVal} font-semibold`}>Admin</span>
            <ChevronRight size={13} strokeWidth={2} className={statText} />
            <span className="text-amber-500 capitalize font-medium">{activeTab}</span>
          </div>
          <div className={`hidden sm:flex items-center gap-3 text-xs ${statText}`}>
            <span><span className={`${statVal} font-semibold`}>{productCount}</span> products</span>
            <span><span className={`${statVal} font-semibold`}>{categoryCount}</span> categories</span>
            <span><span className={`${statVal} font-semibold`}>{orderCount}</span> orders</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
