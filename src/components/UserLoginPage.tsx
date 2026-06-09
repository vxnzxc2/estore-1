import { useState, useRef } from 'react'
import { Store, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import type { UserRole } from '../types'

const passwordInputStyles = `
  input[type="password"]::-webkit-credentials-auto-fill-button {
    display: none !important;
  }
  input[type="password"]::-ms-reveal {
    display: none !important;
  }
`

interface Props {
  onLogin: (email: string, role: UserRole) => void
  light?: boolean
}

// Role-based credentials
const ROLE_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  owner: { email: 'owner@gmail.com', password: 'hatdog123' },
  employee: { email: 'employee@gmail.com', password: 'employee01' },
  buyer: { email: 'buyer@gmail.com', password: 'buyer123' },
}

export default function UserLoginPage({ onLogin, light }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  const determineRole = (email: string, password: string): UserRole | null => {
    // Check owner credentials
    if (email === ROLE_CREDENTIALS.owner.email && password === ROLE_CREDENTIALS.owner.password) {
      return 'owner'
    }
    // Check employee credentials
    if (email === ROLE_CREDENTIALS.employee.email && password === ROLE_CREDENTIALS.employee.password) {
      return 'employee'
    }
    // Check buyer credentials
    if (email === ROLE_CREDENTIALS.buyer.email && password === ROLE_CREDENTIALS.buyer.password) {
      return 'buyer'
    }
    // Invalid credentials
    return null
  }

  const handleAuth = async () => {
    if (!email || !password) return setError('Please fill in all fields.')
    if (!email.includes('@')) return setError('Please enter a valid email.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')

    setLoading(true)
    setError('')

    try {
      // Build API URL - use same host but port 3001
      const apiUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/auth/login`
      console.log('[Login] Connecting to:', apiUrl)
      console.log('[Login] Browser location:', window.location.href)

      // First test health endpoint
      const healthUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/health`
      console.log('[Login] Testing health first:', healthUrl)
      const healthTest = await fetch(healthUrl)
      console.log('[Login] Health test status:', healthTest.status)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      console.log('[Login] Response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      const data = await response.json()
      if (!data.user || !data.user.role) {
        setError('Invalid response from server')
        setLoading(false)
        return
      }

      setLoading(false)
      onLogin(email, data.user.role)
    } catch (err) {
      console.error('Login error:', err)
      setError('Connection error. Make sure backend is running on port 3001.')
      setLoading(false)
    }
  }

  const bg = light ? 'bg-gray-50' : 'bg-[#080c14]'
  const card = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-400' : 'text-slate-500'
  const label = light ? 'text-gray-500' : 'text-slate-400'
  const inp = light
    ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-300 focus:border-amber-400'
    : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-600 focus:border-amber-500/60'
  const toggleLink = light ? 'text-amber-600 hover:text-amber-700' : 'text-amber-400 hover:text-amber-300'

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-4 transition-colors`}>
      <style>{passwordInputStyles}</style>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/20">
            <Store size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className={`text-2xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>eStore</h1>
          </div>
        </div>

        {/* Card */}
        <div className={`${card} rounded-2xl p-6 space-y-4`}>
          <h2 className={`text-base font-semibold ${title}`}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>

          <div>
            <label className={`text-xs ${label} mb-1.5 block`}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && passwordRef.current?.focus()}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${inp}`}
            />
          </div>

          <div>
            <label className={`text-xs ${label} mb-1.5 block`}>Password</label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-colors ${inp}`}
              />
              <button
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
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

          {/* Sign In / Sign Up button */}
          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight size={14} strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Toggle Sign Up / Sign In */}
          <p className={`text-center ${sub} text-xs`}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setPassword('') }}
              className={`font-semibold ${toggleLink}`}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className={`text-center ${sub} text-xs mt-4 space-y-1`}>
          <p><span className="font-semibold text-amber-500">👑 Owner:</span> owner@gmail.com / hatdog123</p>
          <p><span className="font-semibold text-blue-500">💼 Employee:</span> employee@gmail.com / employee01</p>
          <p><span className="font-semibold text-green-500">🛍️ Buyer:</span> buyer@gmail.com / buyer123</p>
        </div>
      </div>
    </div>
  )
}
