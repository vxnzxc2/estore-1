import { useState } from 'react'
import AdminLayout      from './AdminLayout'
import Dashboard        from './Dashboard'
import ProductsTab      from './ProductsTab'
import CategoriesTab    from './CategoriesTab'
import HistoryTab       from './HistoryTab'
import AnnouncementsTab from './AnnouncementsTab'
import type { Product, Order, Announcement } from '../types'

interface Props {
  products: Product[]
  categories: string[]
  orders: Order[]
  announcements: Announcement[]
  onAddProduct: (p: Omit<Product, 'id'>) => void
  onUpdateStock: (id: number, stock: number) => void
  onRemoveProduct: (id: number) => void
  onUpdateProduct: (id: number, updates: Partial<Product>) => void
  onAddCategory: (name: string) => void
  onRemoveCategory: (name: string) => void
  onAddAnnouncement: (a: Omit<Announcement, 'id' | 'createdAt'>) => void
  onRemoveAnnouncement: (id: number) => void
  onExit: () => void
  light?: boolean
}

export default function AdminPanel({
  products, categories, orders, announcements,
  onAddProduct, onUpdateStock, onRemoveProduct, onUpdateProduct,
  onAddCategory, onRemoveCategory, onAddAnnouncement, onRemoveAnnouncement, onExit, light,
}: Props) {
  const [tab,    setTab]    = useState('dashboard')
  const [filter, setFilter] = useState<string | undefined>(undefined)

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length

  const handleNavigate = (newTab: string, newFilter?: string) => {
    setFilter(newFilter)
    setTab(newTab)
  }

  return (
    <AdminLayout
      activeTab={tab}
      onTabChange={t => { setTab(t); setFilter(undefined) }}
      onLogout={onExit}
      productCount={products.length}
      categoryCount={categories.length}
      lowStockCount={lowStockCount}
      orderCount={orders.length}
      announcementCount={announcements.length}
      light={light}
    >
      {tab === 'dashboard'  && (
        <Dashboard products={products} categories={categories} orders={orders} light={light} onNavigate={handleNavigate} />
      )}
      {tab === 'products'   && (
        <ProductsTab
          products={products}
          categories={categories}
          onAdd={onAddProduct}
          onUpdateStock={onUpdateStock}
          onRemove={onRemoveProduct}
          onUpdate={onUpdateProduct}
          light={light}
          initialFilter={filter}
        />
      )}
      {tab === 'categories' && (
        <CategoriesTab categories={categories} products={products} onAdd={onAddCategory} onRemove={onRemoveCategory} light={light} />
      )}
      {tab === 'history'       && <HistoryTab orders={orders} light={light} />}
      {tab === 'announcements' && (
        <AnnouncementsTab
          announcements={announcements}
          onAdd={onAddAnnouncement}
          onRemove={onRemoveAnnouncement}
          light={light}
        />
      )}
    </AdminLayout>
  )
}
