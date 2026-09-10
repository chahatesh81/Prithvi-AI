import React, { useState } from 'react';
import { Bell, Filter, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { AlertPanel } from '../components/AlertPanel/AlertPanel';
import { apiService } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from '../types/api';

export const Alerts: React.FC = () => {
  const alertsQuery = useAlerts();
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const rawAlerts: Alert[] = alertsQuery.data || [];

  const handleAcknowledge = async (alertId: string) => {
    try {
      setActionLoadingId(alertId);
      await apiService.acknowledgeAlert(alertId);
      queryClient.setQueryData<Alert[]>(['alerts'], (old = []) =>
        old.map((a) =>
          a.id === alertId
            ? { ...a, status: 'ACKNOWLEDGED', acknowledged: true, acknowledged_at: new Date().toISOString() }
            : a
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      setActionLoadingId(alertId);
      await apiService.resolveAlert(alertId);
      queryClient.setQueryData<Alert[]>(['alerts'], (old = []) =>
        old.map((a) =>
          a.id === alertId
            ? { ...a, status: 'RESOLVED', resolved_at: new Date().toISOString() }
            : a
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAlerts = rawAlerts.filter((a) => {
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={22} style={{ color: 'var(--risk-critical)' }} /> Emergency Alerts & Hazard Warnings
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Real-time hazard warnings emitted by backend rule evaluation and ML threshold triggers
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Status Tab Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-dark-800)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
            {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: statusFilter === st ? 'var(--primary-600)' : 'transparent',
                  color: statusFilter === st ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 150ms ease',
                }}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Severity Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-dark-800)',
                color: 'var(--text-primary)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MODERATE">Moderate Only</option>
            </select>
          </div>
        </div>
      </div>

      <AlertPanel
        alerts={filteredAlerts}
        isLoading={alertsQuery.isLoading}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
        actionLoadingId={actionLoadingId}
      />
    </div>
  );
};
