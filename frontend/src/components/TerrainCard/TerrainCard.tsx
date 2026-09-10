import React from 'react';
import { Mountain, Compass, MoveUpRight, Layers } from 'lucide-react';
import { NormalizedTerrain } from '../../types/api';
import { DataFreshnessBadge } from '../DataFreshnessBadge/DataFreshnessBadge';

interface TerrainCardProps {
  data?: NormalizedTerrain;
  isLoading?: boolean;
}

export const TerrainCard: React.FC<TerrainCardProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="glass-panel" style={{ padding: '1.25rem', minHeight: '160px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading Terrain Topography...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel glass-panel-hover equal-height-card" style={{ padding: '1.25rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mountain size={18} style={{ color: 'var(--risk-high)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Terrain & Topography</h4>
        </div>
        <DataFreshnessBadge mode={data.data_mode} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', fontSize: '0.85rem' }}>
        {/* Elevation */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Elevation</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.elevation}m
          </span>
        </div>

        {/* Slope */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Slope</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--risk-high)' }}>
            {data.slope}°
          </span>
        </div>

        {/* Aspect */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Aspect</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.aspect}°
          </span>
        </div>

        {/* Curvature */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Curvature</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.curvature}
          </span>
        </div>

        {/* TPI */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>TPI</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.tpi}
          </span>
        </div>

        {/* TRI */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>TRI</span>
          <span className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.tri}
          </span>
        </div>
      </div>
    </div>
  );
};
