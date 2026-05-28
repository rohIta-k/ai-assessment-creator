'use client'

import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { AssignmentsDashboardPage } from '../../views/AssignmentsDashboardPage'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AssignmentsDashboardPage />
    </ProtectedRoute>
  )
}
