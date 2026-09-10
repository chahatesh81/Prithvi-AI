import { DataMode, Hazard, RiskLevel } from './risk';
import { Coordinates } from './geo';

export interface RouteHotspot {
  id: string;
  latitude: number;
  longitude: number;
  hazard_type: Hazard;
  severity: RiskLevel;
  description: string;
}

export interface CandidateRoute {
  route_id: string;
  name: string;
  rank: number;
  is_recommended: boolean;
  distance_km: number;
  estimated_duration_min: number;
  flood_exposure: RiskLevel;
  landslide_exposure: RiskLevel;
  combined_risk: number; // 0 to 100
  risk_level: RiskLevel;
  comparative_risk_label: string; // e.g. "Recommended Lower-Risk Route", "Moderate Comparative Risk", "Higher Hazard Exposure"
  hazard_hotspots: RouteHotspot[];
  geometry: [number, number][]; // [latitude, longitude] pairs for map polyline
  road_conditions?: string;
}

export interface RouteRiskRequest {
  origin: Coordinates & { name?: string };
  destination: Coordinates & { name?: string };
  travel_mode?: 'driving' | 'walking' | 'emergency';
  risk_preference?: 'lowest_risk' | 'fastest' | 'balanced';
}

export interface RouteRiskResponse {
  routes: CandidateRoute[];
  origin: Coordinates & { name?: string };
  destination: Coordinates & { name?: string };
  timestamp: string;
  data_mode: DataMode;
}
