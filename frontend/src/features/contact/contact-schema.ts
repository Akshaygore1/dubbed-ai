import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email address'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
})

export type ContactFormValues = z.infer<typeof contactSchema>
