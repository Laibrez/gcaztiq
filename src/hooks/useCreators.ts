import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useCreators() {
  return useQuery({
    queryKey: ['creators'],
    queryFn: () => api.get('/api/creators'),
  })
}

export function useInviteCreator() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; name?: string }) =>
      api.post('/api/creators/invite', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })
}

export function useDeleteCreator() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/creators/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })
}
