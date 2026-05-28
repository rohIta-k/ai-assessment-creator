import type { AuthSession } from '../types/auth'
import type { GeneratedAssignment, QuestionType } from '../types/assignment'

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message ?? 'Request failed')
  }

  return response.json() as Promise<T>
}

export function authenticateWithGoogle(credential: string) {
  return request<AuthSession>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  })
}

export function fetchCurrentUser(token: string) {
  return request<{ user: AuthSession['user'] }>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function createAssignment(
  token: string,
  payload: {
    title: string
    instructions: string
    uploadedMaterial?: string
    uploadedMaterialDataUrl?: string
  },
) {
  return request('/api/assignments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export interface GenerateAssignmentPayload {
  assignmentId?: string
  title: string
  dueDate: string
  questionTypes: QuestionType[]
  additionalInstructions: string
  uploadedMaterial: string
  uploadedMaterialDataUrl: string
}

export function generateAssignment(token: string, payload: GenerateAssignmentPayload) {
  console.log('[frontend] POST /api/assignments/generate', payload)
  return request<{ assignmentId: string; jobId: string }>('/api/assignments/generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export function cancelAssignmentGeneration(
  token: string,
  payload: { assignmentId: string; jobId: string },
) {
  console.log('[frontend] POST /api/assignments/generate/cancel', payload)
  return request<{ ok: boolean }>('/api/assignments/generate/cancel', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export function fetchAssignment(token: string, assignmentId: string) {
  return request<{ assignment: GeneratedAssignment }>(`/api/assignments/${assignmentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export interface AssignmentListItem {
  id?: string
  _id?: string
  title: string
  dueDate?: string
  saved?: boolean
  createdAt?: string
}

export function fetchAssignments(token: string) {
  return request<{ assignments: AssignmentListItem[] }>('/api/assignments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function saveAssignment(token: string, assignmentId: string) {
  console.log('[frontend] POST /api/assignments/:assignmentId/save', { assignmentId })
  return request<{ assignment: GeneratedAssignment }>(`/api/assignments/${assignmentId}/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function deleteAssignment(token: string, assignmentId: string) {
  console.log('[frontend] DELETE /api/assignments/:assignmentId', { assignmentId })
  return request<{ ok: boolean }>(`/api/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
