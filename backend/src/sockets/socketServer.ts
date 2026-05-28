import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { env } from '../config/env.js'
import { verifyJwt } from '../utils/jwt.js'
import { subscribeToUserSocketEvents } from './socketEvents.js'

let io: Server | null = null

export function initializeSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (typeof token !== 'string') {
      return next(new Error('Authentication required.'))
    }

    try {
      const payload = verifyJwt(token)
      socket.data.userId = payload.sub
      next()
    } catch {
      next(new Error('Invalid session.'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId}`)
  })

  subscribeToUserSocketEvents(({ userId, event, payload }) => {
    emitToUser(userId, event, payload)
  })

  return io
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload)
}
