import React from 'react';
import { Waves, Mountain } from 'lucide-react';
import { RiskResult } from '../../types/risk';
import { RiskBadge } from './RiskBadge';
import { RiskTrend } from './RiskTrend';
import { DataFreshnessBadge } from '../DataFreshnessBadge/DataFreshnessBadge';
import { formatProbability, formatRiskScore } from '../../utils/risk';
import { formatTimestamp } from '../../utils/freshness';

interface RiskCardProps {
  data: RiskResult;
  title?: string;
}

export const RiskCard: React.FC<RiskCardProps> = ({ data, title }) => {
  const isFlood = data.hazard === 'flood';
  const Icon = isFlood ? Waves : Mountain;
  const primaryColor = isFlood ? 'var(--hazard-flood)' : 'var(--hazard-landslide)';
  const badgeBg = isFlood ? 'var(--hazard-flood-bg)' : 'var(--hazard-landslide-bg)';
  const borderAccent = isFlood ? 'var(--hazard-flood-border)' : 'var(--hazard-landslide-border)';

  // Deterministically compute 8 bar heights based strictly on existing risk_score, probability, and trend
  const score = Math.max(5, Math.min(95, data.risk_score || data.probability * 100 || 50));
  const trendFactor = data.trend === 'INCREASING' ? 1 : data.trend === 'DECREASING' ? -1 : 0;

  const barCount = 8;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const progress = i / (barCount - 1);
    const progression = trendFactor === 1 
      ? 0.55 + 0.45 * progress 
      : trendFactor === -1 
      ? 1.0 - 0.45 * progress 
      : 0.85 + 0.15 * Math.sin(i * 1.5);
    const val = Math.round(score * progression);
    return Math.max(12, Math.min(95, val));
  });

  const chartW = 260;
  const chartH = 54;
  const barW = 12;
  const barGap = (chartW - (barCount * barW)) / (barCount - 1);

  // Generate smooth cubic bezier area curve over existing data points
  const points = bars.map((b, i) => {
    const x = i * (barW + barGap) + barW / 2;
    const y = chartH - (b / 100) * (chartH - 8);
    return { x, y };
  });

  let curveD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    curveD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaD = `${curveD} L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z`;

  return (
    <div
      className="glass-panel glass-panel-hover equal-height-card"
      style={{
        padding: '1.25rem',
        position: 'relative',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--card-border)',
        borderTop: `3px solid ${primaryColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: badgeBg,
              border: `1px solid ${borderAccent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: primaryColor,
            }}
          >
            <Icon size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, letterSpacing: '0.06em' }}>
                {isFlood ? 'Hydrological Branch' : 'Geotechnical Branch'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {title || `${data.hazard} Hazard Branch`}
            </h3>
          </div>
        </div>

        <RiskBadge level={data.risk_level} />
      </div>

      {/* Main Score & Probability Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          backgroundColor: '#F8FAFC',
          padding: '0.9rem 1.15rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--card-border)',
          marginBottom: '1rem',
        }}
      >
        {/* Risk Score */}
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Risk Score (0-100)
          </span>
          <div className="tabular-nums" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
            {formatRiskScore(data.risk_score)}
          </div>
        </div>

        {/* Branch Probability */}
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Branch Probability
          </span>
          <div className="tabular-nums" style={{ fontSize: '1.85rem', fontWeight: 800, color: primaryColor, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
            {formatProbability(data.probability)}
          </div>
        </div>
      </div>

      {/* Visual Telemetry Chart (Bars + Smooth Line Area) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 0.85rem 0.5rem 0.85rem',
          marginBottom: '0.85rem',
        }}
      >
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          style={{ width: '100%', height: '54px', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`areaGrad-${data.hazard}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill Under Curve */}
          <path d={areaD} fill={`url(#areaGrad-${data.hazard})`} />

          {/* Vertical Bars */}
          {bars.map((h, idx) => {
            const bx = idx * (barW + barGap);
            const bh = (h / 100) * (chartH - 10);
            const by = chartH - bh;
            return (
              <rect
                key={idx}
                x={bx}
                y={by}
                width={barW}
                height={bh}
                rx={2}
                fill={primaryColor}
                fillOpacity={0.35 + (idx / barCount) * 0.45}
              />
            );
          })}

          {/* Smooth Trend Line */}
          <path d={curveD} fill="none" stroke={primaryColor} strokeWidth={2} strokeLinecap="round" />
        </svg>

        {/* Telemetry Metric Subtitle */}
        <div
          style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '0.4rem',
            fontWeight: 500,
          }}
        >
          {isFlood
            ? 'Rising river levels • Precipitation • Runoff'
            : 'Terrain instability • Soil moisture • Slope analysis'}
        </div>
      </div>

      {/* Telemetry Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
          borderTop: '1px solid var(--card-border)',
          paddingTop: '0.75rem',
          marginTop: 'auto',
        }}
      >
        {/* Trend & Data Freshness Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <RiskTrend trend={data.trend} />
          <DataFreshnessBadge mode={data.data_mode} />
        </div>

        {/* Model Identifier & Observation Timestamp Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-dim)' }}>
              Model:
            </span>
            <code
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
                backgroundColor: '#F8FAFC',
                padding: '0.1rem 0.35rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--card-border)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {data.model_version || 'v1.0'}
            </code>
          </div>

          <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {formatTimestamp(data.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};
