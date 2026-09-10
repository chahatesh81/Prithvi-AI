import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhatIfSimulator } from '../../src/components/Simulator/WhatIfSimulator';
import { useModeStore } from '../../src/state/modeStore';
import { useLocationStore } from '../../src/state/locationStore';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('WhatIfSimulator Component', () => {
  beforeEach(() => {
    useModeStore.getState().setMode('DEMO');
    useLocationStore.getState().setLocation({ latitude: 31.1048, longitude: 77.1734 }, 'Shimla Central Hub');
  });

  it('renders simulator header, location, and control sliders', () => {
    renderWithClient(<WhatIfSimulator />);

    expect(screen.getByText(/dual-hazard what-if scenario simulator/i)).toBeInTheDocument();
    expect(screen.getByText('Simulation Mode')).toBeInTheDocument();
    expect(screen.getByText(/Shimla Central Hub/i)).toBeInTheDocument();

    // Check slider labels
    expect(screen.getByText(/rainfall volume anomaly/i)).toBeInTheDocument();
    expect(screen.getByText(/peak precipitation intensity/i)).toBeInTheDocument();
    expect(screen.getByText(/precipitation event duration/i)).toBeInTheDocument();
    expect(screen.getByText(/antecedent soil moisture anomaly/i)).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole('button', { name: /run what-if simulation/i })).toBeInTheDocument();
  });

  it('allows adjusting sliders and resets on Reset Controls click', () => {
    renderWithClient(<WhatIfSimulator />);

    const resetBtn = screen.getByRole('button', { name: /reset controls/i });
    fireEvent.click(resetBtn);

    // After reset, configured scenario summary shows +0% rainfall
    expect(screen.getByText(/simulating \+0% rainfall/i)).toBeInTheDocument();
  });

  it('triggers simulation and displays baseline vs scenario comparison', async () => {
    renderWithClient(<WhatIfSimulator />);

    const runBtn = screen.getByRole('button', { name: /run what-if simulation/i });
    fireEvent.click(runBtn);

    // Expect simulation comparison card to render
    await waitFor(() => {
      expect(screen.getByText('Baseline vs. Scenario Comparison')).toBeInTheDocument();
    });

    expect(screen.getByText(/observed baseline/i)).toBeInTheDocument();
    expect(screen.getByText(/scenario projection/i)).toBeInTheDocument();
    expect(screen.getByText(/what-if scenario:/i)).toBeInTheDocument();
    expect(screen.getByText(/risk change:/i)).toBeInTheDocument();
    expect(screen.getByText(/flood branch probability shift/i)).toBeInTheDocument();
  });
});
