import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type AdminUser = {
  id: string
  name: string
  email: string
  createdAt: string
  approvalStatus: 'pending' | 'approved'
  approvedAt: string | null
}

type AdminUsersResponse = {
  success: boolean
  data: AdminUser[]
}

const fetchAdminUsers = async (status: 'pending' | 'approved') => {
  const { data } = await api.get<AdminUsersResponse>('/admin/users', {
    params: { status },
  })
  return data.data
}

export const adminUsersQueryKey = (status: 'pending' | 'approved') =>
  ['admin-users', status] as const

export const useAdminUsers = (status: 'pending' | 'approved', enabled = true) =>
  useQuery({
    queryKey: adminUsersQueryKey(status),
    queryFn: () => fetchAdminUsers(status),
    enabled,
    retry: false,
  })
