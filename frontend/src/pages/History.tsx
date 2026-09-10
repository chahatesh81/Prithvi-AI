import React, { useState } from 'react';
import { History as HistoryIcon, Calendar, Filter, Database } from 'lucide-react';
import { useLocationStore } from '../state/locationStore';
import { useHistory } from '../hooks/useHistory';
import { RiskBadge } from '../components/RiskCard/RiskBadge';
import { RiskTrendChart } from '../components/RiskCard/RiskTrendChart';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge/DataFreshnessBadge';
import { formatTimestamp } from '../utils/freshness';
import { formatProbability } from '../utils/risk';

export const History: React.FC = () => {
  const { latitude, longitude, locationName } = useLocationStore();
  const [days, setDays] = useState<number>(30);
  const historyQuery = useHistory(latitude, longitude, days);

  const historyItems = historyQuery.data || [];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <HistoryIcon size={22} style={{ color: 'var(--primary-400)' }} /> Prediction History & Risk Trends
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Historical record of model evaluations, time-series hazard shifts, and provenance snapshots for <strong>{locationName}</strong>
          </p>
        </div>
      </div>

      {/* Interactive Time-Series Trend Chart */}
      <RiskTrendChart
        data={historyItems}
        selectedDays={days}
        onDaysChange={(d) => setDays(d)}
        isLoading={historyQuery.isLoading}
      />

      {/* History Table Container */}
      <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Evaluation Snapshots ({historyItems.length})
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Chronological audit log
          </span>
        </div>

        {historyItems.length === 0 && !historyQuery.isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No historical risk data is available for this location.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem' }}>Hazard Type</th>
                <th style={{ padding: '0.75rem' }}>Flood Prob.</th>
                <th style={{ padding: '0.75rem' }}>Landslide Prob.</th>
                <th style={{ padding: '0.75rem' }}>Combined Score</th>
                <th style={{ padding: '0.75rem' }}>Risk Level</th>
                <th style={{ padding: '0.75rem' }}>Model Version</th>
                <th style={{ padding: '0.75rem' }}>Data Mode</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--card-border)',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {formatTimestamp(item.timestamp)}
                  </td>
                  <td style={{ padding: '0.75rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                    {item.hazard}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--primary-400)', fontWeight: 600 }}>
                    {formatProbability(item.flood_probability)}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--risk-high)', fontWeight: 600 }}>
                    {formatProbability(item.landslide_probability)}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    {item.combined_risk}/100
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <RiskBadge level={item.risk_level} size="sm" />
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <code>{item.model_version}</code>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <DataFreshnessBadge mode={item.data_mode} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
