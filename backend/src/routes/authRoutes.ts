import { Router } from 'express'
import { googleAuth, getMe } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

export const authRoutes = Router()

authRoutes.post('/google', googleAuth)
authRoutes.get('/me', authMiddleware, getMe)
