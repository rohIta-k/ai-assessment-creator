import { Redis } from 'ioredis'
import { env } from '../config/env.js'

const SOCKET_EVENTS_CHANNEL = 'socket-events'

export interface UserSocketEvent {
  userId: string
  event: string
  payload: unknown
}

export async function publishUserSocketEvent(message: UserSocketEvent) {
  const publisher = new Redis(env.REDIS_URL)
  await publisher.publish(SOCKET_EVENTS_CHANNEL, JSON.stringify(message))
  publisher.disconnect()
}

export function subscribeToUserSocketEvents(handler: (message: UserSocketEvent) => void) {
  const subscriber = new Redis(env.REDIS_URL)
  subscriber.subscribe(SOCKET_EVENTS_CHANNEL)
  subscriber.on('message', (_channel: string, raw: string) => {
    try {
      handler(JSON.parse(raw) as UserSocketEvent)
    } catch {
      // Drop malformed pub/sub messages.
    }
  })

  return subscriber
}
