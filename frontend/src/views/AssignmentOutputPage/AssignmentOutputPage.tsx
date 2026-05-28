import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { GeneratedAssignment } from '../../types/assignment'
import { Header } from '../../components/layout/Header'
import { PageContainer } from '../../components/layout/PageContainer'
import { Loader } from '../../components/common/Loader'
import { LoadingScreen, PageTitle, ReviewScreen } from '../../components/output/AssignmentOutputPage'
import { cancelAssignmentGeneration, fetchAssignment, generateAssignment, saveAssignment } from '../../lib/api'
import { disconnectAssignmentSocket, connectAssignmentSocket } from '../../lib/socket'
import { useAssignmentStore } from '../../store/assignmentStore'
import { useAuthStore } from '../../store/authStore'

const MIN_LOADING_DURATION_MS = 3000

export function AssignmentOutputPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = useAuthStore((state) => state.token)
    const store = useAssignmentStore()
    const [toast, setToast] = useState('')
    const [minimumLoadingElapsed, setMinimumLoadingElapsed] = useState(false)
    const simulatedProgress = useRef<number | null>(null)
    const minimumLoadingTimer = useRef<number | null>(null)
    const isLoadingRoute = searchParams.get('state') === 'loading'
    const viewedAssignmentId = searchParams.get('assignmentId') ?? ''
    const assignment = store.generatedAssignment
    const showLoading =
        isLoadingRoute &&
        store.generationStatus !== 'completed'
    const [isHydratingViewedAssignment, setIsHydratingViewedAssignment] = useState(false)

    useEffect(() => {
        if (
            minimumLoadingElapsed &&
            store.generationStatus === 'completed'
        ) {
            const timeout = window.setTimeout(() => {
                router.replace('/output')
            }, 420)

            return () => window.clearTimeout(timeout)
        }
    }, [
        minimumLoadingElapsed,
        router,
        store.generationStatus,
    ])


    useEffect(() => {
        if (!isLoadingRoute) return

        if (minimumLoadingTimer.current) {
            window.clearTimeout(minimumLoadingTimer.current)
        }

        minimumLoadingTimer.current = window.setTimeout(() => {
            setMinimumLoadingElapsed(true)
        }, MIN_LOADING_DURATION_MS)

        return () => {
            if (minimumLoadingTimer.current) {
                window.clearTimeout(minimumLoadingTimer.current)
            }
        }
    }, [isLoadingRoute, store.activeAssignmentId])

    useEffect(() => {
        if (!token) return

        if (!viewedAssignmentId || isLoadingRoute) return

        const authToken = token

        let mounted = true

        async function loadViewedAssignment() {
            if (assignment?.id === viewedAssignmentId) {
                return
            }

            setIsHydratingViewedAssignment(true)

            try {
                const response = await fetchAssignment(authToken, viewedAssignmentId)
                if (!mounted) return

                store.setGeneratedAssignment(response.assignment)
            } catch (error) {
                if (mounted) {
                    console.log('[frontend] failed to load viewed assignment', error)
                }
            } finally {
                if (mounted) {
                    setIsHydratingViewedAssignment(false)
                }
            }
        }

        void loadViewedAssignment()

        return () => {
            mounted = false
        }
    }, [assignment?.id, isLoadingRoute, store, token, viewedAssignmentId])

    useEffect(() => {
        if (!token) return

        if (viewedAssignmentId && !isLoadingRoute) return

        const socket = connectAssignmentSocket(token)
        socket.on('generation:started', (payload: { assignmentId: string; jobId: string }) => {
            console.log('[frontend] generation started', payload)
            store.setGenerationProgress(8, 'Reading uploaded material')
        })
        socket.on('generation:progress', (payload: { progress: number; step: string }) => {
            console.log('[frontend] generation progress', payload)
            store.setGenerationProgress(payload.progress, payload.step)
        })
        socket.on(
            'generation:completed',
            (payload: {
                assignmentId: string
                jobId: string
                assignment: GeneratedAssignment
            }) => {
                console.log('GENERATION COMPLETED', payload)

                store.completeGeneration(payload.assignment)
            }
        )
        socket.on('generation:failed', (payload: { message: string }) => {
            console.log('[frontend] generation failed', payload)
            store.failGeneration(payload.message)
        })

        return () => {
            socket.off('generation:started')
            socket.off('generation:progress')
            socket.off('generation:completed')
            socket.off('generation:failed')
        }
    }, [isLoadingRoute, store, token, viewedAssignmentId])

    useEffect(() => {
        if (!showLoading || store.generationStatus === 'failed') return

        if (simulatedProgress.current) {
            window.clearInterval(simulatedProgress.current)
        }

        simulatedProgress.current = window.setInterval(() => {
            const next = Math.min(
                useAssignmentStore.getState().generationProgress + 3,
                96
            )

            const activeStep =
                next >= 92
                    ? 'Finalizing assignment'
                    : next >= 75
                        ? 'Reviewing & formatting'
                        : next >= 55
                            ? 'Generating questions'
                            : 'Understanding topics & difficulty'

            useAssignmentStore
                .getState()
                .setGenerationProgress(next, activeStep)
        }, 1200)

        return () => {
            if (simulatedProgress.current) {
                window.clearInterval(simulatedProgress.current)
            }
        }
    }, [showLoading, store.generationStatus])

    const regeneratePayload = useMemo(() => ({
        title: store.form.topicName || assignment?.title || '',
        dueDate: store.form.dueDate || assignment?.dueDate || '',
        questionTypes:
            store.form.questionTypes.length > 0
                ? store.form.questionTypes
                : assignment?.questionTypes || [],
        additionalInstructions:
            store.form.instructions || assignment?.instructions || '',
        uploadedMaterial:
            store.form.uploadName || assignment?.uploadedMaterial || '',
        uploadedMaterialDataUrl:
            store.form.uploadDataUrl || assignment?.uploadedMaterialDataUrl || '',
    }), [assignment, store.form])

    if (!assignment && isHydratingViewedAssignment) {
        return (
            <PageContainer outputMode>
                <Header title="Assignment" />
                <Loader />
            </PageContainer>
        )
    }

    if (!assignment && !showLoading) {
        return (
            <PageContainer outputMode>
                <Header title="Assignment" />
                <div className="p-[40px] text-center">
                    No assignment generated yet.
                </div>
            </PageContainer>
        )
    }

    const handleRegenerate = async () => {
        if (!token) return

        if (!regeneratePayload.title.trim()) {
            console.log('[frontend] regenerate validation failed: title missing')
            return
        }

        if (!regeneratePayload.dueDate.trim()) {
            console.log('[frontend] regenerate validation failed: due date missing')
            return
        }

        if (regeneratePayload.questionTypes.length === 0) {
            console.log('[frontend] regenerate validation failed: question types missing')
            return
        }

        console.log('[frontend] sending assignment for generation', regeneratePayload)

        store.resetGenerationState()
        setMinimumLoadingElapsed(false)
        router.push('/output?state=loading')
        try {
            const response = await generateAssignment(token, {
                ...regeneratePayload,
                assignmentId: assignment?.id || store.activeAssignmentId || undefined,
            })
            console.log('[frontend] generation request accepted', response)
            store.startGeneration(response.assignmentId, response.jobId)
            router.push('/output?state=loading')
        } catch (error) {
            console.log('[frontend] generation request failed', error)
            store.failGeneration(error instanceof Error ? error.message : 'Could not regenerate assignment.')
        }
    }

    const handleCancelLoading = async () => {
        if (!token) {
            router.replace('/create')
            return
        }

        try {
            if (store.activeAssignmentId && store.activeJobId) {
                await cancelAssignmentGeneration(token, {
                    assignmentId: store.activeAssignmentId,
                    jobId: store.activeJobId,
                })
            }
        } catch {
            // Keep the UX responsive even if cancellation fails server-side.
        } finally {
            disconnectAssignmentSocket()
            store.resetGenerationState()
            router.replace('/create')
        }
    }

    const handleSave = async () => {
        if (!token) {
            console.log('[frontend] save blocked: missing token')
            return
        }

        if (!assignment) {
            console.log('[frontend] save blocked: assignment missing')
            setToast('No generated assignment available to save.')
            return
        }

        const assignmentId = assignment.id || store.activeAssignmentId || (assignment as GeneratedAssignment & { _id?: string })._id || ''

        if (!assignmentId.trim()) {
            console.log('[frontend] save blocked: assignment id missing')
            setToast('Generated assignment is missing an id.')
            return
        }

        if (!assignment.generatedPaper) {
            console.log('[frontend] save blocked: generated paper missing')
            setToast('Generated assignment is not ready yet.')
            return
        }

        console.log('[frontend] saving assignment', { assignmentId })
        await saveAssignment(token, assignmentId)
        console.log('[frontend] assignment saved', { assignmentId })
        store.markAssignmentSaved()
        setToast('Assignment saved successfully')
        window.setTimeout(() => setToast(''), 2200)
    }

    const handleGoToAssignments = () => {
        router.push('/dashboard')
    }

    const handleGoToCreate = () => {
        if (assignment?.id) {
            router.push(`/create?assignmentId=${encodeURIComponent(assignment.id)}`)
            return
        }

        router.push('/create')
    }

    return (
        <PageContainer outputMode>
            <Header title="Assignment" />
            <section className="mx-auto w-full max-w-[1218px] px-[24px] pb-[24px] max-md:px-[12px] max-md:pb-[110px]">
                <AnimatePresence mode="wait" initial={false}>
                    {showLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            <PageTitle />
                            <LoadingScreen onRetry={handleRegenerate} />
                            <div className="mt-[28px] flex items-center justify-between max-[790px]:justify-center max-[790px]:gap-[16px] max-[790px]:flex-wrap">
                                <button type="button" onClick={handleCancelLoading} className="h-[44px] rounded-full bg-white px-[24px] text-[16px] font-medium">
                                    ← Previous
                                </button>
                                <button type="button" disabled className="h-[44px] rounded-full bg-[#151515] px-[26px] text-[16px] font-medium text-white opacity-50">
                                    Next →
                                </button>
                            </div>
                        </motion.div>
                    ) : assignment ? (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 16, scale: 0.995 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.995 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            <ReviewScreen
                                assignment={assignment}
                                onRegenerate={handleRegenerate}
                                onSave={handleSave}
                                onGoToAssignments={handleGoToAssignments}
                                onGoToCreate={handleGoToCreate}
                                toast={toast}
                            />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </section>
        </PageContainer>
    )
}
