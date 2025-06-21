'use client'

import { useSession, signOut, signIn } from 'next-auth/react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

function getInitialTheme() {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'darkmode'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function Nav() {
  const { data: session } = useSession()
  const [themeClass, setThemeClass] = useState('bg-white')

  useEffect(() => {
    const updateTheme = () => {
      const html = document.documentElement
      if (html.classList.contains('darkmode')) {
        setThemeClass('bg-[rgb(17,16,16)] border-neutral-800 text-white')
      } else {
        setThemeClass('bg-white border-neutral-200 text-black')
      }
    }
    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${themeClass}`}>
        <div className="w-full h-16 flex items-center px-4">
          <Link href="/" className="text-2xl font-semibold tracking-tighter ml-0 md:ml-16 flex-shrink-0">cisco.</Link>
          <div className="flex-1" />
          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mr-0 md:mr-4"
            >
              sign out
            </button>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mr-0 md:mr-4"
            >
              sign in
            </button>
          )}
        </div>
        {/* Thin dividing line under navbar */}
        <div className="fixed top-16 left-0 right-0 h-px bg-neutral-200 dark:bg-neutral-800 z-40 md:ml-16" />
      </nav>
    </>
  )
}
