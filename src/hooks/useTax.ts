import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useTaxSummary(year: number) {
  return useQuery({
    queryKey: ['tax-summary', year],
    queryFn: async () => {
      const res = await api.get(`/api/tax/summary?year=${year}`);
      return res as {
        necRequired: number;
        readyToFile: number;
        needsAttention: number;
        totalReportable: number;
        totalFlagged: number;
      };
    },
  });
}

export function useTaxCreators(year: number) {
  return useQuery({
    queryKey: ['tax-creators', year],
    queryFn: async () => {
      const res = await api.get(`/api/tax/creators?year=${year}`);
      return res as any[];
    },
  });
}

export function useRemindCreator(year: number) {
  return useMutation({
    mutationFn: async (creatorId: string) => {
      await api.post(`/api/tax/remind/${creatorId}`, { year });
    },
  });
}
