import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { RouteRiskPanel } from '../components/Routes/RouteRiskPanel';
import { Map } from '../components/Map/Map';
import { useRouteRisk } from '../hooks/useRouteRisk';
import { RouteRiskRequest } from '../types/route';
import { RiskBadge } from '../components/RiskCard/RiskBadge';

export const Routes: React.FC = () => {
  const routeRiskMutation = useRouteRisk();
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(undefined);

  // Trigger initial calculation on mount using default corridor
  useEffect(() => {
    const initialRequest: RouteRiskRequest = {
      origin: { name: 'Shimla Ridge HQ', latitude: 31.1048, longitude: 77.1734 },
      destination: { name: 'Solan Highway Hub', latitude: 30.9084, longitude: 77.0999 },
      travel_mode: 'emergency',
      risk_preference: 'lowest_risk',
    };
    routeRiskMutation.mutate(initialRequest);
  }, []);

  const routeResponse = routeRiskMutation.data;
  const routes = routeResponse?.routes || [];

  // When routes arrive, default to the recommended route
  useEffect(() => {
    if (routes.length > 0 && !selectedRouteId) {
      const rec = routes.find((r) => r.is_recommended) || routes[0];
      setSelectedRouteId(rec.route_id);
    }
  }, [routes, selectedRouteId]);

  const handleCalculateRoutes = (req: RouteRiskRequest) => {
    setSelectedRouteId(undefined);
    routeRiskMutation.mutate(req);
  };

  const selectedRoute = routes.find((r) => r.route_id === selectedRouteId) || routes[0];

  return (
    <div className="page-content">
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderLeft: '4px solid var(--primary-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Navigation size={22} style={{ color: 'var(--primary-400)' }} /> Risk-Aware Alternative Routing & Evacuation Support
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Geospatial hazard overlay of candidate transportation links across flood inundation basins and active landslide escarpments.
          </p>
        </div>

        {/* Selected Route Status Pill */}
        {selectedRoute && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Corridor</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedRoute.name}
              </div>
            </div>
            <RiskBadge level={selectedRoute.risk_level} size="md" />
          </div>
        )}
      </div>

      {/* Main Grid: Left Panel + Right Map */}
      <div className="responsive-dashboard-grid">
        {/* Left Column: Form & Route Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <RouteRiskPanel
            onCalculateRoutes={handleCalculateRoutes}
            routeResponse={routeResponse}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            isLoading={routeRiskMutation.isPending}
            error={routeRiskMutation.error}
          />
        </div>

        {/* Right Column: Synchronized Leaflet Map with Route Overlays */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary-400)' }} /> Spatial Route & Hazard Hotspots
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Green = Lower Risk • Red/Orange = Hazard Zones
              </span>
            </div>

            <Map
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              height="540px"
            />
          </div>

          {/* Selected Route Details Box */}
          {selectedRoute && (
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Active Assessment: {selectedRoute.name}
                </h4>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: selectedRoute.is_recommended ? 'var(--risk-low)' : 'var(--risk-high)',
                  }}
                >
                  {selectedRoute.comparative_risk_label}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Length</span>
                  <span className="font-mono tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedRoute.distance_km} km</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Travel Time</span>
                  <span className="font-mono tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedRoute.estimated_duration_min} min</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Flood / Slide Risk</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {selectedRoute.flood_exposure} / {selectedRoute.landslide_exposure}
                  </span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Combined Score</span>
                  <span className="font-mono tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {selectedRoute.combined_risk}/100
                  </span>
                </div>
              </div>

              {selectedRoute.hazard_hotspots.length > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Segment Hazard Hotspots:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {selectedRoute.hazard_hotspots.map((hs) => (
                      <div
                        key={hs.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.65rem',
                          backgroundColor: 'var(--bg-dark-800)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          border: '1px solid var(--card-border)',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{hs.description}</span>
                        <RiskBadge level={hs.severity} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
