import Groq from 'groq-sdk'
import type { HydratedDocument } from 'mongoose'
import { env } from '../config/env.js'
import { Assignment, type AssignmentDocument } from '../models/Assignment.js'
import { buildAssignmentPrompt, type DifficultyDistribution, type GenerateAssignmentPaperPayload, type QuestionTypeInput } from '../utils/promptBuilder.js'
import { buildRepairPrompt, safeParseGeneratedAssignmentResponse, type GeneratedAssignmentResponse } from '../utils/responseParser.js'

export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'assignment-not-found'
      | 'groq-request-failed'
      | 'empty-response'
      | 'malformed-response'
      | 'validation-failed',
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AIGenerationError'
  }
}

const groq = new Groq({ apiKey: env.GROQ_API_KEY })

function getSubject(title: string, questionTypes: QuestionTypeInput[]) {
  const titleSource = title.toLowerCase()
  const labels = questionTypes.map((questionType) => questionType.label.toLowerCase()).join(' ')
  const source = `${titleSource} ${labels}`

  if (/computer|program|code|algorithm|data structure|dsa|software|database/.test(source)) {
    return 'Computer Science'
  }

  if (/science|physics|chemistry|biology|earth|environment/.test(source)) {
    return 'Science'
  }

  if (/math|algebra|geometry|calculus|statistics|number/.test(source)) {
    return 'Mathematics'
  }

  if (/english|grammar|literature|comprehension|writing/.test(source)) {
    return 'English'
  }

  return 'General Studies'
}

function getClassName(questionTypes: QuestionTypeInput[]) {
  const labels = questionTypes.map((questionType) => questionType.label.toLowerCase()).join(' ')

  if (/college|university|graduate|postgraduate/.test(labels)) {
    return 'College'
  }

  if (/class 1|class 2|class 3|class 4|class 5/.test(labels)) {
    return 'Class 5'
  }

  if (/class 6|class 7|class 8/.test(labels)) {
    return 'Class 8'
  }

  if (/class 9|class 10/.test(labels)) {
    return 'Class 10'
  }

  return 'Class 8'
}

function calculateDifficultyDistribution(totalQuestions: number): DifficultyDistribution {
  const easy = Math.max(1, Math.round(totalQuestions * 0.4))
  const medium = Math.max(1, Math.round(totalQuestions * 0.35))
  const hard = Math.max(totalQuestions - easy - medium, 0)
  const remainder = totalQuestions - (easy + medium + hard)

  return {
    easy: easy + Math.max(remainder, 0),
    medium,
    hard,
  }
}

function normalizeQuestionTypes(questionTypes: unknown[]): QuestionTypeInput[] {
  return questionTypes
    .map((questionType) => {
      if (!questionType || typeof questionType !== 'object') {
        return null
      }

      const candidate = questionType as Partial<QuestionTypeInput>
      const label = typeof candidate.label === 'string' && candidate.label.trim() ? candidate.label.trim() : ''
      const questions = Number(candidate.questions)
      const marks = Number(candidate.marks)

      if (!label) {
        return null
      }

      const normalized: QuestionTypeInput = {
        label,
        questions: Number.isFinite(questions) && questions > 0 ? Math.floor(questions) : 1,
        marks: Number.isFinite(marks) && marks > 0 ? Math.floor(marks) : 1,
      }

      if (typeof candidate.id === 'string' && candidate.id.trim()) {
        normalized.id = candidate.id.trim()
      }

      return normalized
    })
    .filter((questionType): questionType is QuestionTypeInput => Boolean(questionType))
}

function countQuestions(questionTypes: QuestionTypeInput[]) {
  return questionTypes.reduce((sum, questionType) => sum + questionType.questions, 0)
}

function countMarks(questionTypes: QuestionTypeInput[]) {
  return questionTypes.reduce((sum, questionType) => sum + questionType.questions * questionType.marks, 0)
}

function isNumericalQuestionType(label: string) {
  return /\bnumerical\b|\bcalculation\b|\bquantitative\b|\bmath(s|ematics)?\b|\bproblems?\b/i.test(label)
}

function buildGeneratedPaper(
  assignment: HydratedDocument<AssignmentDocument>,
  parsedResponse: GeneratedAssignmentResponse,
  questionTypes: QuestionTypeInput[],
) {
  const questionTypeLabels = questionTypes.map((questionType) => questionType.label)
  let nextQuestionId = 1

  const sections = parsedResponse.sections.map((section, sectionIndex) => {
    const correspondingType = questionTypes[sectionIndex]
    const sectionQuestions = section.questions.map((question) => {
      const questionTypeLabel = correspondingType?.label ?? question.question
      const visual = question.visual && !isNumericalQuestionType(questionTypeLabel) && (question.visual.points?.length ?? 0) > 0
        ? {
          renderer: question.visual.renderer,
          chartType: question.visual.chartType,
          title: question.visual.title,
          xAxisLabel: question.visual.xAxisLabel,
          yAxisLabel: question.visual.yAxisLabel,
          points: question.visual.points?.map((point) => ({
            x: point.x,
            y: point.y,
          })),
          expression: question.visual.expression,
          domain: question.visual.domain,
        }
        : undefined

      const structuredQuestion = {
        id: nextQuestionId,
        text: question.question,
        marks: question.marks,
        difficulty: question.difficulty === 'easy'
          ? 'Easy'
          : question.difficulty === 'medium'
            ? 'Medium'
            : 'Hard',
        type: questionTypeLabel,
        options: question.options,
        answer: question.answer,
        visual,
      }

      nextQuestionId += 1
      return structuredQuestion
    })

    return {
      id: String.fromCharCode(65 + sectionIndex),
      title: section.title || `SECTION ${String.fromCharCode(65 + sectionIndex)}`,
      subtitle: section.instruction || correspondingType?.label || 'Question Set',
      marks: sectionQuestions.reduce((sum, question) => sum + question.marks, 0),
      questions: sectionQuestions,
    }
  })

  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
  const totalMarks = sections.reduce((sum, section) => sum + section.marks, 0)

  return {
    schoolName: 'Delhi Public School',
    subject: parsedResponse.subject,
    className: parsedResponse.className,
    title: parsedResponse.title,
    dueDate: assignment.dueDate || '',
    totalMarks,
    totalQuestions,
    instructions: parsedResponse.instructions || assignment.instructions || '',
    sourceFile: assignment.uploadedMaterial || 'Uploaded material',
    questionTypes: questionTypeLabels,
    sections,
  }
}

async function requestGroqResponse(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  signal?: AbortSignal,
) {
  try {
    console.log('[backend] groq request started', { messageCount: messages.length })
    const response = await Promise.race([
      groq.chat.completions.create({
        model: env.GROQ_MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }, signal ? { signal } : undefined),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => reject(new Error('Groq request timed out.')), env.GROQ_TIMEOUT_MS)
        signal?.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new Error('Groq request cancelled.'))
        }, { once: true })
      }),
    ])

    const content = response.choices[0]?.message?.content ?? ''
    if (!content.trim()) {
      throw new AIGenerationError('The model returned an empty response.', 'empty-response')
    }

    console.log('[backend] groq request received response')

    return content
  } catch (error) {
    if (error instanceof AIGenerationError) {
      throw error
    }

    if (error instanceof Error && error.message === 'Groq request cancelled.') {
      throw new AIGenerationError('The generation was cancelled.', 'validation-failed', error)
    }

    throw new AIGenerationError('The Groq request failed.', 'groq-request-failed', error)
  }
}

async function generateStructuredResponse(messages: Array<{ role: 'system' | 'user'; content: string }>, signal?: AbortSignal) {
  console.log('[backend] generating structured response')
  const rawResponse = await requestGroqResponse(messages, signal)

  try {
    console.log('[backend] parsing groq response')
    return safeParseGeneratedAssignmentResponse(rawResponse)
  } catch (error) {
    console.log('[backend] groq response malformed, attempting repair')
    const repairMessages = [
      {
        role: 'system' as const,
        content: [
          'You fix malformed JSON outputs for question paper generation.',
          'Return only valid JSON and keep the original content consistent with the requested schema.',
        ].join(' '),
      },
      {
        role: 'user' as const,
        content: [
          'Repair the following response so it matches the expected JSON schema exactly.',
          '',
          buildRepairPrompt(rawResponse),
        ].join('\n'),
      },
    ]

    const repairedResponse = await requestGroqResponse(repairMessages, signal)
    try {
      console.log('[backend] parsing repaired groq response')
      console.log(repairedResponse)
      return safeParseGeneratedAssignmentResponse(repairedResponse)
    } catch (repairError) {
      throw new AIGenerationError('The AI response could not be parsed.', 'malformed-response', repairError ?? error)
    }
  }
}

export async function generateAssignmentPaper(
  payload: GenerateAssignmentPaperPayload,
  options?: {
    signal?: AbortSignal
    shouldAbort?: () => boolean
  },
) {
  if (payload.questionTypes.length === 0 || payload.totalQuestions <= 0 || payload.totalMarks <= 0) {
    throw new AIGenerationError('At least one question type is required.', 'validation-failed')
  }

  if (options?.shouldAbort?.()) {
    throw new AIGenerationError('The generation was cancelled.', 'validation-failed')
  }

  console.log('[backend] generateAssignmentPaper start', {
    title: payload.title,
    subject: payload.subject,
    className: payload.className,
    totalQuestions: payload.totalQuestions,
    totalMarks: payload.totalMarks,
  })

  const prompt = buildAssignmentPrompt(payload)
  const parsedResponse = await generateStructuredResponse(prompt.messages, options?.signal)

  const inputQuestionCount = payload.totalQuestions
  const outputQuestionCount = parsedResponse.sections.reduce((sum, section) => sum + section.questions.length, 0)
  const outputMarks = parsedResponse.sections.reduce((sum, section) => sum + section.questions.reduce((marksSum, question) => marksSum + question.marks, 0), 0)

  if (parsedResponse.sections.length !== payload.questionTypes.length) {
    throw new AIGenerationError('The generated paper did not match the requested section structure.', 'validation-failed')
  }

  const distributionMatches = parsedResponse.sections.every((section, index) => {
    const questionType = payload.questionTypes[index]
    return section.questions.length === questionType.questions
      && section.questions.every((question) => question.marks === questionType.marks)
  })

  if (outputQuestionCount !== inputQuestionCount || outputMarks !== payload.totalMarks || !distributionMatches) {
    throw new AIGenerationError('The generated paper did not match the requested question distribution.', 'validation-failed')
  }

  console.log('[backend] generateAssignmentPaper completed validation', {
    questionCount: outputQuestionCount,
    markCount: outputMarks,
    sectionCount: parsedResponse.sections.length,
  })

  return parsedResponse
}

export async function generateQuestionPaper(
  assignmentId: string,
  onProgress?: (progress: number, step: string) => Promise<void> | void,
  options?: {
    shouldAbort?: () => boolean
  },
) {
  const assignment = await Assignment.findById(assignmentId)
  if (!assignment) {
    throw new AIGenerationError('Assignment not found.', 'assignment-not-found')
  }

  console.log('[backend] generateQuestionPaper start', { assignmentId })

  const questionTypes = normalizeQuestionTypes(assignment.questionTypes)
  const totalQuestions = countQuestions(questionTypes)
  const totalMarks = countMarks(questionTypes)
  const storedMetadata = (assignment.metadata ?? {}) as Record<string, unknown>
  const payload: GenerateAssignmentPaperPayload = {
    title: assignment.title,
    subject: typeof storedMetadata.subject === 'string' && storedMetadata.subject.trim() ? storedMetadata.subject.trim() : getSubject(assignment.title, questionTypes),
    className: typeof storedMetadata.className === 'string' && storedMetadata.className.trim() ? storedMetadata.className.trim() : getClassName(questionTypes),
    questionTypes,
    totalQuestions,
    totalMarks,
    difficultyDistribution: calculateDifficultyDistribution(totalQuestions),
    additionalInstructions: assignment.instructions || '',
    uploadedMaterialText: typeof storedMetadata.uploadedMaterialText === 'string' && storedMetadata.uploadedMaterialText.trim()
      ? storedMetadata.uploadedMaterialText.trim()
      : assignment.uploadedMaterial
        ? `Uploaded file: ${assignment.uploadedMaterial}`
        : '',
  }

  if (options?.shouldAbort?.()) {
    throw new AIGenerationError('The generation was cancelled.', 'validation-failed')
  }

  const abortController = new AbortController()
  const cancellationWatcher = setInterval(() => {
    if (options?.shouldAbort?.()) {
      abortController.abort()
    }
  }, 1000)

  try {
    await onProgress?.(12, 'Reading material')
    console.log('[backend] generation step', { assignmentId, progress: 12, step: 'Reading material' })
    await onProgress?.(26, 'Understanding requirements')
    console.log('[backend] generation step', { assignmentId, progress: 26, step: 'Understanding requirements' })
    await onProgress?.(44, 'Generating sections')
    console.log('[backend] generation step', { assignmentId, progress: 44, step: 'Generating sections' })

    const parsedResponse = await generateAssignmentPaper(payload, {
      signal: abortController.signal,
      shouldAbort: options?.shouldAbort,
    })

    await onProgress?.(72, 'Generating questions')
    console.log('[backend] generation step', { assignmentId, progress: 72, step: 'Generating questions' })
    await onProgress?.(88, 'Formatting assignment')
    console.log('[backend] generation step', { assignmentId, progress: 88, step: 'Formatting assignment' })

    if (options?.shouldAbort?.()) {
      abortController.abort()
      throw new AIGenerationError('The generation was cancelled.', 'validation-failed')
    }

    const generatedPaper = buildGeneratedPaper(assignment, parsedResponse, questionTypes)
    assignment.generatedPaper = generatedPaper
    assignment.metadata = {
      model: env.GROQ_MODEL,
      generatedAt: new Date().toISOString(),
      source: 'groq',
      subject: payload.subject,
      className: payload.className,
      totalQuestions: payload.totalQuestions,
      totalMarks: payload.totalMarks,
      difficultyDistribution: payload.difficultyDistribution,
      questionTypes: questionTypes.map((questionType) => ({
        label: questionType.label,
        questions: questionType.questions,
        marks: questionType.marks,
      })),
    }

    await assignment.save()
    await onProgress?.(96, 'Finalizing paper')
    console.log('[backend] generation step', { assignmentId, progress: 96, step: 'Finalizing paper' })
    console.log('[backend] generateQuestionPaper completed', { assignmentId })

    return assignment
  } finally {
    clearInterval(cancellationWatcher)
  }
}
