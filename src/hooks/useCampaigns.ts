import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/api/campaigns'),
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; starts_at?: string; ends_at?: string; creator_ids?: string[] }) =>
      api.post('/api/campaigns', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app'}/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('gc_token')}` },
      })
      if (!res.ok) throw await res.json()
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function usePatchCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; name?: string }) =>
      api.post(`/api/campaigns/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}
