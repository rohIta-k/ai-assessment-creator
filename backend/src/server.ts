import { createServer } from 'node:http'
import { app } from './app.js'
import { connectDatabase } from './config/db.js'
import { env } from './config/env.js'
import { initializeSocketServer } from './sockets/socketServer.js'

async function bootstrap() {
  await connectDatabase()

  await import('./workers/generationWorker.js')
  console.log('[backend] generation worker bootstrapped')

  const server = createServer(app)
  initializeSocketServer(server)

  server.listen(env.PORT, () => {
    console.log(`Backend listening on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start backend', error)
  process.exit(1)
})
