import type { Request, Response } from 'express'
import { z } from 'zod'
import { signInWithGoogle } from '../services/authService.js'

const googleAuthSchema = z.object({
  credential: z.string().min(1),
})

export async function googleAuth(req: Request, res: Response) {
  const { credential } = googleAuthSchema.parse(req.body)
  const session = await signInWithGoogle(credential)
  res.json(session)
}

export function getMe(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  res.json({
    user: {
      id: req.user._id.toString(),
      googleId: req.user.googleId,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
    },
  })
}
