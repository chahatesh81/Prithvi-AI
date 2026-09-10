import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useHistory(latitude: number, longitude: number, days = 30, enabled = true) {
  const roundedLat = parseFloat(latitude.toFixed(4));
  const roundedLon = parseFloat(longitude.toFixed(4));

  return useQuery({
    queryKey: ['history', roundedLat, roundedLon, days],
    queryFn: () => apiService.getHistory(roundedLat, roundedLon, days),
    enabled: enabled && !isNaN(latitude) && !isNaN(longitude),
    staleTime: 1000 * 60 * 15,
  });
}
