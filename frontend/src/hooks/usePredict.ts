import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { DualRiskResponse, Hazard, RiskResult } from '../types/risk';

interface UsePredictDualOptions {
  latitude: number;
  longitude: number;
  hazard?: 'dual';
  enabled?: boolean;
}

interface UsePredictSingleOptions {
  latitude: number;
  longitude: number;
  hazard: 'flood' | 'landslide';
  enabled?: boolean;
}

export function usePredict(options: UsePredictDualOptions): UseQueryResult<DualRiskResponse, Error>;
export function usePredict(options: UsePredictSingleOptions): UseQueryResult<RiskResult, Error>;
export function usePredict({
  latitude,
  longitude,
  hazard = 'dual',
  enabled = true,
}: {
  latitude: number;
  longitude: number;
  hazard?: Hazard;
  enabled?: boolean;
}) {
  const safeLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : 31.1048;
  const safeLon = typeof longitude === 'number' && !isNaN(longitude) ? longitude : 77.1734;
  const roundedLat = parseFloat(safeLat.toFixed(4));
  const roundedLon = parseFloat(safeLon.toFixed(4));

  return useQuery({
    queryKey: ['predict', hazard, roundedLat, roundedLon],
    queryFn: async () => {
      if (hazard === 'flood') {
        return apiService.getFloodPrediction(roundedLat, roundedLon);
      }
      if (hazard === 'landslide') {
        return apiService.getLandslidePrediction(roundedLat, roundedLon);
      }
      return apiService.getDualPrediction(roundedLat, roundedLon);
    },
    enabled: enabled && !isNaN(latitude) && !isNaN(longitude),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
