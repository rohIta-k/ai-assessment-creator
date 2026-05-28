"use client"

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '../../components/layout/Header'
import { PageContainer } from '../../components/layout/PageContainer'
import { AssignmentForm } from '../../components/assignments/AssignmentForm'
import { ProgressStepper } from '../../components/assignments/ProgressStepper'
import { fetchAssignment } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { useAssignmentStore } from '../../store/assignmentStore'

export function CreateAssignmentPage() {
  const searchParams = useSearchParams()
  const token = useAuthStore((state) => state.token)
  const setTopicName = useAssignmentStore((state) => state.setTopicName)
  const setDueDate = useAssignmentStore((state) => state.setDueDate)
  const setUploadName = useAssignmentStore((state) => state.setUploadName)
  const setUploadDataUrl = useAssignmentStore((state) => state.setUploadDataUrl)
  const setQuestionTypes = useAssignmentStore((state) => state.setQuestionTypes)
  const setInstructions = useAssignmentStore((state) => state.setInstructions)
  const setGeneratedAssignment = useAssignmentStore((state) => state.setGeneratedAssignment)
  const resetDraftState = useAssignmentStore((state) => state.resetDraftState)
  const hydratedAssignmentId = useRef('')
  const currentAssignmentScope = useRef('')
  const blankCreateResetDone = useRef(false)

  useEffect(() => {
    const rawAssignmentId = searchParams.get('assignmentId')
    const assignmentId: string = typeof rawAssignmentId === 'string' ? rawAssignmentId.trim() : ''
    const authToken: string = token ?? ''

    if (!assignmentId) {
      if (!blankCreateResetDone.current) {
        resetDraftState()
        blankCreateResetDone.current = true
      }

      hydratedAssignmentId.current = ''
      currentAssignmentScope.current = ''
      return
    }

    blankCreateResetDone.current = false

    if (currentAssignmentScope.current !== assignmentId) {
      resetDraftState()
      hydratedAssignmentId.current = ''
      currentAssignmentScope.current = assignmentId
    }

    if (!authToken || hydratedAssignmentId.current === assignmentId) {
      return
    }

    let mounted = true

    async function loadAssignment() {
      try {
        const response = await fetchAssignment(authToken, assignmentId)
        if (!mounted || !response.assignment) {
          return
        }

        const assignment = response.assignment
        setTopicName(assignment.title ?? '')
        setDueDate(assignment.dueDate ?? '')
        setUploadName(assignment.uploadedMaterial ?? '')
        setUploadDataUrl(assignment.uploadedMaterialDataUrl ?? '')
        setQuestionTypes(Array.isArray(assignment.questionTypes) ? assignment.questionTypes : [])
        setInstructions(assignment.instructions ?? '')

        if (assignment.generatedPaper) {
          setGeneratedAssignment(assignment)
        }

        hydratedAssignmentId.current = assignmentId
      } catch (error) {
        console.log('[frontend] failed to hydrate assignment form from backend', error)
      }
    }

    void loadAssignment()

    return () => {
      mounted = false
    }
  }, [resetDraftState, searchParams, setDueDate, setGeneratedAssignment, setInstructions, setQuestionTypes, setTopicName, setUploadDataUrl, setUploadName, token])

  return (
    <PageContainer>
      <Header centeredTitle="Create Assignment" />
      <section className="mx-auto mt-0 mb-0 w-full max-w-[1103px] px-[24px] pb-[24px] max-lg:px-[12px] max-lg:pb-[16px]">
        <div className="mt-0 flex h-[66px] items-center gap-4 p-2 max-lg:hidden">
          <span className="grid h-[12px] w-[12px] place-items-center rounded-full bg-[#4fc47d] ring-4 ring-[#b6e9c9]" />
          <div>
            <h1 className="text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-primary">Create Assignment</h1>
            <p className="mt-[2px] text-[14px] font-[400] leading-[140%] tracking-[-0.04em] text-muted">Set up a new assignment for your students</p>
          </div>
        </div>
        <ProgressStepper />
        <AssignmentForm />
      </section>
    </PageContainer>
  )
}
