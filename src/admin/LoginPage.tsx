import { useState } from 'react'
import { Store, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'

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
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = () => {
    if (!username || !password) return setError('Please fill in all fields.')
    setLoading(true)
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) { onLogin() }
      else { setError('Invalid username or password.'); setLoading(false) }
    }, 600)
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
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/20">
            <Store size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>Evaristo's</h1>
            <p className={`${sub} text-sm mt-0.5`}>Admin Panel</p>
          </div>
        </div>

        {/* Card */}
        <div className={`${card} rounded-2xl p-6 space-y-4`}>
          <h2 className={`text-base font-semibold ${title}`}>Sign in to continue</h2>

          <div>
            <label className={`text-xs ${label} mb-1.5 block`}>Username</label>
            <input type="text" placeholder="admin" value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${inp}`} />
          </div>

          <div>
            <label className={`text-xs ${label} mb-1.5 block`}>Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors pr-10 ${inp}`} />
              <button onClick={() => setShowPass(s => !s)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${light ? 'text-gray-400 hover:text-gray-600' : 'text-slate-500 hover:text-slate-300'} transition-colors`}>
                {showPass ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-400 shrink-0" strokeWidth={2} />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Sign In button */}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Lock size={14} strokeWidth={2.5} /> Sign In</>}
          </button>

          {/* Cancel button */}
          <button onClick={onCancel}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${cancelCl}`}>
            <ArrowLeft size={14} strokeWidth={2.5} /> Back to Store
          </button>
        </div>

        <p className={`text-center ${sub} text-xs mt-4`}>
          Default: <span className={title}>admin</span> / <span className={title}>ronan123</span>
        </p>
      </div>
    </div>
  )
}
