import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { RouteRiskRequest, RouteRiskResponse } from '../types/route';

export function useRouteRisk() {
  return useMutation<RouteRiskResponse, Error, RouteRiskRequest>({
    mutationFn: (request: RouteRiskRequest) => apiService.getAlternativeRoutes(request),
  });
}
