import React from 'react';
import { Info, AlertCircle, Radio, MapPin, WifiOff, User, ChevronDown } from 'lucide-react';
import { useModeStore } from '../../state/modeStore';
import { useLocationStore } from '../../state/locationStore';

export const DemoModeBanner: React.FC = () => {
  const { dataMode, setMode } = useModeStore();
  const { latitude, longitude, locationName } = useLocationStore();

  if (dataMode !== 'DEMO') return null;

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid var(--card-border)',
        padding: '0.4rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--primary-600)', display: 'inline-block' }} />
        <span>
          <strong style={{ color: 'var(--text-primary)' }}>DEMO MODE</strong> &nbsp;|&nbsp; Displaying static benchmark scenarios. Outputs are probabilistic decision-support calculations, not live observations.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Active Location Dropdown Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--card-border)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          <MapPin size={12} style={{ color: 'var(--primary-600)' }} />
          <span>{locationName}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            ({latitude.toFixed(2)}°, {longitude.toFixed(2)}°)
          </span>
          <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Offline Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--card-border)',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--hazard-landslide)',
          }}
        >
          <WifiOff size={12} />
          <span>Offline</span>
        </div>

        {/* Switch to Live Button */}
        <button
          type="button"
          onClick={() => setMode('LIVE')}
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-100)',
            border: '1px solid var(--primary-300)',
            color: 'var(--primary-700)',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Radio size={12} style={{ color: 'var(--primary-700)' }} /> Live Mode
        </button>

        {/* User Profile Avatar */}
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <User size={13} />
        </div>
      </div>
    </div>
  );
};
