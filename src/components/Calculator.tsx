import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Props { light?: boolean; onClose: () => void }

type Op = '+' | '−' | '×' | '÷' | null

export default function Calculator({ light, onClose }: Props) {
  const [disp,      setDisp]      = useState('0')
  const [prevVal,   setPrevVal]   = useState<string | null>(null)
  const [op,        setOp]        = useState<Op>(null)
  const [expectNew, setExpectNew] = useState(false)

  const bg   = light ? 'bg-white'        : 'bg-[#0d1424]'
  const hdr  = light ? 'border-gray-100' : 'border-white/5'
  const titl = light ? 'text-gray-900'   : 'text-white'
  const sub  = light ? 'text-gray-400'   : 'text-slate-400'
  const scrn = light ? 'bg-gray-50 border border-gray-200' : 'bg-slate-900/60 border border-white/5'

  const fmt = (n: number) => !isFinite(n) ? 'Error' : parseFloat(n.toPrecision(10)).toString()

  const compute = (a: string, b: string, o: Op) => {
    const x = parseFloat(a), y = parseFloat(b)
    if (o === '+') return x + y
    if (o === '−') return x - y
    if (o === '×') return x * y
    if (o === '÷') return y === 0 ? NaN : x / y
    return y
  }

  const press = (k: string) => {
    if (k === 'AC') {
      setDisp('0'); setPrevVal(null); setOp(null); setExpectNew(false)
    } else if (k === 'DEL') {
      if (expectNew) { setDisp('0'); setExpectNew(false) }
      else if (disp === 'Error') { setDisp('0') }
      else setDisp(d => d.length > 1 ? d.slice(0, -1) : '0')
    } else if (k === '%') {
      setDisp(d => fmt(parseFloat(d) / 100))
    } else if (['+','−','×','÷'].includes(k)) {
      const o = k as Op
      if (prevVal !== null && op && !expectNew) {
        const r = fmt(compute(prevVal, disp, op))
        setDisp(r); setPrevVal(r)
      } else {
        setPrevVal(disp)
      }
      setOp(o); setExpectNew(true)
    } else if (k === '=') {
      if (prevVal !== null && op) {
        setDisp(fmt(compute(prevVal, disp, op)))
        setPrevVal(null); setOp(null); setExpectNew(true)
      }
    } else if (k === '.') {
      if (expectNew) { setDisp('0.'); setExpectNew(false) }
      else setDisp(d => d.includes('.') ? d : d + '.')
    } else {
      if (expectNew || disp === '0' || disp === 'Error') {
        setDisp(k); setExpectNew(false)
      } else {
        setDisp(d => d.replace('-','').replace('.','').length < 12 ? d + k : d)
      }
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = {
        'Enter': '=', 'Backspace': 'DEL', 'Escape': 'AC',
        '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%',
      }
      if (map[e.key]) { e.preventDefault(); press(map[e.key]) }
      else if (/^[0-9.]$/.test(e.key)) { e.preventDefault(); press(e.key) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [disp, prevVal, op, expectNew])

  const dispSize = disp.length > 10 ? 'text-2xl' : disp.length > 7 ? 'text-3xl' : 'text-4xl'

  const B = (label: React.ReactNode, key: string, cls: string, span?: boolean) => (
    <button
      key={String(label)}
      onClick={() => press(key)}
      className={`h-14 rounded-2xl border font-semibold text-lg transition-all active:scale-90 flex items-center justify-center gap-1 ${cls} ${span ? 'col-span-2' : ''}`}
    >
      {label}
    </button>
  )

  const n  = light ? 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100' : 'bg-slate-800 border-white/5 text-white hover:bg-slate-700'
  const o  = 'bg-amber-500 hover:bg-amber-400 text-white border-amber-500'
  const ac = 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
  const dl = light ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
  const eq = 'bg-green-500 hover:bg-green-400 text-white border-green-500'

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className={`absolute inset-0 ${light ? 'bg-black/20' : 'bg-black/60'} backdrop-blur-sm`} onClick={onClose} />
      <div className={`animate-slide-right relative ${bg} w-full max-w-xs h-full flex flex-col shadow-2xl border-l ${hdr} overflow-hidden`}>

        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
          <h2 className={`font-bold ${titl} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Calculator</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 flex flex-col py-4 pt-8 gap-3">
          {/* Display */}
          <div className={`${scrn} rounded-2xl px-5 py-4 flex flex-col items-end justify-end min-h-[90px]`}>
            {prevVal && op && <p className={`text-xs ${sub} mb-1`}>{prevVal} {op}</p>}
            <p className={`font-bold ${titl} font-mono tracking-tight ${dispSize}`}>{disp}</p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2 flex-1 content-start">
            {B('AC',  'AC',  ac)}
            {B('DEL', 'DEL', dl)}
            {B('%',   '%',   o)}
            {B('÷',   '÷',   o)}
            {B('7','7',n)} {B('8','8',n)} {B('9','9',n)} {B('×','×',o)}
            {B('4','4',n)} {B('5','5',n)} {B('6','6',n)} {B('−','−',o)}
            {B('1','1',n)} {B('2','2',n)} {B('3','3',n)} {B('+','+',o)}
            {B('0', '0', n, true)}
            {B('.', '.', n)}
            {B('=', '=', eq)}
          </div>
        </div>
      </div>
    </div>
  )
}