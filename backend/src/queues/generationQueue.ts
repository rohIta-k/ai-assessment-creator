import { Queue } from 'bullmq'
import { env } from '../config/env.js'

const redisUrl = new URL(env.REDIS_URL)

export const redisConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username,
  password: redisUrl.password,
  tls: {},
  maxRetriesPerRequest: null,
}

export interface GenerationJob {
  assignmentId: string
  userId: string
  cancelRequested?: boolean
  regenerate?: boolean
}

export const generationQueue = new Queue<GenerationJob>(
  'assignment-generation',
  {
    connection: redisConnection,
  }
)
