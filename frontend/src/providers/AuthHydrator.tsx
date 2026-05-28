'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { connectAssignmentSocket, disconnectAssignmentSocket } from '../lib/socket'
import { useAuthStore } from '../store/authStore'

export function AuthHydrator({ children }: { children: ReactNode }) {
  const router = useRouter()
  const restore = useAuthStore((state) => state.restore)
  const logout = useAuthStore((state) => state.logout)
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)

  useEffect(() => {
    restore()
  }, [restore])

  useEffect(() => {
    if (!expiresAt) {
      return
    }

    const remainingMs = expiresAt - Date.now()
    if (remainingMs <= 0) {
      logout()
      router.replace('/')
      return
    }

    const timeout = window.setTimeout(() => {
      logout()
      router.replace('/')
    }, remainingMs)

    return () => window.clearTimeout(timeout)
  }, [expiresAt, logout, router])

  useEffect(() => {
    if (!token) {
      disconnectAssignmentSocket()
      return
    }

    const socket = connectAssignmentSocket(token)
    socket.on('assignment:generation-started', () => undefined)
    socket.on('assignment:generation-completed', () => undefined)
    socket.on('assignment:generation-failed', () => undefined)

    return () => {
      socket.off('assignment:generation-started')
      socket.off('assignment:generation-completed')
      socket.off('assignment:generation-failed')
    }
  }, [token])

  return children
}
