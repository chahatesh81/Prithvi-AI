import React from 'react';
import { useModeStore } from '../../state/modeStore';
import { getDataModeBadgeDetails } from '../../utils/freshness';
import { DataMode } from '../../types/risk';

interface DataFreshnessBadgeProps {
  mode?: DataMode;
  retrievedAt?: string;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({ mode, retrievedAt }) => {
  const { dataMode } = useModeStore();
  const activeMode = mode || dataMode;
  const details = getDataModeBadgeDetails(activeMode);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.6rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: details.bgColor,
        border: `1px solid ${details.borderColor}`,
        color: details.color,
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
      title={retrievedAt ? `Retrieved: ${new Date(retrievedAt).toLocaleString()}` : undefined}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: details.color,
        }}
      />
      <span>{details.label}</span>
    </div>
  );
};
