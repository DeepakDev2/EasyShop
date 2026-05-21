'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { Product } from '@/types'
import { formatPrice, getPrimaryImage } from '@/lib/utils'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function ProductCard({ product }: { product: Product }) {
  const img = getPrimaryImage(product.images)
  const starColor = product.rating >= 4 ? 'star-badge-good' : product.rating >= 3 ? 'star-badge-avg' : 'star-badge-bad'
  const { toggle, isWished } = useWishlistStore()
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()
  const wished = isWished(product.id)

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) { router.push('/auth/login'); return }
    const added = await toggle(product.id)
    toast(added ? 'Added to Wishlist ❤️' : 'Removed from Wishlist', {
      icon: added ? '❤️' : '🤍',
    })
  }

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div className="card hover:shadow-lg transition-shadow duration-200 group cursor-pointer overflow-hidden">
        {/* Image */}
        <div className="relative bg-gray-50 aspect-square overflow-hidden">
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discountPct > 0 && (
            <span className="absolute top-2 left-2 bg-[#388e3c] text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
              {product.discountPct}% off
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-gray-500 font-semibold text-sm">Out of Stock</span>
            </div>
          )}
          {/* Wishlist heart button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={16}
              className={wished ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug mb-1.5">
            {product.name}
          </p>

          {/* Rating */}
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`star-badge ${starColor}`}>
                {product.rating} <Star size={10} fill="currentColor" />
              </span>
              <span className="text-xs text-gray-500">({product.ratingCount.toLocaleString('en-IN')})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-xs font-semibold text-[#388e3c]">{product.discountPct}% off</span>
              </>
            )}
          </div>

          {product.brand && (
            <p className="text-xs text-gray-400 mt-1">{product.brand}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
