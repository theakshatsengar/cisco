'use server'

import { signIn } from 'next-auth/react'

export async function handleSignIn() {
  await signIn('google', { callbackUrl: '/' })
} 