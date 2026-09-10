import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../../src/services/api';
import { useModeStore } from '../../src/state/modeStore';

describe('API Service Contract', () => {
  beforeEach(() => {
    useModeStore.getState().setMode('DEMO');
  });

  it('returns valid dual prediction structure in demo mode fallback', async () => {
    const result = await apiService.getDualPrediction(31.1048, 77.1734);
    expect(result.location.latitude).toBe(31.1048);
    expect(result.location.longitude).toBe(77.1734);
    expect(result.flood.probability).toBeGreaterThanOrEqual(0);
    expect(result.landslide.probability).toBeGreaterThanOrEqual(0);
    expect(result.combined_risk).toBeGreaterThanOrEqual(0);
    expect(result.combined_risk).toBeLessThanOrEqual(100);
    expect(result.data_mode).toBe('DEMO');
  });

  it('returns normalized weather object', async () => {
    const weather = await apiService.getWeather(31.1048, 77.1734);
    expect(weather.rainfall).toBeGreaterThanOrEqual(0);
    expect(weather.temperature).toBeDefined();
    expect(weather.humidity).toBeGreaterThanOrEqual(0);
  });

  it('returns simulated scenario result in demo mode', async () => {
    const simulation = await apiService.simulateScenario({
      latitude: 31.1048,
      longitude: 77.1734,
      scenario: {
        rainfall_change_percent: 50,
        duration_hours: 6,
        rainfall_intensity: 45,
        soil_moisture_change_percent: 20,
      },
    });
    expect(simulation.simulation_id).toBeDefined();
    expect(simulation.baseline.risk_score).toBeDefined();
    expect(simulation.scenario.risk_score).toBeDefined();
    expect(simulation.risk_change).toBeDefined();
    expect(simulation.is_simulation).toBe(true);
  });

  it('returns candidate routes in demo mode', async () => {
    const routesRes = await apiService.getAlternativeRoutes({
      origin: { latitude: 31.1048, longitude: 77.1734, name: 'Shimla' },
      destination: { latitude: 30.9084, longitude: 77.0999, name: 'Solan' },
      travel_mode: 'driving',
      risk_preference: 'lowest_risk',
    });
    expect(routesRes.routes.length).toBeGreaterThan(0);
    expect(routesRes.routes[0].geometry.length).toBeGreaterThan(0);
    expect(routesRes.routes[0].comparative_risk_label).toBeDefined();
    // Safety check: verify no route claims absolute safety
    routesRes.routes.forEach((r) => {
      expect(r.comparative_risk_label.toUpperCase()).not.toBe('SAFE');
      expect(r.comparative_risk_label.toUpperCase()).not.toBe('COMPLETELY SAFE');
    });
  });

  it('handles alert acknowledgement and resolution in demo mode', async () => {
    const ack = await apiService.acknowledgeAlert('alert-1');
    expect(ack.status).toBe('ACKNOWLEDGED');
    expect(ack.acknowledged_by).toBe('Authorized Response Officer');

    const res = await apiService.resolveAlert('alert-1');
    expect(res.status).toBe('RESOLVED');
  });
});
