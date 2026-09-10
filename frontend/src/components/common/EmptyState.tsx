import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  minHeight?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  message = 'No observations or records found for the selected spatial region.',
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
        gap: '0.5rem',
      }}
    >
      <Inbox size={32} style={{ color: 'var(--text-muted)' }} />
      <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '320px' }}>{message}</p>
    </div>
  );
};
