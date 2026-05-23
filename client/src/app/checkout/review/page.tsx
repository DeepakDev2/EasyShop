'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import { Package, MapPin } from 'lucide-react'

import { Suspense } from 'react'

function ReviewPageContent() {
  const router = useRouter()
  const { items, total, discount, subtotal, clearCart } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const [address, setAddress] = useState<Record<string, string> | null>(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('checkout_address')
    if (stored) setAddress(JSON.parse(stored))
    else router.replace('/checkout/address')
  }, [router])

  if (items.length === 0) {
    return <><Header /><div className="py-20 text-center"><Link href="/" className="btn-secondary px-8 py-2.5 rounded-sm inline-block">Shop Now</Link></div></>
  }

  const deliveryCharge = total() >= 500 ? 0 : 40
  const grandTotal = total() + deliveryCharge

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) { toast.error('Please login to place an order'); router.push('/auth/login'); return }
    if (!address) { router.push('/checkout/address'); return }

    setPlacing(true)
    try {
      const res = await api.post('/orders', {
        items: items.map(i => ({ productId: i.product.id, qty: i.qty, price: i.product.price })),
        address,
      })
      const order = res.data.data
      await clearCart()
      sessionStorage.removeItem('checkout_address')
      router.push(`/order-success?order=${order.orderNumber}&total=${order.total}`)
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to place order')
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className="bg-[#388e3c] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✓</span>
          <span className="text-[#388e3c] font-semibold">Delivery Address</span>
          <div className="flex-1 border-t border-gray-300 mx-2" />
          <span className="bg-[#2874f0] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
          <span className="font-semibold text-[#2874f0]">Review & Pay</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            {address && (
              <div className="card p-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-[#2874f0]" /> Delivery to
                  {address.type && <span className="text-xs bg-blue-50 text-[#2874f0] px-2 py-0.5 rounded-full capitalize">{address.type}</span>}
                </h2>
                <p className="text-sm text-gray-700 font-medium">{address.fullName} · {address.phone}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.pincode}
                </p>
                <Link href="/checkout/address" className="text-xs text-[#2874f0] hover:underline mt-1 inline-block">Change</Link>
              </div>
            )}

            <div className="card p-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Package size={16} className="text-[#2874f0]" /> Order Summary ({items.length} item{items.length > 1 ? 's' : ''})
              </h2>
              <div className="space-y-3 divide-y divide-gray-100">
                {items.map(entry => (
                  <div key={entry.product.id} className="flex gap-3 pt-3 first:pt-0">
                    <div className="relative w-16 h-16 bg-gray-50 rounded shrink-0">
                      <Image src={entry.product.image} alt={entry.product.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-1">{entry.product.name}</p>
                      <p className="text-xs text-gray-400">Qty: {entry.qty}</p>
                      <p className="text-sm font-semibold mt-0.5">{formatPrice(entry.product.price * entry.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-4 h-fit sticky top-32">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide border-b pb-2 mb-3">Price Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Price</span><span>{formatPrice(subtotal())}</span></div>
              {discount() > 0 && <div className="flex justify-between text-[#388e3c]"><span>Discount</span><span>−{formatPrice(discount())}</span></div>}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-[#388e3c]' : ''}>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span><span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>💳 Payment: <strong>Cash on Delivery</strong></p>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing}
              className="btn-secondary w-full py-3 mt-4 rounded-sm disabled:opacity-60">
              {placing ? 'Placing Order…' : 'Place Order →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6]" />}>
      <ReviewPageContent />
    </Suspense>
  )
}
