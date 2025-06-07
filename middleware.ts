import { auth } from './auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnSignInPage = req.nextUrl.pathname.startsWith('/signin')

  // If user is not logged in and trying to access protected routes
  if (!isLoggedIn && !isOnSignInPage) {
    return Response.redirect(new URL('/signin', req.nextUrl))
  }

  // If user is logged in and trying to access signin page
  if (isLoggedIn && isOnSignInPage) {
    return Response.redirect(new URL('/', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 