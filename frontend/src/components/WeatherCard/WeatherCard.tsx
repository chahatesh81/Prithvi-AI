import React from 'react';
import { CloudRain, Thermometer, Droplets, Wind } from 'lucide-react';
import { NormalizedWeather } from '../../types/api';
import { DataFreshnessBadge } from '../DataFreshnessBadge/DataFreshnessBadge';
import { formatTimestamp } from '../../utils/freshness';

interface WeatherCardProps {
  data?: NormalizedWeather;
  isLoading?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="glass-panel" style={{ padding: '1.25rem', minHeight: '160px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading Weather Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel glass-panel-hover equal-height-card" style={{ padding: '1.25rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CloudRain size={18} style={{ color: 'var(--accent-cyan)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Current Weather</h4>
        </div>
        <DataFreshnessBadge mode={data.data_mode} retrievedAt={data.retrieved_at} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
        {/* Rainfall */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Rainfall (24h)</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {data.rainfall} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>mm</span>
          </span>
        </div>

        {/* Temperature */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Temperature</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.temperature}°C
          </span>
        </div>

        {/* Humidity */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Humidity</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.humidity}%
          </span>
        </div>

        {/* Wind Speed */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Wind Speed</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.wind_speed} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>km/h</span>
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Observed: {formatTimestamp(data.observation_time)}</span>
        <span>Source: {data.source}</span>
      </div>
    </div>
  );
};
