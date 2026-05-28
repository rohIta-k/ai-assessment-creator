export interface AuthUser {
  id: string
  googleId: string
  name: string
  email: string
  picture: string
}

export interface AuthSession {
  user: AuthUser
  token: string
  expiresAt: number
}

export interface GoogleCredentialResponse {
  credential?: string
}
