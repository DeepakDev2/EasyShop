'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { formatPrice, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { Package, MapPin, ChevronRight, ArrowLeft, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'delivered']
const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('easyshop_token'))
    if (!isLoggedIn && !hasToken) {
      router.push(`/auth/login?redirect=%2Forders%2F${id}`)
      return
    }
    if (!isLoggedIn) return
    api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).catch(() => router.push('/orders')).finally(() => setLoading(false))
  }, [id, isLoggedIn, router])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const res = await api.put(`/orders/${id}/cancel`)
      setOrder(res.data.data)
      toast.success('Order cancelled successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to cancel order')
    } finally { setCancelling(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        <div className="card h-24 skeleton" />
        <div className="card h-48 skeleton" />
        <div className="card h-32 skeleton" />
      </div>
    </div>
  )
  if (!order) return null

  const stepIdx = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/orders" className="hover:text-[#2874f0] flex items-center gap-1"><ArrowLeft size={14} /> My Orders</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700">#{order.orderNumber}</span>
        </div>

        {/* Status banner */}
        <div className="card p-4 mb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">Order #{order.orderNumber}</p>
              <p className="text-xs text-gray-400">Placed on {formatDate(order.placedAt)}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {order.status}
            </span>
          </div>

          {/* Progress tracker */}
          {order.status !== 'cancelled' && (
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      i <= stepIdx ? 'bg-[#2874f0] border-[#2874f0] text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {i < stepIdx ? '✓' : i + 1}
                    </div>
                    <p className="text-xs mt-1 text-center capitalize text-gray-500 whitespace-nowrap">{step}</p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stepIdx ? 'bg-[#2874f0]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card p-4 mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Package size={16} className="text-[#2874f0]" /> Items Ordered
          </h2>
          <div className="space-y-4 divide-y divide-gray-100">
            {order.orderItems?.map((item: any) => (
              <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                <div className="relative w-16 h-16 bg-gray-50 rounded shrink-0">
                  {item.productImg
                    ? <Image src={item.productImg} alt={item.productName} fill className="object-contain p-1" />
                    : <Package size={24} className="text-gray-200 m-auto" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium line-clamp-2">{item.productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold">{formatPrice(Number(item.unitPrice))}</span>
                    <span className="text-xs text-gray-400">× {item.quantity} =</span>
                    <span className="text-sm font-bold text-gray-800">{formatPrice(Number(item.totalPrice))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Payment */}
        {order.shippingAddress && (
          <div className="card p-4 mb-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-[#2874f0]" /> Delivery Address
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{order.shippingAddress}</p>
          </div>
        )}

        {/* Price Summary */}
        <div className="card p-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Price Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-medium capitalize">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment Status</span>
              <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-[#388e3c]' : 'text-[#ff9f00]'}`}>{order.paymentStatus}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Order Total</span><span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Cancel Order */}
        {['placed', 'confirmed'].includes(order.status) && (
          <div className="card p-4 mt-3">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Need to cancel?</h2>
            <p className="text-xs text-gray-400 mb-3">You can cancel this order as it hasn't shipped yet. Stock will be restored.</p>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded transition-colors disabled:opacity-50"
            >
              <XCircle size={16} />
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
