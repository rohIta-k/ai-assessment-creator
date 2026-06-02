import { Worker } from 'bullmq'
import { connectDatabase } from '../config/db.js'
import { Assignment } from '../models/Assignment.js'
import { redisConnection, type GenerationJob } from '../queues/generationQueue.js'
import { generateQuestionPaper } from '../services/aiGenerationService.js'
import { publishUserSocketEvent } from '../sockets/socketEvents.js'

async function startWorker() {

  const worker = new Worker<GenerationJob>(
    'assignment-generation',
    async (job) => {
      console.log('[backend] generation worker picked job', {
        assignmentId: job.data.assignmentId,
        jobId: job.id,
      })
      let cancelRequested = false
      const cancellationPoller = setInterval(async () => {
        try {
          const assignment = await Assignment.findById(job.data.assignmentId).select('metadata.cancelRequested')
          cancelRequested = Boolean(assignment?.metadata && typeof assignment.metadata === 'object' && 'cancelRequested' in assignment.metadata && assignment.metadata.cancelRequested)
          if (cancelRequested) {
            console.log('[backend] generation worker saw cancel request', {
              assignmentId: job.data.assignmentId,
              jobId: job.id,
            })
          }
        } catch {
          // Keep the worker moving if the cancel lookup fails temporarily.
        }
      }, 1000)

      await publishUserSocketEvent({
        userId: job.data.userId,
        event: 'generation:started',
        payload: {
          assignmentId: job.data.assignmentId,
          jobId: job.id,
        },
      })
      console.log('[backend] generation started event published', {
        assignmentId: job.data.assignmentId,
        jobId: job.id,
      })

      try {
        const assignment = await generateQuestionPaper(job.data.assignmentId, async (progress, step) => {
          console.log('[backend] generation progress step', {
            assignmentId: job.data.assignmentId,
            jobId: job.id,
            progress,
            step,
          })
          await job.updateProgress(progress)
          await publishUserSocketEvent({
            userId: job.data.userId,
            event: 'generation:progress',
            payload: {
              assignmentId: job.data.assignmentId,
              jobId: job.id,
              progress,
              step,
            },
          })
        }, {
          shouldAbort: () => cancelRequested,
        })

        console.log('[backend] generation completed, publishing socket event', {
          assignmentId: job.data.assignmentId,
          jobId: job.id,
        })
        await publishUserSocketEvent({
          userId: job.data.userId,
          event: 'generation:completed',
          payload: {
            assignmentId: job.data.assignmentId,
            jobId: job.id,
            assignment,
          },
        })

        return { assignmentId: assignment.id }
      } finally {
        clearInterval(cancellationPoller)
        console.log('[backend] generation worker finished job', {
          assignmentId: job.data.assignmentId,
          jobId: job.id,
        })
      }
    },
    { connection: redisConnection },
  )

  worker.on('failed', (job, error) => {
    if (!job) {
      return
    }

    void publishUserSocketEvent({
      userId: job.data.userId,
      event: 'generation:failed',
      payload: {
        assignmentId: job.data.assignmentId,
        jobId: job.id,
        message: error.message,
      },
    })
  })

  console.log('Generation worker started.')
}

startWorker().catch((error) => {
  console.error('Failed to start generation worker', error)
  process.exit(1)
})
