export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-4 mt-10 text-center">
      <div className="bg-red-600 stripe-bg rounded-3xl py-6 px-8 text-white shadow-xl">
        <p
          className="font-extrabold text-xl animate-wiggle inline-block"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          🏪 Tindahan ni Aling Rosa
        </p>
        <p className="text-red-200 text-sm mt-1">
          Blk 3 Lot 5, Sampaguita St., Maynila · Open 6AM–10PM daily
        </p>
        <p className="text-red-300 text-xs mt-2">
          📞 0912-345-6789 · Tumatanggap ng GCash at Palengke Pay
        </p>
        <div className="flex justify-center gap-4 mt-3 flex-wrap">
          {['🇵🇭 Proudly Pinoy', '❤️ Family Business', '🌟 30+ Years'].map(tag => (
            <span
              key={tag}
              className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
