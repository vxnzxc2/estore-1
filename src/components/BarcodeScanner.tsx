import { useEffect, useRef, useState, useCallback } from 'react'
import Quagga from '@ericblade/quagga2'
import { X, Camera, ZapOff, AlertTriangle } from 'lucide-react'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
  light?: boolean
}

export default function BarcodeScanner({ onDetected, onClose, light }: Props) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [error,    setError]    = useState('')
  const [scanning, setScanning] = useState(false)
  const [lastCode, setLastCode] = useState('')
  const detectedAt = useRef(0)

  const stopScanner = useCallback(() => {
    try { Quagga.stop() } catch (_) {}
    setScanning(false)
  }, [])

  const startScanner = useCallback(() => {
    if (!scannerRef.current) return
    setError('')
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      },
      decoder: { readers: ['ean_reader','ean_8_reader','code_128_reader','code_39_reader','upc_reader','upc_e_reader'] },
      locate: true,
      numOfWorkers: 2,
      frequency: 10,
    }, (err) => {
      if (err) {
        setError(err.toString().includes('Permission')
          ? 'Camera permission denied. Please allow camera access.'
          : 'Could not start camera. Make sure your device has a camera.')
        return
      }
      Quagga.start()
      setScanning(true)
    })

    Quagga.onDetected((result) => {
      const code = result?.codeResult?.code
      if (!code) return
      const now = Date.now()
      if (code === lastCode && now - detectedAt.current < 2000) return
      detectedAt.current = now
      setLastCode(code)
      if (scannerRef.current) {
        scannerRef.current.style.outline = '4px solid #22c55e'
        setTimeout(() => { if (scannerRef.current) scannerRef.current.style.outline = 'none' }, 400)
      }
      onDetected(code)
    })
  }, [lastCode, onDetected])

  useEffect(() => { startScanner(); return () => stopScanner() }, [])

  const bg    = light ? 'bg-white'    : 'bg-[#0d1424]'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-400' : 'text-slate-400'
  const closeB= light ? 'bg-gray-100 text-gray-500' : 'bg-slate-700 text-slate-300'

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Full screen camera */}
      <div className="relative flex-1 bg-black overflow-hidden">
        <div ref={scannerRef} className="w-full h-full" style={{ position: 'relative', overflow: 'hidden' }} />

        {/* Overlay UI */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dark corners */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Scan window */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-44 bg-transparent" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}>
              {/* Corner brackets */}
              {[['top-0 left-0 border-t-2 border-l-2 rounded-tl-lg'], ['top-0 right-0 border-t-2 border-r-2 rounded-tr-lg'],
                ['bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg'], ['bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg']
              ].map(([cls], i) => (
                <div key={i} className={`absolute w-7 h-7 border-amber-400 ${cls}`} />
              ))}
              {scanning && (
                <div className="absolute left-1 right-1 h-0.5 bg-amber-400 animate-scan-line"
                  style={{ boxShadow: '0 0 8px 2px rgba(245,158,11,0.6)' }} />
              )}
            </div>
          </div>
          <p className="absolute bottom-32 left-0 right-0 text-center text-white/70 text-sm font-medium pointer-events-none">
            Align barcode within the frame
          </p>
        </div>

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe py-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-amber-400" strokeWidth={2} />
            <p className="text-white font-semibold text-sm">Barcode Scanner</p>
          </div>
          <button onClick={() => { stopScanner(); onClose() }}
            className="w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/95 px-6 text-center pointer-events-auto">
            <ZapOff size={40} className="text-red-400" strokeWidth={1.5} />
            <p className="text-white font-semibold text-sm">{error}</p>
            <button onClick={startScanner}
              className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              Try Again
            </button>
            <button onClick={onClose} className="text-slate-400 text-sm">Cancel</button>
          </div>
        )}

        {/* Loading */}
        {!scanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 pointer-events-auto">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Starting camera…</p>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className={`${bg} px-5 py-4 bottom-nav`}>
        {lastCode ? (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className={`${sub} text-xs`}>Last: <span className={`${title} font-mono font-bold`}>{lastCode}</span></p>
          </div>
        ) : null}
        <div className={`flex items-start gap-2 ${light ? 'text-amber-700' : 'text-amber-400/80'}`}>
          <AlertTriangle size={14} className="shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-xs">Assign barcodes to products in <span className="font-semibold">Admin → Products</span></p>
        </div>
      </div>
    </div>
  )
}
