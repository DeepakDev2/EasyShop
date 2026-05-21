import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center px-4 text-center">
      <div className="card p-12 max-w-md w-full space-y-4">
        <div className="text-8xl font-black text-[#2874f0] opacity-20 leading-none">404</div>
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
        <p className="text-gray-500 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/" className="btn-secondary px-8 py-2.5 rounded-sm inline-block">Go Home</Link>
        </div>
      </div>
    </div>
  )
}
