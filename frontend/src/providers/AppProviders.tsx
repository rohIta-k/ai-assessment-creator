'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import type { ReactNode } from 'react'
import { AuthHydrator } from './AuthHydrator'
import { GoogleSignInProvider } from './GoogleSignInProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    return (
      <GoogleSignInProvider>
        <AuthHydrator>{children}</AuthHydrator>
      </GoogleSignInProvider>
    )
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleSignInProvider>
        <AuthHydrator>{children}</AuthHydrator>
      </GoogleSignInProvider>
    </GoogleOAuthProvider>
  )
}
