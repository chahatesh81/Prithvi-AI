import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { SimulationRequest, SimulationResult } from '../types/simulation';

export function useSimulation() {
  return useMutation<SimulationResult, Error, SimulationRequest>({
    mutationFn: (request: SimulationRequest) => apiService.simulateScenario(request),
  });
}
