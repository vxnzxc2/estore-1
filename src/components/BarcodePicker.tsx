import { useEffect, useRef, useState } from 'react'
import { Camera, X, Check, ScanLine } from 'lucide-react'
import Quagga from '@ericblade/quagga2'

interface Props {
  value: string
  onChange: (v: string) => void
  light?: boolean
}

const HAS_NATIVE_DETECTOR = typeof window !== 'undefined' && 'BarcodeDetector' in window

export default function BarcodePicker({ value, onChange, light }: Props) {
  const [scanning,  setScanning]  = useState(false)
  const [error,     setError]     = useState('')
  const [localVal,  setLocalVal]  = useState(value)

  const scanRef   = useRef<HTMLDivElement>(null)
  const videoRef  = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)

  // Keep localVal in sync when parent resets value
  useEffect(() => { setLocalVal(value) }, [value])

  // ── Commit manual input to parent ─────────────────────────────────────────
  const commitManual = (v: string) => {
    setLocalVal(v)
    onChange(v)
  }

  // ── Stop everything ───────────────────────────────────────────────────────
  const stopScanner = () => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    try { Quagga.stop() } catch (_) {}
    videoRef.current?.remove()
    videoRef.current = null
    setScanning(false)
    setError('')
  }

  // ── Handle a detected code ────────────────────────────────────────────────
  const handleDetected = (code: string) => {
    stopScanner()
    setLocalVal(code)
    onChange(code)
  }

  // ── Start native BarcodeDetector ──────────────────────────────────────────
  const startNative = async () => {
    if (!scanRef.current) return
    setError('')
    try {
      const vid = document.createElement('video')
      vid.playsInline = true
      vid.muted       = true
      vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:12px;'
      scanRef.current.appendChild(vid)
      videoRef.current = vid

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      vid.srcObject = stream
      await vid.play()

      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'code_39'],
      })

      const tick = async () => {
        try {
          const results = await detector.detect(vid)
          if (results.length > 0) { handleDetected(results[0].rawValue); return }
        } catch (_) {}
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (err: any) {
      setError(friendlyError(err))
    }
  }

  // ── Start Quagga fallback ─────────────────────────────────────────────────
  const startQuagga = (useFacingEnv = true) => {
    if (!scanRef.current) return
    setError('')

    const constraints: any = { width: { ideal: 640 }, height: { ideal: 480 } }
    if (useFacingEnv) constraints.facingMode = 'environment'

    const handler = (result: any) => {
      const code = result?.codeResult?.code
      if (code) handleDetected(code)
    }

    try {
      Quagga.init({
        inputStream: { type: 'LiveStream', target: scanRef.current, constraints },
        decoder: { readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader', 'upc_e_reader'] },
        locate: true, numOfWorkers: 0, frequency: 10,
      }, (err) => {
        if (err) { if (useFacingEnv) startQuagga(false); else { setError(friendlyError(err)) }; return }
        Quagga.start()
        Quagga.onDetected(handler)
      })
    } catch (e) { setError(friendlyError(e)) }
  }

  const startScanner = () => {
    if (!navigator.mediaDevices?.getUserMedia) { setError('Camera not supported on this browser.'); return }
    setScanning(true)
    if (HAS_NATIVE_DETECTOR) startNative()
    else startQuagga()
  }

  useEffect(() => () => stopScanner(), [])

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputWrap = light
    ? 'bg-white border-gray-300 focus-within:border-amber-400'
    : 'bg-slate-900 border-slate-600 focus-within:border-amber-500/60'
  const inputText = light
    ? 'text-gray-900 placeholder:text-gray-400'
    : 'text-white placeholder:text-slate-500'
  const camBtn = light
    ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
    : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'

  return (
    <div className="space-y-2">

      {/* ── Single-line input + camera icon ─────────────────────────────── */}
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-colors ${inputWrap}`}>
        {/* Camera scan button on the left */}
        <button
          type="button"
          onClick={scanning ? stopScanner : startScanner}
          className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
            scanning
              ? 'bg-amber-500 text-white'
              : camBtn
          }`}
          title="Scan barcode with camera"
        >
          {scanning
            ? <X size={15} strokeWidth={2.5} />
            : <Camera size={16} strokeWidth={2} />
          }
        </button>

        <input
          type="text"
          placeholder="Input barcode or scan"
          value={localVal}
          onChange={e => commitManual(e.target.value)}
          className={`flex-1 text-sm bg-transparent outline-none font-mono tracking-wider ${inputText}`}
        />

        {/* Clear button — shown when there's a value */}
        {localVal && !scanning && (
          <button
            type="button"
            onClick={() => commitManual('')}
            className={`shrink-0 transition-colors ${
              light ? 'text-gray-300 hover:text-red-500' : 'text-slate-600 hover:text-red-400'
            }`}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Confirmed value pill */}
      {localVal && !scanning && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${light ? 'bg-green-50' : 'bg-green-500/10'}`}>
          <Check size={12} className="text-green-500 shrink-0" strokeWidth={3} />
          <p className={`flex-1 text-xs font-mono truncate ${light ? 'text-green-700' : 'text-green-400'}`}>
            {localVal}
          </p>
        </div>
      )}

      {/* ── Camera viewfinder ─────────────────────────────────────────────── */}
      {scanning && (
        <div className="space-y-2">
          <div
            className={`relative rounded-xl overflow-hidden ${light ? 'bg-gray-100' : 'bg-slate-900'}`}
            style={{ height: 160 }}
          >
            {/* Quagga / native video mounts here */}
            <div ref={scanRef} className="absolute inset-0" style={{ overflow: 'hidden', borderRadius: 12 }} />

            {/* Scan overlay corners + moving line */}
            {!error && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-40 h-24">
                  {[
                    'top-0 left-0 border-t-2 border-l-2',
                    'top-0 right-0 border-t-2 border-r-2',
                    'bottom-0 left-0 border-b-2 border-l-2',
                    'bottom-0 right-0 border-b-2 border-r-2',
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-amber-400 rounded-sm ${cls}`} />
                  ))}
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-amber-400 animate-scan-line opacity-80"
                    style={{ boxShadow: '0 0 6px 2px rgba(245,158,11,0.5)' }}
                  />
                </div>
              </div>
            )}

            {/* Spinner while camera starts */}
            {!error && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${light ? 'bg-black/30 text-white' : 'bg-black/50 text-white/70'}`}>
                  <ScanLine size={10} className="inline mr-1" strokeWidth={2} />
                  Align barcode in frame
                </span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-red-400 text-xs">{error}</p>
                <button
                  type="button"
                  onClick={() => { setError(''); startScanner() }}
                  className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Cancel */}
          <button
            type="button"
            onClick={stopScanner}
            className={`w-full text-xs py-2 rounded-lg transition-colors ${
              light ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

function friendlyError(err: any): string {
  const name = err?.name ?? String(err)
  if (name === 'NotAllowedError' || String(err).toLowerCase().includes('permission'))
    return 'Camera permission denied.'
  if (name === 'NotFoundError') return 'No camera found on this device.'
  if (name === 'NotReadableError') return 'Camera is in use by another app.'
  return `Camera unavailable: ${err?.message ?? name}`
}
