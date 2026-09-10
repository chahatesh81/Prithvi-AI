import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { useLocationStore } from '../../state/locationStore';
import { useLayerStore } from '../../state/layerStore';
import { LocationMarker } from './LocationMarker';
import { HazardOverlay } from './HazardOverlay';
import { ExposureLayers } from './ExposureLayers';
import { RouteOverlay } from './RouteOverlay';
import { LayerControl } from './LayerControl';
import { DualRiskResponse } from '../../types/risk';
import { ImpactSummary } from '../../types/exposure';
import { CandidateRoute } from '../../types/route';

interface BaseMapProps {
  predictionData?: DualRiskResponse;
  impactData?: ImpactSummary;
  routes?: CandidateRoute[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  height?: string;
}

// Inner helper component to capture map click events and set coordinates
const MapClickHandler: React.FC = () => {
  const { setLocation } = useLocationStore();

  useMapEvents({
    click(e) {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      setLocation({ latitude: lat, longitude: lon });
    },
  });

  return null;
};

const TILE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

const TILE_ATTRIBUTIONS = {
  dark: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
  satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  terrain: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; OpenTopoMap',
};

export const BaseMap: React.FC<BaseMapProps> = ({
  predictionData,
  impactData,
  routes = [],
  selectedRouteId,
  onSelectRoute,
  height = '500px',
}) => {
  const { latitude, longitude } = useLocationStore();
  const { baseMap } = useLayerStore();

  const center: [number, number] = [
    isNaN(latitude) ? 31.1048 : latitude,
    isNaN(longitude) ? 77.1734 : longitude,
  ];

  const zoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM || '10', 10);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-md)' }}>
      <LayerControl />

      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={TILE_URLS[baseMap]} attribution={TILE_ATTRIBUTIONS[baseMap]} maxZoom={19} />
        <MapClickHandler />
        <LocationMarker />
        <HazardOverlay predictionData={predictionData} />
        <ExposureLayers impactData={impactData} />
        <RouteOverlay routes={routes} selectedRouteId={selectedRouteId} onSelectRoute={onSelectRoute} />
      </MapContainer>

      {/* Tactical Coordinate HUD Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.75rem',
          zIndex: 1000,
          backgroundColor: 'rgba(7, 26, 28, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.3rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.68rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          pointerEvents: 'none',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
        <span className="tabular-nums">
          LAT {center[0].toFixed(4)}° N &nbsp;|&nbsp; LON {center[1].toFixed(4)}° E &nbsp;|&nbsp; WGS84
        </span>
      </div>
    </div>
  );
};
