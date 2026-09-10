import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  minHeight?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Unavailable',
  message = 'Failed to load telemetry or hazard metrics. Please check connection and try again.',
  onRetry,
  minHeight = '180px',
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        padding: '1.5rem',
        textAlign: 'center',
        gap: '0.75rem',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }}
    >
      <AlertTriangle size={32} style={{ color: 'var(--risk-high)' }} />
      <div>
        <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.25rem' }}>{title}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '360px' }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-dark-600)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginTop: '0.25rem',
            border: '1px solid var(--card-border)',
            transition: 'all 150ms ease',
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};
