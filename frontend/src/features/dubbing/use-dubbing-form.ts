import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '../../lib/api'
import { dubbingSchema, type DubbingFormData } from './dubbing-schema'

const submitDubbing = async (formData: FormData) => {
  const { data } = await api.post('/dubbing', formData)
  return data
}

export const useDubbingForm = () => {
  const form = useForm<DubbingFormData>({
    resolver: zodResolver(dubbingSchema),
    defaultValues: {
      sourceLanguage: '',
      targetLanguage: '',
    },
  })

  const mutation = useMutation({
    mutationFn: submitDubbing,
    onSuccess: () => {
      form.reset()
    },
  })

  return {
    form,
    mutation,
  }
}
