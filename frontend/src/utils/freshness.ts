import { DataMode } from '../types/risk';

export function formatTimestamp(isoString?: string): string {
  if (!isoString) return 'Unknown';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function getDataModeBadgeDetails(mode?: DataMode): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (mode) {
    case 'LIVE':
      return {
        label: 'LIVE DATA',
        color: 'var(--mode-live)',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
      };
    case 'CACHED':
      return {
        label: 'CACHED DATA',
        color: 'var(--mode-cached)',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      };
    case 'DEMO':
      return {
        label: 'DEMO / OFFLINE',
        color: 'var(--mode-demo)',
        bgColor: 'rgba(139, 92, 246, 0.15)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
      };
    case 'UNAVAILABLE':
    default:
      return {
        label: 'UNAVAILABLE',
        color: 'var(--mode-unavailable)',
        bgColor: 'rgba(100, 116, 139, 0.15)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
      };
  }
}
