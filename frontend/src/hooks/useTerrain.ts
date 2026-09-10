import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useTerrain(latitude: number, longitude: number, enabled = true) {
  const roundedLat = parseFloat(latitude.toFixed(4));
  const roundedLon = parseFloat(longitude.toFixed(4));

  return useQuery({
    queryKey: ['terrain', roundedLat, roundedLon],
    queryFn: () => apiService.getTerrain(roundedLat, roundedLon),
    enabled: enabled && !isNaN(latitude) && !isNaN(longitude),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
