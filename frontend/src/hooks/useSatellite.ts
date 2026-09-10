import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useSatellite(latitude: number, longitude: number, enabled = true) {
  const roundedLat = parseFloat(latitude.toFixed(4));
  const roundedLon = parseFloat(longitude.toFixed(4));

  return useQuery({
    queryKey: ['satellite', roundedLat, roundedLon],
    queryFn: () => apiService.getSatellite(roundedLat, roundedLon),
    enabled: enabled && !isNaN(latitude) && !isNaN(longitude),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
