import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { Pool } from 'pg'
import cors from 'cors'
import http from 'http'

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

// ── Broadcast to all connected clients ──────────────────────────────────────
function broadcast(data: object) {
  const msg = JSON.stringify(data)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg)
  })
}

// ── Init DB table ────────────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_stock (
      id      INTEGER PRIMARY KEY,
      name    TEXT NOT NULL,
      stock   INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('DB ready')
}

// ── Routes ───────────────────────────────────────────────────────────────────

// GET all stock
app.get('/api/stock', async (_req, res) => {
  const result = await pool.query('SELECT * FROM product_stock ORDER BY id')
  res.json(result.rows)
})

// POST seed initial stock (call once on first run)
app.post('/api/stock/seed', async (req, res) => {
  const products: { id: number; name: string; stock: number }[] = req.body
  for (const p of products) {
    await pool.query(`
      INSERT INTO product_stock (id, name, stock)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [p.id, p.name, p.stock])
  }
  const result = await pool.query('SELECT * FROM product_stock ORDER BY id')
  res.json(result.rows)
})

// PATCH update stock after purchase
app.patch('/api/stock/:id', async (req, res) => {
  const { id } = req.params
  const { stock } = req.body
  const result = await pool.query(`
    UPDATE product_stock
    SET stock = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [stock, id])

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const updated = result.rows[0]
  // Notify all connected clients
  broadcast({ type: 'STOCK_UPDATE', product: updated })
  res.json(updated)
})

// ── WebSocket connection ──────────────────────────────────────────────────────
wss.on('connection', async (ws) => {
  console.log('Client connected')
  // Send current stock snapshot on connect
  const result = await pool.query('SELECT * FROM product_stock ORDER BY id')
  ws.send(JSON.stringify({ type: 'STOCK_SNAPSHOT', products: result.rows }))

  ws.on('close', () => console.log('Client disconnected'))
})

initDB().then(() => {
  server.listen(3001, () => console.log('Server running on http://localhost:3001'))
})