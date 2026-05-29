import { useEffect, useRef, useState, useCallback } from 'react'
import Quagga from '@ericblade/quagga2'
import { X, Camera, ZapOff, AlertTriangle, ShieldAlert } from 'lucide-react'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
  light?: boolean
}

// Native BarcodeDetector (Chrome 83+ Android/Desktop, Edge, Samsung Internet)
const HAS_NATIVE_DETECTOR = typeof window !== 'undefined' && 'BarcodeDetector' in window

export default function BarcodeScanner({ onDetected, onClose, light }: Props) {
  const quaggaRef  = useRef<HTMLDivElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const rafRef     = useRef<number>(0)
  const lastCode   = useRef('')
  const lastAt     = useRef(0)

  const [scanning, setScanning] = useState(false)
  const [lastSeen, setLastSeen] = useState('')
  const [error,    setError]    = useState('')

  const stopAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    try { Quagga.stop() } catch (_) {}
    setScanning(false)
  }, [])

  const handleCode = useCallback((code: string) => {
    if (!code) return
    const now = Date.now()
    if (code === lastCode.current && now - lastAt.current < 2000) return
    lastCode.current = code
    lastAt.current   = now
    setLastSeen(code)
    onDetected(code)
  }, [onDetected])

  // ── Native BarcodeDetector path ──────────────────────────────────────────
  const startNative = useCallback(async () => {
    if (!videoRef.current) return
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setScanning(true)

      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'code_39', 'qr_code'],
      })

      const tick = async () => {
        if (!videoRef.current) return
        try {
          const results = await detector.detect(videoRef.current)
          if (results.length > 0) handleCode(results[0].rawValue)
        } catch (_) {}
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (err: any) {
      setError(friendlyError(err))
    }
  }, [handleCode])

  // ── Quagga fallback path ─────────────────────────────────────────────────
  const startQuagga = useCallback((useFacingEnv = true) => {
    if (!quaggaRef.current) return
    setError('')

    const videoConstraints: Record<string, any> = {
      width: { ideal: 1280 }, height: { ideal: 720 },
    }
    if (useFacingEnv) videoConstraints.facingMode = 'environment'

    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: quaggaRef.current,
        constraints: videoConstraints,
      },
      decoder: {
        readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader', 'upc_reader', 'upc_e_reader'],
      },
      locate: true,
      numOfWorkers: 0,   // main-thread — most compatible across devices
      frequency: 10,
    }, (err) => {
      if (err) {
        if (useFacingEnv) {
          // environment camera not available — retry without the constraint
          startQuagga(false)
        } else {
          setError(friendlyError(err))
        }
        return
      }
      Quagga.start()
      setScanning(true)
    })

    Quagga.onDetected((result) => {
      const code = result?.codeResult?.code
      if (code) handleCode(code)
    })
  }, [handleCode])

  // ── Entry point ──────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (!window.isSecureContext) {
      setError('__https__')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported on this browser.')
      return
    }
    if (HAS_NATIVE_DETECTOR) {
      startNative()
    } else {
      startQuagga()
    }
  }, [startNative, startQuagga])

  useEffect(() => { start(); return () => stopAll() }, [])

  const bg    = light ? 'bg-white'      : 'bg-[#0d1424]'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-400' : 'text-slate-400'

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Camera viewport */}
      <div className="relative flex-1 bg-black overflow-hidden">

        {/* Native: <video> element */}
        {HAS_NATIVE_DETECTOR && (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        )}
        {/* Quagga: div target */}
        {!HAS_NATIVE_DETECTOR && (
          <div ref={quaggaRef} className="w-full h-full" style={{ position: 'relative', overflow: 'hidden' }} />
        )}

        {/* Scan-window overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-44" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}>
                {[['top-0 left-0 border-t-2 border-l-2 rounded-tl-lg'],
                  ['top-0 right-0 border-t-2 border-r-2 rounded-tr-lg'],
                  ['bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg'],
                  ['bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg'],
                ].map(([cls], i) => <div key={i} className={`absolute w-7 h-7 border-amber-400 ${cls}`} />)}
                <div className="absolute left-1 right-1 h-0.5 bg-amber-400 animate-scan-line"
                  style={{ boxShadow: '0 0 8px 2px rgba(245,158,11,0.6)' }} />
              </div>
            </div>
            <p className="absolute bottom-32 left-0 right-0 text-center text-white/70 text-sm font-medium">
              Align barcode within the frame
            </p>
          </div>
        )}

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-amber-400" strokeWidth={2} />
            <p className="text-white font-semibold text-sm">Barcode Scanner</p>
          </div>
          <button onClick={() => { stopAll(); onClose() }}
            className="w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Loading */}
        {!scanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 pointer-events-auto">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Starting camera…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/95 px-6 text-center pointer-events-auto">
            {error === '__https__' ? (
              <>
                <ShieldAlert size={40} className="text-yellow-400" strokeWidth={1.5} />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Secure connection required</p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Camera access requires HTTPS. Open the app using the <span className="text-amber-400 font-semibold">https://</span> address shown in the server console, or access it from <span className="text-amber-400 font-semibold">localhost</span>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <ZapOff size={40} className="text-red-400" strokeWidth={1.5} />
                <p className="text-white font-semibold text-sm">{error}</p>
                <button onClick={start}
                  className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                  Try Again
                </button>
              </>
            )}
            <button onClick={onClose} className="text-slate-400 text-sm">Cancel</button>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className={`${bg} px-5 py-4`}>
        {lastSeen && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className={`${sub} text-xs`}>Last: <span className={`${title} font-mono font-bold`}>{lastSeen}</span></p>
          </div>
        )}
        <div className={`flex items-start gap-2 ${light ? 'text-amber-700' : 'text-amber-400/80'}`}>
          <AlertTriangle size={14} className="shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-xs">Assign barcodes to products in <span className="font-semibold">Admin → Products</span></p>
        </div>
      </div>
    </div>
  )
}

function friendlyError(err: any): string {
  const name = err?.name ?? String(err)
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || String(err).toLowerCase().includes('permission'))
    return 'Camera permission denied. Please tap "Allow" when the browser asks, or enable it in your device settings.'
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError')
    return 'No camera found on this device.'
  if (name === 'NotReadableError' || name === 'TrackStartError')
    return 'Camera is in use by another app. Please close it and try again.'
  if (name === 'OverconstrainedError')
    return 'Camera does not support the required settings. Trying a different mode…'
  return `Could not access camera: ${err?.message || name}`
}
