import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { Pool } from 'pg'
import cors from 'cors'
import http from 'http'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const server = http.createServer(app)
const wss    = new WebSocketServer({ server })

function broadcast(data: object) {
  const msg = JSON.stringify(data)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg)
  })
}

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_stock (
      id         INTEGER PRIMARY KEY,
      name       TEXT    NOT NULL,
      stock      INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id           TEXT PRIMARY KEY,
      items        JSONB        NOT NULL,
      total        NUMERIC      NOT NULL,
      delivery_fee NUMERIC      NOT NULL,
      grand_total  NUMERIC      NOT NULL,
      placed_at    TIMESTAMPTZ  NOT NULL,
      status       TEXT         NOT NULL DEFAULT 'completed',
      method       TEXT,
      fulfillment  TEXT
    )
  `)
  console.log('[DB] ready')
}

// GET all stock
app.get('/api/stock', async (_req, res) => {
  const result = await pool.query('SELECT * FROM product_stock ORDER BY id')
  res.json(result.rows)
})

// POST seed — ONLY inserts products that don't exist yet, NEVER overwrites stock
app.post('/api/stock/seed', async (req, res) => {
  const products: { id: number; name: string; stock: number }[] = req.body
  for (const p of products) {
    await pool.query(
      `INSERT INTO product_stock (id, name, stock)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.stock]
    )
  }
  const result = await pool.query('SELECT * FROM product_stock ORDER BY id')
  res.json(result.rows)
})

// PATCH update single product stock
app.patch('/api/stock/:id', async (req, res) => {
  const { id }    = req.params
  const { stock } = req.body as { stock: number }

  const result = await pool.query(
    `UPDATE product_stock
     SET stock = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [stock, id]
  )

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const updated = result.rows[0]
  broadcast({ type: 'STOCK_UPDATE', product: updated })
  res.json(updated)
})

// POST save a new order
app.post('/api/orders', async (req, res) => {
  const o = req.body
  await pool.query(
    `INSERT INTO orders (id, items, total, delivery_fee, grand_total, placed_at, status, method, fulfillment)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [o.id, JSON.stringify(o.items), o.total, o.deliveryFee, o.grandTotal, o.placedAt, o.status, o.method, o.fulfillment]
  )
  res.json({ ok: true })
})

// GET all orders
app.get('/api/orders', async (_req, res) => {
  const result = await pool.query('SELECT * FROM orders ORDER BY placed_at DESC')
  res.json(result.rows)
})

// WebSocket — send full DB snapshot on connect
wss.on('connection', async (ws) => {
  console.log('[WS] client connected')
  const result = await pool.query('SELECT * FROM product_stock ORDER BY id')
  ws.send(JSON.stringify({ type: 'STOCK_SNAPSHOT', products: result.rows }))
  ws.on('close', () => console.log('[WS] client disconnected'))
})

initDB().then(() => {
  server.listen(3002, () => console.log('[Server] http://localhost:3002'))
})
