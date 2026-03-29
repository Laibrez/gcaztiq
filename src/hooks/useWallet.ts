import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get('/api/wallet/balance'),
    refetchInterval: 30000  // refresh every 30s
  })
}
