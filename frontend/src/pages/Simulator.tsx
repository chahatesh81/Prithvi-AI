import React, { useState } from 'react';
import { Sliders, MapPin, Search, AlertCircle } from 'lucide-react';
import { useLocationStore } from '../state/locationStore';
import { WhatIfSimulator } from '../components/Simulator/WhatIfSimulator';
import { Map } from '../components/Map/Map';
import { usePredict } from '../hooks/usePredict';
import { validateCoordinates } from '../utils/coordinates';
import { LocationPreset } from '../types/ui';

const PRESET_LOCATIONS: LocationPreset[] = [
  { name: 'Shimla Ridge', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734, description: 'High landslide & heavy rainfall vulnerability zone' },
  { name: 'Joshimath', state: 'Uttarakhand', latitude: 30.5562, longitude: 79.5647, description: 'Critical slope subsidence & landslide prone sector' },
  { name: 'Wayanad', state: 'Kerala', latitude: 11.6854, longitude: 76.1320, description: 'Heavy monsoon flash flood & debris flow region' },
  { name: 'Darjeeling', state: 'West Bengal', latitude: 27.0410, longitude: 88.2663, description: 'Steep terrain hillside instability area' },
];

export const Simulator: React.FC = () => {
  const { latitude, longitude, setLocation } = useLocationStore();
  const [latInput, setLatInput] = useState(latitude.toString());
  const [lonInput, setLonInput] = useState(longitude.toString());
  const [inputError, setInputError] = useState<string | null>(null);

  const predictQuery = usePredict({ latitude, longitude, hazard: 'dual' });

  const handleCoordinateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(latInput);
    const lonNum = parseFloat(lonInput);
    const validation = validateCoordinates(latNum, lonNum);

    if (!validation.isValid) {
      setInputError(validation.error || 'Invalid coordinates');
      return;
    }

    setInputError(null);
    setLocation({ latitude: latNum, longitude: lonNum });
  };

  const handlePresetSelect = (preset: LocationPreset) => {
    setLatInput(preset.latitude.toString());
    setLonInput(preset.longitude.toString());
    setInputError(null);
    setLocation({ latitude: preset.latitude, longitude: preset.longitude }, `${preset.name}, ${preset.state}`);
  };

  return (
    <div className="page-content">
      {/* Top Coordinate Selector & Presets */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} style={{ color: 'var(--accent-purple)' }} /> Simulation Target Location
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Choose a target location to establish the baseline for What-If scenario modeling.
            </span>
          </div>

          {/* Coordinate Search Form */}
          <form onSubmit={handleCoordinateSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--bg-dark-850)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lat:</span>
              <input
                type="number"
                step="any"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="tabular-nums"
                style={{ width: '85px', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}
                placeholder="31.1048"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--bg-dark-850)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lon:</span>
              <input
                type="number"
                step="any"
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                className="tabular-nums"
                style={{ width: '85px', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}
                placeholder="77.1734"
              />
            </div>

            <button
              type="submit"
              className="intel-btn"
              style={{
                backgroundColor: 'var(--accent-purple)',
                color: '#fff',
                fontSize: '0.82rem',
              }}
            >
              <Search size={14} /> Set Baseline
            </button>
          </form>
        </div>

        {inputError && (
          <div style={{ color: 'var(--risk-high)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertCircle size={14} /> {inputError}
          </div>
        )}

        {/* Presets Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px solid var(--card-border-subtle)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>High-Vulnerability Benchmarks:</span>
          {PRESET_LOCATIONS.map((preset) => {
            const isMatch = Math.abs(latitude - preset.latitude) < 0.001 && Math.abs(longitude - preset.longitude) < 0.001;
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                title={preset.description}
                className="intel-btn intel-btn-secondary"
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: isMatch ? 700 : 500,
                  borderColor: isMatch ? 'var(--accent-purple)' : 'var(--card-border)',
                  color: isMatch ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  backgroundColor: isMatch ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-dark-750)',
                }}
              >
                {preset.name} ({preset.state})
              </button>
            );
          })}
        </div>
      </div>

      {/* What-If Simulator Main Component */}
      <WhatIfSimulator />

      {/* Spatial Map Context */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} style={{ color: 'var(--primary-400)' }} /> Spatial Hazard Context for Scenario Area
        </h3>
        <Map predictionData={predictQuery.data} height="400px" />
      </div>
    </div>
  );
};
