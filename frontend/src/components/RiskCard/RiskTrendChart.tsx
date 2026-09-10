import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, AlertCircle } from 'lucide-react';
import { PredictionHistoryItem } from '../../types/api';
import { formatTimestamp } from '../../utils/freshness';

interface RiskTrendChartProps {
  data?: PredictionHistoryItem[];
  selectedDays?: number;
  onDaysChange?: (days: number) => void;
  isLoading?: boolean;
}

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({
  data = [],
  selectedDays = 30,
  onDaysChange,
  isLoading = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading Historical Risk Telemetry...</span>
      </div>
    );
  }

  // Insufficient data handling (strictly as requested: "Insufficient historical data")
  if (!data || data.length < 2) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          minHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        <AlertCircle size={24} style={{ color: 'var(--text-muted)' }} />
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Insufficient Historical Data
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '340px' }}>
          At least two historical prediction observations are required to calculate hazard acceleration trends.
        </p>
      </div>
    );
  }

  // Sort chronological
  const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Determine overall trend direction
  const firstScore = sortedData[0].combined_risk;
  const lastScore = sortedData[sortedData.length - 1].combined_risk;
  const delta = lastScore - firstScore;
  const trend = delta > 3 ? 'INCREASING' : delta < -3 ? 'DECREASING' : 'STABLE';

  // Dimensions for responsive SVG
  const width = 800;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (sortedData.length - 1)) * chartW;
  const getY = (val: number) => paddingTop + chartH - (val / 100) * chartH;

  // Generate SVG path points
  const combinedPoints = sortedData.map((d, i) => `${getX(i)},${getY(d.combined_risk)}`).join(' ');
  const floodPoints = sortedData.map((d, i) => `${getX(i)},${getY(Math.round(d.flood_probability * 100))}`).join(' ');
  const landslidePoints = sortedData.map((d, i) => `${getX(i)},${getY(Math.round(d.landslide_probability * 100))}`).join(' ');

  const hoveredItem = hoveredIndex !== null ? sortedData[hoveredIndex] : null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Header & Range Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Historical Risk Trajectory & Trend Analysis
            </h3>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: trend === 'INCREASING' ? 'var(--risk-high-bg)' : trend === 'DECREASING' ? 'var(--risk-low-bg)' : 'var(--bg-dark-700)',
                color: trend === 'INCREASING' ? 'var(--risk-high)' : trend === 'DECREASING' ? 'var(--risk-low)' : 'var(--text-secondary)',
                border: `1px solid ${trend === 'INCREASING' ? 'var(--risk-high-border)' : trend === 'DECREASING' ? 'var(--risk-low-border)' : 'var(--card-border)'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              {trend === 'INCREASING' ? <TrendingUp size={12} /> : trend === 'DECREASING' ? <TrendingDown size={12} /> : <Minus size={12} />}
              Risk {trend.charAt(0) + trend.slice(1).toLowerCase()}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Comparing Flood, Landslide, and Combined Fusion trajectories over time
          </span>
        </div>

        {/* Range Selector */}
        {onDaysChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--bg-dark-800)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
            {[
              { label: '24 Hours', days: 1 },
              { label: '7 Days', days: 7 },
              { label: '30 Days', days: 30 },
            ].map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => onDaysChange(option.days)}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: selectedDays === option.days ? 'var(--primary-600)' : 'transparent',
                  color: selectedDays === option.days ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 150ms ease',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Time Series Chart */}
      <div style={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Horizontal Grid lines at 25, 50, 75, 100 */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--card-border)"
                  strokeDasharray="2, 2"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-sans)"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Lines: Flood (Blue), Landslide (Orange), Combined (White/Highlighted) */}
          <polyline
            fill="none"
            stroke="var(--primary-400)"
            strokeWidth="2"
            strokeDasharray="4, 2"
            points={floodPoints}
          />
          <polyline
            fill="none"
            stroke="var(--risk-high)"
            strokeWidth="2"
            strokeDasharray="4, 2"
            points={landslidePoints}
          />
          <polyline
            fill="none"
            stroke="#f8fafc"
            strokeWidth="3"
            points={combinedPoints}
          />

          {/* Interactive Data Points */}
          {sortedData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.combined_risk);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={d.id}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Invisible hover target */}
                <circle cx={x} cy={y} r={14} fill="transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? 'var(--primary-400)' : '#f8fafc'}
                  stroke="var(--bg-dark-900)"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredItem && hoveredIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              backgroundColor: 'var(--bg-dark-800)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
              {formatTimestamp(hoveredItem.timestamp)}
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Combined Risk:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{hoveredItem.combined_risk}/100</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary-400)' }}>Flood Probability:</span>
              <span>{Math.round(hoveredItem.flood_probability * 100)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ color: 'var(--risk-high)' }}>Landslide Probability:</span>
              <span>{Math.round(hoveredItem.landslide_probability * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#f8fafc', display: 'inline-block' }} />
          <span>Combined Fusion Risk (0-100)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '2px', backgroundColor: 'var(--primary-400)', borderStyle: 'dashed', display: 'inline-block' }} />
          <span>Flood Probability %</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '2px', backgroundColor: 'var(--risk-high)', borderStyle: 'dashed', display: 'inline-block' }} />
          <span>Landslide Probability %</span>
        </div>
      </div>
    </div>
  );
};
