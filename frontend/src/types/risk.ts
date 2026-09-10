export type Hazard = 'flood' | 'landslide' | 'dual';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
export type DataMode = 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
export type TrendDirection = 'INCREASING' | 'DECREASING' | 'STABLE' | 'UNKNOWN';

export interface RiskResult {
  hazard: Hazard;
  probability: number; // 0 to 1
  risk_score: number;  // 0 to 100
  risk_level: RiskLevel;
  model_version?: string;
  trend?: TrendDirection;
  timestamp: string;
  data_mode?: DataMode;
}

export interface DualRiskResponse {
  prediction_id?: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  flood: RiskResult;
  landslide: RiskResult;
  combined_risk: number; // 0 to 100
  combined_risk_level: RiskLevel;
  confidence?: number; // 0 to 1 confidence score
  model_versions?: {
    flood: string;
    landslide: string;
    fusion: string;
  };
  data_mode: DataMode;
  timestamp: string;
}
