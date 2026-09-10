import React from 'react';
import { Circle, Polygon } from 'react-leaflet';
import { useLayerStore } from '../../state/layerStore';
import { useLocationStore } from '../../state/locationStore';
import { DualRiskResponse } from '../../types/risk';

interface HazardOverlayProps {
  predictionData?: DualRiskResponse;
}

export const HazardOverlay: React.FC<HazardOverlayProps> = ({ predictionData }) => {
  const {
    combinedOverlay,
    floodOverlay,
    landslideOverlay,
    weatherOverlay,
    satelliteOverlay,
    terrainOverlay,
  } = useLayerStore();
  const { latitude, longitude } = useLocationStore();

  if (isNaN(latitude) || isNaN(longitude)) return null;

  const floodProb = predictionData?.flood.probability ?? 0.72;
  const landslideProb = predictionData?.landslide.probability ?? 0.87;
  const combinedRisk = predictionData?.combined_risk ?? 84;

  // Spatial risk radii
  const combinedRadiusMeters = Math.max(2000, Math.round((combinedRisk / 100) * 5000));
  const floodRadiusMeters = Math.max(1500, Math.round(floodProb * 4000));
  const landslideRadiusMeters = Math.max(1200, Math.round(landslideProb * 3500));

  // Landslide susceptibility zone polygon offset
  const landslidePolygon: [number, number][] = [
    [latitude + 0.012, longitude + 0.008],
    [latitude + 0.018, longitude + 0.022],
    [latitude + 0.005, longitude + 0.028],
    [latitude - 0.004, longitude + 0.014],
  ];

  // Steep terrain slope contour polygon offset
  const terrainSlopePolygon: [number, number][] = [
    [latitude + 0.025, longitude - 0.015],
    [latitude + 0.035, longitude - 0.005],
    [latitude + 0.015, longitude + 0.012],
    [latitude + 0.005, longitude - 0.008],
  ];

  return (
    <>
      {/* Combined Risk Fusion Overlay */}
      {combinedOverlay && (
        <Circle
          center={[latitude, longitude]}
          radius={combinedRadiusMeters}
          pathOptions={{
            color: combinedRisk >= 80 ? '#dc2626' : combinedRisk >= 60 ? '#f97316' : '#3b82f6',
            fillColor: combinedRisk >= 80 ? '#dc2626' : combinedRisk >= 60 ? '#f97316' : '#3b82f6',
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '6, 6',
          }}
        />
      )}

      {/* Flood Risk Overlay Circle */}
      {floodOverlay && (
        <Circle
          center={[latitude, longitude]}
          radius={floodRadiusMeters}
          pathOptions={{
            color: floodProb >= 0.7 ? '#3b82f6' : '#60a5fa',
            fillColor: '#3b82f6',
            fillOpacity: floodProb >= 0.7 ? 0.35 : 0.2,
            weight: 2,
            dashArray: '4, 4',
          }}
        />
      )}

      {/* Landslide Risk Overlay Polygon & Circle */}
      {landslideOverlay && (
        <>
          <Circle
            center={[latitude, longitude]}
            radius={landslideRadiusMeters}
            pathOptions={{
              color: landslideProb >= 0.8 ? '#ef4444' : '#f97316',
              fillColor: landslideProb >= 0.8 ? '#dc2626' : '#f97316',
              fillOpacity: landslideProb >= 0.8 ? 0.4 : 0.25,
              weight: 2,
            }}
          />
          <Polygon
            positions={landslidePolygon}
            pathOptions={{
              color: '#f97316',
              fillColor: '#ea580c',
              fillOpacity: 0.3,
              weight: 1.5,
            }}
          />
        </>
      )}

      {/* Weather / Rainfall Radar Layer */}
      {weatherOverlay && (
        <Circle
          center={[latitude, longitude]}
          radius={6000}
          pathOptions={{
            color: '#06b6d4',
            fillColor: '#0891b2',
            fillOpacity: 0.22,
            weight: 1.5,
          }}
        />
      )}

      {/* Satellite Spectral / NDVI Footprint Layer */}
      {satelliteOverlay && (
        <Circle
          center={[latitude, longitude]}
          radius={4500}
          pathOptions={{
            color: '#8b5cf6',
            fillColor: '#7c3aed',
            fillOpacity: 0.18,
            weight: 1,
            dashArray: '3, 3',
          }}
        />
      )}

      {/* Terrain Slope Contours Layer */}
      {terrainOverlay && (
        <Polygon
          positions={terrainSlopePolygon}
          pathOptions={{
            color: '#eab308',
            fillColor: '#ca8a04',
            fillOpacity: 0.25,
            weight: 1.5,
          }}
        />
      )}
    </>
  );
};
