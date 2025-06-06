import { auth } from './app/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Handle forwarded headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-forwarded-host', request.headers.get('host') || '')
  requestHeaders.set('x-forwarded-proto', request.headers.get('x-forwarded-proto') || 'http')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 