"use client"

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '../../components/layout/Header'
import { PageContainer } from '../../components/layout/PageContainer'
import { AssignmentFilters } from '../../components/assignments/AssignmentFilters'
import { AssignmentGrid } from '../../components/assignments/AssignmentGrid'
import { EmptyAssignmentsPage } from '../EmptyAssignmentsPage'
import { deleteAssignment, fetchAssignments, type AssignmentListItem } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import type { Assignment } from '../../types/assignment'

export function AssignmentsDashboardPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const [isLoading, setIsLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!token) return

    const authToken = token

    let mounted = true

    async function loadAssignments() {
      setIsLoading(true)

      try {
        const response = await fetchAssignments(authToken)
        if (!mounted) return

        const savedAssignments = response.assignments
          .filter((assignment) => Boolean(assignment.saved))
          .map(mapAssignmentToDashboardCard)

        setAssignments(savedAssignments)
      } catch (error) {
        console.log('[frontend] failed to load dashboard assignments', error)
        if (mounted) {
          setAssignments([])
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadAssignments()

    return () => {
      mounted = false
    }
  }, [token])

  const filteredAssignments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return assignments
    }

    return assignments.filter((assignment) => {
      const searchable = [assignment.title, assignment.due, assignment.assignedOn, assignment.subject ?? '']
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalizedSearch)
    })
  }, [assignments, searchTerm])

  const hasAssignments = assignments.length > 0

  const content = useMemo(() => {
    if (isLoading) {
      return <DashboardLoadingState />
    }

    if (!hasAssignments) {
      return <EmptyAssignmentsPage />
    }

    return (
      <PageContainer>
        <Header centeredTitle="Assignments" />
        <section className="mx-auto mt-[10px] max-w-[1030px] px-[16px] max-lg:mt-[6px] max-lg:px-[12px]">
          <div className="mb-[12px] flex items-center gap-[12px] px-[6px] max-lg:hidden">
            <span className="grid h-[17px] w-[17px] place-items-center rounded-full bg-[#4fc47d] ring-4 ring-[#b6e9c9]" />
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.025em]">Assignments</h1>
              <p className="mt-[2px] text-[13px] text-[#929292]">Manage and create assignments for your classes.</p>
            </div>
          </div>
          <AssignmentFilters searchValue={searchTerm} onSearchValueChange={setSearchTerm} />
          <AssignmentGrid
            assignments={filteredAssignments}
            onOpenAssignment={(assignmentId) => {
              router.push(`/output?assignmentId=${assignmentId}`)
            }}
            onViewAssignment={(assignmentId) => {
              router.push(`/output?assignmentId=${assignmentId}`)
            }}
            onDeleteAssignment={async (assignmentId) => {
              if (!token) return

              try {
                await deleteAssignment(token, assignmentId)
                setAssignments((current) => current.filter((assignment) => assignment.id !== assignmentId))
              } catch (error) {
                console.log('[frontend] failed to delete assignment', error)
              }
            }}
          />
        </section>
        <Link
          href="/create"
          className="fixed bottom-[30px] left-[calc(50%+152px)] hidden h-[44px] -translate-x-1/2 items-center gap-[8px] rounded-full bg-[#171717] px-[28px] text-[15px] font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition hover:bg-[#2b2b2b] lg:flex"
        >
          <Plus className="h-[18px] w-[18px]" />
          Create Assignment
        </Link>
      </PageContainer>
    )
  }, [filteredAssignments, hasAssignments, isLoading, router, searchTerm, token])

  return content
}

function DashboardLoadingState() {
  return (
    <PageContainer>
      <Header centeredTitle="Assignments" />
      <section className="mx-auto mt-[10px] max-w-[1030px] px-[16px] max-lg:mt-[6px] max-lg:px-[12px]">
        <div className="mb-[12px] flex items-center gap-[12px] px-[6px] max-lg:hidden">
          <span className="grid h-[17px] w-[17px] place-items-center rounded-full bg-[#e5e5e5] ring-4 ring-[#f0f0f0] animate-pulse" />
          <div className="space-y-[8px]">
            <div className="h-[20px] w-[160px] rounded-full bg-[#e9e9e9] animate-pulse" />
            <div className="h-[13px] w-[260px] rounded-full bg-[#efefef] animate-pulse" />
          </div>
        </div>

        <div className="mb-[12px] flex min-h-[58px] items-center gap-[14px] rounded-[18px] bg-white p-[10px_15px] shadow-[0_18px_38px_rgba(0,0,0,0.06)] max-lg:mb-[18px] max-lg:h-[57px] max-lg:rounded-[12px] max-lg:p-[9px]">
          <div className="flex min-w-[145px] items-center gap-[8px] rounded-full px-[2px] text-[16px] font-medium text-[#8c8c8c] max-lg:min-w-[88px]">
            <span className="h-[20px] w-[20px] rounded-full bg-[#ededed] animate-pulse" />
            <span className="max-lg:hidden">Filter By</span>
            <span className="lg:hidden">Filter</span>
          </div>
          <div className="ml-auto h-[46px] w-full max-w-[340px] rounded-full bg-[#efefef] animate-pulse max-lg:max-w-none" />
        </div>

        <div className="grid grid-cols-1 gap-[12px] lg:grid-cols-2 lg:gap-[12px]">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="min-h-[148px] rounded-[21px] bg-white p-[25px] shadow-[0_18px_38px_rgba(0,0,0,0.08)] max-lg:min-h-[104px] max-lg:p-[18px]">
              <div className="h-[22px] w-[64%] rounded-full bg-[#ececec] animate-pulse" />
              <div className="mt-[20px] space-y-[12px]">
                <div className="h-[12px] w-[72%] rounded-full bg-[#f0f0f0] animate-pulse" />
                <div className="h-[12px] w-[55%] rounded-full bg-[#f0f0f0] animate-pulse" />
                <div className="h-[12px] w-[62%] rounded-full bg-[#f0f0f0] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  )
}

function mapAssignmentToDashboardCard(assignment: AssignmentListItem): Assignment {
  const createdAt = assignment.createdAt ? new Date(assignment.createdAt) : null

  return {
    id: assignment.id ?? assignment._id ?? '',
    title: assignment.title,
    subject: '',
    assignedOn: createdAt ? createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
    due: assignment.dueDate || '—',
    status: 'generated',
  }
}
