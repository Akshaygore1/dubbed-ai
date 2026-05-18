import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export type DubbingJob = {
  id: string
  videoUrl: string | null
  videoKey: string | null
  audioKey: string | null
  sourceLanguage: string
  targetLanguage: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  dubbedVideoUrl: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

type DubbingJobsResponse = {
  success: boolean
  data: DubbingJob[]
}

const fetchDubbingJobs = async () => {
  const { data } = await api.get<DubbingJobsResponse>('/dubbing')
  return data.data
}

export const dubbingJobsQueryKey = ['dubbing-jobs'] as const

export const useDubbingJobs = () =>
  useQuery({
    queryKey: dubbingJobsQueryKey,
    queryFn: fetchDubbingJobs,
  })
