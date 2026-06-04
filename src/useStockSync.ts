import { useEffect, useRef } from 'react'

const WS_URL = 'ws://localhost:3001'
const API_URL = 'http://localhost:3001/api'

export function useStockSync(
  products: { id: number; name: string; stock: number }[],
  onStockUpdate: (id: number, stock: number) => void
) {
  const ws = useRef<WebSocket | null>(null)
  const seeded = useRef(false)

  // Seed DB with initial products once
  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    fetch(`${API_URL}/stock/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products.map(p => ({ id: p.id, name: p.name, stock: p.stock })))
    })
  }, [])

  // Connect WebSocket
  useEffect(() => {
    function connect() {
      const socket = new WebSocket(WS_URL)
      ws.current = socket

      socket.onopen = () => console.log('WS connected')

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data)

        if (data.type === 'STOCK_SNAPSHOT') {
          // Apply full snapshot from DB
          data.products.forEach((p: { id: number; stock: number }) => {
            onStockUpdate(p.id, p.stock)
          })
        }

        if (data.type === 'STOCK_UPDATE') {
          // Apply single product update
          onStockUpdate(data.product.id, data.product.stock)
        }
      }

      socket.onclose = () => {
        console.log('WS disconnected, reconnecting in 3s...')
        setTimeout(connect, 3000)
      }

      socket.onerror = (err) => {
        console.error('WS error', err)
        socket.close()
      }
    }

    connect()
    return () => ws.current?.close()
  }, [])

  // Expose function to push stock update to server
  function pushStockUpdate(id: number, stock: number) {
    fetch(`${API_URL}/stock/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    })
  }

  return { pushStockUpdate }
}