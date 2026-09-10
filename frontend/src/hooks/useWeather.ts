import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useWeather(latitude: number, longitude: number, enabled = true) {
  const roundedLat = parseFloat(latitude.toFixed(4));
  const roundedLon = parseFloat(longitude.toFixed(4));

  return useQuery({
    queryKey: ['weather', roundedLat, roundedLon],
    queryFn: () => apiService.getWeather(roundedLat, roundedLon),
    enabled: enabled && !isNaN(latitude) && !isNaN(longitude),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
