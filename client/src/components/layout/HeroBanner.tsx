'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const BANNERS = [
  {
    id: 1,
    label: 'Electronics Sale',
    headline: 'Up to 70% off on Electronics',
    sub: 'Laptops, Mobiles, TVs & More',
    badge: 'LIMITED TIME',
    gradient: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    accent: '#e94560',
    emoji: '⚡',
    pill: 'SALE LIVE',
    pillColor: '#e94560',
    link: '/?category=electronics',
  },
  {
    id: 2,
    label: 'Fashion Week',
    headline: 'Style Starts Here',
    sub: 'Top Brands, Freshest Trends — 50% off',
    badge: 'FASHION WEEK',
    gradient: 'from-[#2d1b69] via-[#11998e] to-[#38ef7d]',
    accent: '#FFE500',
    emoji: '👗',
    pill: 'NEW ARRIVALS',
    pillColor: '#38ef7d',
    link: '/?category=fashion',
  },
  {
    id: 3,
    label: 'Home & Kitchen',
    headline: 'Dream Home Deals',
    sub: 'Furniture, Appliances & Decor',
    badge: 'BEST SELLERS',
    gradient: 'from-[#fc4a1a] via-[#f7b733] to-[#f7b733]',
    accent: '#ffffff',
    emoji: '🏠',
    pill: 'TRENDING',
    pillColor: '#fc4a1a',
    link: '/?category=appliances',
  },
  {
    id: 4,
    label: 'Books',
    headline: 'Feed Your Curiosity',
    sub: 'Bestsellers & New Releases — Flat 30% off',
    badge: 'TOP PICKS',
    gradient: 'from-[#134e5e] via-[#71b280] to-[#71b280]',
    accent: '#FFE500',
    emoji: '📚',
    pill: 'HOT DEAL',
    pillColor: '#FFE500',
    link: '/?category=books',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = (idx: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent((idx + BANNERS.length) % BANNERS.length)
    setTimeout(() => setAnimating(false), 400)
  }

  // Auto-advance every 4s
  useEffect(() => {
    const t = setInterval(() => go(current + 1), 4000)
    return () => clearInterval(t)
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  const banner = BANNERS[current]

  return (
    <div className={`relative overflow-hidden rounded-lg mb-4 bg-gradient-to-r ${banner.gradient} transition-all duration-500`}
      style={{ minHeight: 180 }}>
      {/* Content */}
      <div className={`flex items-center justify-between px-8 py-8 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="space-y-2">
          {/* Pill badge */}
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: banner.pillColor, color: banner.gradient.includes('FFE500') ? '#000' : '#fff' }}>
            {banner.pill}
          </span>
          <h2 className="text-3xl font-black text-white leading-tight">{banner.headline}</h2>
          <p className="text-white/80 text-base">{banner.sub}</p>
          <Link href={banner.link} className="inline-block mt-2">
            <button className="bg-white text-gray-900 font-bold text-sm px-6 py-2.5 rounded-sm hover:bg-gray-100 transition-colors">
              Shop Now →
            </button>
          </Link>
        </div>
        <div className="text-8xl select-none hidden sm:block" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
          {banner.emoji}
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => go(current - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors">
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => go(current + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors">
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
        ))}
      </div>
    </div>
  )
}
