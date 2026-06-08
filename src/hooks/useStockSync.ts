import { useEffect, useRef } from 'react'

const WS_URL  = 'ws://localhost:3001'
const API_URL = 'http://localhost:3001/api'

export function useStockSync(
  products: { id: number; name: string; stock: number }[],
  onStockUpdate: (id: number, stock: number) => void
) {
  const ws      = useRef<WebSocket | null>(null)
  const seeded  = useRef(false)

  // ── Seed DB only if products don't exist yet (first run only) ──────────
  useEffect(() => {
    if (seeded.current) return
    seeded.current = true

    // Only seed products that are missing — never overwrite existing stock
    fetch(`${API_URL}/stock/seed`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(
        products.map(p => ({ id: p.id, name: p.name, stock: p.stock }))
      ),
    }).catch(() => {})
  }, [])

  // ── WebSocket connection ────────────────────────────────────────────────
  useEffect(() => {
    function connect() {
      try {
        const socket = new WebSocket(WS_URL)
        ws.current = socket

        socket.onopen = () => console.log('[WS] connected')

        socket.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data)

            if (data.type === 'STOCK_SNAPSHOT') {
              // Apply full snapshot from DB — these are the real persisted values
              data.products.forEach((p: { id: number; stock: number }) => {
                onStockUpdate(p.id, p.stock)
              })
            }

            if (data.type === 'STOCK_UPDATE') {
              onStockUpdate(data.product.id, data.product.stock)
            }
          } catch (_) {}
        }

        socket.onclose = () => {
          console.log('[WS] disconnected — retrying in 3s')
          setTimeout(connect, 3000)
        }

        socket.onerror = () => socket.close()
      } catch (_) {}
    }

    connect()
    return () => {
      ws.current?.close()
    }
  }, [])

  // ── Push stock update to server ─────────────────────────────────────────
  function pushStockUpdate(id: number, stock: number) {
    fetch(`${API_URL}/stock/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ stock }),
    }).catch(() => {})
  }

  return { pushStockUpdate }
}
