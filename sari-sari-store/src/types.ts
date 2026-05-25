export interface Product {
  id: number
  name: string
  price: number
  category: string
  emoji: string
  color: string
  badge: string | null
  stock: number
}

export interface CartItem extends Product {
  qty: number
}

export type Category =
  | 'All'
  | 'Snacks'
  | 'Drinks'
  | 'Canned Goods'
  | 'Condiments'
  | 'Personal Care'
  | 'Sachets'
  | 'Candy'
