'use client'

import { Session } from 'next-auth'
import { useState } from 'react'
import { handleSignIn, handleSignOut } from '../actions'

export function NavClient({ session }: { session: Session | null }) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="flex items-center">
      {session ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
          >
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User avatar'}
                className="w-8 h-8 rounded-full object-cover filter grayscale "
              />
            ) : (
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  {session.user?.name || session.user?.email}
                </div>
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form action={handleSignIn}>
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Sign in
          </button>
        </form>
      )}
    </div>
  )
} 