import type { Product, Category } from './types'

export const CATEGORIES: Category[] = [
  'All', 'Snacks', 'Drinks', 'Canned Goods', 'Condiments', 'Personal Care', 'Sachets', 'Candy',
]

export const CAT_COLORS: Record<string, string> = {
  All:             'bg-slate-700 text-white',
  Snacks:          'bg-orange-700 text-white',
  Drinks:          'bg-blue-800 text-white',
  'Canned Goods':  'bg-stone-700 text-white',
  Condiments:      'bg-amber-800 text-white',
  'Personal Care': 'bg-teal-800 text-white',
  Sachets:         'bg-zinc-700 text-white',
  Candy:           'bg-red-800 text-white',
}

export const PROMO_MESSAGES: string[] = [
  '🎉 Mabuhay sa Tindahan ni Evaristo!',
  '🚚 FREE delivery sa ₱1000+ na order!',
  '🔥 Bagong dating: Spam Lite at Gatorade Blue!',
  '⚡ Araw-araw mababang presyo!',
  '👊 Salamat sa inyong patuloy na suporta!',
]

export const PRODUCTS: Product[] = [
  { id: 1,  name: 'Chippy BBQ',              price: 15,  category: 'Snacks',        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80', badge: 'Paborito!',   stock: 20 },
  { id: 2,  name: 'Nova Country Cheddar',    price: 12,  category: 'Snacks',        image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&q=80', badge: null,          stock: 15 },
  { id: 3,  name: 'Skyflakes Crackers',      price: 10,  category: 'Snacks',        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80', badge: null,          stock: 25 },
  { id: 4,  name: 'Piattos Cheese',          price: 20,  category: 'Snacks',        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&q=80', badge: 'Hot!',        stock: 8  },
  { id: 5,  name: 'Boy Bawang Garlic',       price: 10,  category: 'Snacks',        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80', badge: null,          stock: 18 },
  { id: 6,  name: 'Coke Mismo',              price: 18,  category: 'Drinks',        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=80', badge: 'Classic!',    stock: 30 },
  { id: 7,  name: 'Royal TRU-Orange',        price: 18,  category: 'Drinks',        image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=300&q=80', badge: null,          stock: 22 },
  { id: 8,  name: 'C2 Green Tea',            price: 22,  category: 'Drinks',        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80', badge: null,          stock: 12 },
  { id: 9,  name: 'Milo Sachet (Hot)',       price: 8,   category: 'Drinks',        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80', badge: null,          stock: 50 },
  { id: 10, name: 'Gatorade Blue',           price: 30,  category: 'Drinks',        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&q=80', badge: null,          stock: 10 },
  { id: 11, name: 'Century Tuna (185g)',     price: 38,  category: 'Canned Goods',  image: 'https://images.unsplash.com/photo-1614579576272-b2a9e90df5d1?w=300&q=80', badge: 'Sulit!',      stock: 20 },
  { id: 12, name: 'Spam Lite',               price: 95,  category: 'Canned Goods',  image: 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=300&q=80', badge: null,          stock: 5  },
  { id: 13, name: 'Argentina Corned Beef',   price: 55,  category: 'Canned Goods',  image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300&q=80', badge: null,          stock: 14 },
  { id: 14, name: 'Ligo Sardines',           price: 28,  category: 'Canned Goods',  image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=300&q=80', badge: null,          stock: 18 },
  { id: 15, name: 'Datu Puti Suka',          price: 25,  category: 'Condiments',    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80', badge: null,          stock: 12 },
  { id: 16, name: 'UFC Banana Ketchup',      price: 35,  category: 'Condiments',    image: 'https://images.unsplash.com/photo-1602253057119-44d745d9b860?w=300&q=80', badge: null,          stock: 9  },
  { id: 17, name: 'Knorr Magic Sarap',       price: 12,  category: 'Condiments',    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=300&q=80', badge: null,          stock: 30 },
  { id: 18, name: 'Lucky Me Pancit Canton',  price: 13,  category: 'Condiments',    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&q=80', badge: 'Trending!',   stock: 40 },
  { id: 19, name: 'Safeguard Bar Soap',      price: 42,  category: 'Personal Care', image: 'https://images.unsplash.com/photo-1607006483224-01e1d3fb09c1?w=300&q=80', badge: null,          stock: 15 },
  { id: 20, name: 'Head & Shoulders',        price: 8,   category: 'Personal Care', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&q=80', badge: null,          stock: 35 },
  { id: 21, name: 'Colgate Toothpaste',      price: 55,  category: 'Personal Care', image: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?w=300&q=80', badge: null,          stock: 10 },
  { id: 22, name: 'Nescafe 3-in-1',          price: 8,   category: 'Sachets',       image: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=300&q=80', badge: 'Bestseller!', stock: 60 },
  { id: 23, name: 'Tang Orange Powder',      price: 7,   category: 'Sachets',       image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&q=80', badge: null,          stock: 40 },
  { id: 24, name: 'Surf Powder Sachet',      price: 10,  category: 'Sachets',       image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300&q=80', badge: null,          stock: 25 },
  { id: 25, name: 'Champion Detergent',      price: 10,  category: 'Sachets',       image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300&q=80', badge: null,          stock: 20 },
  { id: 26, name: 'White Rabbit Candy',      price: 5,   category: 'Candy',         image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&q=80', badge: null,          stock: 50 },
  { id: 27, name: 'Gummy Bears (Haribo)',    price: 25,  category: 'Candy',         image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&q=80', badge: null,          stock: 15 },
  { id: 28, name: 'Flat Tops Choco',         price: 5,   category: 'Candy',         image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300&q=80', badge: 'Nostalgic!',  stock: 30 },
  { id: 29, name: 'Ricoa Flat Tops',         price: 5,   category: 'Candy',         image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=300&q=80', badge: null,          stock: 28 },
]
