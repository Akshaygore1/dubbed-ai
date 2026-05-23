import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type AdminSession = {
  email: string
  expiresAt: string
}

type AdminSessionResponse = {
  success: boolean
  data: AdminSession
}

const fetchAdminSession = async () => {
  const { data } = await api.get<AdminSessionResponse>('/admin/session')
  return data.data
}

export const adminSessionQueryKey = ['admin-session'] as const

export const useAdminSession = () =>
  useQuery({
    queryKey: adminSessionQueryKey,
    queryFn: fetchAdminSession,
    retry: false,
  })
