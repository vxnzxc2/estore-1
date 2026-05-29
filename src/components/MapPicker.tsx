import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X, MapPin, Loader, Check, Navigation } from 'lucide-react'

// Fix Leaflet's broken default icon paths in Vite/webpack bundles
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom amber pin icon
const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:42px;
    display:flex;flex-direction:column;align-items:center;
    filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));
  ">
    <div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:#f59e0b;border:3px solid #fff;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(245,158,11,0.5);
    "></div>
    <div style="width:3px;height:14px;background:#f59e0b;margin-top:-2px;border-radius:0 0 2px 2px;"></div>
  </div>`,
  iconSize:   [32, 42],
  iconAnchor: [16, 42],
  popupAnchor:[0, -44],
})

interface Coords { lat: number; lng: number }

interface Props {
  initialAddress?: string
  onConfirm: (address: string, coords: Coords) => void
  onClose: () => void
  light?: boolean
}

// Philippines bounds
const PH_CENTER: [number, number] = [12.8797, 121.7740]
const PH_BOUNDS = L.latLngBounds([4.5, 116.0], [21.5, 127.0])

export default function MapPicker({ initialAddress, onConfirm, onClose, light }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const leafletMap  = useRef<L.Map | null>(null)
  const markerRef   = useRef<L.Marker | null>(null)

  const [coords,   setCoords]   = useState<Coords | null>(null)
  const [address,  setAddress]  = useState(initialAddress || '')
  const [geocoding, setGeocoding] = useState(false)
  const [hint,     setHint]     = useState('Tap anywhere on the map to drop a pin')

  const bg    = light ? 'bg-white'        : 'bg-[#0d1424]'
  const hdr   = light ? 'border-gray-100' : 'border-white/5'
  const title = light ? 'text-gray-900'   : 'text-white'
  const sub   = light ? 'text-gray-400'   : 'text-slate-400'

  // Reverse geocode using free Nominatim API
  const reverseGeocode = async (lat: number, lng: number) => {
    setGeocoding(true)
    setHint('Getting address…')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data?.display_name) {
        setAddress(data.display_name)
        setHint('Address found! You can edit it below.')
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        setHint('No address found. Coordinates saved.')
      }
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      setHint('Could not fetch address. Coordinates saved.')
    } finally {
      setGeocoding(false)
    }
  }

  const placePin = (lat: number, lng: number) => {
    if (!leafletMap.current) return
    setCoords({ lat, lng })

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng], { icon: PIN_ICON, draggable: true })
        .addTo(leafletMap.current)
        .on('dragend', (e) => {
          const { lat: dlat, lng: dlng } = (e.target as L.Marker).getLatLng()
          setCoords({ lat: dlat, lng: dlng })
          reverseGeocode(dlat, dlng)
        })
    }
    reverseGeocode(lat, lng)
  }

  // Use device GPS
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setHint('Geolocation is not supported on this device.')
      return
    }
    setHint('Getting your location…')
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        leafletMap.current?.flyTo([c.latitude, c.longitude], 16, { duration: 1.2 })
        placePin(c.latitude, c.longitude)
      },
      () => setHint('Could not get your location. Tap the map manually.'),
      { timeout: 8000 }
    )
  }

  // Initialise Leaflet once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    const map = L.map(mapRef.current, {
      center: PH_CENTER,
      zoom: 6,
      maxBounds: PH_BOUNDS,
      maxBoundsViscosity: 0.8,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Province labels layer for easier navigation
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, opacity: 0,
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      placePin(e.latlng.lat, e.latlng.lng)
    })

    leafletMap.current = map

    return () => {
      map.remove()
      leafletMap.current = null
      markerRef.current  = null
    }
  }, [])

  const handleConfirm = () => {
    if (!coords) return
    onConfirm(address || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`, coords)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className={`${bg} rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden flex flex-col shadow-2xl`}
        style={{ height: '90vh' }}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr} shrink-0`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <MapPin size={16} className="text-amber-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className={`font-bold ${title} text-sm`} style={{ fontFamily: 'Syne, sans-serif' }}>Pin Delivery Location</h2>
              <p className={`${sub} text-[11px]`}>Philippines map · tap to place pin</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-colors`}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-0">
          <div ref={mapRef} className="w-full h-full" />

          {/* GPS button */}
          <button onClick={useMyLocation}
            className="absolute bottom-4 right-4 z-[400] w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors border border-gray-200">
            <Navigation size={18} strokeWidth={2} />
          </button>

          {/* Hint pill */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none max-w-[90%] text-center">
            {geocoding ? <Loader size={11} className="animate-spin shrink-0" /> : <MapPin size={11} className="text-amber-400 shrink-0" />}
            {hint}
          </div>
        </div>

        {/* Bottom panel */}
        <div className={`px-4 py-4 border-t ${hdr} shrink-0 space-y-3`}>
          {/* Address field */}
          <div>
            <p className={`text-xs font-medium ${sub} mb-1.5`}>Delivery Address</p>
            <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 ${light ? 'border-gray-300 bg-white' : 'border-slate-600 bg-slate-900'}`}>
              <MapPin size={14} className={`mt-0.5 shrink-0 ${coords ? 'text-amber-500' : sub}`} strokeWidth={2} />
              {geocoding ? (
                <p className={`flex-1 text-sm ${sub} flex items-center gap-1.5`}>
                  <Loader size={13} className="animate-spin" /> Fetching address…
                </p>
              ) : (
                <textarea rows={2} value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Drop a pin on the map to fill this in…"
                  className={`flex-1 text-sm bg-transparent outline-none resize-none ${light ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-slate-500'}`} />
              )}
            </div>
            {coords && (
              <p className={`text-[10px] ${sub} mt-1 font-mono`}>
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={onClose}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${light ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={!coords || geocoding}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-lg shadow-amber-500/20">
              <Check size={15} strokeWidth={3} /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
