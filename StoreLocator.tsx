import { X, MapPin, Navigation, Phone, Clock, Store } from 'lucide-react'

interface Props {
  onClose: () => void
  light?: boolean
}

const STORES = [
  { id: 1, name: "Evaristo's Main Branch",   address: 'Blk 3 Lot 5, Sampaguita St., Maynila',       phone: '0912-345-6789', hours: '6AM–10PM', distance: '0.2 km', open: true  },
  { id: 2, name: "Evaristo's Tondo Branch",  address: '123 Honesto St., Tondo, Manila',              phone: '0923-456-7890', hours: '7AM–9PM',  distance: '1.4 km', open: true  },
  { id: 3, name: "Evaristo's Sta. Mesa",     address: '45 Piy Margal St., Sta. Mesa, Manila',        phone: '0934-567-8901', hours: '6AM–10PM', distance: '2.1 km', open: false },
  { id: 4, name: "Evaristo's Pandacan",      address: '78 Industrial Valley Complex, Pandacan',      phone: '0945-678-9012', hours: '8AM–8PM',  distance: '3.5 km', open: true  },
]

export default function StoreLocator({ onClose, light }: Props) {
  const bg     = light ? 'bg-white'        : 'bg-[#0d1424]'
  const overlay= light ? 'bg-black/20'     : 'bg-black/60'
  const hdr    = light ? 'border-gray-100' : 'border-white/5'
  const title  = light ? 'text-gray-900'   : 'text-white'
  const sub    = light ? 'text-gray-400'   : 'text-slate-400'
  const card   = light ? 'bg-gray-50 border-gray-200' : 'bg-slate-800/60 border-white/5'

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={onClose} />
      <div className={`animate-slide-right relative ${bg} w-full max-w-sm h-full flex flex-col shadow-2xl border-l ${hdr}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
              <MapPin size={18} className="text-blue-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-base`} style={{ fontFamily: 'Syne, sans-serif' }}>Find a Store</h2>
              <p className={`${sub} text-xs`}>Nearest Evaristo's branches</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500' : 'bg-slate-800 text-slate-400'}`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Map placeholder */}
        <div className={`mx-4 mt-4 rounded-2xl overflow-hidden h-40 flex items-center justify-center relative ${light ? 'bg-blue-50 border border-blue-100' : 'bg-slate-800 border border-slate-700'}`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 70% 70%, #f59e0b 0%, transparent 40%)' }} />
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <Navigation size={28} className="text-blue-500" strokeWidth={1.5} />
            <p className={`${sub} text-xs font-medium`}>Enable location to see stores on map</p>
            <button className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
              Enable Location
            </button>
          </div>
        </div>

        {/* Store list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {STORES.map(store => (
            <div key={store.id} className={`${card} rounded-2xl border p-4`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Store size={15} className="text-amber-500 shrink-0" strokeWidth={2} />
                  <p className={`font-semibold ${title} text-sm`}>{store.name}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${store.open ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                    {store.open ? 'Open' : 'Closed'}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${light ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}>
                    {store.distance}
                  </span>
                </div>
              </div>
              <div className={`space-y-1 text-xs ${sub}`}>
                <div className="flex items-start gap-1.5">
                  <MapPin size={11} strokeWidth={2} className="shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={11} strokeWidth={2} />
                  <span>{store.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} strokeWidth={2} />
                  <span>{store.hours}</span>
                </div>
              </div>
              <button className={`mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${light ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}>
                <Navigation size={12} strokeWidth={2} /> Get Directions
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
