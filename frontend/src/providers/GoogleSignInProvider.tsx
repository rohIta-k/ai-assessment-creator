'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { authenticateWithGoogle } from '../lib/api'
import { useAuthStore } from '../store/authStore'

type SignInSuccessHandler = () => void

interface GoogleSignInContextValue {
  promptSignIn: (onSuccess?: SignInSuccessHandler) => void
  authError: string | null
  clearAuthError: () => void
}

const GoogleSignInContext = createContext<GoogleSignInContextValue | null>(null)

export function GoogleSignInProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const login = useAuthStore((state) => state.login)
  const [authError, setAuthError] = useState<string | null>(null)
  const successHandlerRef = useRef<SignInSuccessHandler | null>(null)

  useEffect(() => {
    if (!clientId) {
      return
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        return false
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            setAuthError('Google sign in did not return a credential.')
            return
          }

          try {
            const session = await authenticateWithGoogle(response.credential)
            login(session)
            setAuthError(null)
            successHandlerRef.current?.()
          } catch (error) {
            setAuthError(error instanceof Error ? error.message : 'Unable to sign in.')
          } finally {
            successHandlerRef.current = null
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      return true
    }

    if (initializeGoogle()) {
      return
    }

    const interval = window.setInterval(() => {
      if (initializeGoogle()) {
        window.clearInterval(interval)
      }
    }, 250)

    return () => window.clearInterval(interval)
  }, [clientId, login])

  const promptSignIn = (onSuccess?: SignInSuccessHandler) => {
    setAuthError(null)

    if (!clientId) {
      setAuthError('Google sign in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.')
      return
    }

    if (!window.google?.accounts?.id) {
      setAuthError('Google sign in is not ready yet.')
      return
    }

    successHandlerRef.current = onSuccess ?? null
    window.google.accounts.id.cancel()
    window.google.accounts.id.prompt()
  }

  return (
    <GoogleSignInContext.Provider
      value={{
        promptSignIn,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </GoogleSignInContext.Provider>
  )
}

export function useGoogleSignIn() {
  const context = useContext(GoogleSignInContext)

  if (!context) {
    throw new Error('useGoogleSignIn must be used within GoogleSignInProvider')
  }

  return context
}
