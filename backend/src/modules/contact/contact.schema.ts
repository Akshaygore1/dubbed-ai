import { z } from 'zod'

export const createContactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  message: z.string().trim().min(10).max(1000),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
