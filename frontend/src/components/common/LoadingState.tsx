import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading risk metrics...', minHeight = '200px' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: '0.75rem',
        color: 'var(--text-secondary)',
        padding: '1.5rem',
      }}
    >
      <Loader2 className="spin" size={28} style={{ color: 'var(--primary-500)', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
