import React, { useState } from 'react';
import { Activity, ShieldAlert, Cpu, FileText } from 'lucide-react';
import { useLocationStore } from '../state/locationStore';
import { usePredict } from '../hooks/usePredict';
import { useImpact } from '../hooks/useImpact';
import { useAlerts } from '../hooks/useAlerts';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { RiskCard } from '../components/RiskCard/RiskCard';
import { RiskBadge } from '../components/RiskCard/RiskBadge';
import { ExplanationPanel } from '../components/ExplanationPanel/ExplanationPanel';
import { ImpactPanel } from '../components/ImpactPanel/ImpactPanel';
import { PredictionDetailsModal } from '../components/PredictionDetails/PredictionDetailsModal';

export const RiskCenter: React.FC = () => {
  const { latitude, longitude, locationName } = useLocationStore();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const predictQuery = usePredict({ latitude, longitude, hazard: 'dual' });
  const impactQuery = useImpact(latitude, longitude);
  const alertsQuery = useAlerts();

  // Explanation Query for active prediction
  const explanationQuery = useQuery({
    queryKey: ['explanation', predictQuery.data?.prediction_id || 'pred_active_01', latitude, longitude],
    queryFn: () => apiService.getExplanation(predictQuery.data?.prediction_id || 'pred_active_01'),
  });

  const dualData = predictQuery.data;

  return (
    <div className="page-content">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity size={22} style={{ color: 'var(--primary-400)' }} /> Risk Analysis & Decision Support Center
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Detailed branch probability breakdown, SHAP model interpretability, and PostGIS spatial exposure for <strong>{locationName}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {dualData && <RiskBadge level={dualData.combined_risk_level} size="lg" />}
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="intel-btn intel-btn-primary"
          >
            <FileText size={14} /> Audit Prediction Details
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="responsive-2col">
        {/* Left Column: Branch Cards & SHAP Explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {dualData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <RiskCard data={dualData.flood} title="Flood Branch" />
              <RiskCard data={dualData.landslide} title="Landslide Branch" />
            </div>
          )}

          <ExplanationPanel data={explanationQuery.data} isLoading={explanationQuery.isLoading} />
        </div>

        {/* Right Column: PostGIS Spatial Exposure & Impact Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ImpactPanel data={impactQuery.data} isLoading={impactQuery.isLoading} />
        </div>
      </div>

      {/* Prediction Details Modal */}
      <PredictionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        dualData={dualData}
        explanationData={explanationQuery.data}
        impactData={impactQuery.data}
        alerts={alertsQuery.data}
      />
    </div>
  );
};
