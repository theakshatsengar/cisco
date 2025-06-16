'use client'

import { useSession, signOut, signIn } from 'next-auth/react'

export default function Nav() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tighter">cisco.</h1>
        {session?.user ? (
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            sign out
          </button>
        ) : (
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            sign in
          </button>
        )}
      </div>
    </nav>
  )
}
