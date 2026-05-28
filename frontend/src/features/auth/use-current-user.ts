import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type CurrentUser = {
  id: string
  name: string
  email: string
  approvalStatus: 'pending' | 'approved'
  approvedAt: string | null
}

type CurrentUserResponse = {
  success: boolean
  data: CurrentUser
}

const fetchCurrentUser = async () => {
  const { data } = await api.get<CurrentUserResponse>('/users/me')
  return data.data
}

export const currentUserQueryKey = ['current-user'] as const

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    retry: false,
  })

export const useCurrentUser = ({
  enabled,
  refetchInterval,
}: {
  enabled: boolean
  refetchInterval?: number | false
}) =>
  useQuery({
    ...currentUserQueryOptions(),
    enabled,
    refetchInterval,
  })
