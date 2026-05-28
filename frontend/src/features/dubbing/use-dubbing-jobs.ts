import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { env } from '@/lib/env'

export type DubbingJob = {
  id: string
  videoUrl: string | null
  videoKey: string | null
  audioKey: string | null
  dubbedAudioKey: string | null
  dubbedVideoKey: string | null
  sourceLanguage: string
  targetLanguage: string
  transcriptionLanguage: string | null
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

export const dubbingJobsQueryOptions = () =>
  queryOptions({
    queryKey: dubbingJobsQueryKey,
    queryFn: fetchDubbingJobs,
  })

export const getDubbingJobDownloadUrl = (jobId: string) =>
  `${env.apiUrl}/dubbing/${jobId}/download`

export const useDubbingJobs = () =>
  useQuery({
    ...dubbingJobsQueryOptions(),
    refetchInterval: (query) =>
      query.state.data?.some((job) => job.status === 'pending' || job.status === 'processing')
        ? 3000
        : false,
  })
