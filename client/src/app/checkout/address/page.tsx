'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useCartStore } from '@/store/cartStore'
import { MapPin } from 'lucide-react'

interface AddressForm {
  fullName: string; phone: string; line1: string; line2: string
  city: string; state: string; pincode: string
}

const INDIAN_STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana',
  'Uttar Pradesh','Uttarakhand','West Bengal',
]

export default function AddressPage() {
  const router = useRouter()
  const { items } = useCartStore()
  const [form, setForm] = useState<AddressForm>({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  })

  if (items.length === 0) {
    return (
      <><Header />
        <div className="max-w-xl mx-auto py-20 text-center">
          <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
          <Link href="/" className="btn-secondary px-8 py-2.5 rounded-sm inline-block">Shop Now</Link>
        </div>
      </>
    )
  }

  const set = (key: keyof AddressForm, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sessionStorage.setItem('checkout_address', JSON.stringify(form))
    router.push('/checkout/review')
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className="bg-[#2874f0] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
          <span className="font-semibold text-[#2874f0]">Delivery Address</span>
          <div className="flex-1 border-t border-gray-300 mx-2" />
          <span className="bg-gray-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
          <span className="text-gray-400">Review & Pay</span>
        </div>

        <div className="card p-6">
          <h1 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-[#2874f0]" /> Delivery Address
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Full Name *</label>
                <input required minLength={2} value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  className="input-base" placeholder="Enter full name" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Mobile Number *</label>
                <input required pattern="\d{10}" maxLength={10} value={form.phone}
                  onChange={e => set('phone', e.target.value.replace(/\D/, ''))}
                  className="input-base" placeholder="10-digit mobile number" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Address (Area and Street) *</label>
              <input required minLength={5} value={form.line1} onChange={e => set('line1', e.target.value)}
                className="input-base" placeholder="House No, Building, Street, Area" />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Locality / Town (optional)</label>
              <input value={form.line2} onChange={e => set('line2', e.target.value)}
                className="input-base" placeholder="Landmark, nearby area" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Pincode *</label>
                <input required pattern="\d{6}" maxLength={6} value={form.pincode}
                  onChange={e => set('pincode', e.target.value.replace(/\D/, ''))}
                  className="input-base" placeholder="6-digit pincode" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">City *</label>
                <input required minLength={2} value={form.city} onChange={e => set('city', e.target.value)}
                  className="input-base" placeholder="City" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">State *</label>
                <select required value={form.state} onChange={e => set('state', e.target.value)} className="input-base">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-secondary w-full py-3 mt-2 rounded-sm">
              Deliver to this Address →
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
