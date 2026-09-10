import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { RiskTrendChart } from '../../src/components/RiskCard/RiskTrendChart';
import { PredictionHistoryItem } from '../../src/types/api';

const MOCK_HISTORY: PredictionHistoryItem[] = [
  {
    id: 'pred-1',
    timestamp: '2026-09-08T10:00:00Z',
    latitude: 31.1048,
    longitude: 77.1734,
    hazard: 'dual',
    model_version: 'v1.0',
    flood_probability: 0.35,
    landslide_probability: 0.42,
    combined_risk: 38,
    risk_level: 'MODERATE',
    data_mode: 'DEMO',
  },
  {
    id: 'pred-2',
    timestamp: '2026-09-09T10:00:00Z',
    latitude: 31.1048,
    longitude: 77.1734,
    hazard: 'dual',
    model_version: 'v1.0',
    flood_probability: 0.65,
    landslide_probability: 0.7,
    combined_risk: 68,
    risk_level: 'VERY_HIGH',
    data_mode: 'DEMO',
  },
  {
    id: 'pred-3',
    timestamp: '2026-09-10T10:00:00Z',
    latitude: 31.1048,
    longitude: 77.1734,
    hazard: 'dual',
    model_version: 'v1.0',
    flood_probability: 0.8,
    landslide_probability: 0.85,
    combined_risk: 82,
    risk_level: 'CRITICAL',
    data_mode: 'DEMO',
  },
];

describe('RiskTrendChart Component', () => {
  it('renders loading state correctly', () => {
    render(<RiskTrendChart isLoading={true} />);
    expect(screen.getByText(/loading historical risk telemetry/i)).toBeInTheDocument();
  });

  it('renders "Insufficient historical data" when data has fewer than 2 records', () => {
    const { rerender } = render(<RiskTrendChart data={[]} />);
    expect(screen.getByText(/insufficient historical data/i)).toBeInTheDocument();

    rerender(<RiskTrendChart data={[MOCK_HISTORY[0]]} />);
    expect(screen.getByText(/insufficient historical data/i)).toBeInTheDocument();
  });

  it('renders historical risk trend line chart with 2 or more records', () => {
    render(<RiskTrendChart data={MOCK_HISTORY} selectedDays={30} />);
    expect(screen.getByText(/historical risk trajectory/i)).toBeInTheDocument();
    expect(screen.getByText(/combined fusion risk/i)).toBeInTheDocument();
    expect(screen.getByText(/flood probability %/i)).toBeInTheDocument();
    expect(screen.getByText(/landslide probability %/i)).toBeInTheDocument();
  });

  it('allows switching time windows (24h, 7d, 30d)', () => {
    const onDaysChange = vi.fn();
    render(<RiskTrendChart data={MOCK_HISTORY} selectedDays={30} onDaysChange={onDaysChange} />);

    const button7d = screen.getByRole('button', { name: '7 Days' });
    fireEvent.click(button7d);
    expect(onDaysChange).toHaveBeenCalledWith(7);

    const button24h = screen.getByRole('button', { name: '24 Hours' });
    fireEvent.click(button24h);
    expect(onDaysChange).toHaveBeenCalledWith(1);
  });
});
