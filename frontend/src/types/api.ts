import { DataMode, Hazard, RiskLevel } from './risk';

export interface NormalizedWeather {
  temperature: number;      // Celsius
  humidity: number;         // Percentage 0-100
  rainfall: number;         // mm (e.g. 24h)
  wind_speed: number;       // km/h
  observation_time: string;
  retrieved_at: string;
  source: string;
  data_mode: DataMode;
}

export interface NormalizedTerrain {
  elevation: number;        // Meters
  slope: number;            // Degrees
  aspect: number;           // Degrees
  curvature: number;
  tpi: number;              // Topographic Position Index
  tri: number;              // Terrain Ruggedness Index
  retrieved_at: string;
  data_mode: DataMode;
}

export interface NormalizedSatellite {
  ndvi: number;             // Normalized Difference Vegetation Index [-1, 1]
  ndwi: number;             // Normalized Difference Water Index [-1, 1]
  change_score: number;     // 0 to 1
  water_change: number;
  vegetation_change: number;
  observation_date: string;
  cloud_cover?: number;     // Percentage
  source: string;
  data_mode: DataMode;
}

export interface NormalizedSoil {
  depth_cm: number;
  clay_percentage: number;
  sand_percentage: number;
  silt_percentage: number;
  organic_carbon: number;
  ph: number;
  retrieved_at: string;
  data_mode: DataMode;
}

export interface FeatureImportance {
  name: string;
  importance: number;       // Contribution weight / SHAP value
  direction?: 'POSITIVE' | 'NEGATIVE';
  description?: string;
}

export interface SHAPExplanation {
  prediction_id: string;
  hazard: Hazard;
  model_version: string;
  base_value?: number;
  features: FeatureImportance[];
  timestamp: string;
}

export interface Alert {
  id: string;
  hazard_type: Hazard;
  severity: RiskLevel;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'EXPIRED';
  message: string;
  latitude: number;
  longitude: number;
  generated_at: string;
  expires_at?: string;
  trigger_reason?: string;
  acknowledged?: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
}

export interface PredictionHistoryItem {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  hazard: Hazard;
  model_version: string;
  flood_probability: number;
  landslide_probability: number;
  combined_risk: number;
  risk_level: RiskLevel;
  data_mode: DataMode;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'healthy' | 'unhealthy' | 'unavailable';
  models: 'loaded' | 'missing' | 'error';
  external_services: {
    weather: string;
    satellite: string;
  };
  timestamp: string;
}

export interface JobStatus {
  job_id: string;
  job_type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress_percent?: number;
  result?: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
