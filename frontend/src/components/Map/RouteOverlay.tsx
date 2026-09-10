import React from 'react';
import { Polyline, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { CandidateRoute } from '../../types/route';

interface RouteOverlayProps {
  routes?: CandidateRoute[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
}

export const RouteOverlay: React.FC<RouteOverlayProps> = ({
  routes = [],
  selectedRouteId,
  onSelectRoute,
}) => {
  if (!routes || routes.length === 0) return null;

  return (
    <>
      {/* Route Polylines */}
      {routes.map((route) => {
        const isSelected = route.route_id === selectedRouteId;
        const isRecommended = route.is_recommended;

        // Color based on risk level and recommendation
        const strokeColor = isRecommended
          ? '#10b981' // Green for recommended lower-risk route
          : route.risk_level === 'CRITICAL' || route.combined_risk >= 80
          ? '#ef4444' // Red for high hazard exposure
          : route.combined_risk >= 50
          ? '#f97316' // Orange
          : '#3b82f6'; // Blue

        return (
          <Polyline
            key={route.route_id}
            positions={route.geometry}
            pathOptions={{
              color: strokeColor,
              weight: isSelected ? 6 : 4,
              opacity: isSelected ? 0.95 : 0.65,
              dashArray: isSelected ? undefined : isRecommended ? undefined : '5, 5',
            }}
            eventHandlers={{
              click: () => onSelectRoute?.(route.route_id),
            }}
          >
            <Tooltip sticky>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {route.name} &mdash; Combined Risk: {route.combined_risk}/100 ({route.comparative_risk_label})
              </div>
            </Tooltip>
          </Polyline>
        );
      })}

      {/* Hazard Hotspots on Routes */}
      {routes.flatMap((route) =>
        route.hazard_hotspots.map((hotspot) => (
          <CircleMarker
            key={hotspot.id}
            center={[hotspot.latitude, hotspot.longitude]}
            radius={7}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: hotspot.severity === 'CRITICAL' ? '#dc2626' : '#ea580c',
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div style={{ padding: '0.25rem', maxWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: hotspot.severity === 'CRITICAL' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(234, 88, 12, 0.2)',
                      color: hotspot.severity === 'CRITICAL' ? '#dc2626' : '#ea580c',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {hotspot.severity} {hotspot.hazard_type}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', margin: 0, lineHeight: 1.3 }}>
                  {hotspot.description}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))
      )}
    </>
  );
};
