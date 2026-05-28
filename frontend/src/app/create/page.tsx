'use client'

import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { CreateAssignmentPage } from '../../views/CreateAssignmentPage'

export default function CreatePage() {
  return (
    <ProtectedRoute>
      <CreateAssignmentPage />
    </ProtectedRoute>
  )
}
