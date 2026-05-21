import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/checkout', '/orders', '/wishlist']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))

  if (isProtected) {
    const token = request.cookies.get('easyshop_token')?.value
    if (!token) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/checkout/:path*', '/orders/:path*', '/wishlist/:path*'],
}
