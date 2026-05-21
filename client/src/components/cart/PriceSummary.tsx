'use client'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Tag } from 'lucide-react'

export default function PriceSummary() {
  const router = useRouter()
  const { items, subtotal, discount, total, itemCount } = useCartStore()
  const count = itemCount()
  const deliveryCharge = total() >= 500 ? 0 : 40

  if (!items.length) return null

  return (
    <div className="card p-4 sticky top-32">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">
        Price Details
      </h2>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Price ({count} item{count > 1 ? 's' : ''})</span>
          <span className="font-medium">{formatPrice(subtotal())}</span>
        </div>
        {discount() > 0 && (
          <div className="flex justify-between text-[#388e3c]">
            <span>Discount</span>
            <span className="font-medium">− {formatPrice(discount())}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Charges</span>
          <span className={deliveryCharge === 0 ? 'text-[#388e3c] font-medium' : 'font-medium'}>
            {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
          </span>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between text-base font-bold">
          <span>Total Amount</span>
          <span>{formatPrice(total() + deliveryCharge)}</span>
        </div>

        {discount() > 0 && (
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded px-2.5 py-1.5 text-xs text-[#388e3c] font-medium">
            <Tag size={12} /> You save {formatPrice(discount())} on this order!
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/checkout/address')}
        className="btn-secondary w-full mt-4 py-3 rounded-sm text-center"
      >
        PLACE ORDER →
      </button>
    </div>
  )
}
