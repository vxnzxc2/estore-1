import { useState } from 'react'
import { Plus, Trash2, Edit3, Check, X, Search, Mail } from 'lucide-react'

interface Employee {
  id: number
  email: string
  name: string
  phone: string
  password: string
  role: 'owner' | 'employee' | 'buyer'
  membership: string
}

interface Props {
  employees: Employee[]
  onAdd: (employee: Omit<Employee, 'id'>) => void
  onUpdate: (id: number, employee: Partial<Employee>) => void
  onRemove: (id: number) => void
  light?: boolean
}

export default function EmployeesTab({ employees, onAdd, onUpdate, onRemove, light }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', phone: '', password: '', role: 'employee' as const })
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [confirmDel, setConfirmDel] = useState<number | null>(null)

  const title = light ? 'text-gray-900' : 'text-white'
  const sub = light ? 'text-gray-400' : 'text-slate-400'
  const label = light ? 'text-gray-500' : 'text-slate-400'
  const inp = light ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400' : 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500'
  const card = light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-800/60 border border-white/5'
  const row = light ? 'hover:bg-gray-50 border-gray-100' : 'hover:bg-slate-700/20 border-white/5'
  const formBg = light ? 'bg-amber-50 border border-amber-200' : 'bg-slate-800/80 border border-amber-500/20'

  const handleAdd = () => {
    if (!form.email || !form.name || !form.password) return alert('Fill all fields')
    if (form.password.length < 6) return alert('Password must be 6+ characters')
    onAdd({ ...form, membership: 'Pro' })
    setForm({ email: '', name: '', phone: '', password: '', role: 'employee' })
    setShowForm(false)
  }

  const filtered = employees.filter(e =>
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className={`text-xl font-bold ${title}`} style={{ fontFamily: 'Syne, sans-serif' }}>Employees</h1>
          <p className={`${sub} text-xs mt-0.5`}>{employees.length} employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 shrink-0">
          <Plus size={15} strokeWidth={2.5} /> Add Employee
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className={`${formBg} rounded-2xl p-4 space-y-3`}>
          <h2 className={`text-sm font-semibold ${title}`}>New Employee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'email', label: 'Email *', type: 'email', placeholder: 'employee@example.com' },
              { key: 'name', label: 'Name *', type: 'text', placeholder: 'John Doe' },
              { key: 'phone', label: 'Phone', type: 'text', placeholder: '0900-000-0000' },
              { key: 'password', label: 'Password *', type: 'password', placeholder: 'Min 6 characters' },
            ].map(({ key, label: lbl, type, placeholder }) => (
              <div key={key}>
                <label className={`text-xs ${label} mb-1 block`}>{lbl}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`}
                />
              </div>
            ))}
            <div>
              <label className={`text-xs ${label} mb-1 block`}>Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${inp}`}
              >
                <option value="employee">Employee</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
              <Check size={14} strokeWidth={3} /> Save
            </button>
            <button onClick={() => { setShowForm(false); setForm({ email: '', name: '', phone: '', password: '', role: 'employee' }) }}
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${light ? 'border-gray-200 text-gray-500' : 'border-slate-600 text-slate-400'}`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className={`flex items-center gap-2 ${card} border rounded-xl px-3 py-2`}>
        <Search size={14} className={sub} strokeWidth={2} />
        <input type="text" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)}
          className={`flex-1 outline-none text-sm bg-transparent ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`} />
        {search && <button onClick={() => setSearch('')}><X size={13} className={sub} /></button>}
      </div>

      {/* Employees list */}
      <div className={`${card} rounded-2xl overflow-hidden`}>
        {filtered.length === 0 ? (
          <p className={`${sub} text-sm text-center py-10`}>No employees found</p>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(emp => (
              <div key={emp.id} className={`flex items-center justify-between gap-3 p-4 ${row} transition-colors`}>
                <div className="flex-1 min-w-0">
                  <p className={`${title} text-sm font-medium`}>{emp.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Mail size={12} className={sub} />
                    <p className={`${sub} text-xs truncate`}>{emp.email}</p>
                  </div>
                  <p className={`${sub} text-xs mt-0.5`}>{emp.phone} • {emp.role}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {confirmDel === emp.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { onRemove(emp.id); setConfirmDel(null) }}
                        className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-semibold hover:bg-red-400">Del</button>
                      <button onClick={() => setConfirmDel(null)} className={sub}><X size={11} strokeWidth={2.5} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDel(emp.id)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${light ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'}`}>
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
