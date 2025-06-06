import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// We no longer import auth directly here for Edge Runtime compatibility
// import { auth } from './app/auth'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__Secure-next-auth.session-token') || request.cookies.get('next-auth.session-token');
  const isLoggedIn = !!sessionCookie;
  const isOnChatPage = request.nextUrl.pathname.startsWith('/chat');
  const isOnAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // If on the chat page and not logged in, redirect to sign-in
  if (isOnChatPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If logged in and on the auth page, redirect to chat
  if (isLoggedIn && isOnAuthPage) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Handle forwarded headers for other requests
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-forwarded-host', request.headers.get('host') || '')
  requestHeaders.set('x-forwarded-proto', request.headers.get('x-forwarded-proto') || 'http')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/chat', '/auth/:path*'], // Match chat page and all auth pages
} 