import type { NextFunction, Request, Response } from 'express'
import { User, type UserDocument } from '../models/User.js'
import { verifyJwt } from '../utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    const payload = verifyJwt(token)
    const user = await User.findById(payload.sub)

    if (!user) {
      return res.status(401).json({ message: 'Invalid session.' })
    }

    req.user = user as UserDocument
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session.' })
  }
}
