import { RiskLevel } from '../types/risk';

export function getRiskLevelDetails(level: RiskLevel): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (level) {
    case 'LOW':
      return {
        label: 'Low Risk',
        color: 'var(--risk-low)',
        bgColor: 'var(--risk-low-bg)',
        borderColor: 'var(--risk-low-border)',
      };
    case 'MODERATE':
      return {
        label: 'Moderate Risk',
        color: 'var(--risk-moderate)',
        bgColor: 'var(--risk-moderate-bg)',
        borderColor: 'var(--risk-moderate-border)',
      };
    case 'HIGH':
      return {
        label: 'High Risk',
        color: 'var(--risk-high)',
        bgColor: 'var(--risk-high-bg)',
        borderColor: 'var(--risk-high-border)',
      };
    case 'VERY_HIGH':
      return {
        label: 'Very High Risk',
        color: 'var(--risk-very-high)',
        bgColor: 'var(--risk-very-high-bg)',
        borderColor: 'var(--risk-very-high-border)',
      };
    case 'CRITICAL':
      return {
        label: 'Critical Risk',
        color: 'var(--risk-critical)',
        bgColor: 'var(--risk-critical-bg)',
        borderColor: 'var(--risk-critical-border)',
      };
    default:
      return {
        label: 'Unknown',
        color: 'var(--text-muted)',
        bgColor: 'rgba(100, 116, 139, 0.15)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
      };
  }
}

export function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}

export function formatRiskScore(score: number): string {
  return `${Math.round(score)}/100`;
}
