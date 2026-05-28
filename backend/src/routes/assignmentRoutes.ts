import { Router } from 'express'
import {
  createAssignment,
  cancelAssignmentGeneration,
  generateAssignment,
  getAssignment,
  listAssignments,
  deleteAssignment,
  saveAssignment,
} from '../controllers/assignmentController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

export const assignmentRoutes = Router()

assignmentRoutes.use(authMiddleware)
assignmentRoutes.post('/', createAssignment)
assignmentRoutes.post('/generate', generateAssignment)
assignmentRoutes.post('/generate/cancel', cancelAssignmentGeneration)
assignmentRoutes.get('/', listAssignments)
assignmentRoutes.get('/:assignmentId', getAssignment)
assignmentRoutes.post('/:assignmentId/save', saveAssignment)
assignmentRoutes.delete('/:assignmentId', deleteAssignment)
