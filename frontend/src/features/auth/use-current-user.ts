import { useQuery } from '@tanstack/react-query'
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

const currentUserQueryKey = ['current-user'] as const

export const useCurrentUser = ({
  enabled,
  refetchInterval,
}: {
  enabled: boolean
  refetchInterval?: number | false
}) =>
  useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    enabled,
    retry: false,
    refetchInterval,
  })
