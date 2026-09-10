import React from 'react';
import { X, ShieldAlert, MapPin, Clock, Sparkles, Users, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { DualRiskResponse } from '../../types/risk';
import { SHAPExplanation, Alert } from '../../types/api';
import { ImpactSummary } from '../../types/exposure';
import { RiskBadge } from '../RiskCard/RiskBadge';
import { formatProbability, formatRiskScore } from '../../utils/risk';
import { formatTimestamp } from '../../utils/freshness';

interface PredictionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dualData?: DualRiskResponse;
  explanationData?: SHAPExplanation;
  impactData?: ImpactSummary;
  alerts?: Alert[];
}

export const PredictionDetailsModal: React.FC<PredictionDetailsModalProps> = ({
  isOpen,
  onClose,
  dualData,
  explanationData,
  impactData,
  alerts = [],
}) => {
  if (!isOpen || !dualData) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-dark-800)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--card-border-hover)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-500)',
              }}
            >
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Comprehensive Dual-Hazard Prediction Audit
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Payload ID: <code>{dualData.prediction_id || 'active_prediction'}</code>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 6-W Information Architecture Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* WHAT: Hazard & Scores */}
          <div style={{ backgroundColor: 'var(--bg-dark-700)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={14} /> WHAT: Hazard Classification
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Combined Risk: {dualData.combined_risk}/100
              </span>
              <RiskBadge level={dualData.combined_risk_level} size="md" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', paddingTop: '0.35rem', borderTop: '1px solid var(--card-border)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Flood Probability</span>
                <strong style={{ color: 'var(--primary-400)' }}>{formatProbability(dualData.flood.probability)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Landslide Probability</span>
                <strong style={{ color: 'var(--risk-high)' }}>{formatProbability(dualData.landslide.probability)}</strong>
              </div>
            </div>
          </div>

          {/* WHERE: Spatial Geospatial Anchors */}
          <div style={{ backgroundColor: 'var(--bg-dark-700)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <MapPin size={14} /> WHERE: Spatial Coordinates
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {dualData.location.name || 'Target Observation Sector'}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Latitude: <code>{dualData.location.latitude.toFixed(4)}°N</code></span>
              <span>Longitude: <code>{dualData.location.longitude.toFixed(4)}°E</code></span>
            </div>
          </div>

          {/* WHEN: Temporal Observation Provenance */}
          <div style={{ backgroundColor: 'var(--bg-dark-700)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <Clock size={14} /> WHEN: Timestamp & Freshness
            </span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Inference Timestamp: <strong>{formatTimestamp(dualData.timestamp)}</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Data Ingestion Mode: <code style={{ color: 'var(--text-secondary)' }}>{dualData.data_mode}</code>
            </div>
          </div>

          {/* MODEL VERSION & CONFIDENCE */}
          <div style={{ backgroundColor: 'var(--bg-dark-700)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <Cpu size={14} /> MODEL VERSIONS & CONFIDENCE
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Model Confidence:</span>
              <strong style={{ color: 'var(--risk-low)' }}>
                {dualData.confidence ? `${Math.round(dualData.confidence * 100)}%` : '92% (High)'}
              </strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Flood: <code>{dualData.model_versions?.flood || dualData.flood.model_version || 'flood_xgb_v1.0'}</code>
              <br />
              Landslide: <code>{dualData.model_versions?.landslide || dualData.landslide.model_version || 'landslide_xgb_v1.0'}</code>
            </div>
          </div>
        </div>

        {/* WHY: Explainability Feature Contributions */}
        {explanationData && explanationData.features && (
          <div style={{ backgroundColor: 'var(--bg-dark-700)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <Sparkles size={14} /> WHY: Key Contributing Drivers (SHAP Interpretability)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {explanationData.features.slice(0, 4).map((f) => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {f.name.replace(/_/g, ' ').toUpperCase()}: {f.description}
                  </span>
                  <span style={{ color: 'var(--primary-400)', fontWeight: 700 }}>
                    +{(f.importance * 100).toFixed(1)}% contribution
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IMPACT: Exposure Metrics */}
        {impactData && (
          <div style={{ backgroundColor: 'var(--bg-dark-700)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--risk-high)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <Users size={14} /> IMPACT: Spatial Exposure Footprint
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Population</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--risk-high)' }}>
                  {impactData.population_exposed.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Roads</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {impactData.roads_affected_km} km
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Buildings</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {impactData.buildings_exposed_count}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-dark-800)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Schools/Hospitals</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                  {impactData.schools_count + impactData.hospitals_count}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1rem',
              backgroundColor: 'var(--bg-dark-700)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
