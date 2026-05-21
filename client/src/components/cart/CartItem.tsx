'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore, CartEntry } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

export default function CartItem({ entry }: { entry: CartEntry }) {
  const { updateQty, removeItem } = useCartStore()
  const { product, qty } = entry

  return (
    <div className="card p-4 flex gap-4">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <div className="relative w-24 h-24 bg-gray-50 rounded overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${product.slug}`}>
          <p className="text-sm font-medium text-gray-800 hover:text-[#2874f0] line-clamp-2">{product.name}</p>
        </Link>
        {product.brand && <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>}

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              <span className="text-xs text-[#388e3c] font-semibold">{product.discountPct}% off</span>
            </>
          )}
        </div>

        {/* Quantity Controls + Remove */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
            <button
              onClick={() => updateQty(product.id, qty - 1)}
              className="px-3 py-1 hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-40"
              disabled={qty <= 1}
            >
              <Minus size={13} />
            </button>
            <span className="px-4 py-1 text-sm font-semibold border-x border-gray-300 min-w-[2.5rem] text-center">{qty}</span>
            <button
              onClick={() => updateQty(product.id, qty + 1)}
              className="px-3 py-1 hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-40"
              disabled={qty >= product.stock}
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            onClick={() => removeItem(product.id)}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
    </div>
  )
}
