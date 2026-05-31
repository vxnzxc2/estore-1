// ─────────────────────────────────────────────────────────────────────────────
// PATCH for src/App.tsx
// Replace / add the sections below.  Everything else in App.tsx stays the same.
// ─────────────────────────────────────────────────────────────────────────────

// 1. ADD this import at the top (if not already present):
import { useState, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 2. BATCHED ACTIVITY LOG
//    Add inside the App() function body, after your existing state declarations.
// ─────────────────────────────────────────────────────────────────────────────

// Pending log messages keyed by product name — last message wins within window
const pendingLogs = useRef<Map<string, string>>(new Map())
const logTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

// Call this from ProductCard via onLog prop.
// It debounces: if the same product is updated again within 600 ms, only
// the latest message is kept — so rapid +/- taps produce ONE notification.
const handleProductLog = (msg: string) => {
  // Extract product name from message for keying
  const key = msg.replace(/^(Added|Bought) [\d.]+(x| kg) /, '')
  pendingLogs.current.set(key, msg)

  if (logTimer.current) clearTimeout(logTimer.current)
  logTimer.current = setTimeout(() => {
    pendingLogs.current.forEach(m => {
      addAnnouncement({ title: 'Cart Activity', message: m })
    })
    pendingLogs.current.clear()
    logTimer.current = null
  }, 600)
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. UPDATE the <ProductCard> JSX inside the filtered.map(...)
//    Add the two new props: onQtyChange and onLog
// ─────────────────────────────────────────────────────────────────────────────

/*
  <ProductCard
    key={p.id}
    product={p}
    qty={cart.find(i => i.id === p.id)?.qty ?? 0}
    onAdd={addToCart}
    onBuyNow={buyNow}
    onRemove={removeItem}
    onQtyChange={setQty}          // ← already there from previous patch
    onLog={handleProductLog}      // ← ADD THIS
    light={light}
    highlight={!!search && (...)}
  />
*/
