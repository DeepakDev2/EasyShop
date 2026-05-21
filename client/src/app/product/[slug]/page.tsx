'use client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ShoppingCart, Zap, Star, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus, Heart } from 'lucide-react'
import Header from '@/components/layout/Header'
import ImageCarousel from '@/components/product/ImageCarousel'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import SpecsTable from '@/components/product/SpecsTable'
import ProductCard from '@/components/product/ProductCard'
import { useProduct } from '@/hooks/useProducts'
import { formatPrice } from '@/lib/utils'
import { lookupPincode } from '@/lib/pincode'

function RatingStar({ rating }: { rating: number }) {
  const color = rating >= 4 ? 'bg-[#388e3c]' : rating >= 3 ? 'bg-[#ff9f00]' : 'bg-[#ff6161]'
  return (
    <span className={`inline-flex items-center gap-1 text-white text-sm font-semibold px-2 py-0.5 rounded ${color}`}>
      {rating} <Star size={12} fill="white" />
    </span>
  )
}

function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="skeleton aspect-square rounded" />
        <div className="space-y-4">
          {[80, 60, 40, 30, 50, 40].map((w, i) => (
            <div key={i} className={`skeleton h-5 rounded`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { data: product, isLoading, isError } = useProduct(slug)
  const [qty, setQty] = useState(1)
  const [pincode, setPincode] = useState('')
  const [pincodeCity, setPincodeCity] = useState<string | null>(null)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const { toggle, isWished } = useWishlistStore()

  if (isLoading) return <><Header /><Skeleton /></>
  if (isError || !product) return (
    <><Header />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Product not found</h1>
        <Link href="/" className="btn-outline mt-4 inline-block">Back to Home</Link>
      </div>
    </>
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related: any[] = (product as any).related ?? []

  const offers = [
    { icon: '🏦', text: '10% off on SBI Cards, up to ₹1,500' },
    { icon: '🔄', text: 'Extra ₹500 off on Exchange' },
    { icon: '📱', text: 'No Cost EMI from ₹' + Math.round(product.price / 12).toLocaleString('en-IN') + '/mo' },
  ]

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1 text-xs text-gray-500">
        <Link href="/" className="hover:text-[#2874f0]">Home</Link>
        <ChevronRight size={12} />
        {product.category && (
          <><Link href={`/?category=${product.category.slug}`} className="hover:text-[#2874f0]">{product.category.name}</Link>
          <ChevronRight size={12} /></>
        )}
        <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* Main product section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded shadow-sm overflow-hidden">
          {/* Left — Image Carousel */}
          <div className="p-6 border-r border-gray-100">
            <ImageCarousel images={product.images} />

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={() => { addItem(product, qty); toast.success('Added to cart!', { icon: '🛒' }); }}
                    className="flex-1 flex items-center justify-center gap-2 btn-primary"
                  >
                    <ShoppingCart size={18} /> ADD TO CART
                  </button>
                  <button
                    onClick={() => { addItem(product, qty); router.push('/cart') }}
                    className="flex-1 flex items-center justify-center gap-2 btn-secondary"
                  >
                    <Zap size={18} /> BUY NOW
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toast('We\'ll notify you when this is back in stock! 🔔', { icon: '🔔', duration: 4000 })}
                  className="flex-1 flex items-center justify-center gap-2 btn-outline py-3"
                >
                  🔔 Notify Me When Available
                </button>
              )}
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="p-6 space-y-4">
            {/* Brand + Title */}
            {product.brand && (
              <Link href={`/?brand=${product.brand}`} className="text-sm text-[#2874f0] hover:underline font-medium">
                {product.brand}
              </Link>
            )}
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-medium text-gray-900 leading-snug flex-1">{product.name}</h1>
              <button
                onClick={async () => {
                  const added = await toggle(product.id)
                  toast(added ? 'Added to Wishlist ❤️' : 'Removed from Wishlist', { icon: added ? '❤️' : '🤍' })
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Add to wishlist">
                <Heart size={22} className={isWished(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
              </button>
            </div>

            {/* Rating */}
            {product.ratingCount > 0 && (
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <RatingStar rating={product.rating} />
                <span className="text-sm text-gray-500">
                  {product.ratingCount.toLocaleString('en-IN')} ratings
                </span>
              </div>
            )}

            {/* Price */}
            <div className="pb-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Special Price</p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="text-base font-semibold text-[#388e3c]">{product.discountPct}% off</span>
                  </>
                )}
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-sm text-[#ff6161] mt-1 font-medium">Only {product.stock} left!</p>
              )}
              {product.stock === 0 && (
                <p className="text-sm text-red-600 mt-1 font-semibold">Out of Stock</p>
              )}
            </div>

            {/* Offers */}
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 mb-2">Available Offers</p>
              <ul className="space-y-1.5">
                {offers.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span>{o.icon}</span>
                    <span>{o.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-1 hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-1 text-sm font-semibold border-x border-gray-300">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Delivery check */}
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Delivery</p>
              <div className="flex gap-2 items-center">
                <input
                  type="text" maxLength={6} placeholder="Enter Pincode"
                  value={pincode} onChange={e => { setPincode(e.target.value.replace(/\D/, '')); setPincodeCity(null) }}
                  className="input-base w-36 text-sm"
                />
                <button
                  disabled={pincode.length !== 6 || pincodeLoading}
                  onClick={async () => {
                    setPincodeLoading(true)
                    setPincodeCity(null)
                    try {
                      const result = await lookupPincode(pincode)
                      setPincodeCity(`${result.city}, ${result.state}`)
                    } catch {
                      toast.error('Pincode not found')
                    } finally {
                      setPincodeLoading(false)
                    }
                  }}
                  className="text-[#2874f0] text-sm font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {pincodeLoading
                    ? <span className="w-3.5 h-3.5 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin inline-block" />
                    : 'Check'}
                </button>
              </div>
              {pincodeCity
                ? <p className="text-xs text-[#388e3c] mt-1.5 font-medium">
                    <Truck size={11} className="inline mr-1" />
                    Delivery available to {pincodeCity} · Usually 3–5 days
                  </p>
                : <p className="text-xs text-gray-500 mt-1.5">
                    <Truck size={11} className="inline mr-1" />
                    Usually delivered in 3–5 days
                  </p>
              }
            </div>

            {/* Guarantees */}
            <div className="flex gap-6 text-xs text-gray-600">
              <div className="flex flex-col items-center gap-1">
                <Shield size={20} className="text-[#2874f0]" />
                <span className="text-center">1 Year<br/>Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw size={20} className="text-[#2874f0]" />
                <span className="text-center">7 Day<br/>Return</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck size={20} className="text-[#2874f0]" />
                <span className="text-center">Free<br/>Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="card p-4 mt-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Specifications */}
        {product.specs?.length > 0 && (
          <div className="mt-3">
            <SpecsTable specs={product.specs} />
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
