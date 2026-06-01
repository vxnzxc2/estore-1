import { useState } from 'react'
import { X, Delete } from 'lucide-react'

interface Props {
  light?: boolean
  onClose: () => void
}

type Op = '+' | '-' | '×' | '÷' | null

export default function Calculator({ light, onClose }: Props) {
  const [display, setDisplay] = useState('0')
  const [prev,    setPrev]    = useState<string | null>(null)
  const [op,      setOp]      = useState<Op>(null)
  const [reset,   setReset]   = useState(false)

  const bg      = light ? 'bg-white'        : 'bg-[#0d1424]'
  const overlay = light ? 'bg-black/20'     : 'bg-black/60'
  const hdr     = light ? 'border-gray-100' : 'border-white/5'
  const title   = light ? 'text-gray-900'   : 'text-white'
  const sub     = light ? 'text-gray-400'   : 'text-slate-400'
  const dispBg  = light ? 'bg-gray-50 border border-gray-200' : 'bg-slate-900/60 border border-white/5'
  const numBtn  = light
    ? 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 active:bg-gray-100 shadow-sm'
    : 'bg-slate-800 border border-white/5 text-white hover:bg-slate-700 active:bg-slate-600'
  const opBtn   = 'bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-white font-bold'
  const eqBtn   = 'bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-white font-extrabold text-xl'
  const clrBtn  = light
    ? 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 active:bg-red-200'
    : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:bg-red-500/30'

  const pushDigit = (d: string) => {
    if (reset) { setDisplay(d === '.' ? '0.' : d); setReset(false); return }
    if (d === '.' && display.includes('.')) return
    setDisplay(prev => prev === '0' && d !== '.' ? d : prev + d)
  }

  const applyOp = (nextOp: Op) => {
    if (prev !== null && op && !reset) {
      const result = compute(parseFloat(prev), parseFloat(display), op)
      setDisplay(fmt(result))
      setPrev(fmt(result))
    } else {
      setPrev(display)
    }
    setOp(nextOp)
    setReset(true)
  }

  const compute = (a: number, b: number, o: Op): number => {
    if (o === '+') return a + b
    if (o === '-') return a - b
    if (o === '×') return a * b
    if (o === '÷') return b !== 0 ? a / b : 0
    return b
  }

  const fmt = (n: number): string => {
    if (!isFinite(n)) return 'Error'
    const s = parseFloat(n.toPrecision(12)).toString()
    return s
  }

  const handleEquals = () => {
    if (prev === null || op === null) return
    const result = compute(parseFloat(prev), parseFloat(display), op)
    setDisplay(fmt(result))
    setPrev(null)
    setOp(null)
    setReset(true)
  }

  const handleClear = () => {
    setDisplay('0'); setPrev(null); setOp(null); setReset(false)
  }

  const handleBackspace = () => {
    if (reset || display.length <= 1) { setDisplay('0'); setReset(false); return }
    setDisplay(d => d.slice(0, -1) || '0')
  }

  const handlePercent = () => {
    setDisplay(d => fmt(parseFloat(d) / 100))
  }

  const ROWS = [
    [
      { label: 'AC', action: handleClear,   cls: clrBtn },
      { label: 'CE', action: () => { setDisplay('0'); setReset(false) }, cls: clrBtn },
      { label: '%',  action: handlePercent, cls: numBtn },
    ],
    [
      { label: '7', action: () => pushDigit('7'), cls: numBtn },
      { label: '8', action: () => pushDigit('8'), cls: numBtn },
      { label: '9', action: () => pushDigit('9'), cls: numBtn },
      { label: '×', action: () => applyOp('×'), cls: opBtn, active: op === '×' },
    ],
    [
      { label: '4', action: () => pushDigit('4'), cls: numBtn },
      { label: '5', action: () => pushDigit('5'), cls: numBtn },
      { label: '6', action: () => pushDigit('6'), cls: numBtn },
      { label: '−', action: () => applyOp('-'), cls: opBtn, active: op === '-' },
    ],
    [
      { label: '1', action: () => pushDigit('1'), cls: numBtn },
      { label: '2', action: () => pushDigit('2'), cls: numBtn },
      { label: '3', action: () => pushDigit('3'), cls: numBtn },
      { label: '+', action: () => applyOp('+'), cls: opBtn, active: op === '+' },
    ],
  ]

  const displayLen = display.replace('-', '').replace('.', '').length
  const displaySize = displayLen > 10 ? 'text-2xl' : displayLen > 7 ? 'text-3xl' : 'text-4xl'

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`animate-slide-right relative ${bg} w-full max-w-xs h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
          <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Calculator</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-4 py-4 gap-3">
          {/* Display */}
          <div className={`${dispBg} rounded-2xl px-5 py-4 flex flex-col items-end min-h-[90px] justify-end`}>
            {prev && op && (
              <p className={`text-xs ${sub} mb-1`}>{prev} {op}</p>
            )}
            <div className="flex items-center gap-2">
              <p className={`font-bold ${title} font-mono tracking-tight truncate ${displaySize}`}
                style={{ fontFamily: 'monospace' }}>
                {display}
              </p>
              <button onClick={handleBackspace} className={`${sub} hover:text-red-400 transition-colors shrink-0`}>
                <Delete size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex-1 grid grid-rows-5 gap-2">
            {ROWS.map((row, ri) => (
              <div key={ri} className="grid grid-cols-4 gap-2">
                {row.map(btn => (
                  <button key={btn.label} onClick={btn.action}
                    className={`rounded-2xl text-lg font-semibold transition-all active:scale-95 flex items-center justify-center ${btn.cls} ${(btn as any).active ? 'ring-2 ring-white/40' : ''}`}>
                    {btn.label}
                  </button>
                ))}
              </div>
            ))}

            {/* Bottom row: 0, ., = */}
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => pushDigit('0')}
                className={`col-span-2 rounded-2xl text-lg font-semibold transition-all active:scale-95 ${numBtn}`}>
                0
              </button>
              <button onClick={() => pushDigit('.')}
                className={`rounded-2xl text-lg font-semibold transition-all active:scale-95 ${numBtn}`}>
                .
              </button>
              <button onClick={handleEquals}
                className={`rounded-2xl transition-all active:scale-95 ${eqBtn}`}>
                =
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
