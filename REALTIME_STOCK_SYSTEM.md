# 🔄 Real-Time Stock Management System

## Overview

The stock management system is now **fully soft-coded** with automatic database synchronization using WebSocket. Every time stock levels change in the database, **all connected clients are instantly notified** without any manual refresh needed.

## How It Works

### 1. **Frontend WebSocket Connection** (`src/store.ts`)

When the app loads, it:
- Connects to the WebSocket server on port 3001
- Receives an initial `STOCK_SNAPSHOT` with all current product stocks
- Listens continuously for `STOCK_UPDATE` messages when stock changes

```typescript
// Real-time WebSocket connection for stock updates
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
const ws = new WebSocket(`${protocol}://${window.location.hostname}:3001`)

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  
  if (message.type === 'STOCK_UPDATE') {
    // Automatically update product stock in state
    setProducts(prev => prev.map(p =>
      p.id === updatedProduct.id
        ? { ...p, stock: updatedProduct.stock }
        : p
    ))
  }
}
```

### 2. **Backend Broadcasting** (`server/index.ts`)

When stock changes, the server broadcasts to all connected clients:

**When an order is placed** (lines 143-159):
```typescript
// Update stock in database
const updateResult = await client.query(
  `UPDATE products SET stock = stock - $1, updated_at=CURRENT_TIMESTAMP 
   WHERE id = $2 RETURNING *`,
  [item.qty, item.id]
)

// Broadcast update to all connected WebSocket clients
if (updateResult.rows.length > 0) {
  broadcast({ type: 'STOCK_UPDATE', product: updateResult.rows[0] })
}
```

**When admin manually updates stock** (lines 95-111):
```typescript
app.put('/api/products/:id/stock', async (req, res) => {
  const result = await pool.query(
    `UPDATE products SET stock=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
    [stock, req.params.id]
  )
  // Broadcast to all clients
  broadcast({ type: 'STOCK_UPDATE', product: result.rows[0] })
  res.json(result.rows[0])
})
```

### 3. **Auto-Reconnection Logic**

If the WebSocket connection drops, the system automatically reconnects every 3 seconds:

```typescript
ws.onclose = () => {
  console.log('[Store] WebSocket disconnected, will retry in 3s...')
  // Auto-reconnect after 3 seconds
  reconnectTimeout = setTimeout(connectWebSocket, 3000)
}
```

## Data Flow Diagram

```
┌─────────────────┐
│  Database       │
│  (PostgreSQL)   │
└────────┬────────┘
         │ (STOCK_UPDATE)
         │
┌────────▼────────┐
│  Server         │
│  (Express + WS) │ ◄─── Admin updates stock
│  :3001          │      or Order places
└────────┬────────┘
         │ broadcast()
         │
    ┌────┴────────────────────┐
    │                         │
┌───▼──────┐           ┌──────▼──┐
│ Client 1 │           │ Client 2│
│ (Browser)│           │(Browser)│
│ Stock: 5 │ ◄─────WS──│Stock: 5 │
└──────────┘  updates  └─────────┘
```

## Features

✨ **Zero Hardcoding**
- All stock values are pulled from the database
- No product data is hardcoded in the frontend

🔌 **Real-Time Sync**
- Stock updates propagate instantly to all connected clients
- Uses WebSocket for bi-directional communication
- Automatic snapshot on connection

🔄 **Resilient**
- Auto-reconnects if connection drops
- Graceful fallback to HTTP API if needed
- Error logging for debugging

📊 **Automatic Updates**
- Order placement → Stock decrements automatically
- Admin updates → All clients see changes instantly
- No page refresh needed

## Testing the System

### 1. Place an Order (Frontend)
- Add items to cart
- Place order
- Stock decreases automatically for all clients

### 2. Manual Stock Update (Admin Panel)
- Go to Admin → Products
- Update stock for any product
- All connected clients see the change immediately

### 3. Monitor WebSocket (Browser Console)
```javascript
// You'll see these logs:
[Store] WebSocket connected for live stock updates
[Store] Stock updated: Product 1 → 45
[Store] Stock updated: Product 2 → 120
```

### 4. Test Reconnection
- Open browser DevTools → Network → Disconnect
- Close DevTools after 5 seconds
- System automatically reconnects and syncs

## Database Schema

The `products` table includes:
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10, 2),
  stock INTEGER,           -- Real-time stock level
  updated_at TIMESTAMP,    -- Last update time
  ...
)
```

## API Endpoints

### Get All Products
```bash
GET /api/products
# Returns all products with current stock from database
```

### Update Stock (Admin)
```bash
PUT /api/products/:id/stock
Content-Type: application/json

{ "stock": 50 }
# Broadcasts to all clients via WebSocket
```

### Place Order (Updates Stock Automatically)
```bash
POST /api/orders
Content-Type: application/json

{ 
  id: "ORD-123456",
  items: [{ id: 1, qty: 2 }, ...],
  total: 1000,
  ...
}
# Decrements stock in database
# Broadcasts stock updates to all clients
```

## Environment Variables

```env
DATABASE_URL=postgresql://...  # Neon PostgreSQL
PORT=3001                      # Server port
```

## Development

To run the system:

```bash
# Terminal 1: Start backend (port 3001)
npm run server

# Terminal 2: Start frontend (port 5173)
npm run dev

# Open browser
# http://localhost:5173
```

## Architecture Benefits

| Feature | Benefit |
|---------|---------|
| **WebSocket** | Real-time updates without polling |
| **Database-driven** | Single source of truth |
| **Soft-coded** | No hardcoded values |
| **Auto-reconnect** | Resilient to network issues |
| **Broadcasting** | Scales to multiple clients |

## Troubleshooting

### Stock not updating?
1. Check WebSocket connection in browser console
2. Verify database connection in server logs
3. Check firewall/proxy for WebSocket (port 3001)

### WebSocket connection fails?
1. Ensure backend is running on port 3001
2. Check CORS headers in server
3. Browser DevTools → Network → Messages tab

### Slow updates?
1. Check database query performance
2. Verify network latency to server
3. Check browser console for errors

## Code Changes Summary

### Modified Files
- `src/store.ts` - Added WebSocket connection and real-time stock sync
- `server/index.ts` - Already had broadcasting (no changes needed)

### Key Features Added
1. ✅ WebSocket connection on component mount
2. ✅ STOCK_SNAPSHOT handling for initial load
3. ✅ STOCK_UPDATE listener for real-time updates
4. ✅ Auto-reconnection logic (3-second retry)
5. ✅ Console logging for debugging
6. ✅ Clean up on component unmount

---

**Status**: ✅ **Production Ready**

The real-time stock management system is fully implemented and ready for use. Stock levels are automatically synchronized across all connected clients using WebSocket technology.
