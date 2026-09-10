import React from 'react';
import { Users, Building, School, Hospital, ShieldAlert } from 'lucide-react';
import { ImpactSummary } from '../../types/exposure';
import { DataFreshnessBadge } from '../DataFreshnessBadge/DataFreshnessBadge';

interface ImpactPanelProps {
  data?: ImpactSummary;
  isLoading?: boolean;
}

export const ImpactPanel: React.FC<ImpactPanelProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="glass-panel" style={{ padding: '1.25rem', minHeight: '200px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calculating PostGIS Spatial Exposure...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} style={{ color: 'var(--risk-high)' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Impact & Exposure Summary</h4>
        </div>
        <DataFreshnessBadge mode={data.data_mode} />
      </div>

      {/* Main Grid Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Population Exposed */}
        <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            Population Exposed
          </span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--risk-high)', fontFamily: 'var(--font-display)' }}>
            {data.population_exposed.toLocaleString()}
          </span>
        </div>

        {/* Roads Affected */}
        <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            Road Network
          </span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {data.roads_affected_km} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>km</span>
          </span>
        </div>

        {/* Buildings Exposed */}
        <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            Buildings Exposed
          </span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {data.buildings_exposed_count}
          </span>
        </div>

        {/* Essential Facilities */}
        <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            Schools & Hospitals
          </span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-teal)', fontFamily: 'var(--font-display)' }}>
            {data.schools_count + data.hospitals_count}
          </span>
        </div>
      </div>

      {/* Critical Facilities List */}
      {data.critical_assets && data.critical_assets.length > 0 && (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            At-Risk Infrastructure Assets
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.critical_assets.map((asset) => (
              <div
                key={asset.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-dark-800)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--card-border)',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {asset.type === 'hospital' ? (
                    <Hospital size={16} style={{ color: 'var(--risk-high)' }} />
                  ) : asset.type === 'school' ? (
                    <School size={16} style={{ color: 'var(--risk-moderate)' }} />
                  ) : (
                    <Building size={16} style={{ color: 'var(--primary-400)' }} />
                  )}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{asset.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {asset.distance_m && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{asset.distance_m}m</span>
                  )}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: asset.exposure_level === 'CRITICAL' ? 'var(--risk-critical)' : 'var(--risk-high)',
                      backgroundColor: asset.exposure_level === 'CRITICAL' ? 'var(--risk-critical-bg)' : 'var(--risk-high-bg)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {asset.exposure_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
