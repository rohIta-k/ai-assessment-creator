'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EmptyAssignmentsPage } from '../views/EmptyAssignmentsPage'
import { useAuthStore } from '../store/authStore'

export default function HomePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const expiresAt = useAuthStore((state) => state.expiresAt)
  const isAuthenticated = Boolean(user && token && expiresAt)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  return <EmptyAssignmentsPage />
}
