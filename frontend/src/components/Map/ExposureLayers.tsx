import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLayerStore } from '../../state/layerStore';
import { ImpactSummary } from '../../types/exposure';

interface ExposureLayersProps {
  impactData?: ImpactSummary;
}

const createAssetIcon = (type: string, exposureLevel: string) => {
  let emoji = '🏢';
  let color = '#3b82f6';
  if (type === 'hospital') {
    emoji = '🏥';
    color = '#ef4444';
  } else if (type === 'school') {
    emoji = '🏫';
    color = '#f59e0b';
  } else if (type === 'power_station') {
    emoji = '⚡';
    color = '#8b5cf6';
  } else if (type === 'road') {
    emoji = '🛣️';
    color = '#64748b';
  }

  return L.divIcon({
    className: 'exposure-asset-icon',
    html: `
      <div style="
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: rgba(18, 24, 36, 0.9);
        border: 2px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

export const ExposureLayers: React.FC<ExposureLayersProps> = ({ impactData }) => {
  const { schools, hospitals, buildings, roads } = useLayerStore();

  if (!impactData || !impactData.critical_assets) return null;

  return (
    <>
      {impactData.critical_assets.map((asset) => {
        if (asset.type === 'school' && !schools) return null;
        if (asset.type === 'hospital' && !hospitals) return null;
        if (asset.type === 'building' && !buildings) return null;
        if (asset.type === 'road' && !roads) return null;

        return (
          <Marker
            key={asset.id}
            position={[asset.latitude, asset.longitude]}
            icon={createAssetIcon(asset.type, asset.exposure_level)}
          >
            <Popup>
              <div style={{ padding: '0.2rem' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{asset.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Type: {asset.type.toUpperCase()} | Exposure: <span style={{ fontWeight: 600, color: 'var(--risk-high)' }}>{asset.exposure_level}</span>
                </div>
                {asset.distance_m && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    Distance to epicenter: {asset.distance_m}m
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
