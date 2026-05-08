import type { Request, Response } from 'express'
import { db } from '../../db/client.js'
import { contacts } from '../../db/schema.js'
import { createContactSchema } from './contact.schema.js'

export const createContact = async (req: Request, res: Response) => {
  const payload = createContactSchema.parse(req.body)

  const [contact] = await db.insert(contacts).values(payload).returning({
    id: contacts.id,
    name: contacts.name,
    email: contacts.email,
    message: contacts.message,
    createdAt: contacts.createdAt,
  })

  res.status(201).json({
    success: true,
    message: 'Contact request created',
    data: contact,
  })
}
