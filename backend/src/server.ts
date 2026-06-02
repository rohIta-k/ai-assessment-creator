import { createServer } from 'node:http'
import { app } from './app.js'
import { connectDatabase } from './config/db.js'
import { env } from './config/env.js'
import { initializeSocketServer } from './sockets/socketServer.js'

async function bootstrap() {
  await connectDatabase()

  const server = createServer(app)
  initializeSocketServer(server)

  server.listen(env.PORT, () => {
    console.log(`Backend listening on port ${env.PORT}`)
  })

  import('./workers/generationWorker.js')
    .then(() => console.log('Worker started'))
    .catch(console.error)
}

bootstrap().catch((error) => {
  console.error('Failed to start backend', error)
  process.exit(1)
})
