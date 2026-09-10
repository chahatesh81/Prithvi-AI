import { DataMode, RiskLevel, TrendDirection } from './risk';

export interface SimulationScenario {
  rainfall_change_percent?: number;      // -50% to +100%
  rainfall_intensity?: number;           // mm/h (e.g. 5 to 100)
  duration_hours?: number;               // 1 to 72 hours
  soil_moisture_change_percent?: number; // -30% to +50%
}

export interface SimulationRequest {
  location_id?: string;
  latitude: number;
  longitude: number;
  scenario: SimulationScenario;
}

export interface HazardPredictionSummary {
  flood_probability: number;
  landslide_probability: number;
  risk_score: number;
  risk_level: RiskLevel;
}

export interface SimulationResult {
  simulation_id: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  baseline: HazardPredictionSummary;
  scenario: HazardPredictionSummary;
  risk_change: number; // scenario_risk_score - baseline_risk_score
  flood_prob_change: number;
  landslide_prob_change: number;
  trend: TrendDirection;
  model_versions: {
    flood: string;
    landslide: string;
    fusion: string;
  };
  scenario_metadata: {
    parameters: SimulationScenario;
    simulated_at: string;
    data_mode: DataMode;
  };
  is_simulation: boolean;
}
