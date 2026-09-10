import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AlertPanel } from '../../src/components/AlertPanel/AlertPanel';
import { Alert } from '../../src/types/api';

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-101',
    hazard_type: 'flood',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    message: 'Extreme flash flood danger in low-lying riparian sectors.',
    latitude: 31.1048,
    longitude: 77.1734,
    generated_at: '2026-09-10T11:00:00Z',
    trigger_reason: 'Rainfall intensity > 50mm/h with soil moisture saturation > 85%',
  },
  {
    id: 'alert-102',
    hazard_type: 'landslide',
    severity: 'HIGH',
    status: 'ACKNOWLEDGED',
    message: 'Slope instability detected along hillside corridor.',
    latitude: 31.0500,
    longitude: 77.1500,
    generated_at: '2026-09-10T10:30:00Z',
    trigger_reason: 'Steep slope gradient > 42° combined with antecedent precipitation',
    acknowledged: true,
    acknowledged_by: 'Authorized Response Officer',
  },
  {
    id: 'alert-103',
    hazard_type: 'dual',
    severity: 'MODERATE',
    status: 'RESOLVED',
    message: 'Coincident hazard warning resolved following weather clearance.',
    latitude: 30.9500,
    longitude: 77.1000,
    generated_at: '2026-09-10T08:00:00Z',
    resolved_at: '2026-09-10T09:30:00Z',
  },
];

describe('AlertPanel Advanced Component', () => {
  it('renders loading state when isLoading is true', () => {
    render(<AlertPanel isLoading={true} />);
    expect(screen.getByText(/checking active hazard warnings/i)).toBeInTheDocument();
  });

  it('renders empty message when no alerts are present', () => {
    render(<AlertPanel alerts={[]} />);
    expect(screen.getByText(/no active hazard alerts/i)).toBeInTheDocument();
  });

  it('renders alerts with statuses and trigger rules', () => {
    render(<AlertPanel alerts={MOCK_ALERTS} />);
    expect(screen.getByText(/Hazard Alerts & Warnings \(3\)/i)).toBeInTheDocument();

    // Verify statuses
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('ACKNOWLEDGED')).toBeInTheDocument();
    expect(screen.getByText('RESOLVED')).toBeInTheDocument();

    // Verify trigger rule
    expect(screen.getByText(/Rainfall intensity > 50mm\/h/i)).toBeInTheDocument();
  });

  it('fires onAcknowledge and onResolve when buttons are clicked', () => {
    const handleAcknowledge = vi.fn();
    const handleResolve = vi.fn();

    render(
      <AlertPanel
        alerts={MOCK_ALERTS}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    );

    // Active alert has an Acknowledge button
    const ackButtons = screen.getAllByRole('button', { name: /acknowledge/i });
    expect(ackButtons.length).toBe(1);
    fireEvent.click(ackButtons[0]);
    expect(handleAcknowledge).toHaveBeenCalledWith('alert-101');

    // Active and Acknowledged alerts have Resolve buttons (alert-101 and alert-102)
    const resolveButtons = screen.getAllByRole('button', { name: /resolve/i });
    expect(resolveButtons.length).toBe(2);
    fireEvent.click(resolveButtons[0]);
    expect(handleResolve).toHaveBeenCalledWith('alert-101');
  });
});
