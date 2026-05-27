export interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
  badge: string | null
  stock: number
  barcode?: string
}

export interface CartItem extends Product {
  qty: number
}

export interface OrderItem {
  id: number
  name: string
  price: number
  qty: number
  image: string
  category: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  deliveryFee: number
  grandTotal: number
  placedAt: string
  status: 'completed'
  method?: string
  fulfillment?: string
}

export type Category =
  | 'All'
  | 'New Arrivals'
  | 'Best Sellers'
  | 'Promos'
  | 'Snacks'
  | 'Drinks'
  | 'Canned Goods'
  | 'Condiments'
  | 'Personal Care'
  | 'Sachets'
  | 'Candy'
  | string
