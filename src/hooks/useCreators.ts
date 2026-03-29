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
    mutationFn: async (id: string) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app'}/api/creators/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('gb_token')}` },
      })
      if (!res.ok) throw await res.json()
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creators'] }),
  })
}
