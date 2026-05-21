'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/'
  const login = useAuthStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back! 🎉')
      router.push(redirect)
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a5dc9 50%, #f1f3f6 50%)' }}>
      <div className="hidden md:flex flex-col justify-center px-16 w-2/5 text-white">
        <h1 className="text-4xl font-bold leading-tight mb-4">Looks like<br/>you're new here!</h1>
        <p className="text-blue-100 text-lg">Sign up with your email to get started</p>
        <div className="mt-8 space-y-3 text-blue-100 text-sm">
          <div>✦ Exclusive deals &amp; offers</div>
          <div>✦ Track orders easily</div>
          <div>✦ Faster checkout every time</div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <div className="mb-6">
            <Link href="/" className="text-2xl font-bold text-[#2874f0]">EasyShop</Link>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">Login</h2>
            <p className="text-sm text-gray-500 mt-1">Get access to your Orders, Wishlist and Recommendations</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" required placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="input-base pl-9" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPw ? 'text' : 'password'} required placeholder="Password" minLength={6}
                value={password} onChange={e => setPassword(e.target.value)} className="input-base pl-9 pr-10" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              By continuing, you agree to EasyShop's{' '}
              <span className="text-[#2874f0] cursor-pointer hover:underline">Terms of Use</span> and{' '}
              <span className="text-[#2874f0] cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
            <button type="submit" disabled={loading} className="btn-secondary w-full py-3 rounded-sm disabled:opacity-60">
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              New to EasyShop?{' '}
              <Link href={`/auth/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-[#2874f0] font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6]" />}>
      <LoginForm />
    </Suspense>
  )
}
