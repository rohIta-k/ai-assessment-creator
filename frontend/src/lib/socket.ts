import { io, type Socket } from 'socket.io-client'
import { API_URL } from './api'

let socket: Socket | null = null

export function connectAssignmentSocket(token: string) {
  if (socket) {
    return socket
  }

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('SOCKET CONNECTED')
  })

  socket.on('disconnect', () => {
    console.log('SOCKET DISCONNECTED')
  })

  return socket
}

export function disconnectAssignmentSocket() {
  socket?.disconnect()
  socket = null
}
