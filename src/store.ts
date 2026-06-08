import { useState, useCallback, useEffect } from 'react'
import { CATEGORIES as INITIAL_CATEGORIES } from './data'
import type { Product, Order, CartItem, Announcement, PreOrder } from './types'
import type { AdvanceOrder } from './components/AdvanceOrderModal'

const FREE_DELIVERY_AT = 1000
const API_URL = 'http://localhost:3001/api'
let nextOrderId = 1
let nextAnnouncementId = 1
let nextAdvanceOrderId = 1
let nextPreOrderId = 1

export function useStore() {
  const [products,       setProducts]       = useState<Product[]>([])
  const [categories,     setCategories]     = useState<string[]>(INITIAL_CATEGORIES.filter(c => c !== 'All'))
  const [orders,         setOrders]         = useState<Order[]>([])
  const [announcements,  setAnnouncements]  = useState<Announcement[]>([])
  const [advanceOrders,  setAdvanceOrders]  = useState<AdvanceOrder[]>([])
  const [preOrders,      setPreOrders]      = useState<PreOrder[]>([])

  // ── Fetch products from database on mount ────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            image: p.image,
            badge: p.badge,
            stock: p.stock,
            stockUnit: p.stock_unit,
            barcode: p.barcode,
            isNew: p.is_new,
            isPromo: p.is_promo,
            isBestseller: p.is_bestseller,
          })))
        }
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    }
    fetchProducts()
  }, [])

  // ── Auto-cancel overdue advance orders & pre-orders ────────────────────
  useEffect(() => {
    const checkAndCancel = () => {
      const now = new Date()

      // Check advance orders
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

      // Check pre-orders
      setPreOrders(prev => {
        let changed = false
        const updated = prev.map(o => {
          if (o.status === 'pending' && new Date(o.dueDate) < now) {
            changed = true
            return { ...o, status: 'cancelled' as const }
          }
          return o
        })
        if (changed) {
          setTimeout(() => {
            const cancelled = prev.filter(
              o => o.status === 'pending' && new Date(o.dueDate) < now
            )
            cancelled.forEach(o => {
              setAnnouncements(prev => [{
                id: nextAnnouncementId++,
                title: 'Pre-Order Cancelled',
                message: `Pre-order #${o.id.slice(-6).toUpperCase()} was automatically cancelled — down payment not received by due date.`,
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
  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.image,
        badge: p.badge,
        stock: p.stock,
        is_new: p.isNew,
        is_promo: p.isPromo,
        is_bestseller: p.isBestseller,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setProducts(prev => [...prev, {
          id: data.id,
          name: data.name,
          price: data.price,
          category: data.category,
          image: data.image,
          badge: data.badge,
          stock: data.stock,
          isNew: data.is_new,
          isPromo: data.is_promo,
          isBestseller: data.is_bestseller,
        }])
      })
      .catch(err => console.error('Failed to add product:', err))
  }, [])

  const updateStock = useCallback((id: number, stock: number) => {
    fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    })
      .then(() => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p))
      })
      .catch(err => console.error('Failed to update stock:', err))
  }, [])

  const removeProduct = useCallback((id: number) => {
    fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE' })
      .then(() => {
        setProducts(prev => prev.filter(p => p.id !== id))
      })
      .catch(err => console.error('Failed to remove product:', err))
  }, [])

  const addCategory = useCallback((name: string) => setCategories(prev => prev.includes(name) ? prev : [...prev, name]), [])

  const removeCategory = useCallback((name: string) => {
    setCategories(prev => prev.filter(c => c !== name))
    setProducts(prev => prev.filter(p => p.category !== name))
  }, [])

  const updateProduct = useCallback((id: number, updates: Partial<Product>) => {
    fetch(`${API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updates.name,
        price: updates.price,
        category: updates.category,
        image: updates.image,
        badge: updates.badge,
        stock: updates.stock,
        is_new: updates.isNew,
        is_promo: updates.isPromo,
        is_bestseller: updates.isBestseller,
      }),
    })
      .then(() => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
      })
      .catch(err => console.error('Failed to update product:', err))
  }, [])

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

  // ── Pre-Orders ────────────────────────────────────────────────────────────
  const placePreOrder = useCallback((cart: CartItem[], paymentMethod: string, dueDays: number = 3) => {
    const total = cart.filter(i => i.isPreOrder).reduce((s, i) => s + i.price * i.qty, 0)
    const downPayment = Math.ceil(total * 0.5)

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)
    dueDate.setHours(23, 59, 59, 0)

    const preOrderId = `PRE-${Date.now()}-${nextPreOrderId++}`
    const newPreOrder: PreOrder = {
      id: preOrderId,
      items: cart.filter(i => i.isPreOrder).map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image,
        category: i.category
      })),
      total,
      downPayment,
      paymentMethod,
      status: 'pending',
      dueDate: dueDate.toISOString(),
      createdAt: new Date().toISOString(),
    }

    // Save to database
    fetch(`${API_URL}/pre-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPreOrder),
    }).catch(err => console.error('Failed to save pre-order:', err))

    setPreOrders(prev => [newPreOrder, ...prev])
    setAnnouncements(prev => [{
      id: nextAnnouncementId++,
      title: 'Pre-Order Created!',
      message: `Pre-order #${newPreOrder.id.slice(-6).toUpperCase()} created. Pay ₱${downPayment.toLocaleString('en-PH')} down payment by ${dueDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} to confirm.`,
      createdAt: new Date().toISOString(),
    }, ...prev])
    return newPreOrder
  }, [])

  const cancelPreOrder = useCallback((id: string) => {
    setPreOrders(prev => prev.map(o =>
      o.id === id ? { ...o, status: 'cancelled' } : o
    ))
    setAnnouncements(prev => [{
      id: nextAnnouncementId++,
      title: 'Pre-Order Cancelled',
      message: `Pre-order #${id.slice(-6).toUpperCase()} has been cancelled.`,
      createdAt: new Date().toISOString(),
    }, ...prev])
  }, [])

  // ── Announcements ─────────────────────────────────────────────────────────
  const addAnnouncement    = useCallback((a: Omit<Announcement, 'id' | 'createdAt'>) =>
    setAnnouncements(prev => [{ ...a, id: nextAnnouncementId++, createdAt: new Date().toISOString() }, ...prev]), [])
  const removeAnnouncement = useCallback((id: number) =>
    setAnnouncements(prev => prev.filter(a => a.id !== id)), [])

  return {
    products, categories, orders, announcements, advanceOrders, preOrders,
    addProduct, updateStock, removeProduct, addCategory, removeCategory, updateProduct,
    placeOrder, cancelOrder,
    placeAdvanceOrder, payAdvanceDeposit, cancelAdvanceOrder,
    placePreOrder, cancelPreOrder,
    addAnnouncement, removeAnnouncement,
  }
}
