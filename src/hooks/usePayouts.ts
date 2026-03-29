import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function usePayouts(status?: string) {
  return useQuery({
    queryKey: ['payouts', status],
    queryFn: () => api.get(`/api/payouts${status ? `?status=${status}` : ''}`),
  })
}

export function useSinglePayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      creator_email: string
      amount_cents: number
      currency?: string
      note?: string
      campaign_id?: string
    }) => api.post('/api/payouts/single', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payouts'] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function useCancelPayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/payouts/${id}/cancel`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payouts'] }),
  })
}
