import { create } from 'zustand'
import { assignments, generatedQuestions, questionTypeOptions } from '../constants/assignments'
import type {
  Assignment,
  GeneratedAssignment,
  GeneratedQuestion,
  GenerationStatus,
  QuestionType,
} from '../types/assignment'

interface AssignmentFormState {
  dueDate: string
  uploadName: string
  uploadDataUrl: string
  topicName: string
  questionTypes: QuestionType[]
  instructions: string
}

interface AssignmentStore {
  assignments: Assignment[]
  generatedQuestions: GeneratedQuestion[]
  form: AssignmentFormState
  isGenerating: boolean
  generationStatus: GenerationStatus
  generationProgress: number
  generationStep: string
  generationError: string
  activeAssignmentId: string
  activeJobId: string
  generatedAssignment: GeneratedAssignment | null
  setDueDate: (dueDate: string) => void
  setUploadName: (uploadName: string) => void
  setUploadDataUrl: (uploadDataUrl: string) => void
  setTopicName: (topicName: string) => void
  setQuestionTypes: (questionTypes: QuestionType[]) => void
  updateQuestionType: (id: string, updates: Partial<QuestionType>) => void
  removeQuestionType: (id: string) => void
  addQuestionType: () => void
  setInstructions: (instructions: string) => void
  setGenerating: (isGenerating: boolean) => void
  startGeneration: (assignmentId: string, jobId: string) => void
  setGenerationProgress: (progress: number, step?: string) => void
  completeGeneration: (assignment: GeneratedAssignment) => void
  failGeneration: (message: string) => void
  setGeneratedAssignment: (assignment: GeneratedAssignment) => void
  markAssignmentSaved: () => void
  resetDraftState: () => void
  resetGenerationState: () => void
}

function resolveGeneratedAssignmentId(
  assignment: GeneratedAssignment & { _id?: string },
  fallbackId = '',
) {
  if (typeof assignment.id === 'string' && assignment.id.trim()) {
    return assignment.id.trim()
  }

  if (typeof assignment._id === 'string' && assignment._id.trim()) {
    return assignment._id.trim()
  }

  return fallbackId
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments,
  generatedQuestions,
  form: {
    dueDate: '',
    uploadName: '',
    uploadDataUrl: '',
    topicName: '',
    questionTypes: [],
    instructions: '',
  },
  isGenerating: false,
  generationStatus: 'idle',
  generationProgress: 0,
  generationStep: 'Preparing generation',
  generationError: '',
  activeAssignmentId: '',
  activeJobId: '',
  generatedAssignment: null,
  setDueDate: (dueDate) => set((state) => ({ form: { ...state.form, dueDate } })),
  setUploadName: (uploadName) => set((state) => ({ form: { ...state.form, uploadName } })),
  setUploadDataUrl: (uploadDataUrl) => set((state) => ({ form: { ...state.form, uploadDataUrl } })),
  setTopicName: (topicName) => set((state) => ({ form: { ...state.form, topicName } })),
  setQuestionTypes: (questionTypes) => set((state) => ({ form: { ...state.form, questionTypes } })),
  updateQuestionType: (id, updates) =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: state.form.questionTypes.map((type) =>
          type.id === id ? { ...type, ...updates } : type,
        ),
      },
    })),
  removeQuestionType: (id) =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: state.form.questionTypes.filter((type) => type.id !== id),
      },
    })),
  addQuestionType: () =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: [
          ...state.form.questionTypes,
          {
            id: `custom-${Date.now()}`,
            label: questionTypeOptions[0]?.label ?? 'Multiple Choice Questions',
            questions: 1,
            marks: 1,
          },
        ],
      },
    })),
  setInstructions: (instructions) => set((state) => ({ form: { ...state.form, instructions } })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  startGeneration: (assignmentId, jobId) =>
    set({
      activeAssignmentId: assignmentId,
      activeJobId: jobId,
      generationStatus: 'queued',
      generationProgress: 4,
      generationStep: 'Preparing generation',
      generationError: '',
      isGenerating: true,
    }),
  setGenerationProgress: (progress, step) =>
    set((state) => ({
      generationProgress: Math.max(state.generationProgress, Math.min(progress, 99)),
      generationStep: step ?? state.generationStep,
      generationStatus: 'generating',
      isGenerating: true,
    })),
  completeGeneration: (assignment) => {
    console.log('SETTING GENERATED ASSIGNMENT', assignment)
    set((state) => {
      const assignmentId = resolveGeneratedAssignmentId(
        assignment as GeneratedAssignment & { _id?: string },
        state.activeAssignmentId,
      )

      return {
        generatedAssignment: {
          ...assignment,
          id: assignmentId,
        },
        activeAssignmentId: assignmentId,
        generationStatus: 'completed',
        generationProgress: 100,
        generationStep: 'Finalizing assignment',
        generationError: '',
        isGenerating: false,
      }
    })
  },
  failGeneration: (message) =>
    set({
      generationStatus: 'failed',
      generationError: message,
      isGenerating: false,
    }),
  setGeneratedAssignment: (assignment) =>
    set((state) => {
      const assignmentId = resolveGeneratedAssignmentId(
        assignment as GeneratedAssignment & { _id?: string },
        state.activeAssignmentId,
      )

      return {
        generatedAssignment: {
          ...assignment,
          id: assignmentId,
        },
        activeAssignmentId: assignmentId,
        generationStatus: 'completed',
        generationProgress: 100,
        isGenerating: false,
      }
    }),
  markAssignmentSaved: () =>
    set((state) => ({
      generatedAssignment: state.generatedAssignment
        ? { ...state.generatedAssignment, saved: true }
        : state.generatedAssignment,
    })),
  resetDraftState: () =>
    set({
      form: {
        dueDate: '',
        uploadName: '',
        uploadDataUrl: '',
        topicName: '',
        questionTypes: [],
        instructions: '',
      },
      isGenerating: false,
      generationStatus: 'idle',
      generationProgress: 0,
      generationStep: 'Preparing generation',
      generationError: '',
      activeAssignmentId: '',
      activeJobId: '',
      generatedAssignment: null,
    }),
  resetGenerationState: () =>
    set({
      isGenerating: false,
      generationStatus: 'idle',
      generationProgress: 0,
      generationStep: 'Preparing generation',
      generationError: '',
      activeAssignmentId: '',
      activeJobId: '',
      generatedAssignment: null,
    }),
}))
