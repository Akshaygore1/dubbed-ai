import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { createContact } from './contact.controller.js'

export const contactRouter = Router()

contactRouter.post('/', asyncHandler(createContact))
