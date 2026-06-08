import { useState, useCallback, useEffect } from 'react'
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from './data'
import type { Product, Order, CartItem, Announcement } from './types'
import type { AdvanceOrder } from './components/AdvanceOrderModal'

const FREE_DELIVERY_AT = 1000
let nextId = INITIAL_PRODUCTS.length + 1
let nextOrderId = 1
let nextAnnouncementId = 1
let nextAdvanceOrderId = 1

export function useStore() {
  const [products,       setProducts]       = useState<Product[]>(INITIAL_PRODUCTS)
  const [categories,     setCategories]     = useState<string[]>(INITIAL_CATEGORIES.filter(c => c !== 'All'))
  const [orders,         setOrders]         = useState<Order[]>([])
  const [announcements,  setAnnouncements]  = useState<Announcement[]>([])
  const [advanceOrders,  setAdvanceOrders]  = useState<AdvanceOrder[]>([])

  // ── Auto-cancel overdue advance orders ──────────────────────────────────
  useEffect(() => {
    const checkAndCancel = () => {
      const now = new Date()
      setAdvanceOrders(prev => {
        let changed = false
        const updated = prev.map(o => {
          if (o.status === 'pending' && !o.depositPaid && new Date(o.dueDate) < now) {
            changed = true
            return { ...o, status: 'cancelled' as const }
          }
          return o
        })
        if (changed) {
          // Queue announcements for cancelled orders (run async to avoid setState-in-setState)
          setTimeout(() => {
            const cancelled = prev.filter(
              o => o.status === 'pending' && !o.depositPaid && new Date(o.dueDate) < now
            )
            cancelled.forEach(o => {
              setAnnouncements(prev => [{
                id: nextAnnouncementId++,
                title: 'Advance Order Cancelled',
                message: `Order #${o.id.slice(-6).toUpperCase()} was automatically cancelled — deposit not paid by due date.`,
                createdAt: new Date().toISOString(),
              }, ...prev])
            })
          }, 0)
        }
        return changed ? updated : prev
      })
    }

    // Check immediately on mount
    checkAndCancel()
    // Then check every minute
    const interval = setInterval(checkAndCancel, 60_000)
    return () => clearInterval(interval)
  }, [])

  // ── Products ──────────────────────────────────────────────────────────────
  const addProduct     = useCallback((p: Omit<Product, 'id'>) => setProducts(prev => [...prev, { ...p, id: nextId++ }]), [])
  const updateStock    = useCallback((id: number, stock: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p)), [])
  const removeProduct  = useCallback((id: number) => setProducts(prev => prev.filter(p => p.id !== id)), [])
  const addCategory    = useCallback((name: string) => setCategories(prev => prev.includes(name) ? prev : [...prev, name]), [])
  const removeCategory = useCallback((name: string) => {
    setCategories(prev => prev.filter(c => c !== name))
    setProducts(prev => prev.filter(p => p.category !== name))
  }, [])
  const updateProduct  = useCallback((id: number, updates: Partial<Product>) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)), [])

  // ── Regular Orders ────────────────────────────────────────────────────────
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

  // ── Advance Orders ────────────────────────────────────────────────────────
  const placeAdvanceOrder = useCallback((order: Omit<AdvanceOrder, 'id' | 'createdAt'>) => {
    const newOrder: AdvanceOrder = {
      ...order,
      id:        `ADV-${Date.now()}-${nextAdvanceOrderId++}`,
      createdAt: new Date().toISOString(),
    }
    setAdvanceOrders(prev => [newOrder, ...prev])
    setAnnouncements(prev => [{
      id: nextAnnouncementId++,
      title: 'Advance Order Placed!',
      message: `Order #${newOrder.id.slice(-6).toUpperCase()} created. Pay ₱${newOrder.deposit.toLocaleString('en-PH')} deposit by ${new Date(newOrder.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} to confirm.`,
      createdAt: new Date().toISOString(),
    }, ...prev])
    return newOrder
  }, [])

  const payAdvanceDeposit = useCallback((id: string) => {
    setAdvanceOrders(prev => prev.map(o =>
      o.id === id
        ? { ...o, depositPaid: true, depositPaidAt: new Date().toISOString(), status: 'confirmed' }
        : o
    ))
    setAnnouncements(prev => {
      const order = advanceOrders.find(o => o.id === id)
      return [{
        id: nextAnnouncementId++,
        title: 'Deposit Paid!',
        message: order
          ? `Deposit of ₱${order.deposit.toLocaleString('en-PH')} for order #${id.slice(-6).toUpperCase()} confirmed. Your order is now secured!`
          : `Deposit paid for order #${id.slice(-6).toUpperCase()}.`,
        createdAt: new Date().toISOString(),
      }, ...prev]
    })
  }, [advanceOrders])

  const cancelAdvanceOrder = useCallback((id: string) => {
    setAdvanceOrders(prev => prev.map(o =>
      o.id === id ? { ...o, status: 'cancelled' } : o
    ))
    setAnnouncements(prev => [{
      id: nextAnnouncementId++,
      title: 'Advance Order Cancelled',
      message: `Order #${id.slice(-6).toUpperCase()} has been cancelled.`,
      createdAt: new Date().toISOString(),
    }, ...prev])
  }, [])

  // ── Announcements ─────────────────────────────────────────────────────────
  const addAnnouncement    = useCallback((a: Omit<Announcement, 'id' | 'createdAt'>) =>
    setAnnouncements(prev => [{ ...a, id: nextAnnouncementId++, createdAt: new Date().toISOString() }, ...prev]), [])
  const removeAnnouncement = useCallback((id: number) =>
    setAnnouncements(prev => prev.filter(a => a.id !== id)), [])

  return {
    products, categories, orders, announcements, advanceOrders,
    addProduct, updateStock, removeProduct, addCategory, removeCategory, updateProduct,
    placeOrder, cancelOrder,
    placeAdvanceOrder, payAdvanceDeposit, cancelAdvanceOrder,
    addAnnouncement, removeAnnouncement,
  }
}
