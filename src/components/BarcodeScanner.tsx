import { useEffect, useRef, useState, useCallback } from 'react'
import Quagga from '@ericblade/quagga2'
import { X, Camera, ZapOff, AlertTriangle } from 'lucide-react'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
  light?: boolean
}

export default function BarcodeScanner({ onDetected, onClose, light }: Props) {
  const scannerRef  = useRef<HTMLDivElement>(null)
  const [error,     setError]     = useState('')
  const [scanning,  setScanning]  = useState(false)
  const [lastCode,  setLastCode]  = useState('')
  const detectedAt  = useRef(0)

  const stopScanner = useCallback(() => {
    try { Quagga.stop() } catch (_) {}
    setScanning(false)
  }, [])

  const startScanner = useCallback(() => {
    if (!scannerRef.current) return
    setError('')
    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
            width:  { ideal: 640 },
            height: { ideal: 480 },
          },
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'code_128_reader',
            'code_39_reader',
            'upc_reader',
            'upc_e_reader',
          ],
        },
        locate: true,
        numOfWorkers: 2,
        frequency: 10,
      },
      (err) => {
        if (err) {
          setError(
            err.toString().includes('Permission')
              ? 'Camera permission denied. Please allow camera access.'
              : 'Could not start camera. Make sure your device has a camera.'
          )
          return
        }
        Quagga.start()
        setScanning(true)
      }
    )

    Quagga.onDetected((result) => {
      const code = result?.codeResult?.code
      if (!code) return
      // Debounce — only fire once per 2 seconds per code
      const now = Date.now()
      if (code === lastCode && now - detectedAt.current < 2000) return
      detectedAt.current = now
      setLastCode(code)
      // Flash feedback
      if (scannerRef.current) {
        scannerRef.current.style.outline = '4px solid #22c55e'
        setTimeout(() => {
          if (scannerRef.current) scannerRef.current.style.outline = 'none'
        }, 400)
      }
      onDetected(code)
    })
  }, [lastCode, onDetected])

  useEffect(() => {
    startScanner()
    return () => stopScanner()
  }, [])

  const overlay = light ? 'bg-white/95'   : 'bg-[#080c14]/95'
  const card    = light ? 'bg-white border border-gray-200 shadow-xl' : 'bg-slate-800 border border-white/10 shadow-2xl'
  const title   = light ? 'text-gray-900' : 'text-white'
  const sub     = light ? 'text-gray-400' : 'text-slate-400'
  const closeB  = light ? 'bg-gray-100 hover:bg-gray-200 text-gray-500' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay} backdrop-blur-sm`}>
      <div className={`${card} rounded-2xl w-full max-w-md overflow-hidden`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Camera size={16} className="text-amber-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>
                Barcode Scanner
              </h2>
              <p className={`${sub} text-xs`}>
                {scanning ? 'Point camera at barcode' : 'Initializing camera…'}
              </p>
            </div>
          </div>
          <button onClick={() => { stopScanner(); onClose() }}
            className={`w-8 h-8 rounded-lg ${closeB} flex items-center justify-center transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Camera view */}
        <div className="relative bg-black" style={{ height: 280 }}>
          {/* Quagga mounts video here */}
          <div ref={scannerRef} className="w-full h-full" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Quagga injects a <video> and <canvas> here */}
          </div>

          {/* Scan line overlay */}
          {scanning && !error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Corner brackets */}
              <div className="relative w-52 h-32">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br" />
                {/* Scan line */}
                <div className="absolute left-1 right-1 h-0.5 bg-amber-400/70 animate-scan-line" style={{
                  top: '50%',
                  boxShadow: '0 0 6px 1px rgba(245,158,11,0.5)',
                  animation: 'scanLine 1.8s ease-in-out infinite',
                }} />
              </div>
              <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60 font-medium">
                Align barcode within the frame
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/90 px-6 text-center">
              <ZapOff size={36} className="text-red-400" strokeWidth={1.5} />
              <p className="text-white font-semibold text-sm">{error}</p>
              <button onClick={startScanner}
                className="bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* Loading */}
          {!scanning && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Starting camera…</p>
            </div>
          )}
        </div>

        {/* Last detected */}
        {lastCode && (
          <div className="px-5 py-3 bg-green-500/10 border-t border-green-500/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-green-400 text-xs font-medium">
              Last scanned: <span className="font-bold tracking-wider">{lastCode}</span>
            </p>
          </div>
        )}

        {/* Tip */}
        <div className={`px-5 py-3 flex items-start gap-2 ${light ? 'bg-amber-50 border-t border-amber-100' : 'bg-amber-500/5 border-t border-amber-500/10'}`}>
          <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
          <p className={`text-xs ${light ? 'text-amber-700' : 'text-amber-400/80'}`}>
            Make sure the product barcode is assigned in Admin → Products. Products without a barcode won't be matched.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 10%; }
          50%  { top: 85%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  )
}
