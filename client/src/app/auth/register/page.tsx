'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

const getStrength = (pw: string) => {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
const STRENGTH_COLORS = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-[#388e3c]', 'bg-[#388e3c]']

export default function RegisterPage() {
  const router = useRouter()
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const redirect = search?.get('redirect') ?? '/'
  const register = useAuthStore(s => s.register)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const strength = getStrength(form.password)
  const passwordsMatch = form.password === form.confirm && form.confirm.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone || undefined)
      toast.success('Account created! Welcome to EasyShop 🎉')
      router.push(redirect)
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a5dc9 50%, #f1f3f6 50%)' }}>
      <div className="hidden md:flex flex-col justify-center px-16 w-2/5 text-white">
        <h1 className="text-4xl font-bold leading-tight mb-4">Join millions<br/>of smart shoppers</h1>
        <p className="text-blue-100 text-lg">Create an account and unlock the best deals</p>
        <div className="mt-8 space-y-3 text-blue-100 text-sm">
          <div className="flex items-center gap-2">✦ Exclusive member-only prices</div>
          <div className="flex items-center gap-2">✦ Easy order tracking</div>
          <div className="flex items-center gap-2">✦ Save items to wishlist</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <div className="mb-5">
            <Link href="/" className="text-2xl font-bold text-[#2874f0]">EasyShop</Link>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">Sign up to shop, save and get exclusive deals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" required placeholder="Full Name" minLength={2}
                value={form.name} onChange={e => set('name', e.target.value)}
                className="input-base pl-9" />
            </div>

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" required placeholder="Email address"
                value={form.email} onChange={e => set('email', e.target.value)}
                className="input-base pl-9" />
            </div>

            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" placeholder="Phone (optional, 10 digits)" maxLength={10}
                value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/, ''))}
                className="input-base pl-9" />
            </div>

            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} required placeholder="Password (min 6 chars)" minLength={6}
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className="input-base pl-9 pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength indicator */}
              {form.password.length > 0 && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength >= 4 ? 'text-[#388e3c]' : strength >= 2 ? 'text-orange-500' : 'text-red-500'}`}>
                    {STRENGTH_LABELS[strength]}
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" required placeholder="Confirm Password"
                value={form.confirm} onChange={e => set('confirm', e.target.value)}
                className="input-base pl-9 pr-10" />
              {form.confirm.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {passwordsMatch ? <CheckCircle size={16} className="text-[#388e3c]" /> : <XCircle size={16} className="text-red-400" />}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500">
              By continuing, you agree to EasyShop's{' '}
              <span className="text-[#2874f0] cursor-pointer hover:underline">Terms of Use</span> and{' '}
              <span className="text-[#2874f0] cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button type="submit" disabled={loading} className="btn-secondary w-full py-3 rounded-sm disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href={`/auth/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-[#2874f0] font-semibold hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
