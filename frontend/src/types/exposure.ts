export interface CriticalAsset {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'bridge' | 'power_station' | 'road' | 'building';
  latitude: number;
  longitude: number;
  exposure_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  distance_m?: number;
}

export interface ImpactSummary {
  location: {
    latitude: number;
    longitude: number;
  };
  risk_radius_meters: number;
  population_exposed: number;
  roads_affected_km: number;
  buildings_exposed_count: number;
  schools_count: number;
  hospitals_count: number;
  critical_assets: CriticalAsset[];
  retrieved_at: string;
  data_mode: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';
}
