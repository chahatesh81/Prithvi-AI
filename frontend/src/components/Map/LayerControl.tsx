import React, { useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { useLayerStore } from '../../state/layerStore';
import { LayerState } from '../../types/geo';

export const LayerControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    baseMap,
    setBaseMap,
    combinedOverlay,
    floodOverlay,
    landslideOverlay,
    weatherOverlay,
    satelliteOverlay,
    terrainOverlay,
    routesOverlay,
    hazardHotspots,
    roads,
    buildings,
    schools,
    hospitals,
    population,
    toggleLayer,
  } = useLayerStore();

  const handleBaseMapChange = (mapType: LayerState['baseMap']) => {
    setBaseMap(mapType);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.85rem',
          backgroundColor: '#FFFFFF',
          color: 'var(--text-primary)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        <Layers size={16} style={{ color: 'var(--primary-600)' }} /> Layer Controls
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            marginTop: '0.5rem',
            width: '260px',
            maxHeight: '440px',
            overflowY: 'auto',
            padding: '1rem',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            fontSize: '0.8rem',
            boxShadow: '0 8px 24px -3px rgba(15, 23, 42, 0.12)',
            border: '1px solid var(--card-border)',
          }}
        >
          {/* Base Map Selector */}
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Base Map Style
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
              {(['dark', 'satellite', 'streets', 'terrain'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleBaseMapChange(type)}
                  style={{
                    padding: '0.3rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    border: '1px solid',
                    borderColor: baseMap === type ? 'var(--primary-600)' : 'var(--card-border)',
                    backgroundColor: baseMap === type ? 'var(--primary-100)' : '#F8FAFC',
                    color: baseMap === type ? 'var(--primary-700)' : 'var(--text-secondary)',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--card-border)' }} />

          {/* Hazard Overlays */}
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Hazard Overlays
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🎯 Combined Risk Overlay</span>
                <input
                  type="checkbox"
                  checked={combinedOverlay}
                  onChange={() => toggleLayer('combinedOverlay')}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🌊 Flood Risk Zone</span>
                <input
                  type="checkbox"
                  checked={floodOverlay}
                  onChange={() => toggleLayer('floodOverlay')}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>⛰️ Landslide Hazard Zone</span>
                <input
                  type="checkbox"
                  checked={landslideOverlay}
                  onChange={() => toggleLayer('landslideOverlay')}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🌧️ Rainfall / Radar</span>
                <input
                  type="checkbox"
                  checked={weatherOverlay}
                  onChange={() => toggleLayer('weatherOverlay')}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🛰️ Satellite Moisture/NDVI</span>
                <input
                  type="checkbox"
                  checked={satelliteOverlay}
                  onChange={() => toggleLayer('satelliteOverlay')}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>📐 Terrain Slopes</span>
                <input
                  type="checkbox"
                  checked={terrainOverlay}
                  onChange={() => toggleLayer('terrainOverlay')}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🛣️ Evacuation Routes</span>
                <input
                  type="checkbox"
                  checked={routesOverlay}
                  onChange={() => toggleLayer('routesOverlay')}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>⚠️ Hazard Hotspots</span>
                <input
                  type="checkbox"
                  checked={hazardHotspots}
                  onChange={() => toggleLayer('hazardHotspots')}
                  style={{ cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--card-border)' }} />

          {/* Exposure / Asset Layers */}
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Exposure Layers
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🏥 Hospitals</span>
                <input type="checkbox" checked={hospitals} onChange={() => toggleLayer('hospitals')} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🏫 Schools</span>
                <input type="checkbox" checked={schools} onChange={() => toggleLayer('schools')} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🛣️ Roads & Transport</span>
                <input type="checkbox" checked={roads} onChange={() => toggleLayer('roads')} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>🏢 Buildings & Infrastructure</span>
                <input type="checkbox" checked={buildings} onChange={() => toggleLayer('buildings')} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <span>👥 Population Density</span>
                <input type="checkbox" checked={population} onChange={() => toggleLayer('population')} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
