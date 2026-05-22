import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import {
  AUTO_SOURCE_LANGUAGE,
  dubbingSchema,
  type DubbingFormData,
} from './dubbing-schema'
import { dubbingJobsQueryKey } from './use-dubbing-jobs'

const submitDubbing = async (formData: FormData) => {
  const { data } = await api.post('/dubbing', formData)
  return data
}

export const useDubbingForm = () => {
  const queryClient = useQueryClient()
  const form = useForm<DubbingFormData>({
    resolver: zodResolver(dubbingSchema),
    defaultValues: {
      sourceLanguage: AUTO_SOURCE_LANGUAGE,
      targetLanguage: '',
    },
  })

  const mutation = useMutation({
    mutationFn: submitDubbing,
    onSuccess: () => {
      form.reset()
      void queryClient.invalidateQueries({ queryKey: dubbingJobsQueryKey })
    },
  })

  return {
    form,
    mutation,
  }
}
