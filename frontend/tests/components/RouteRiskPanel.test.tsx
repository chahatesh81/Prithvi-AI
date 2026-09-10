import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { RouteRiskPanel } from '../../src/components/Routes/RouteRiskPanel';
import { RouteRiskResponse } from '../../src/types/route';

const MOCK_ROUTE_RESPONSE: RouteRiskResponse = {
  origin: { name: 'Shimla Ridge HQ', latitude: 31.1048, longitude: 77.1734 },
  destination: { name: 'Solan Highway Hub', latitude: 30.9084, longitude: 77.0999 },
  timestamp: '2026-09-10T11:30:00Z',
  data_mode: 'DEMO',
  routes: [
    {
      route_id: 'route_opt_1',
      name: 'Shimla-Kandaghat Ridge Line',
      rank: 1,
      is_recommended: true,
      distance_km: 46.2,
      estimated_duration_min: 78,
      flood_exposure: 'LOW',
      landslide_exposure: 'MODERATE',
      combined_risk: 28,
      risk_level: 'LOW',
      comparative_risk_label: 'Recommended Lower-Risk Route',
      hazard_hotspots: [
        {
          id: 'hs-1',
          latitude: 31.025,
          longitude: 77.12,
          hazard_type: 'landslide',
          severity: 'MODERATE',
          description: 'Minor debris potential near hairpin curve 14',
        },
      ],
      geometry: [
        [31.1048, 77.1734],
        [31.025, 77.12],
        [30.9084, 77.0999],
      ],
    },
    {
      route_id: 'route_opt_2',
      name: 'Valley Basin Highway',
      rank: 2,
      is_recommended: false,
      distance_km: 41.5,
      estimated_duration_min: 65,
      flood_exposure: 'CRITICAL',
      landslide_exposure: 'HIGH',
      combined_risk: 76,
      risk_level: 'CRITICAL',
      comparative_risk_label: 'Higher Hazard Exposure',
      hazard_hotspots: [
        {
          id: 'hs-2',
          latitude: 30.985,
          longitude: 77.11,
          hazard_type: 'flood',
          severity: 'CRITICAL',
          description: 'Active river water inundation over bridge culvert',
        },
      ],
      geometry: [
        [31.1048, 77.1734],
        [30.985, 77.11],
        [30.9084, 77.0999],
      ],
    },
  ],
};

describe('RouteRiskPanel Component', () => {
  it('renders evaluator form with preset evacuation corridors', () => {
    const handleCalculate = vi.fn();
    const handleSelect = vi.fn();

    render(
      <RouteRiskPanel
        onCalculateRoutes={handleCalculate}
        onSelectRoute={handleSelect}
      />
    );

    expect(screen.getByText(/risk-aware route evaluator/i)).toBeInTheDocument();
    expect(screen.getByText('Shimla Ridge → Solan Bypass')).toBeInTheDocument();
    expect(screen.getByText('Evaluate Alternative Routes')).toBeInTheDocument();
  });

  it('submits form with origin, destination, and travel parameters', () => {
    const handleCalculate = vi.fn();
    const handleSelect = vi.fn();

    render(
      <RouteRiskPanel
        onCalculateRoutes={handleCalculate}
        onSelectRoute={handleSelect}
      />
    );

    const submitBtn = screen.getByText('Evaluate Alternative Routes');
    fireEvent.click(submitBtn);

    expect(handleCalculate).toHaveBeenCalledTimes(1);
    expect(handleCalculate).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: expect.objectContaining({ name: 'Shimla Ridge HQ' }),
        destination: expect.objectContaining({ name: 'Solan Highway Hub' }),
        travel_mode: 'emergency',
        risk_preference: 'lowest_risk',
      })
    );
  });

  it('renders candidate routes and fires onSelectRoute', () => {
    const handleCalculate = vi.fn();
    const handleSelect = vi.fn();

    render(
      <RouteRiskPanel
        onCalculateRoutes={handleCalculate}
        routeResponse={MOCK_ROUTE_RESPONSE}
        selectedRouteId="route_opt_1"
        onSelectRoute={handleSelect}
      />
    );

    expect(screen.getByText('Shimla-Kandaghat Ridge Line')).toBeInTheDocument();
    expect(screen.getByText('Valley Basin Highway')).toBeInTheDocument();
    expect(screen.getByText('46.2 km')).toBeInTheDocument();
    expect(screen.getByText('78 min')).toBeInTheDocument();

    // Click candidate route #2
    const route2Card = screen.getByText('Valley Basin Highway');
    fireEvent.click(route2Card);
    expect(handleSelect).toHaveBeenCalledWith('route_opt_2');
  });

  it('strictly adheres to comparative terminology and never labels any route as absolute "SAFE"', () => {
    const handleCalculate = vi.fn();
    const handleSelect = vi.fn();

    render(
      <RouteRiskPanel
        onCalculateRoutes={handleCalculate}
        routeResponse={MOCK_ROUTE_RESPONSE}
        selectedRouteId="route_opt_1"
        onSelectRoute={handleSelect}
      />
    );

    // Uses comparative label:
    expect(screen.getByText('Recommended Lower-Risk Route')).toBeInTheDocument();
    expect(screen.getByText('Higher Hazard Exposure')).toBeInTheDocument();

    // Verify that NO element in candidate route badges has text "SAFE" or "COMPLETELY SAFE"
    const allLabels = screen.getAllByText(/Route|Exposure/i).map((el) => el.textContent?.trim());
    allLabels.forEach((label) => {
      expect(label?.toUpperCase()).not.toBe('SAFE');
      expect(label?.toUpperCase()).not.toBe('COMPLETELY SAFE');
    });
  });
});
