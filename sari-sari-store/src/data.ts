import type { Product, Category } from './types'

export const CATEGORIES: Category[] = [
  'All',
  'Snacks',
  'Drinks',
  'Canned Goods',
  'Condiments',
  'Personal Care',
  'Sachets',
  'Candy',
]

export const CAT_COLORS: Record<Category, string> = {
  All:             'bg-gray-700 text-white',
  Snacks:          'bg-orange-500 text-white',
  Drinks:          'bg-blue-500 text-white',
  'Canned Goods':  'bg-teal-600 text-white',
  Condiments:      'bg-yellow-500 text-gray-900',
  'Personal Care': 'bg-indigo-500 text-white',
  Sachets:         'bg-amber-500 text-white',
  Candy:           'bg-pink-500 text-white',
}

export const CAT_ICONS: Record<Category, string> = {
  All:             '🏪',
  Snacks:          '🍿',
  Drinks:          '🥤',
  'Canned Goods':  '🥫',
  Condiments:      '🧂',
  'Personal Care': '🧼',
  Sachets:         '📦',
  Candy:           '🍬',
}

export const PROMO_MESSAGES: string[] = [
  '🎉 Mabuhay sa Tindahan ni Aling Rosa! 🎉',
  '🛒 Libre delivery sa ₱500+ na order!',
  '💥 Bagong dating: Spam Lite at Gatorade Blue!',
  '🌟 Araw-araw mababang presyo!',
  '❤️ Salamat sa inyong patuloy na suporta!',
]

export const PRODUCTS: Product[] = [
  // Snacks
  { id: 1,  name: 'Chippy BBQ',              price: 15, category: 'Snacks',          emoji: '🌽', color: 'bg-orange-400', badge: 'Paborito!',  stock: 20 },
  { id: 2,  name: 'Nova Country Cheddar',    price: 12, category: 'Snacks',          emoji: '🧀', color: 'bg-yellow-400', badge: null,          stock: 15 },
  { id: 3,  name: 'Skyflakes Crackers',      price: 10, category: 'Snacks',          emoji: '🫓', color: 'bg-amber-300',  badge: null,          stock: 25 },
  { id: 4,  name: 'Piattos Cheese',          price: 20, category: 'Snacks',          emoji: '🥔', color: 'bg-yellow-500', badge: 'Hot!',        stock: 8  },
  { id: 5,  name: 'Boy Bawang Garlic',       price: 10, category: 'Snacks',          emoji: '🧄', color: 'bg-orange-300', badge: null,          stock: 18 },
  // Drinks
  { id: 6,  name: 'Coke Mismo',              price: 18, category: 'Drinks',          emoji: '🥤', color: 'bg-red-500',    badge: 'Classic!',    stock: 30 },
  { id: 7,  name: 'Royal TRU-Orange',        price: 18, category: 'Drinks',          emoji: '🍊', color: 'bg-orange-500', badge: null,          stock: 22 },
  { id: 8,  name: 'C2 Green Tea',            price: 22, category: 'Drinks',          emoji: '🍵', color: 'bg-green-400',  badge: null,          stock: 12 },
  { id: 9,  name: 'Milo Sachet (Hot)',       price: 8,  category: 'Drinks',          emoji: '☕', color: 'bg-amber-700',  badge: null,          stock: 50 },
  { id: 10, name: 'Gatorade Blue',           price: 30, category: 'Drinks',          emoji: '💧', color: 'bg-blue-400',   badge: null,          stock: 10 },
  // Canned Goods
  { id: 11, name: 'Century Tuna (185g)',     price: 38, category: 'Canned Goods',    emoji: '🐟', color: 'bg-blue-500',   badge: 'Sulit!',      stock: 20 },
  { id: 12, name: 'Spam Lite',               price: 95, category: 'Canned Goods',    emoji: '🥫', color: 'bg-pink-500',   badge: null,          stock: 5  },
  { id: 13, name: 'Argentina Corned Beef',   price: 55, category: 'Canned Goods',    emoji: '🥩', color: 'bg-red-400',    badge: null,          stock: 14 },
  { id: 14, name: 'Ligo Sardines',           price: 28, category: 'Canned Goods',    emoji: '🐠', color: 'bg-teal-400',   badge: null,          stock: 18 },
  // Condiments
  { id: 15, name: 'Datu Puti Suka',          price: 25, category: 'Condiments',      emoji: '🍶', color: 'bg-amber-200',  badge: null,          stock: 12 },
  { id: 16, name: 'UFC Banana Ketchup',      price: 35, category: 'Condiments',      emoji: '🍅', color: 'bg-yellow-600', badge: null,          stock: 9  },
  { id: 17, name: 'Knorr Magic Sarap',       price: 12, category: 'Condiments',      emoji: '✨', color: 'bg-yellow-400', badge: null,          stock: 30 },
  { id: 18, name: 'Lucky Me Pancit Canton',  price: 13, category: 'Condiments',      emoji: '🍜', color: 'bg-orange-400', badge: 'Trending!',   stock: 40 },
  // Personal Care
  { id: 19, name: 'Safeguard Bar Soap',      price: 42, category: 'Personal Care',   emoji: '🧼', color: 'bg-blue-300',   badge: null,          stock: 15 },
  { id: 20, name: 'Head & Shoulders Sachet', price: 8,  category: 'Personal Care',   emoji: '🧴', color: 'bg-indigo-400', badge: null,          stock: 35 },
  { id: 21, name: 'Colgate Toothpaste',      price: 55, category: 'Personal Care',   emoji: '🦷', color: 'bg-red-400',    badge: null,          stock: 10 },
  // Sachets
  { id: 22, name: 'Nescafe 3-in-1',          price: 8,  category: 'Sachets',         emoji: '☕', color: 'bg-amber-600',  badge: 'Bestseller!', stock: 60 },
  { id: 23, name: 'Tang Orange Powder',      price: 7,  category: 'Sachets',         emoji: '🍊', color: 'bg-orange-400', badge: null,          stock: 40 },
  { id: 24, name: 'Surf Powder Sachet',      price: 10, category: 'Sachets',         emoji: '🧺', color: 'bg-blue-400',   badge: null,          stock: 25 },
  { id: 25, name: 'Champion Detergent',      price: 10, category: 'Sachets',         emoji: '🫧', color: 'bg-green-400',  badge: null,          stock: 20 },
  // Candy
  { id: 26, name: 'White Rabbit Candy',      price: 5,  category: 'Candy',           emoji: '🐰', color: 'bg-pink-300',   badge: null,          stock: 50 },
  { id: 27, name: 'Gummy Bears (Haribo)',    price: 25, category: 'Candy',           emoji: '🐻', color: 'bg-purple-400', badge: null,          stock: 15 },
  { id: 28, name: 'Flat Tops Choco',         price: 5,  category: 'Candy',           emoji: '🍫', color: 'bg-amber-800',  badge: 'Nostalgic!',  stock: 30 },
  { id: 29, name: 'Ricoa Flat Tops',         price: 5,  category: 'Candy',           emoji: '🍬', color: 'bg-pink-500',   badge: null,          stock: 28 },
]
