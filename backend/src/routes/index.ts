import { Router } from 'express'
import { contactRouter } from '../modules/contact/contact.route.js'
import { dubbingRouter } from '../modules/dubbing/dubbing.route.js'
import { healthRouter } from '../modules/health/health.route.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/contacts', contactRouter)
apiRouter.use('/dubbing', dubbingRouter)
