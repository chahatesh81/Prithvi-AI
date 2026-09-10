import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { RiskBadge } from '../../src/components/RiskCard/RiskBadge';

describe('RiskBadge Component', () => {
  it('renders LOW risk badge correctly', () => {
    render(<RiskBadge level="LOW" />);
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('renders CRITICAL risk badge correctly', () => {
    render(<RiskBadge level="CRITICAL" />);
    expect(screen.getByText('Critical Risk')).toBeInTheDocument();
  });

  it('renders HIGH risk badge with custom size', () => {
    render(<RiskBadge level="HIGH" size="lg" />);
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });
});
