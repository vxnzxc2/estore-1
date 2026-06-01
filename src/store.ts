import { useState, useCallback } from 'react'
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from './data'
import type { Product, Order, CartItem, Announcement } from './types'

const FREE_DELIVERY_AT = 1000
let nextId = INITIAL_PRODUCTS.length + 1
let nextOrderId = 1
let nextAnnouncementId = 1

export function useStore() {
  const [products,      setProducts]      = useState<Product[]>(INITIAL_PRODUCTS)
  const [categories,    setCategories]    = useState<string[]>(INITIAL_CATEGORIES.filter(c => c !== 'All'))
  const [orders,        setOrders]        = useState<Order[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const addProduct    = useCallback((p: Omit<Product, 'id'>) => setProducts(prev => [...prev, { ...p, id: nextId++ }]), [])
  const updateStock   = useCallback((id: number, stock: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p)), [])
  const removeProduct = useCallback((id: number) => setProducts(prev => prev.filter(p => p.id !== id)), [])
  const addCategory   = useCallback((name: string) => setCategories(prev => prev.includes(name) ? prev : [...prev, name]), [])
  const removeCategory= useCallback((name: string) => {
    setCategories(prev => prev.filter(c => c !== name))
    setProducts(prev => prev.filter(p => p.category !== name))
  }, [])
  const updateProduct = useCallback((id: number, updates: Partial<Product>) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)), [])

  const placeOrder = useCallback((cart: CartItem[], method: string, fulfillment: string, payLaterTerm?: number) => {
    const total       = cart.reduce((s, i) => s + i.price * i.qty, 0)
    const deliveryFee = fulfillment === 'pickup' ? 0 : total >= FREE_DELIVERY_AT ? 0 : 50
    const order: Order = {
      id:          `ORD-${Date.now()}-${nextOrderId++}`,
      items:       cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image, category: i.category })),
      total,
      deliveryFee,
      grandTotal:  total + deliveryFee,
      placedAt:    new Date().toISOString(),
      status:      'completed',
      method,
      fulfillment,
      payLaterTerm,
    }
    setOrders(prev => [order, ...prev])
    setAnnouncements(prev => [{
      id: nextAnnouncementId++,
      title: 'Order Confirmed',
      message: `Your order ${order.id} has been confirmed and is now being processed.`,
      createdAt: new Date().toISOString(),
    }, ...prev])
  }, [])

  const cancelOrder = useCallback((id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o))
    setAnnouncements(prev => [{
      id: nextAnnouncementId++,
      title: 'Order Cancelled',
      message: `Your order ${id} has been cancelled successfully.`,
      createdAt: new Date().toISOString(),
    }, ...prev])
  }, [])

  const addAnnouncement    = useCallback((a: Omit<Announcement, 'id' | 'createdAt'>) =>
    setAnnouncements(prev => [{ ...a, id: nextAnnouncementId++, createdAt: new Date().toISOString() }, ...prev]), [])
  const removeAnnouncement = useCallback((id: number) =>
    setAnnouncements(prev => prev.filter(a => a.id !== id)), [])

  return {
    products, categories, orders, announcements,
    addProduct, updateStock, removeProduct, addCategory, removeCategory, updateProduct, placeOrder, cancelOrder,
    addAnnouncement, removeAnnouncement,
  }
}
