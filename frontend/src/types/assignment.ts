import type { LucideIcon } from 'lucide-react'

export type AssignmentStatus = 'active' | 'draft' | 'generated'
export type Difficulty = 'Easy' | 'Moderate' | 'Challenging'

export interface Assignment {
  id: string
  title: string
  subject?: string
  assignedOn: string
  due: string
  status: AssignmentStatus
}

export interface QuestionType {
  id: string
  label: string
  questions: number
  marks: number
}

export interface QuestionTypeOption {
  id: string
  label: string
}

export interface GeneratedQuestion {
  id: number
  difficulty: Difficulty
  text: string
  marks: number
}

export type QuestionVisualRenderer = 'recharts' | 'desmos'
export type QuestionVisualChartType = 'line' | 'bar' | 'scatter'

export interface QuestionVisualPoint {
  x: string | number
  y: number
}

export interface GeneratedQuestionVisual {
  renderer: QuestionVisualRenderer
  chartType?: QuestionVisualChartType
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  points?: QuestionVisualPoint[]
  expression?: string
  domain?: [number, number]
}

export type GenerationStatus = 'idle' | 'queued' | 'generating' | 'completed' | 'failed'

export interface GeneratedPaperQuestion {
  id: number
  text: string
  marks: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  type: string
  options?: string[]
  answer?: string
  visual?: GeneratedQuestionVisual
}

export interface GeneratedPaperSection {
  id: string
  title: string
  subtitle: string
  marks: number
  questions: GeneratedPaperQuestion[]
}

export interface GeneratedPaper {
  schoolName: string
  subject: string
  className: string
  title: string
  dueDate: string
  totalMarks: number
  totalQuestions: number
  instructions: string
  sourceFile: string
  questionTypes: string[]
  sections: GeneratedPaperSection[]
}

export interface GeneratedAssignment {
  id: string
  title: string
  instructions: string
  dueDate: string
  uploadedMaterial: string
  uploadedMaterialDataUrl?: string
  questionTypes: QuestionType[]
  generatedPaper: GeneratedPaper
  saved?: boolean
}

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
  badge?: number
  mobileIconSrc?: string
}
