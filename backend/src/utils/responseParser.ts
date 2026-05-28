import { z } from 'zod'
import { jsonrepair } from 'jsonrepair'

export const generatedQuestionSchema = z.object({
  question: z.string().trim().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.coerce.number().int().positive(),
  answer: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).optional(),
  visual: z.object({
    renderer: z.enum(['recharts', 'desmos']),
    chartType: z.enum(['line', 'bar', 'scatter']).optional(),
    title: z.string().trim().default(''),
    xAxisLabel: z.string().trim().default(''),
    yAxisLabel: z.string().trim().default(''),
    points: z.array(z.object({
      x: z.union([z.string(), z.number()]),
      y: z.coerce.number(),
    })).default([]),
    expression: z.string().trim().default(''),
    domain: z.tuple([z.coerce.number(), z.coerce.number()]).optional(),
  }).optional(),
})

export const generatedSectionSchema = z.object({
  title: z.string().trim().min(1),
  instruction: z.string().trim().default(''),
  questions: z.array(generatedQuestionSchema).min(1),
})

export const generatedAssignmentResponseSchema = z.object({
  title: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  className: z.string().trim().min(1),
  instructions: z.string().trim().default(''),
  totalMarks: z.coerce.number().int().nonnegative(),
  totalQuestions: z.coerce.number().int().nonnegative(),
  sections: z.array(generatedSectionSchema).min(1),
}).passthrough()

export type GeneratedAssignmentResponse = z.infer<typeof generatedAssignmentResponseSchema>

function normalizeQuestion(question: unknown) {
  if (!question || typeof question !== 'object') {
    return question
  }

  const candidate = question as Record<string, unknown>
  const difficulty = typeof candidate.difficulty === 'string'
    ? candidate.difficulty.trim().toLowerCase()
    : candidate.difficulty

  const visual = candidate.visual && typeof candidate.visual === 'object'
    ? (() => {
      const visualCandidate = candidate.visual as Record<string, unknown>

      return {
        ...visualCandidate,
        renderer: typeof visualCandidate.renderer === 'string'
          ? visualCandidate.renderer.trim().toLowerCase()
          : visualCandidate.renderer,
        chartType: typeof visualCandidate.chartType === 'string'
          ? visualCandidate.chartType.trim().toLowerCase()
          : visualCandidate.chartType,
        points: Array.isArray(visualCandidate.points)
          ? visualCandidate.points.map((point) => {
            if (!point || typeof point !== 'object') {
              return point
            }

            const pointCandidate = point as Record<string, unknown>
            return {
              x: pointCandidate.x,
              y: pointCandidate.y,
            }
          })
          : visualCandidate.points,
      }
    })()
    : candidate.visual

  return {
    ...candidate,
    question: typeof candidate.question === 'string'
      ? candidate.question
      : typeof candidate.text === 'string'
        ? candidate.text
        : typeof candidate.prompt === 'string'
          ? candidate.prompt
          : typeof candidate.statement === 'string'
            ? candidate.statement
            : candidate.question,
    answer: typeof candidate.answer === 'string'
      ? candidate.answer
      : typeof candidate.correctAnswer === 'string'
        ? candidate.correctAnswer
        : candidate.answer,
    difficulty,
    options: Array.isArray(candidate.options)
      ? candidate.options.filter((option): option is string => typeof option === 'string' && option.trim().length > 0)
      : candidate.options,
    visual,
  }
}

function normalizeGeneratedAssignmentResponse(parsed: unknown) {
  if (!parsed || typeof parsed !== 'object') {
    return parsed
  }

  const candidate = parsed as Record<string, unknown>
  const sections = Array.isArray(candidate.sections)
    ? candidate.sections.map((section) => {
      if (!section || typeof section !== 'object') {
        return section
      }

      const sectionCandidate = section as Record<string, unknown>
      return {
        ...sectionCandidate,
        title: typeof sectionCandidate.title === 'string'
          ? sectionCandidate.title
          : typeof sectionCandidate.name === 'string'
            ? sectionCandidate.name
            : sectionCandidate.title,
        instruction: typeof sectionCandidate.instruction === 'string'
          ? sectionCandidate.instruction
          : typeof sectionCandidate.instructions === 'string'
            ? sectionCandidate.instructions
            : '',
        questions: Array.isArray(sectionCandidate.questions)
          ? sectionCandidate.questions.map(normalizeQuestion)
          : sectionCandidate.questions,
      }
    })
    : candidate.sections

  return {
    ...candidate,
    sections,
  }
}

function stripCodeFences(raw: string) {
  return raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()
}

function extractBalancedJson(raw: string) {
  const startIndex = raw.search(/[\[{]/)
  if (startIndex < 0) {
    return null
  }

  const input = raw.slice(startIndex)
  const stack: string[] = []
  let inString = false
  let escaped = false

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (character === '\\') {
      escaped = true
      continue
    }

    if (character === '"') {
      inString = !inString
      continue
    }

    if (inString) {
      continue
    }

    if (character === '{' || character === '[') {
      stack.push(character)
      continue
    }

    if (character === '}' || character === ']') {
      const opening = stack.pop()
      if (!opening) {
        return null
      }

      if ((opening === '{' && character !== '}') || (opening === '[' && character !== ']')) {
        return null
      }

      if (stack.length === 0) {
        return input.slice(0, index + 1)
      }
    }
  }

  return null
}

export function safeParseGeneratedAssignmentResponse(raw: string) {
  const cleaned = stripCodeFences(raw)

  const candidates = [cleaned, extractBalancedJson(cleaned)].filter((candidate): candidate is string => Boolean(candidate))

  for (const candidate of candidates) {
    const parseAttempts = [candidate]

    try {
      parseAttempts.push(jsonrepair(candidate))
    } catch {
      // Ignore repair failures and try the next candidate.
    }

    for (const attempt of parseAttempts) {
      try {
        const parsed = JSON.parse(attempt)
        const normalized = normalizeGeneratedAssignmentResponse(parsed)
        const validation = generatedAssignmentResponseSchema.safeParse(normalized)
        if (validation.success) {
          return validation.data
        }
      } catch {
        // Try the next attempt.
      }
    }
  }

  throw new Error('The AI response was malformed or did not match the required schema.')
}

export function buildRepairPrompt(rawResponse: string) {
  return [
    'The following JSON response is invalid or incomplete.',
    'Repair it so that it matches the required schema exactly and output only valid JSON.',
    '',
    rawResponse,
  ].join('\n')
}