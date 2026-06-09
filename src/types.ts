export interface FeaturedTag {
  id: string
  label: string
  icon: string
}

export type MembershipPlan = 'Free' | 'Pro' | 'Max'
export type UserRole = 'owner' | 'employee' | 'buyer'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  membership: MembershipPlan
  walletBalance: number
  points: number
  role: UserRole
}

export interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
  badge: string | null
  stock: number
  stockUnit?: 'pcs' | 'kg'
  barcode?: string
  isNew?: boolean
  isNewIcon?: string
  isPromo?: boolean
  isPromoIcon?: string
  isBestseller?: boolean
  isBestsellerIcon?: string
  featuredTags?: FeaturedTag[]
}

export interface CartItem extends Product {
  qty: number
  isPreOrder?: boolean
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
  status: 'completed' | 'cancelled'
  method?: string
  fulfillment?: string
  payLaterTerm?: number
  orderStatus?: 'pending' | 'processing' | 'shipped' | 'delivered'
  processingAt?: string
  shippedAt?: string
  deliveredAt?: string
}

export interface PreOrder {
  id: string
  items: OrderItem[]
  total: number
  downPayment: number
  paymentMethod: string
  status: 'pending' | 'paid' | 'cancelled'
  dueDate: string
  createdAt: string
  paidAt?: string
}

export interface Announcement {
  id: number
  title: string
  message: string
  createdAt: string
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
