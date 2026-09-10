import React from 'react';
import { HelpCircle, Info, Sparkles } from 'lucide-react';
import { SHAPExplanation } from '../../types/api';

interface ExplanationPanelProps {
  data?: SHAPExplanation;
  isLoading?: boolean;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="glass-panel" style={{ padding: '1.25rem', minHeight: '180px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calculating SHAP Model Interpretability...</span>
      </div>
    );
  }

  const maxImportance = Math.max(...data.features.map((f) => f.importance), 0.01);

  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--primary-400)' }} />
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              SHAP Feature Importance & Model Explanation
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Backend Model Architecture: {data.model_version}
            </span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
        The bar chart below renders feature contribution weights computed by the backend SHAP explainer for prediction payload <code>{data.prediction_id}</code>.
      </p>

      {/* Feature Importance Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.features.map((feat) => {
          const widthPercent = Math.min(100, Math.round((feat.importance / maxImportance) * 100));

          return (
            <div key={feat.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {feat.name.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span style={{ color: 'var(--primary-400)', fontWeight: 700 }}>
                  +{(feat.importance * 100).toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: 'var(--bg-dark-800)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  border: '1px solid var(--card-border)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${widthPercent}%`,
                    backgroundColor: feat.direction === 'NEGATIVE' ? 'var(--accent-teal)' : 'var(--primary-500)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 300ms ease',
                  }}
                />
              </div>

              {feat.description && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {feat.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
