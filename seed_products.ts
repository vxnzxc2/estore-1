import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const PRODUCTS = [
  { id: 1,  name: 'Chippy BBQ',              price: 15,  category: 'Snacks',        stock: 20 },
  { id: 2,  name: 'Nova Country Cheddar',    price: 12,  category: 'Snacks',        stock: 15 },
  { id: 3,  name: 'Skyflakes Crackers',      price: 10,  category: 'Snacks',        stock: 25 },
  { id: 4,  name: 'Piattos Cheese',          price: 20,  category: 'Snacks',        stock: 8  },
  { id: 5,  name: 'Boy Bawang Garlic',       price: 10,  category: 'Snacks',        stock: 18 },
  { id: 6,  name: 'Coke Mismo',              price: 18,  category: 'Drinks',        stock: 30 },
  { id: 7,  name: 'Royal TRU-Orange',        price: 18,  category: 'Drinks',        stock: 22 },
  { id: 8,  name: 'C2 Green Tea',            price: 22,  category: 'Drinks',        stock: 12 },
  { id: 9,  name: 'Milo Sachet (Hot)',       price: 8,   category: 'Drinks',        stock: 50 },
  { id: 10, name: 'Gatorade Blue',           price: 30,  category: 'Drinks',        stock: 10 },
  { id: 11, name: 'Century Tuna (185g)',     price: 38,  category: 'Canned Goods',  stock: 20 },
  { id: 12, name: 'Spam Lite',               price: 95,  category: 'Canned Goods',  stock: 5  },
  { id: 13, name: 'Argentina Corned Beef',   price: 55,  category: 'Canned Goods',  stock: 14 },
  { id: 14, name: 'Ligo Sardines',           price: 28,  category: 'Canned Goods',  stock: 18 },
  { id: 15, name: 'Datu Puti Suka',          price: 25,  category: 'Condiments',    stock: 12 },
  { id: 16, name: 'UFC Banana Ketchup',      price: 35,  category: 'Condiments',    stock: 9  },
  { id: 17, name: 'Knorr Magic Sarap',       price: 12,  category: 'Condiments',    stock: 30 },
  { id: 18, name: 'Lucky Me Pancit Canton',  price: 13,  category: 'Condiments',    stock: 40 },
  { id: 19, name: 'Safeguard Bar Soap',      price: 42,  category: 'Personal Care', stock: 15 },
  { id: 20, name: 'Head & Shoulders',        price: 8,   category: 'Personal Care', stock: 35 },
  { id: 21, name: 'Colgate Toothpaste',      price: 55,  category: 'Personal Care', stock: 10 },
  { id: 22, name: 'Nescafe 3-in-1',          price: 8,   category: 'Sachets',       stock: 60 },
  { id: 23, name: 'Tang Orange Powder',      price: 7,   category: 'Sachets',       stock: 40 },
  { id: 24, name: 'Surf Powder Sachet',      price: 10,  category: 'Sachets',       stock: 25 },
  { id: 25, name: 'Champion Detergent',      price: 10,  category: 'Sachets',       stock: 20 },
  { id: 26, name: 'White Rabbit Candy',      price: 5,   category: 'Candy',         stock: 50 },
  { id: 27, name: 'Gummy Bears (Haribo)',    price: 25,  category: 'Candy',         stock: 15 },
  { id: 28, name: 'Flat Tops Choco',         price: 5,   category: 'Candy',         stock: 30 },
  { id: 29, name: 'Ricoa Flat Tops',         price: 5,   category: 'Candy',         stock: 28 },
]

async function seed() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_stock (
        id         INTEGER PRIMARY KEY,
        name       TEXT    NOT NULL,
        stock      INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    console.log('✅ Table ready\n')

    let inserted = 0
    let updated = 0

    for (const p of PRODUCTS) {
      const res = await pool.query(
        `INSERT INTO product_stock (id, name, stock)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               stock = EXCLUDED.stock,
               updated_at = NOW()
         RETURNING (xmax = 0) AS is_insert`,
        [p.id, p.name, p.stock]
      )
      const wasInsert = res.rows[0].is_insert
      if (wasInsert) {
        inserted++
        console.log(`  ✅ Inserted: [${String(p.id).padStart(2)}] ${p.name.padEnd(25)} stock: ${p.stock}`)
      } else {
        updated++
        console.log(`  🔄 Updated:  [${String(p.id).padStart(2)}] ${p.name.padEnd(25)} stock: ${p.stock}`)
      }
    }

    const count = await pool.query('SELECT COUNT(*) FROM product_stock')
    console.log(`\n🎉 Done! ${inserted} inserted, ${updated} updated.`)
    console.log(`📦 Total products in DB: ${count.rows[0].count}`)
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
