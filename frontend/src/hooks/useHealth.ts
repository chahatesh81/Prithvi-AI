import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useHealth(enabled = true) {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.getHealth(),
    enabled,
    refetchInterval: 1000 * 60 * 5, // check health every 5 minutes
  });
}
