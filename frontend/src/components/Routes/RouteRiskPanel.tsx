import React, { useState } from 'react';
import { Navigation, ShieldAlert, Clock, Compass, AlertTriangle, CheckCircle2, ChevronRight, RefreshCw, Car, Flame } from 'lucide-react';
import { RouteRiskResponse, CandidateRoute, RouteRiskRequest } from '../../types/route';
import { RiskBadge } from '../RiskCard/RiskBadge';

interface RouteRiskPanelProps {
  onCalculateRoutes: (request: RouteRiskRequest) => void;
  routeResponse?: RouteRiskResponse;
  selectedRouteId?: string;
  onSelectRoute: (routeId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const PRESET_CORRIDORS = [
  {
    name: 'Shimla Ridge → Solan Bypass',
    origin: { name: 'Shimla Ridge HQ', latitude: 31.1048, longitude: 77.1734 },
    destination: { name: 'Solan Highway Hub', latitude: 30.9084, longitude: 77.0999 },
  },
  {
    name: 'Kalka Highway → Shimla Bypass',
    origin: { name: 'Kalka Toll Plaza', latitude: 30.8350, longitude: 76.9320 },
    destination: { name: 'Shimla Ridge HQ', latitude: 31.1048, longitude: 77.1734 },
  },
  {
    name: 'Joshimath Base → Tapovan Corridor',
    origin: { name: 'Joshimath Main Sector', latitude: 30.5562, longitude: 79.5647 },
    destination: { name: 'Tapovan Outpost', latitude: 30.4900, longitude: 79.6200 },
  },
];

export const RouteRiskPanel: React.FC<RouteRiskPanelProps> = ({
  onCalculateRoutes,
  routeResponse,
  selectedRouteId,
  onSelectRoute,
  isLoading = false,
  error = null,
}) => {
  const [selectedCorridorIndex, setSelectedCorridorIndex] = useState<number>(0);
  const [originName, setOriginName] = useState(PRESET_CORRIDORS[0].origin.name);
  const [originLat, setOriginLat] = useState(PRESET_CORRIDORS[0].origin.latitude.toString());
  const [originLon, setOriginLon] = useState(PRESET_CORRIDORS[0].origin.longitude.toString());

  const [destName, setDestName] = useState(PRESET_CORRIDORS[0].destination.name);
  const [destLat, setDestLat] = useState(PRESET_CORRIDORS[0].destination.latitude.toString());
  const [destLon, setDestLon] = useState(PRESET_CORRIDORS[0].destination.longitude.toString());

  const [travelMode, setTravelMode] = useState<'driving' | 'emergency' | 'walking'>('emergency');
  const [riskPreference, setRiskPreference] = useState<'lowest_risk' | 'balanced' | 'fastest'>('lowest_risk');

  const handleCorridorSelect = (index: number) => {
    setSelectedCorridorIndex(index);
    const corridor = PRESET_CORRIDORS[index];
    setOriginName(corridor.origin.name);
    setOriginLat(corridor.origin.latitude.toString());
    setOriginLon(corridor.origin.longitude.toString());

    setDestName(corridor.destination.name);
    setDestLat(corridor.destination.latitude.toString());
    setDestLon(corridor.destination.longitude.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req: RouteRiskRequest = {
      origin: {
        name: originName,
        latitude: parseFloat(originLat),
        longitude: parseFloat(originLon),
      },
      destination: {
        name: destName,
        latitude: parseFloat(destLat),
        longitude: parseFloat(destLon),
      },
      travel_mode: travelMode,
      risk_preference: riskPreference,
    };
    onCalculateRoutes(req);
  };

  const routes = routeResponse?.routes || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Route Request Formulation Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={18} style={{ color: 'var(--primary-400)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Risk-Aware Route Evaluator
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Multi-Hazard Routing Service</span>
        </div>

        {/* Presets Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Evacuation Corridors:
          </span>
          {PRESET_CORRIDORS.map((corridor, idx) => (
            <button
              key={corridor.name}
              type="button"
              onClick={() => handleCorridorSelect(idx)}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: selectedCorridorIndex === idx ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-dark-700)',
                border: '1px solid',
                borderColor: selectedCorridorIndex === idx ? 'var(--primary-500)' : 'var(--card-border)',
                color: selectedCorridorIndex === idx ? '#F1F5F9' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: selectedCorridorIndex === idx ? 700 : 500,
              }}
            >
              {corridor.name}
            </button>
          ))}
        </div>

        {/* Origin & Destination Inputs Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* Origin */}
            <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary-400)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                Origin Point
              </span>
              <input
                type="text"
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
                placeholder="Origin location name"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}
              />
              <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Lat: {parseFloat(originLat).toFixed(3)}°</span>
                <span>•</span>
                <span>Lon: {parseFloat(originLon).toFixed(3)}°</span>
              </div>
            </div>

            {/* Destination */}
            <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                Destination Point
              </span>
              <input
                type="text"
                value={destName}
                onChange={(e) => setDestName(e.target.value)}
                placeholder="Destination location name"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}
              />
              <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Lat: {parseFloat(destLat).toFixed(3)}°</span>
                <span>•</span>
                <span>Lon: {parseFloat(destLon).toFixed(3)}°</span>
              </div>
            </div>
          </div>

          {/* Travel Mode & Optimization Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Travel Profile:
              </label>
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value as any)}
                style={{ width: '100%', backgroundColor: 'var(--bg-dark-800)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', fontSize: '0.8rem', outline: 'none' }}
              >
                <option value="emergency">Emergency Response (4x4 / Heavy)</option>
                <option value="driving">Standard Driving</option>
                <option value="walking">Pedestrian / Evacuation Footpath</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Risk Optimization Strategy:
              </label>
              <select
                value={riskPreference}
                onChange={(e) => setRiskPreference(e.target.value as any)}
                style={{ width: '100%', backgroundColor: 'var(--bg-dark-800)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', fontSize: '0.8rem', outline: 'none' }}
              >
                <option value="lowest_risk">Lowest Hazard Exposure (Safety First)</option>
                <option value="balanced">Balanced Risk & Travel Time</option>
                <option value="fastest">Shortest Travel Duration</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--primary-600)',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '0.25rem',
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spin" /> Calculating Route Risk Overlay...
              </>
            ) : (
              <>
                <Navigation size={16} /> Evaluate Alternative Routes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderLeft: '4px solid var(--risk-critical)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--risk-critical)', fontWeight: 700, fontSize: '0.85rem' }}>
            <AlertTriangle size={16} /> Route Service Unavailable
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {error.message || 'Unable to compute spatial route exposure. Ensure the routing backend service is active.'}
          </p>
        </div>
      )}

      {/* Candidate Routes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Candidate Route Options ({routes.length})
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Select a route to inspect spatial geometry on map
          </span>
        </div>

        {routes.length === 0 && !isLoading && !error && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Navigation size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
            <p>Click "Evaluate Alternative Routes" to generate hazard-ranked corridors.</p>
          </div>
        )}

        {routes.map((route) => {
          const isSelected = route.route_id === selectedRouteId;
          const isRecommended = route.is_recommended;

          return (
            <div
              key={route.route_id}
              onClick={() => onSelectRoute(route.route_id)}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1rem',
                cursor: 'pointer',
                borderLeft: isRecommended
                  ? '4px solid var(--risk-low)'
                  : isSelected
                  ? '4px solid var(--primary-500)'
                  : '4px solid var(--card-border)',
                backgroundColor: isSelected ? 'rgba(30, 41, 59, 0.9)' : undefined,
                transition: 'all 150ms ease',
              }}
            >
              {/* Card Header: Rank & Comparative Label */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isRecommended ? 'var(--risk-low-bg)' : 'var(--bg-dark-700)',
                      color: isRecommended ? 'var(--risk-low)' : 'var(--text-secondary)',
                      border: `1px solid ${isRecommended ? 'var(--risk-low-border)' : 'var(--card-border)'}`,
                    }}
                  >
                    Rank #{route.rank}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {route.name}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: isRecommended ? 'var(--risk-low)' : route.risk_level === 'CRITICAL' ? 'var(--risk-critical)' : 'var(--risk-high)',
                    backgroundColor: isRecommended ? 'var(--risk-low-bg)' : route.risk_level === 'CRITICAL' ? 'var(--risk-critical-bg)' : 'var(--risk-high-bg)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {route.comparative_risk_label}
                </span>
              </div>

              {/* Metrics Grid: Distance, Time, Exposure, Combined Risk */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', backgroundColor: 'var(--bg-dark-800)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Distance</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {route.distance_km} km
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Est. Duration</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {route.estimated_duration_min} min
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Flood / Landslide</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {route.flood_exposure} / {route.landslide_exposure}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Combined Risk</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {route.combined_risk}/100
                    </span>
                    <RiskBadge level={route.risk_level} size="sm" />
                  </div>
                </div>
              </div>

              {/* Hotspots & Road Conditions Summary */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>
                  {route.hazard_hotspots.length > 0 ? (
                    <span style={{ color: 'var(--risk-high)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <AlertTriangle size={12} /> {route.hazard_hotspots.length} Hazard Hotspot(s) identified
                    </span>
                  ) : (
                    <span style={{ color: 'var(--risk-low)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <CheckCircle2 size={12} /> Zero critical hazard hotspots
                    </span>
                  )}
                </span>
                {route.road_conditions && (
                  <span style={{ fontStyle: 'italic', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {route.road_conditions}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
