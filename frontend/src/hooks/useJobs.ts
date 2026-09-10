import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useCreateJob() {
  return useMutation({
    mutationFn: ({ jobType, parameters }: { jobType: string; parameters: Record<string, unknown> }) =>
      apiService.createJob(jobType, parameters),
  });
}

export function useJobStatus(jobId?: string, enabled = true) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => apiService.getJobStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      return 3000; // poll every 3s
    },
  });
}
