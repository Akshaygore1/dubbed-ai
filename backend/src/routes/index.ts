import { Router } from 'express'
import { dubbingRouter } from '../modules/dubbing/dubbing.route.js'
import { healthRouter } from '../modules/health/health.route.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/dubbing', dubbingRouter)
