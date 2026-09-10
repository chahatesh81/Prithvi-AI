import { httpClient } from './http';
import { DualRiskResponse, RiskResult } from '../types/risk';
import {
  NormalizedWeather,
  NormalizedTerrain,
  NormalizedSatellite,
  NormalizedSoil,
  SHAPExplanation,
  Alert,
  PredictionHistoryItem,
  SystemHealth,
  JobStatus,
} from '../types/api';
import { ImpactSummary } from '../types/exposure';
import { SimulationRequest, SimulationResult } from '../types/simulation';
import { RouteRiskRequest, RouteRiskResponse } from '../types/route';
import {
  getDemoDualPrediction,
  getDemoWeather,
  getDemoTerrain,
  getDemoSatellite,
  getDemoSoil,
  getDemoImpact,
  getDemoAlerts,
  getDemoExplanation,
  getDemoHistory,
  getDemoHealth,
  getDemoSimulationResult,
  getDemoAlternativeRoutes,
} from '../utils/demo';
import { useModeStore } from '../state/modeStore';

const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

export const apiService = {
  // Health
  async getHealth(): Promise<SystemHealth> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoHealth();
    }
    try {
      const health = await httpClient<SystemHealth>('/health');
      useModeStore.getState().setBackendConnected(true);
      return health;
    } catch (error) {
      useModeStore.getState().setBackendConnected(false);
      throw error;
    }
  },

  // Predictions
  async getDualPrediction(latitude: number, longitude: number): Promise<DualRiskResponse> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoDualPrediction(latitude, longitude);
    }
    return httpClient<DualRiskResponse>(`${API_PREFIX}/predict/dual`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  async getFloodPrediction(latitude: number, longitude: number): Promise<RiskResult> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoDualPrediction(latitude, longitude).flood;
    }
    return httpClient<RiskResult>(`${API_PREFIX}/predict/flood`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  async getLandslidePrediction(latitude: number, longitude: number): Promise<RiskResult> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoDualPrediction(latitude, longitude).landslide;
    }
    return httpClient<RiskResult>(`${API_PREFIX}/predict/landslide`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  // Environmental APIs
  async getWeather(latitude: number, longitude: number): Promise<NormalizedWeather> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoWeather(latitude, longitude);
    }
    return httpClient<NormalizedWeather>(`${API_PREFIX}/weather?lat=${latitude}&lon=${longitude}`);
  },

  async getTerrain(latitude: number, longitude: number): Promise<NormalizedTerrain> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoTerrain(latitude, longitude);
    }
    return httpClient<NormalizedTerrain>(`${API_PREFIX}/terrain?lat=${latitude}&lon=${longitude}`);
  },

  async getSatellite(latitude: number, longitude: number): Promise<NormalizedSatellite> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoSatellite(latitude, longitude);
    }
    return httpClient<NormalizedSatellite>(`${API_PREFIX}/satellite?lat=${latitude}&lon=${longitude}`);
  },

  async getSoil(latitude: number, longitude: number): Promise<NormalizedSoil> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoSoil(latitude, longitude);
    }
    return httpClient<NormalizedSoil>(`${API_PREFIX}/soil?lat=${latitude}&lon=${longitude}`);
  },

  // Decision Support: Impact
  async getImpact(latitude: number, longitude: number, riskRadiusMeters = 5000): Promise<ImpactSummary> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoImpact(latitude, longitude);
    }
    return httpClient<ImpactSummary>(
      `${API_PREFIX}/impact?latitude=${latitude}&longitude=${longitude}&risk_radius=${riskRadiusMeters}`
    );
  },

  // Decision Support: Alerts
  async getAlerts(): Promise<Alert[]> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoAlerts();
    }
    return httpClient<Alert[]>(`${API_PREFIX}/alerts`);
  },

  async acknowledgeAlert(alertId: string): Promise<Alert> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      const demoAlerts = getDemoAlerts();
      const existing = demoAlerts.find((a) => a.id === alertId) || demoAlerts[0];
      return {
        ...existing,
        status: 'ACKNOWLEDGED',
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: 'Authorized Response Officer',
      };
    }
    return httpClient<Alert>(`${API_PREFIX}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
  },

  async resolveAlert(alertId: string): Promise<Alert> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      const demoAlerts = getDemoAlerts();
      const existing = demoAlerts.find((a) => a.id === alertId) || demoAlerts[0];
      return {
        ...existing,
        status: 'RESOLVED',
        resolved_at: new Date().toISOString(),
      };
    }
    return httpClient<Alert>(`${API_PREFIX}/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  },

  // Decision Support: History
  async getHistory(latitude: number, longitude: number, days = 30): Promise<PredictionHistoryItem[]> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoHistory();
    }
    return httpClient<PredictionHistoryItem[]>(
      `${API_PREFIX}/history?lat=${latitude}&lon=${longitude}&days=${days}`
    );
  },

  // Decision Support: Explanation
  async getExplanation(predictionId: string): Promise<SHAPExplanation> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoExplanation(predictionId);
    }
    return httpClient<SHAPExplanation>(`${API_PREFIX}/predictions/${predictionId}/explanation`);
  },

  // Decision Support: What-If Simulator
  async simulateScenario(request: SimulationRequest): Promise<SimulationResult> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoSimulationResult(request.latitude, request.longitude, request.scenario);
    }
    return httpClient<SimulationResult>(`${API_PREFIX}/simulate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Decision Support: Alternative Routes
  async getAlternativeRoutes(request: RouteRiskRequest): Promise<RouteRiskResponse> {
    if (useModeStore.getState().dataMode === 'DEMO') {
      return getDemoAlternativeRoutes(request.origin, request.destination);
    }
    return httpClient<RouteRiskResponse>(`${API_PREFIX}/routes/alternative`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Jobs
  async createJob(jobType: string, parameters: Record<string, unknown>): Promise<{ job_id: string; status: string }> {
    return httpClient(`${API_PREFIX}/jobs`, {
      method: 'POST',
      body: JSON.stringify({ job_type: jobType, parameters }),
    });
  },

  async getJobStatus(jobId: string): Promise<JobStatus> {
    return httpClient<JobStatus>(`${API_PREFIX}/jobs/${jobId}`);
  },
};
