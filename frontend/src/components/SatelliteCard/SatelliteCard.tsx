import React from 'react';
import { Orbit, Leaf, Waves, Percent } from 'lucide-react';
import { NormalizedSatellite } from '../../types/api';
import { DataFreshnessBadge } from '../DataFreshnessBadge/DataFreshnessBadge';
import { formatTimestamp } from '../../utils/freshness';

interface SatelliteCardProps {
  data?: NormalizedSatellite;
  isLoading?: boolean;
}

export const SatelliteCard: React.FC<SatelliteCardProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="glass-panel" style={{ padding: '1.25rem', minHeight: '160px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading Satellite Indicators...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel glass-panel-hover equal-height-card" style={{ padding: '1.25rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Orbit size={18} style={{ color: 'var(--accent-purple)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Satellite Indicators</h4>
        </div>
        <DataFreshnessBadge mode={data.data_mode} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
        {/* NDVI */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
            <Leaf size={12} style={{ color: 'var(--risk-low)' }} /> NDVI (Vegetation)
          </span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--risk-low)' }}>
            {data.ndvi}
          </span>
        </div>

        {/* NDWI */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
            <Waves size={12} style={{ color: 'var(--primary-400)' }} /> NDWI (Water)
          </span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-400)' }}>
            {data.ndwi}
          </span>
        </div>

        {/* Change Score */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Change Anomaly Score</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.change_score}
          </span>
        </div>

        {/* Cloud Cover */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Cloud Cover</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.cloud_cover ?? 0}%
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Observed: {formatTimestamp(data.observation_date)}</span>
        <span>Source: {data.source}</span>
      </div>
    </div>
  );
};
