import { useState } from 'react'
import { Search, X, Mail, Phone, Wallet, Gift } from 'lucide-react'

interface Buyer {
  id: number
  email: string
  name: string
  phone: string
  membership: string
  walletBalance: number
  points: number
  createdAt: string
}

interface Props {
  buyers: Buyer[]
  light?: boolean
}

export default function BuyersTab({ buyers, light }: Props) {
  const [search, setSearch] = useState('')
  const [filterMembership, setFilterMembership] = useState('all')

  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-400' : 'text-slate-400'
  const card = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const row = light ? 'hover:bg-gray-50 border-gray-100' : 'hover:bg-slate-700/20 border-white/5'

  const filtered = buyers.filter(b => {
    const matchSearch = b.email.toLowerCase().includes(search.toLowerCase()) ||
                       b.name.toLowerCase().includes(search.toLowerCase())
    const matchMembership = filterMembership === 'all' || b.membership === filterMembership
    return matchSearch && matchMembership
  })

  const memberships = ['all', ...new Set(buyers.map(b => b.membership))]
  const totalSpent = buyers.reduce((sum, b) => sum + (b.walletBalance || 0), 0)
  const totalPoints = buyers.reduce((sum, b) => sum + (b.points || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className={`text-xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>Buyers</h1>
          <p className={`${sub} text-xs mt-0.5`}>{buyers.length} customer{buyers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${card} rounded-xl p-4`}>
          <p className={`text-xs ${sub} mb-1`}>Total Customers</p>
          <p className={`text-2xl font-bold ${title}`}>{buyers.length}</p>
        </div>
        <div className={`${card} rounded-xl p-4`}>
          <p className={`text-xs ${sub} mb-1`}>Total Wallet Balance</p>
          <p className={`text-2xl font-bold text-amber-500`}>₱{totalSpent.toFixed(2)}</p>
        </div>
        <div className={`${card} rounded-xl p-4`}>
          <p className={`text-xs ${sub} mb-1`}>Total Points</p>
          <p className={`text-2xl font-bold text-yellow-500`}>{totalPoints}</p>
        </div>
        <div className={`${card} rounded-xl p-4`}>
          <p className={`text-xs ${sub} mb-1`}>Avg Balance</p>
          <p className={`text-2xl font-bold text-green-500`}>₱{(totalSpent / (buyers.length || 1)).toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex items-center gap-2 ${card} border rounded-xl px-3 py-2 flex-1`}>
          <Search size={14} className={sub} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search buyer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`flex-1 outline-none text-sm bg-transparent ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`}
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className={sub} /></button>}
        </div>
        <select
          value={filterMembership}
          onChange={e => setFilterMembership(e.target.value)}
          className={`px-4 py-2 rounded-xl text-sm border outline-none ${light ? 'bg-white border-gray-300 text-gray-900' : 'bg-slate-900 border-slate-600 text-white'}`}
        >
          {memberships.map(m => (
            <option key={m} value={m}>{m === 'all' ? 'All Plans' : m}</option>
          ))}
        </select>
      </div>

      {/* Buyers list */}
      <div className={`${card} rounded-2xl overflow-hidden`}>
        {filtered.length === 0 ? (
          <p className={`${sub} text-sm text-center py-10`}>No buyers found</p>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${light ? 'bg-gray-50' : 'bg-slate-700/20'}`}>
                  <th className={`text-left px-4 py-3 font-semibold ${sub}`}>Name</th>
                  <th className={`text-left px-4 py-3 font-semibold ${sub}`}>Email</th>
                  <th className={`text-left px-4 py-3 font-semibold ${sub}`}>Phone</th>
                  <th className={`text-left px-4 py-3 font-semibold ${sub}`}>Plan</th>
                  <th className={`text-right px-4 py-3 font-semibold ${sub}`}>Balance</th>
                  <th className={`text-right px-4 py-3 font-semibold ${sub}`}>Points</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(buyer => (
                  <tr key={buyer.id} className={`${row} transition-colors`}>
                    <td className={`px-4 py-3 ${title} font-medium`}>{buyer.name}</td>
                    <td className={`px-4 py-3 ${sub} flex items-center gap-1`}>
                      <Mail size={12} />
                      {buyer.email}
                    </td>
                    <td className={`px-4 py-3 ${sub} flex items-center gap-1`}>
                      <Phone size={12} />
                      {buyer.phone}
                    </td>
                    <td className={`px-4 py-3`}>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        buyer.membership === 'Max' ? 'bg-purple-500/20 text-purple-400' :
                        buyer.membership === 'Pro' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {buyer.membership}
                      </span>
                    </td>
                    <td className={`text-right px-4 py-3 ${title} font-semibold flex items-center justify-end gap-1`}>
                      <Wallet size={12} className="text-amber-500" />
                      ₱{buyer.walletBalance.toFixed(2)}
                    </td>
                    <td className={`text-right px-4 py-3 ${title} font-semibold flex items-center justify-end gap-1`}>
                      <Gift size={12} className="text-yellow-500" />
                      {buyer.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
