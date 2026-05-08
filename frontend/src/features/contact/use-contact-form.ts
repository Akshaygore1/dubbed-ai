import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '../../lib/api'
import { useAppStore } from '../../store/app-store'
import { contactSchema, type ContactFormValues } from './contact-schema'

const submitContact = async (values: ContactFormValues) => {
  const { data } = await api.post('/contacts', values)
  return data
}

export const useContactForm = () => {
  const setHasSubmitted = useAppStore((state) => state.setHasSubmitted)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })

  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      setHasSubmitted(true)
      form.reset()
    },
  })

  return {
    form,
    mutation,
  }
}
