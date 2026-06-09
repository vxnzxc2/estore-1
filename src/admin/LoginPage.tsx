import { useState, useRef } from 'react'
import { Store, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'

interface Props {
  onLogin: () => void
  onCancel: () => void
  light?: boolean
}

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'ronan123'

export default function LoginPage({ onLogin, onCancel, light }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleLogin = () => {
    if (!username || !password) return setError('Please fill in all fields.')
    setLoading(true)
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        setLoading(false)
        onLogin()
      } else {
        setError('Invalid username or password.')
        setLoading(false)
      }
    }, 100)
  }

  const bg    = light ? 'bg-gray-50'    : 'bg-[#080c14]'
  const card  = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub   = light ? 'text-gray-400' : 'text-slate-500'
  const label = light ? 'text-gray-500' : 'text-slate-400'
  const inp   = light ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-300 focus:border-amber-400'
                      : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-600 focus:border-amber-500/60'
  const cancelCl = light
    ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500'

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-4 transition-colors`}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30 relative">
            <Store size={28} className="text-white" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
              <ShieldCheck size={11} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="text-center">
            <h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>eStore</h1>
            <p className={`${sub} text-sm mt-0.5`}>Admin Panel</p>
          </div>
        </div>

        {/* Card */}
        <div className={`${card} rounded-2xl p-6 space-y-4 backdrop-blur-sm`}>
          <div>
            <h2 className={`text-lg font-bold ${title}`}>Admin Login</h2>
            <p className={`${sub} text-xs mt-1`}>Enter your credentials to access the admin panel</p>
          </div>

          <div>
            <label className={`text-xs font-medium ${label} mb-2 block`}>Username</label>
            <input
              type="text"
              placeholder="admin"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault()
                  passwordRef.current?.focus()
                }
              }}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-amber-500/20 ${inp}`}
            />
          </div>

          <div>
            <label className={`text-xs font-medium ${label} mb-2 block`}>Password</label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-amber-500/20 pr-10 ${inp}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${light ? 'text-gray-400 hover:text-gray-600' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
              >
                {showPass ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 animate-shake">
              <AlertCircle size={14} className="text-red-400 shrink-0" strokeWidth={2} />
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Sign In button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={14} strokeWidth={2.5} /> Sign In
              </>
            )}
          </button>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${cancelCl}`}
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Back to Store
          </button>
        </div>

        <p className={`text-center ${sub} text-xs mt-4`}>
          Demo: <span className={title}>admin</span> / <span className={title}>ronan123</span>
        </p>
      </div>
    </div>
  )
}
