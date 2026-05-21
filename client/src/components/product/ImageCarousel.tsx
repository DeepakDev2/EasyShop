'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { ProductImage } from '@/types'

export default function ImageCarousel({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  if (!images.length) return null

  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      <div className="flex flex-col gap-2 w-16 shrink-0">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className={`border-2 rounded overflow-hidden aspect-square transition-all ${
              active === i ? 'border-[#2874f0]' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <Image src={img.url} alt={`Image ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 relative">
        <div
          className={`relative aspect-square bg-gray-50 rounded overflow-hidden cursor-zoom-in ${zoomed ? 'scale-125' : ''} transition-transform duration-200`}
          onClick={() => setZoomed(z => !z)}
        >
          <Image
            src={images[active].url}
            alt={`Product image ${active + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4"
            priority
          />
          <button className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-600 hover:bg-white">
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow rounded-full p-1.5 hover:bg-gray-50 z-10">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow rounded-full p-1.5 hover:bg-gray-50 z-10">
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {images.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-colors ${active === i ? 'bg-[#2874f0]' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
