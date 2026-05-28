import type { Request, Response } from 'express'
import type { HydratedDocument } from 'mongoose'
import { z } from 'zod'
import { Assignment, type AssignmentDocument } from '../models/Assignment.js'
import { generationQueue } from '../queues/generationQueue.js'

const createAssignmentSchema = z.object({
  title: z.string().min(1).max(160),
  instructions: z.string().max(5000).default(''),
  uploadedMaterial: z.string().max(300).default(''),
  uploadedMaterialDataUrl: z.string().default(''),
})

const generateAssignmentSchema = z.object({
  assignmentId: z.string().trim().optional(),
  title: z.string().min(1).max(160),
  dueDate: z.string().max(40).default(''),
  questionTypes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    questions: z.number(),
    marks: z.number(),
  })).default([]),
  additionalInstructions: z.string().max(5000).default(''),
  uploadedMaterial: z.string().max(300).default(''),
  uploadedMaterialDataUrl: z.string().default(''),
})

function serializeAssignment(assignment: HydratedDocument<AssignmentDocument> | null) {
  if (!assignment) {
    return null
  }

  return {
    id: assignment.id,
    title: assignment.title,
    instructions: assignment.instructions,
    dueDate: assignment.dueDate,
    uploadedMaterial: assignment.uploadedMaterial,
    uploadedMaterialDataUrl: assignment.uploadedMaterialDataUrl,
    questionTypes: assignment.questionTypes,
    generatedPaper: assignment.generatedPaper,
    metadata: assignment.metadata,
    saved: assignment.saved,
  }
}

export async function createAssignment(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  const payload = createAssignmentSchema.parse(req.body)
  console.log('[backend] createAssignment received', { userId: req.user._id.toString(), title: payload.title })
  const assignment = await Assignment.create({
    userId: req.user._id,
    title: payload.title,
    instructions: payload.instructions,
    uploadedMaterial: payload.uploadedMaterial,
    uploadedMaterialDataUrl: payload.uploadedMaterialDataUrl,
    generatedPaper: '',
    metadata: {},
  })

  await generationQueue.add('generate-paper', {
    assignmentId: assignment.id,
    userId: req.user._id.toString(),
  })

  console.log('[backend] createAssignment queued generation', { assignmentId: assignment.id })

  res.status(201).json({ assignment })
}

export async function generateAssignment(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  const payload = generateAssignmentSchema.parse(req.body)
  const updateFields = {
    title: payload.title,
    instructions: payload.additionalInstructions,
    dueDate: payload.dueDate,
    uploadedMaterial: payload.uploadedMaterial,
    uploadedMaterialDataUrl: payload.uploadedMaterialDataUrl,
    questionTypes: payload.questionTypes,
    generatedPaper: null,
    metadata: {},
    saved: false,
  }

  console.log('[backend] generateAssignment received', {
    userId: req.user._id.toString(),
    title: payload.title,
    dueDate: payload.dueDate,
    questionTypes: payload.questionTypes.length,
    assignmentId: payload.assignmentId,
  })

  const assignment = payload.assignmentId
    ? await Assignment.findOneAndUpdate(
      { _id: payload.assignmentId, userId: req.user._id },
      { $set: updateFields },
      { returnDocument: 'after' },
    )
    : await Assignment.create({
      userId: req.user._id,
      ...updateFields,
    })

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found.' })
  }

  const job = await generationQueue.add('generate-paper', {
    assignmentId: assignment.id,
    userId: req.user._id.toString(),
  })

  console.log('[backend] generateAssignment queued job', {
    assignmentId: assignment.id,
    jobId: job.id,
  })

  res.status(201).json({ assignmentId: assignment.id, jobId: job.id })
}

export async function cancelAssignmentGeneration(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  const assignmentId = typeof req.body.assignmentId === 'string' ? req.body.assignmentId : ''
  const jobId = typeof req.body.jobId === 'string' ? req.body.jobId : ''

  if (!assignmentId || !jobId) {
    return res.status(400).json({ message: 'Assignment id and job id are required.' })
  }

  console.log('[backend] cancelAssignmentGeneration received', {
    userId: req.user._id.toString(),
    assignmentId,
    jobId,
  })

  const assignment = await Assignment.findOneAndUpdate(
    { _id: assignmentId, userId: req.user._id },
    { $set: { 'metadata.cancelRequested': true } },
    { returnDocument: 'after' },
  )

  const job = await generationQueue.getJob(jobId)
  if (job) {
    await job.remove().catch(() => undefined)
  }

  console.log('[backend] cancelAssignmentGeneration marked cancelRequested', {
    assignmentId,
    jobId,
    removedJob: Boolean(job),
  })

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found.' })
  }

  return res.json({ ok: true })
}

export async function getAssignment(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  const assignment = await Assignment.findOne({ _id: req.params.assignmentId, userId: req.user._id })
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found.' })
  }

  console.log('[backend] getAssignment', { assignmentId: assignment.id, hasPaper: Boolean(assignment.generatedPaper) })

  res.json({ assignment: serializeAssignment(assignment) })
}

export async function saveAssignment(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  const assignment = await Assignment.findOneAndUpdate(
    { _id: req.params.assignmentId, userId: req.user._id },
    { saved: true },
    { returnDocument: 'after' },
  )
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found.' })
  }

  console.log('[backend] saveAssignment completed', { assignmentId: assignment.id })

  res.json({ assignment: serializeAssignment(assignment) })
}

export async function deleteAssignment(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  const assignment = await Assignment.findOneAndDelete({ _id: req.params.assignmentId, userId: req.user._id })
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found.' })
  }

  console.log('[backend] deleteAssignment completed', { assignmentId: assignment.id })

  return res.json({ ok: true })
}

export async function listAssignments(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  const assignments = await Assignment.find({ userId: req.user._id }).sort({ createdAt: -1 })
  console.log('[backend] listAssignments', { userId: req.user._id.toString(), count: assignments.length })
  res.json({ assignments })
}
