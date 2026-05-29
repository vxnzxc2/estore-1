import { Activity, Bell, ScanLine, Calculator, Settings } from 'lucide-react'

interface Props {
  totalQty: number
  unreadNotifs: number
  light?: boolean
  onActivity: () => void
  onNotifications: () => void
  onScan: () => void
  onCalculator: () => void
  onSettings: () => void
}

export default function BottomNav({
  totalQty, unreadNotifs, light,
  onActivity, onNotifications, onScan, onCalculator, onSettings,
}: Props) {
  const navBg  = light ? 'bg-white border-gray-200'     : 'bg-[#0d1424] border-white/5'
  const btnCl  = light
    ? 'text-gray-400 hover:text-amber-500'
    : 'text-slate-500 hover:text-amber-400'

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-30 ${navBg} border-t shadow-2xl safe-bottom`}>
      <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto">

        {/* Activity */}
        <button onClick={onActivity}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl relative ${btnCl} transition-colors`}>
          <div className="relative">
            <Activity size={22} strokeWidth={2} />
            {totalQty > 0 && (
              <span className="animate-badge-pop absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalQty > 9 ? '9+' : totalQty}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Activity</span>
        </button>

        {/* Notifications */}
        <button onClick={onNotifications}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl relative ${btnCl} transition-colors`}>
          <div className="relative">
            <Bell size={22} strokeWidth={2} />
            {unreadNotifs > 0 && (
              <span className="animate-badge-pop absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Notifs</span>
        </button>

        {/* Scan — center elevated */}
        <button onClick={onScan} className="flex flex-col items-center gap-1 -mt-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all">
            <ScanLine size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold text-amber-500">Scan</span>
        </button>

        {/* Calculator */}
        <button onClick={onCalculator}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl ${btnCl} transition-colors`}>
          <Calculator size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Calc</span>
        </button>

        {/* Settings */}
        <button onClick={onSettings}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl ${btnCl} transition-colors`}>
          <Settings size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>

      </div>
    </nav>
  )
}
