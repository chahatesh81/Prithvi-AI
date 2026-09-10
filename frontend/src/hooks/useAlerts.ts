import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useAlerts(enabled = true) {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiService.getAlerts(),
    enabled,
    refetchInterval: 1000 * 60 * 2, // poll every 2 minutes
  });
}
