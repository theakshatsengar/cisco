'use server'

import { signIn, signOut } from './auth'
import { redirect } from 'next/navigation'

export async function handleSignIn() {
  await signIn("google")
  redirect('/')
}

export async function handleSignOut() {
  await signOut()
  redirect('/auth/signin')
} 