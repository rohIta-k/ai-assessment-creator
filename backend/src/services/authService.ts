import { OAuth2Client } from 'google-auth-library'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { JWT_TTL_MS, signJwt } from '../utils/jwt.js'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

export async function signInWithGoogle(credential: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload?.sub || !payload.email || !payload.name) {
    throw new Error('Invalid Google credential.')
  }

  const user = await User.findOneAndUpdate(
    { googleId: payload.sub },
    {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture ?? '',
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  )

  const token = signJwt({ sub: user.id, email: user.email })

  return {
    user: {
      id: user.id,
      googleId: user.googleId,
      name: user.name,
      email: user.email,
      picture: user.picture,
    },
    token,
    expiresAt: Date.now() + JWT_TTL_MS,
  }
}
