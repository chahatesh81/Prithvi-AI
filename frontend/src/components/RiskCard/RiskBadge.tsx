import React from 'react';
import { RiskLevel } from '../../types/risk';
import { getRiskLevelDetails } from '../../utils/risk';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const details = getRiskLevelDetails(level);

  const sizeStyles = {
    sm: { padding: '0.15rem 0.5rem', fontSize: '0.7rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.8rem' },
    lg: { padding: '0.4rem 1rem', fontSize: '0.9rem' },
  }[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: details.bgColor,
        border: `1px solid ${details.borderColor}`,
        color: details.color,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        ...sizeStyles,
      }}
    >
      <span
        style={{
          width: size === 'lg' ? '8px' : '6px',
          height: size === 'lg' ? '8px' : '6px',
          borderRadius: '50%',
          backgroundColor: details.color,
        }}
      />
      {details.label}
    </span>
  );
};
