import React from 'react';
import { Bell, AlertCircle, Clock, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Alert } from '../../types/api';
import { RiskBadge } from '../RiskCard/RiskBadge';
import { formatTimestamp } from '../../utils/freshness';

interface AlertPanelProps {
  alerts?: Alert[];
  isLoading?: boolean;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  actionLoadingId?: string | null;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  isLoading,
  onAcknowledge,
  onResolve,
  actionLoadingId,
}) => {
  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '1.25rem', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Checking Active Hazard Warnings...</span>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <Bell size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>No Active Hazard Alerts</h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All monitored regions currently report baseline hazard metrics.</span>
      </div>
    );
  }

  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} style={{ color: 'var(--risk-critical)' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hazard Alerts & Warnings ({alerts.length})</h4>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {alerts.map((alert) => {
          const isPendingAction = actionLoadingId === alert.id;

          return (
            <div
              key={alert.id}
              style={{
                backgroundColor: 'var(--bg-dark-800)',
                border: `1px solid ${
                  alert.status === 'RESOLVED'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : alert.severity === 'CRITICAL'
                    ? 'rgba(220, 38, 38, 0.4)'
                    : 'var(--card-border)'
                }`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {/* Alert Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} style={{ color: alert.severity === 'CRITICAL' ? 'var(--risk-critical)' : 'var(--risk-high)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {alert.hazard_type} Warning
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor:
                        alert.status === 'ACTIVE'
                          ? 'var(--risk-critical-bg)'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'rgba(234, 179, 8, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                      color:
                        alert.status === 'ACTIVE'
                          ? 'var(--risk-critical)'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'var(--risk-moderate)'
                          : 'var(--risk-low)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {alert.status}
                  </span>
                </div>
                <RiskBadge level={alert.severity} size="sm" />
              </div>

              {/* Message */}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {alert.message}
              </p>

              {/* Trigger Reason where available */}
              {alert.trigger_reason && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-dark-700)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Trigger Rule:</strong> {alert.trigger_reason}
                </div>
              )}

              {/* Footer Details & Action Affordances */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '0.25rem', borderTop: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> Issued: {formatTimestamp(alert.generated_at)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} /> {alert.latitude.toFixed(3)}°, {alert.longitude.toFixed(3)}°
                  </span>
                </div>

                {/* Acknowledge / Resolve Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {alert.status === 'ACTIVE' && onAcknowledge && (
                    <button
                      type="button"
                      disabled={isPendingAction}
                      onClick={() => onAcknowledge(alert.id)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        color: 'var(--risk-moderate)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <ShieldCheck size={12} /> Acknowledge
                    </button>
                  )}

                  {alert.status !== 'RESOLVED' && onResolve && (
                    <button
                      type="button"
                      disabled={isPendingAction}
                      onClick={() => onResolve(alert.id)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--risk-low)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <CheckCircle2 size={12} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
