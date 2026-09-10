import React, { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLocationStore } from '../../state/locationStore';

const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-location-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(34, 197, 94, 0.25);
        border: 2px solid #22C55E;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
      ">
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4ADE80;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export const LocationMarker: React.FC = () => {
  const { latitude, longitude, locationName } = useLocationStore();
  const map = useMap();

  useEffect(() => {
    if (!isNaN(latitude) && !isNaN(longitude)) {
      map.flyTo([latitude, longitude], map.getZoom(), { duration: 1.2 });
    }
  }, [latitude, longitude, map]);

  if (isNaN(latitude) || isNaN(longitude)) return null;

  return (
    <Marker position={[latitude, longitude]} icon={createCustomIcon()}>
      <Popup>
        <div style={{ padding: '0.2rem' }}>
          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{locationName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Lat: {latitude.toFixed(4)}°, Lon: {longitude.toFixed(4)}°
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
