'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function Nav() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tighter">chat with cisco.</h1>
        {session?.user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {session.user.name?.toLowerCase()}
            </span>
          </div>
        )}
      </div>
    </nav>
  )
}
