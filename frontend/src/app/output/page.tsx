'use client'

import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { AssignmentOutputPage } from '../../views/AssignmentOutputPage'

export default function OutputPage() {
  return (
    <ProtectedRoute>
      <AssignmentOutputPage />
    </ProtectedRoute>
  )
}
