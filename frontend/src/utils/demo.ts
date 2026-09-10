import { DualRiskResponse, RiskResult, RiskLevel } from '../types/risk';
import { NormalizedWeather, NormalizedTerrain, NormalizedSatellite, NormalizedSoil, SHAPExplanation, Alert, PredictionHistoryItem, SystemHealth } from '../types/api';
import { ImpactSummary } from '../types/exposure';
import { SimulationResult, SimulationScenario } from '../types/simulation';
import { RouteRiskResponse, CandidateRoute, RouteHotspot } from '../types/route';
import { Coordinates } from '../types/geo';

export const DEMO_COORDINATES = {
  latitude: 31.1048,
  longitude: 77.1734,
  name: 'Shimla, Himachal Pradesh',
};

export function getDemoDualPrediction(lat: number, lon: number): DualRiskResponse {
  const isShimla = Math.abs(lat - DEMO_COORDINATES.latitude) < 0.1 && Math.abs(lon - DEMO_COORDINATES.longitude) < 0.1;
  
  const floodProb = isShimla ? 0.72 : 0.45;
  const landslideProb = isShimla ? 0.87 : 0.62;
  const combinedRisk = isShimla ? 84 : 58;

  const floodRisk: RiskResult = {
    hazard: 'flood',
    probability: floodProb,
    risk_score: Math.round(floodProb * 100),
    risk_level: floodProb >= 0.8 ? 'CRITICAL' : floodProb >= 0.6 ? 'HIGH' : floodProb >= 0.4 ? 'MODERATE' : 'LOW',
    model_version: 'flood_xgb_v1.0',
    trend: 'INCREASING',
    timestamp: new Date().toISOString(),
    data_mode: 'DEMO',
  };

  const landslideRisk: RiskResult = {
    hazard: 'landslide',
    probability: landslideProb,
    risk_score: Math.round(landslideProb * 100),
    risk_level: landslideProb >= 0.8 ? 'CRITICAL' : landslideProb >= 0.6 ? 'HIGH' : landslideProb >= 0.4 ? 'MODERATE' : 'LOW',
    model_version: 'landslide_xgb_v1.0',
    trend: 'STABLE',
    timestamp: new Date().toISOString(),
    data_mode: 'DEMO',
  };

  return {
    prediction_id: isShimla ? 'pred_active_shimla_01' : `pred_${Math.round(lat * 100)}_${Math.round(lon * 100)}`,
    location: {
      latitude: lat,
      longitude: lon,
      name: isShimla ? DEMO_COORDINATES.name : `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
    },
    flood: floodRisk,
    landslide: landslideRisk,
    combined_risk: combinedRisk,
    combined_risk_level: combinedRisk >= 81 ? 'CRITICAL' : combinedRisk >= 61 ? 'VERY_HIGH' : combinedRisk >= 41 ? 'HIGH' : combinedRisk >= 21 ? 'MODERATE' : 'LOW',
    confidence: 0.89,
    model_versions: {
      flood: 'flood_xgb_v1.0 + CNN-spatial',
      landslide: 'landslide_xgb_v1.0 + CNN-spatial',
      fusion: 'fusion_v1.0 (Weighted Bayesian)',
    },
    data_mode: 'DEMO',
    timestamp: new Date().toISOString(),
  };
}

export function getDemoWeather(lat: number, lon: number): NormalizedWeather {
  return {
    temperature: 18.5,
    humidity: 84,
    rainfall: 112.4,
    wind_speed: 16.2,
    observation_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    retrieved_at: new Date().toISOString(),
    source: 'IMD / OpenWeather API (Demo Mode)',
    data_mode: 'DEMO',
  };
}

export function getDemoTerrain(lat: number, lon: number): NormalizedTerrain {
  return {
    elevation: 2276, // Shimla elevation approx
    slope: 34.8,     // Steep slope in degrees
    aspect: 185.0,   // South-facing slope
    curvature: 0.14,
    tpi: 18.5,
    tri: 42.1,
    retrieved_at: new Date().toISOString(),
    data_mode: 'DEMO',
  };
}

export function getDemoSatellite(lat: number, lon: number): NormalizedSatellite {
  return {
    ndvi: 0.42,
    ndwi: 0.18,
    change_score: 0.65,
    water_change: 0.32,
    vegetation_change: -0.21,
    observation_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    cloud_cover: 12.5,
    source: 'Sentinel-2 (Copernicus CDSE Demo)',
    data_mode: 'DEMO',
  };
}

export function getDemoSoil(lat: number, lon: number): NormalizedSoil {
  return {
    depth_cm: 120,
    clay_percentage: 28,
    sand_percentage: 42,
    silt_percentage: 30,
    organic_carbon: 2.1,
    ph: 6.4,
    retrieved_at: new Date().toISOString(),
    data_mode: 'DEMO',
  };
}

export function getDemoImpact(lat: number, lon: number): ImpactSummary {
  return {
    location: { latitude: lat, longitude: lon },
    risk_radius_meters: 5000,
    population_exposed: 14250,
    roads_affected_km: 18.4,
    buildings_exposed_count: 640,
    schools_count: 5,
    hospitals_count: 2,
    critical_assets: [
      { id: '1', name: 'Indira Gandhi Medical College & Hospital', type: 'hospital', latitude: lat + 0.005, longitude: lon + 0.003, exposure_level: 'CRITICAL', distance_m: 850 },
      { id: '2', name: 'St. Edward\'s Senior Secondary School', type: 'school', latitude: lat - 0.004, longitude: lon + 0.002, exposure_level: 'HIGH', distance_m: 1100 },
      { id: '3', name: 'NH-05 Shimla-Kalka Highway Section', type: 'road', latitude: lat + 0.008, longitude: lon - 0.006, exposure_level: 'CRITICAL', distance_m: 450 },
      { id: '4', name: 'Sanjauli Substation', type: 'power_station', latitude: lat - 0.007, longitude: lon - 0.005, exposure_level: 'HIGH', distance_m: 1400 },
    ],
    retrieved_at: new Date().toISOString(),
    data_mode: 'DEMO',
  };
}

export function getDemoAlerts(): Alert[] {
  return [
    {
      id: 'alt_001',
      hazard_type: 'landslide',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      acknowledged: false,
      trigger_reason: 'Continuous heavy precipitation >110mm/24h exceeding slope shear stress threshold',
      message: 'Critical landslide hazard warning near Shimla Ridge due to continuous heavy rainfall (>110mm/24h) and saturated soil slope stability reduction.',
      latitude: DEMO_COORDINATES.latitude,
      longitude: DEMO_COORDINATES.longitude,
      generated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'alt_002',
      hazard_type: 'flood',
      severity: 'HIGH',
      status: 'ACTIVE',
      acknowledged: false,
      trigger_reason: 'Water discharge rate in Giri River basin segment exceeded 90th percentile historical benchmark',
      message: 'Flash flood alert triggered along Giri River basin segment. Water level rising steadily.',
      latitude: DEMO_COORDINATES.latitude + 0.08,
      longitude: DEMO_COORDINATES.longitude - 0.04,
      generated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: 'alt_003',
      hazard_type: 'landslide',
      severity: 'MODERATE',
      status: 'ACKNOWLEDGED',
      acknowledged: true,
      acknowledged_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      acknowledged_by: 'Emergency Response Officer - Shimla Operations',
      trigger_reason: 'Soil moisture saturation sensor threshold reached at sector 4',
      message: 'Moderate slope movement warning on Sanjauli Bypass road segment. Transport monitored.',
      latitude: DEMO_COORDINATES.latitude + 0.015,
      longitude: DEMO_COORDINATES.longitude + 0.02,
      generated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    },
  ];
}

export function getDemoExplanation(predictionId = 'pred_demo_01'): SHAPExplanation {
  return {
    prediction_id: predictionId,
    hazard: 'dual',
    model_version: 'fusion_v1.0 (XGBoost + CNN)',
    base_value: 0.22,
    features: [
      { name: 'rainfall_24h', importance: 0.38, direction: 'POSITIVE', description: '24-hour cumulative precipitation (112.4mm)' },
      { name: 'slope_angle', importance: 0.29, direction: 'POSITIVE', description: 'Steep terrain slope angle (34.8°)' },
      { name: 'soil_saturation', importance: 0.16, direction: 'POSITIVE', description: 'High soil moisture content & bulk density' },
      { name: 'vegetation_loss', importance: 0.11, direction: 'POSITIVE', description: 'NDVI vegetation decrease (-0.21)' },
      { name: 'elevation', importance: 0.06, direction: 'NEGATIVE', description: 'High elevation drainage factor (2276m)' },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function getDemoHistory(): PredictionHistoryItem[] {
  const now = Date.now();
  return Array.from({ length: 10 }).map((_, index) => {
    const daysAgo = 9 - index;
    const itemDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const floodProb = Math.min(0.9, Math.max(0.2, 0.4 + Math.sin(index) * 0.3));
    const landslideProb = Math.min(0.95, Math.max(0.3, 0.5 + Math.cos(index) * 0.35));
    const combined = Math.round((floodProb * 0.4 + landslideProb * 0.6) * 100);

    return {
      id: `pred_hist_${100 + index}`,
      timestamp: itemDate,
      latitude: DEMO_COORDINATES.latitude,
      longitude: DEMO_COORDINATES.longitude,
      hazard: 'dual',
      model_version: 'fusion_v1.0',
      flood_probability: parseFloat(floodProb.toFixed(2)),
      landslide_probability: parseFloat(landslideProb.toFixed(2)),
      combined_risk: combined,
      risk_level: combined >= 81 ? 'CRITICAL' : combined >= 61 ? 'VERY_HIGH' : combined >= 41 ? 'HIGH' : combined >= 21 ? 'MODERATE' : 'LOW',
      data_mode: 'DEMO',
    };
  });
}

export function getDemoHealth(): SystemHealth {
  return {
    status: 'healthy',
    database: 'healthy',
    models: 'loaded',
    external_services: {
      weather: 'healthy',
      satellite: 'healthy',
    },
    timestamp: new Date().toISOString(),
  };
}

export function getDemoSimulationResult(
  latitude: number,
  longitude: number,
  scenario: SimulationScenario
): SimulationResult {
  const rainPct = scenario.rainfall_change_percent ?? 0;
  const intensity = scenario.rainfall_intensity ?? 20;
  const duration = scenario.duration_hours ?? 24;
  const soilPct = scenario.soil_moisture_change_percent ?? 0;

  // Baseline values (Shimla benchmark)
  const baselineFloodProb = 0.42;
  const baselineLandslideProb = 0.31;
  const baselineRiskScore = 48;
  const baselineRiskLevel: RiskLevel = 'HIGH';

  // Deterministic simulation response curve
  const rainFactor = rainPct / 100;
  const intensityFactor = (intensity - 20) / 100;
  const durationFactor = (duration - 24) / 72;
  const soilFactor = soilPct / 100;

  const scenarioFloodProb = Math.min(
    0.99,
    Math.max(0.05, +(baselineFloodProb + rainFactor * 0.32 + intensityFactor * 0.18 + durationFactor * 0.1).toFixed(2))
  );

  const scenarioLandslideProb = Math.min(
    0.99,
    Math.max(0.05, +(baselineLandslideProb + rainFactor * 0.28 + soilFactor * 0.25 + durationFactor * 0.15).toFixed(2))
  );

  const scenarioRiskScore = Math.min(
    100,
    Math.max(0, Math.round(scenarioFloodProb * 45 + scenarioLandslideProb * 55))
  );

  const scenarioRiskLevel: RiskLevel =
    scenarioRiskScore >= 81
      ? 'CRITICAL'
      : scenarioRiskScore >= 61
      ? 'VERY_HIGH'
      : scenarioRiskScore >= 41
      ? 'HIGH'
      : scenarioRiskScore >= 21
      ? 'MODERATE'
      : 'LOW';

  const riskChange = scenarioRiskScore - baselineRiskScore;
  const floodProbChange = +(scenarioFloodProb - baselineFloodProb).toFixed(2);
  const landslideProbChange = +(scenarioLandslideProb - baselineLandslideProb).toFixed(2);

  const trend = riskChange > 3 ? 'INCREASING' : riskChange < -3 ? 'DECREASING' : 'STABLE';

  return {
    simulation_id: `sim_${Date.now()}`,
    location: {
      latitude,
      longitude,
      name: Math.abs(latitude - DEMO_COORDINATES.latitude) < 0.1 ? DEMO_COORDINATES.name : `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
    },
    baseline: {
      flood_probability: baselineFloodProb,
      landslide_probability: baselineLandslideProb,
      risk_score: baselineRiskScore,
      risk_level: baselineRiskLevel,
    },
    scenario: {
      flood_probability: scenarioFloodProb,
      landslide_probability: scenarioLandslideProb,
      risk_score: scenarioRiskScore,
      risk_level: scenarioRiskLevel,
    },
    risk_change: riskChange,
    flood_prob_change: floodProbChange,
    landslide_prob_change: landslideProbChange,
    trend,
    model_versions: {
      flood: 'flood_xgb_v1.0 (Simulation Inference)',
      landslide: 'landslide_xgb_v1.0 (Simulation Inference)',
      fusion: 'fusion_v1.0',
    },
    scenario_metadata: {
      parameters: scenario,
      simulated_at: new Date().toISOString(),
      data_mode: 'DEMO',
    },
    is_simulation: true,
  };
}

export function getDemoAlternativeRoutes(
  origin: Coordinates & { name?: string },
  destination: Coordinates & { name?: string }
): RouteRiskResponse {
  const oLat = origin.latitude || 31.1048;
  const oLon = origin.longitude || 77.1734;
  const dLat = destination.latitude || 30.9084;
  const dLon = destination.longitude || 77.0999;

  const routes: CandidateRoute[] = [
    {
      route_id: 'route_opt_b',
      name: 'Route B (Lower Valley Ridge Alternate via Tutu-Jutogh)',
      rank: 1,
      is_recommended: true,
      distance_km: 20.1,
      estimated_duration_min: 38,
      flood_exposure: 'LOW',
      landslide_exposure: 'LOW',
      combined_risk: 31,
      risk_level: 'MODERATE',
      comparative_risk_label: 'Recommended Lower-Risk Route',
      hazard_hotspots: [],
      geometry: [
        [oLat, oLon],
        [oLat - 0.03, oLon - 0.02],
        [oLat - 0.07, oLon - 0.04],
        [oLat - 0.12, oLon - 0.05],
        [oLat - 0.16, oLon - 0.06],
        [dLat, dLon],
      ],
      road_conditions: 'Paved all-weather road with reinforced slope catchment barriers',
    },
    {
      route_id: 'route_opt_a',
      name: 'Route A (Direct Corridor via NH-05)',
      rank: 2,
      is_recommended: false,
      distance_km: 18.2,
      estimated_duration_min: 34,
      flood_exposure: 'HIGH',
      landslide_exposure: 'LOW',
      combined_risk: 62,
      risk_level: 'HIGH',
      comparative_risk_label: 'Moderate Comparative Risk',
      hazard_hotspots: [
        {
          id: 'hs_01',
          latitude: oLat - 0.08,
          longitude: oLon - 0.03,
          hazard_type: 'flood',
          severity: 'HIGH',
          description: 'Giri River crossing culvert overflow risk in heavy precipitation',
        },
      ],
      geometry: [
        [oLat, oLon],
        [oLat - 0.04, oLon - 0.01],
        [oLat - 0.08, oLon - 0.03],
        [oLat - 0.13, oLon - 0.04],
        [dLat, dLon],
      ],
      road_conditions: 'National Highway with active drainage maintenance',
    },
    {
      route_id: 'route_opt_c',
      name: 'Route C (Eastern Mountain Link via Chail Ridge)',
      rank: 3,
      is_recommended: false,
      distance_km: 17.4,
      estimated_duration_min: 32,
      flood_exposure: 'VERY_HIGH',
      landslide_exposure: 'MODERATE',
      combined_risk: 81,
      risk_level: 'CRITICAL',
      comparative_risk_label: 'Higher Hazard Exposure',
      hazard_hotspots: [
        {
          id: 'hs_02',
          latitude: oLat - 0.05,
          longitude: oLon + 0.02,
          hazard_type: 'landslide',
          severity: 'CRITICAL',
          description: 'Active steep slope cutting with documented rockfall vulnerability',
        },
        {
          id: 'hs_03',
          latitude: oLat - 0.11,
          longitude: oLon + 0.01,
          hazard_type: 'flood',
          severity: 'HIGH',
          description: 'Narrow canyon road susceptible to flash debris flows',
        },
      ],
      geometry: [
        [oLat, oLon],
        [oLat - 0.05, oLon + 0.02],
        [oLat - 0.11, oLon + 0.01],
        [oLat - 0.15, oLon],
        [dLat, dLon],
      ],
      road_conditions: 'Narrow mountain grade with active landslide warnings',
    },
  ];

  return {
    routes,
    origin,
    destination,
    timestamp: new Date().toISOString(),
    data_mode: 'DEMO',
  };
}
