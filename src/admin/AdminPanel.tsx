import { useState } from 'react'
import AdminLayout      from './AdminLayout'
import Dashboard        from './Dashboard'
import ProductsTab      from './ProductsTab'
import CategoriesTab    from './CategoriesTab'
import HistoryTab       from './HistoryTab'
import AnnouncementsTab from './AnnouncementsTab'
import EmployeesTab     from './EmployeesTab'
import BuyersTab        from './BuyersTab'
import StockManagement  from './StockManagement'
import type { Product, Order, Announcement } from '../types'

interface Employee {
  id: number
  email: string
  name: string
  phone: string
  password: string
  role: 'owner' | 'employee' | 'buyer'
  membership: string
}

interface Buyer {
  id: number
  email: string
  name: string
  phone: string
  membership: string
  walletBalance: number
  points: number
  createdAt: string
}

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
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, email: 'employee@gmail.com', name: 'Employee Account', phone: '0900-000-0002', password: 'employee01', role: 'employee', membership: 'Pro' },
  ])
  const [buyers, setBuyers] = useState<Buyer[]>([
    { id: 1, email: 'buyer@gmail.com', name: 'Buyer Account', phone: '0900-000-0003', membership: 'Free', walletBalance: 450.25, points: 0, createdAt: new Date().toISOString() },
    { id: 2, email: 'john@example.com', name: 'John Doe', phone: '0901-234-5678', membership: 'Pro', walletBalance: 1250.00, points: 125, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, email: 'jane@example.com', name: 'Jane Smith', phone: '0902-345-6789', membership: 'Max', walletBalance: 3500.50, points: 350, createdAt: new Date(Date.now() - 172800000).toISOString() },
  ])

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length

  const handleAddEmployee = (emp: Omit<Employee, 'id'>) => {
    setEmployees(prev => [...prev, { ...emp, id: Math.max(...prev.map(e => e.id), 0) + 1 }])
  }

  const handleUpdateEmployee = (id: number, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const handleRemoveEmployee = (id: number) => {
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

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
      {tab === 'stock'   && (
        <StockManagement
          products={products}
          onUpdateStock={onUpdateStock}
          light={light}
        />
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
      {tab === 'employees' && (
        <EmployeesTab
          employees={employees}
          onAdd={handleAddEmployee}
          onUpdate={handleUpdateEmployee}
          onRemove={handleRemoveEmployee}
          light={light}
        />
      )}
      {tab === 'buyers' && (
        <BuyersTab buyers={buyers} light={light} />
      )}
    </AdminLayout>
  )
}
