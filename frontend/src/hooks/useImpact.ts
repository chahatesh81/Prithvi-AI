import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useImpact(latitude: number, longitude: number, riskRadiusMeters = 5000, enabled = true) {
  const roundedLat = parseFloat(latitude.toFixed(4));
  const roundedLon = parseFloat(longitude.toFixed(4));

  return useQuery({
    queryKey: ['impact', roundedLat, roundedLon, riskRadiusMeters],
    queryFn: () => apiService.getImpact(roundedLat, roundedLon, riskRadiusMeters),
    enabled: enabled && !isNaN(latitude) && !isNaN(longitude),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}
