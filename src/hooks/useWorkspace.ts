import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type InvitationStatus = 'none' | 'invited' | 'accepted'

export interface WorkspaceProspect {
  id: string
  brand_id: string
  handle: string
  name: string
  email: string
  niche: string[]
  city: string
  country: string
  flag: string
  followers: number
  engagement: number
  format: string[]
  reached_out: boolean
  responded: boolean
  invitation_status: InvitationStatus
  invited_at?: string
  accepted_at?: string
  search_params?: Record<string, any>
  created_at: string
  updated_at: string
}

// Fetch all saved prospects for this brand
export function useWorkspaceProspects() {
  return useQuery<WorkspaceProspect[]>({
    queryKey: ['workspace-prospects'],
    queryFn: () => api.get('/api/workspace/prospects'),
  })
}

// Upsert one or more prospects (from search results)
export function useAddProspects() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (prospects: Partial<WorkspaceProspect>[]) =>
      api.post('/api/workspace/prospects', prospects),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace-prospects'] }),
  })
}

// Update a single prospect's fields (optimistic)
export function useUpdateProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<WorkspaceProspect> }) => {
      const BASE = import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app'
      return fetch(`${BASE}/api/workspace/prospects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('gc_token')}`,
        },
        body: JSON.stringify(patch),
      }).then(r => r.json())
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ['workspace-prospects'] })
      const prev = qc.getQueryData<WorkspaceProspect[]>(['workspace-prospects'])
      qc.setQueryData<WorkspaceProspect[]>(['workspace-prospects'], old =>
        old?.map(p => (p.id === id ? { ...p, ...patch } : p)) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['workspace-prospects'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['workspace-prospects'] }),
  })
}

// Delete a prospect
export function useDeleteProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/workspace/prospects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace-prospects'] }),
  })
}

// Send an invite email to a prospect
export function useInviteProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/workspace/prospects/${id}/invite`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace-prospects'] }),
  })
}
