import React from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { TrendDirection } from '../../types/risk';

interface RiskTrendProps {
  trend?: TrendDirection;
}

export const RiskTrend: React.FC<RiskTrendProps> = ({ trend = 'STABLE' }) => {
  const getTrendStyle = () => {
    switch (trend) {
      case 'INCREASING':
        return {
          icon: <TrendingUp size={13} style={{ color: 'var(--risk-high)' }} />,
          color: 'var(--risk-high)',
          bg: 'var(--risk-high-bg)',
          border: 'var(--risk-high-border)',
        };
      case 'DECREASING':
        return {
          icon: <TrendingDown size={13} style={{ color: 'var(--risk-low)' }} />,
          color: 'var(--risk-low)',
          bg: 'var(--risk-low-bg)',
          border: 'var(--risk-low-border)',
        };
      case 'STABLE':
        return {
          icon: <Minus size={13} style={{ color: 'var(--text-secondary)' }} />,
          color: 'var(--text-secondary)',
          bg: 'rgba(100, 116, 139, 0.12)',
          border: 'var(--card-border)',
        };
      case 'UNKNOWN':
      default:
        return {
          icon: <HelpCircle size={13} style={{ color: 'var(--text-muted)' }} />,
          color: 'var(--text-muted)',
          bg: 'rgba(100, 116, 139, 0.08)',
          border: 'var(--card-border-subtle)',
        };
    }
  };

  const style = getTrendStyle();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        fontSize: '0.72rem',
        color: style.color,
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
      }}
      title={`Risk Trajectory: ${trend}`}
    >
      {style.icon}
      <span style={{ textTransform: 'capitalize' }}>{trend.toLowerCase()}</span>
    </div>
  );
};
