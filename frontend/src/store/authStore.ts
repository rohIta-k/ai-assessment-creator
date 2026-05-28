'use client'

import { create } from 'zustand'
import type { AuthSession, AuthUser } from '../types/auth'

const AUTH_STORAGE_KEY = 'vedaai.auth'

interface AuthStore {
  user: AuthUser | null
  token: string | null
  expiresAt: number | null
  hydrated: boolean
  login: (session: AuthSession) => void
  logout: () => void
  restore: () => void
  isAuthenticated: () => boolean
}

function clearStoredAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

function readStoredAuth(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const session = JSON.parse(raw) as AuthSession
    if (!session.token || !session.user || !session.expiresAt || Date.now() >= session.expiresAt) {
      clearStoredAuth()
      return null
    }

    return session
  } catch {
    clearStoredAuth()
    return null
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  expiresAt: null,
  hydrated: false,
  login: (session) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    set({
      user: session.user,
      token: session.token,
      expiresAt: session.expiresAt,
      hydrated: true,
    })
  },
  logout: () => {
    clearStoredAuth()
    set({ user: null, token: null, expiresAt: null, hydrated: true })
  },
  restore: () => {
    const session = readStoredAuth()
    set({
      user: session?.user ?? null,
      token: session?.token ?? null,
      expiresAt: session?.expiresAt ?? null,
      hydrated: true,
    })
  },
  isAuthenticated: () => {
    const { token, user, expiresAt } = get()
    return Boolean(token && user && expiresAt && Date.now() < expiresAt)
  },
}))
