'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { MapPin, Home, Briefcase, Plus, CheckCircle, Loader2 } from 'lucide-react'
import axios from 'axios'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { INDIAN_STATES } from '@/lib/india-states'
import { lookupPincode } from '@/lib/pincode'

interface AddressForm {
  fullName: string; phone: string; line1: string; line2: string
  city: string; state: string; pincode: string; type: 'home' | 'work'
}

interface SavedAddress extends AddressForm {
  id: number; isDefault: boolean
}

const EMPTY_FORM: AddressForm = {
  fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', type: 'home',
}

import { Suspense } from 'react'

function AddressPageContent() {
  const router = useRouter()
  const { items } = useCartStore()
  const { isLoggedIn } = useAuthStore()

  const [saved, setSaved] = useState<SavedAddress[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [pincodeHint, setPincodeHint] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const pincodeAbortRef = useRef<AbortController | null>(null)

  const stateOptions = useMemo(() => {
    if (form.state && !INDIAN_STATES.includes(form.state as (typeof INDIAN_STATES)[number])) {
      return [...INDIAN_STATES, form.state]
    }
    return [...INDIAN_STATES]
  }, [form.state])

  // Auto-fill city & state when 6-digit pincode is entered (debounced)
  useEffect(() => {
    const pin = form.pincode.replace(/\D/g, '')
    if (pin.length !== 6) {
      setPincodeHint(null)
      return
    }

    const timer = setTimeout(async () => {
      pincodeAbortRef.current?.abort()
      const ac = new AbortController()
      pincodeAbortRef.current = ac
      setPincodeLoading(true)
      setPincodeHint(null)

      try {
        const result = await lookupPincode(pin, ac.signal)
        setForm(f => ({ ...f, pincode: pin, city: result.city, state: result.state }))
        setPincodeHint(`${result.city}, ${result.state}`)
      } catch (err: unknown) {
        if (axios.isCancel(err)) return
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
          ?? 'Could not find this pincode'
        setPincodeHint(null)
        toast.error(msg)
      } finally {
        setPincodeLoading(false)
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      pincodeAbortRef.current?.abort()
    }
  }, [form.pincode])

  // Load saved addresses from DB on mount (logged-in users only)
  useEffect(() => {
    if (!isLoggedIn) { setShowForm(true); return }
    api.get('/addresses').then(res => {
      const addresses: SavedAddress[] = res.data.data
      setSaved(addresses)
      if (addresses.length === 0) {
        setShowForm(true)
      } else {
        const def = addresses.find(a => a.isDefault) ?? addresses[0]
        setSelectedId(def.id)
      }
    }).catch(() => setShowForm(true))
  }, [isLoggedIn])

  if (items.length === 0) return (
    <><Header />
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
        <Link href="/" className="btn-secondary px-8 py-2.5 rounded-sm inline-block">Shop Now</Link>
      </div>
    </>
  )

  const setField = (key: keyof AddressForm, val: string) => setForm(f => ({ ...f, [key]: val }))

  // Save new address to DB (if logged in) then proceed
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let address = form
      if (isLoggedIn) {
        const res = await api.post('/addresses', { ...form, isDefault: saved.length === 0 })
        address = res.data.data
        toast.success('Address saved!')
      }
      sessionStorage.setItem('checkout_address', JSON.stringify(address))
      router.push('/checkout/review')
    } catch {
      toast.error('Could not save address')
    } finally { setSaving(false) }
  }

  // Use an existing saved address
  const handleUseSaved = () => {
    const addr = saved.find(a => a.id === selectedId)
    if (!addr) return
    sessionStorage.setItem('checkout_address', JSON.stringify(addr))
    router.push('/checkout/review')
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className="bg-[#2874f0] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
          <span className="font-semibold text-[#2874f0]">Delivery Address</span>
          <div className="flex-1 border-t border-gray-300 mx-2" />
          <span className="bg-gray-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
          <span className="text-gray-400">Review & Pay</span>
        </div>

        {/* Saved addresses (logged-in only) */}
        {isLoggedIn && saved.length > 0 && (
          <div className="card p-5 mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-[#2874f0]" /> Saved Addresses
            </h2>
            <div className="space-y-3">
              {saved.map(addr => (
                <label key={addr.id}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    selectedId === addr.id ? 'border-[#2874f0] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" name="addr" value={addr.id} checked={selectedId === addr.id}
                    onChange={() => setSelectedId(addr.id)} className="mt-1 accent-[#2874f0]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-800">{addr.fullName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded capitalize font-medium ${
                        addr.type === 'home' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{addr.type}</span>
                      {addr.isDefault && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Default</span>}
                    </div>
                    <p className="text-sm text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} – {addr.pincode}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>
                  </div>
                  {selectedId === addr.id && <CheckCircle size={18} className="text-[#2874f0] mt-1 shrink-0" />}
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleUseSaved}
                className="btn-secondary px-8 py-2.5 rounded-sm flex-1">
                Deliver Here →
              </button>
              <button onClick={() => { setShowForm(v => !v); setForm(EMPTY_FORM) }}
                className="btn-outline px-4 py-2.5 rounded-sm flex items-center gap-1.5 text-sm">
                <Plus size={14} /> Add New
              </button>
            </div>
          </div>
        )}

        {/* Address form — new or guest */}
        {(showForm || !isLoggedIn) && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-[#2874f0]" />
              {saved.length > 0 ? 'Add New Address' : 'Delivery Address'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Full Name *</label>
                  <input required minLength={2} value={form.fullName} onChange={e => setField('fullName', e.target.value)}
                    className="input-base" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Mobile Number *</label>
                  <input required pattern="\d{10}" maxLength={10} value={form.phone}
                    onChange={e => setField('phone', e.target.value.replace(/\D/, ''))}
                    className="input-base" placeholder="10-digit mobile number" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Address *</label>
                <input required minLength={5} value={form.line1} onChange={e => setField('line1', e.target.value)}
                  className="input-base" placeholder="House No, Building, Street, Area" />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Locality / Landmark (optional)</label>
                <input value={form.line2} onChange={e => setField('line2', e.target.value)}
                  className="input-base" placeholder="Nearby landmark" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Pincode *</label>
                  <div className="relative">
                    <input
                      required
                      pattern="\d{6}"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={form.pincode}
                      onChange={e => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input-base pr-8"
                      placeholder="6-digit pincode"
                    />
                    {pincodeLoading && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-4 h-4 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {pincodeHint && (
                    <p className="text-xs text-[#388e3c] mt-1">✓ {pincodeHint}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">City *</label>
                  <input required minLength={2} value={form.city} onChange={e => setField('city', e.target.value)}
                    className="input-base" placeholder="City" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">State *</label>
                  <select required value={form.state} onChange={e => setField('state', e.target.value)} className="input-base">
                    <option value="">Select State</option>
                    {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Address Type */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">Address Type</label>
                <div className="flex gap-3">
                  {(['home', 'work'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setField('type', t)}
                      className={`flex items-center gap-2 px-4 py-2 rounded border text-sm transition-colors ${
                        form.type === t ? 'border-[#2874f0] bg-blue-50 text-[#2874f0]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {t === 'home' ? <Home size={14} /> : <Briefcase size={14} />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="btn-secondary w-full py-3 mt-2 rounded-sm flex items-center justify-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {isLoggedIn ? 'Save & Deliver Here →' : 'Deliver to this Address →'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

export default function AddressPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6]" />}>
      <AddressPageContent />
    </Suspense>
  )
}
