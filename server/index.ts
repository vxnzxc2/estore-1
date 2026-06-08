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

// ── PRODUCTS ENDPOINTS ────────────────────────────────────────
app.get('/api/products', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id, name, price, category, image, badge, stock,
        stock_unit, barcode, is_new, is_promo, is_bestseller
      FROM products
      ORDER BY id ASC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching products:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Add Product (Admin)
app.post('/api/admin/products', async (req, res) => {
  const { name, price, category, image, badge, stock, is_new, is_promo, is_bestseller } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, category, image, badge, stock, is_new, is_promo, is_bestseller)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, price, category, image, badge, stock, is_new || false, is_promo || false, is_bestseller || false]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error adding product:', err)
    res.status(500).json({ error: 'Failed to add product' })
  }
})

// Update Product (Admin)
app.put('/api/admin/products/:id', async (req, res) => {
  const { name, price, category, image, badge, stock, is_new, is_promo, is_bestseller } = req.body
  try {
    const result = await pool.query(
      `UPDATE products
       SET name=$1, price=$2, category=$3, image=$4, badge=$5, stock=$6, is_new=$7, is_promo=$8, is_bestseller=$9, updated_at=CURRENT_TIMESTAMP
       WHERE id=$10
       RETURNING *`,
      [name, price, category, image, badge, stock, is_new, is_promo, is_bestseller, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error updating product:', err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Update Stock (Admin or System)
app.put('/api/products/:id/stock', async (req, res) => {
  const { stock } = req.body
  try {
    const result = await pool.query(
      `UPDATE products SET stock=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
      [stock, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    broadcast({ type: 'STOCK_UPDATE', product: result.rows[0] })
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error updating stock:', err)
    res.status(500).json({ error: 'Failed to update stock' })
  }
})

// Delete Product (Admin)
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING *', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json({ message: 'Product deleted', product: result.rows[0] })
  } catch (err) {
    console.error('Error deleting product:', err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// ── ORDERS ENDPOINTS ────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  const { id, items, total, deliveryFee, grandTotal, method, fulfillment, placedAt } = req.body
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Create order
    await client.query(
      `INSERT INTO orders (id, total, delivery_fee, grand_total, payment_method, fulfillment, status, placed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, total, deliveryFee, grandTotal, method, fulfillment, 'completed', placedAt]
    )

    // Add order items and update stock
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, qty, image, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, item.id, item.name, item.price, item.qty, item.image, item.category]
      )

      // Update stock
      const updateResult = await client.query(
        `UPDATE products SET stock = stock - $1, updated_at=CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [item.qty, item.id]
      )

      if (updateResult.rows.length > 0) {
        broadcast({ type: 'STOCK_UPDATE', product: updateResult.rows[0] })
      }
    }

    await client.query('COMMIT')
    res.json({ id, message: 'Order placed successfully' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error placing order:', err)
    res.status(500).json({ error: 'Failed to place order' })
  } finally {
    client.release()
  }
})

app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id])
    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id])

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ ...orderResult.rows[0], items: itemsResult.rows })
  } catch (err) {
    console.error('Error fetching order:', err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// ── PRE-ORDERS ENDPOINTS ────────────────────────────────────────
app.post('/api/pre-orders', async (req, res) => {
  const { id, items, total, downPayment, paymentMethod, dueDate, createdAt } = req.body
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Create pre-order
    await client.query(
      `INSERT INTO pre_orders (id, total, down_payment, payment_method, status, due_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, total, downPayment, paymentMethod, 'pending', dueDate, createdAt]
    )

    // Add pre-order items
    for (const item of items) {
      await client.query(
        `INSERT INTO pre_order_items (pre_order_id, product_id, name, price, qty)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, item.id, item.name, item.price, item.qty]
      )
    }

    await client.query('COMMIT')
    res.json({ id, message: 'Pre-order placed successfully' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error placing pre-order:', err)
    res.status(500).json({ error: 'Failed to place pre-order' })
  } finally {
    client.release()
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// WebSocket — send full DB snapshot on connect
wss.on('connection', async (ws) => {
  console.log('[WS] client connected')
  try {
    const result = await pool.query(`
      SELECT id, name, price, category, image, badge, stock,
             stock_unit, barcode, is_new, is_promo, is_bestseller
      FROM products ORDER BY id
    `)
    ws.send(JSON.stringify({ type: 'STOCK_SNAPSHOT', products: result.rows }))
  } catch (err) {
    console.error('Error sending snapshot:', err)
  }
  ws.on('close', () => console.log('[WS] client disconnected'))
})

server.listen(3001, '0.0.0.0', () => {
  console.log('[Server] ✅ http://localhost:3001')
  console.log('[Database] Connected to Neon')
})
