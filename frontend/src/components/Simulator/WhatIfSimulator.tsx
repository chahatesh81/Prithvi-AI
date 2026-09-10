import React, { useState } from 'react';
import { Sliders, Play, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, Sparkles, MapPin, Info } from 'lucide-react';
import { useLocationStore } from '../../state/locationStore';
import { usePredict } from '../../hooks/usePredict';
import { useSimulation } from '../../hooks/useSimulation';
import { RiskBadge } from '../RiskCard/RiskBadge';
import { formatProbability, formatRiskScore } from '../../utils/risk';
import { formatTimestamp } from '../../utils/freshness';
import { SimulationScenario } from '../../types/simulation';

interface WhatIfSimulatorProps {
  onLocationChange?: (lat: number, lon: number, name?: string) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = () => {
  const { latitude, longitude, locationName } = useLocationStore();
  const baselinePredictQuery = usePredict({ latitude, longitude, hazard: 'dual' });
  const simulationMutation = useSimulation();

  // Scenario variables (only those supported by model/backend contract)
  const [rainfallChange, setRainfallChange] = useState<number>(25); // +25%
  const [rainfallIntensity, setRainfallIntensity] = useState<number>(35); // 35 mm/h
  const [durationHours, setDurationHours] = useState<number>(24); // 24h
  const [soilMoistureChange, setSoilMoistureChange] = useState<number>(15); // +15%

  const baselineData = baselinePredictQuery.data;
  const simulationResult = simulationMutation.data;

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const scenario: SimulationScenario = {
      rainfall_change_percent: rainfallChange,
      rainfall_intensity: rainfallIntensity,
      duration_hours: durationHours,
      soil_moisture_change_percent: soilMoistureChange,
    };

    simulationMutation.mutate({
      latitude,
      longitude,
      scenario,
    });
  };

  const handleResetScenario = () => {
    setRainfallChange(0);
    setRainfallIntensity(20);
    setDurationHours(24);
    setSoilMoistureChange(0);
    simulationMutation.reset();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Simulation Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderLeft: '4px solid var(--accent-purple)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} style={{ color: 'var(--accent-purple)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Dual-Hazard What-If Scenario Simulator
            </h2>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--accent-purple)',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Simulation Mode
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Evaluate hypothetical extreme climate conditions and assess changes in modeled flood and landslide vulnerability for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{locationName}</strong> ({latitude.toFixed(4)}°, {longitude.toFixed(4)}°).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleResetScenario}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              backgroundColor: 'var(--bg-dark-700)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            <RefreshCw size={14} /> Reset Controls
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Results on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Scenario Formulation Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--primary-400)' }} /> Model Scenario Inputs
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Supported Model Variables</span>
          </div>

          <form onSubmit={handleRunSimulation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Control 1: Rainfall Change % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="rainfall-change-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Rainfall Volume Anomaly
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: rainfallChange > 0 ? 'var(--primary-400)' : 'var(--text-secondary)' }}>
                  {rainfallChange > 0 ? `+${rainfallChange}%` : `${rainfallChange}%`}
                </span>
              </div>
              <input
                id="rainfall-change-input"
                type="range"
                min="-50"
                max="100"
                step="5"
                value={rainfallChange}
                onChange={(e) => setRainfallChange(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>-50% (Drought)</span>
                <span>0% (Baseline)</span>
                <span>+100% (Extreme Monsoon)</span>
              </div>
            </div>

            {/* Control 2: Rainfall Intensity (mm/h) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="rainfall-intensity-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Peak Precipitation Intensity
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: rainfallIntensity >= 50 ? 'var(--risk-critical)' : rainfallIntensity >= 30 ? 'var(--risk-high)' : 'var(--text-primary)' }}>
                  {rainfallIntensity} mm/h
                </span>
              </div>
              <input
                id="rainfall-intensity-input"
                type="range"
                min="5"
                max="100"
                step="5"
                value={rainfallIntensity}
                onChange={(e) => setRainfallIntensity(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>5 mm/h (Light)</span>
                <span>35 mm/h (Heavy)</span>
                <span>100 mm/h (Cloudburst)</span>
              </div>
            </div>

            {/* Control 3: Duration (Hours) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="duration-hours-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Precipitation Event Duration
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {durationHours} Hours
                </span>
              </div>
              <input
                id="duration-hours-input"
                type="range"
                min="1"
                max="72"
                step="1"
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>1h (Flash Event)</span>
                <span>24h (1 Day)</span>
                <span>72h (3-Day Sustained)</span>
              </div>
            </div>

            {/* Control 4: Soil Moisture Anomaly % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="soil-moisture-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Antecedent Soil Moisture Anomaly
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: soilMoistureChange > 0 ? 'var(--risk-high)' : 'var(--text-secondary)' }}>
                  {soilMoistureChange > 0 ? `+${soilMoistureChange}%` : `${soilMoistureChange}%`}
                </span>
              </div>
              <input
                id="soil-moisture-input"
                type="range"
                min="-30"
                max="50"
                step="5"
                value={soilMoistureChange}
                onChange={(e) => setSoilMoistureChange(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--risk-high)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>-30% (Dry Substrate)</span>
                <span>0% (Normal)</span>
                <span>+50% (Saturated Ground)</span>
              </div>
            </div>

            {/* Scenario Summary Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-dark-800)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
              }}
            >
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                Configured Scenario Hypothesis:
              </strong>
              Simulating {rainfallChange >= 0 ? `+${rainfallChange}%` : `${rainfallChange}%`} rainfall with {rainfallIntensity} mm/h intensity over a {durationHours}-hour window with {soilMoistureChange >= 0 ? `+${soilMoistureChange}%` : `${soilMoistureChange}%`} antecedent soil saturation.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={simulationMutation.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--accent-purple)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 700,
                opacity: simulationMutation.isPending ? 0.7 : 1,
                cursor: simulationMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
            >
              {simulationMutation.isPending ? (
                <>
                  <RefreshCw size={18} className="spin" /> Running Simulation...
                </>
              ) : (
                <>
                  <Play size={18} fill="#fff" /> Run What-If Simulation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Comparative Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Error State */}
          {simulationMutation.isError && (
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderLeft: '4px solid var(--risk-critical)',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--risk-critical)', fontWeight: 700, fontSize: '0.9rem' }}>
                <AlertTriangle size={18} /> Simulation Service Failed
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {simulationMutation.error?.message || 'The simulation endpoint could not be reached. Ensure the FastAPI backend is running.'}
              </p>
            </div>
          )}

          {/* Result Card or Idle Placeholder */}
          {simulationResult ? (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Simulation Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-purple)', fontWeight: 700 }}>
                    Simulation Output
                  </span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    Baseline vs. Scenario Comparison
                  </h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: simulationResult.risk_change > 0 ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                      color: simulationResult.risk_change > 0 ? 'var(--risk-high)' : 'var(--risk-low)',
                      border: `1px solid ${simulationResult.risk_change > 0 ? 'var(--risk-high-border)' : 'var(--risk-low-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {simulationResult.risk_change > 0 ? (
                      <ArrowUpRight size={14} />
                    ) : simulationResult.risk_change < 0 ? (
                      <ArrowDownRight size={14} />
                    ) : (
                      <Minus size={14} />
                    )}
                    Risk Change: {simulationResult.risk_change > 0 ? `+${simulationResult.risk_change}` : simulationResult.risk_change}
                  </span>
                </div>
              </div>

              {/* Explicit Safety Notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  fontSize: '0.72rem',
                  color: 'var(--accent-purple)',
                }}
              >
                <Info size={14} />
                <span>
                  <strong>WHAT-IF SCENARIO:</strong> This modeled projection does not alter baseline observations.
                </span>
              </div>

              {/* Comparative Table / Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Baseline Column */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-dark-800)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    Observed Baseline
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Combined Risk:</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {simulationResult.baseline.risk_score}/100
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Flood Probability:</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                        {formatProbability(simulationResult.baseline.flood_probability)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Landslide Probability:</span>
                      <span style={{ fontWeight: 700, color: 'var(--risk-high)' }}>
                        {formatProbability(simulationResult.baseline.landslide_probability)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Risk Level:</span>
                      <RiskBadge level={simulationResult.baseline.risk_level} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Scenario Column */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-dark-800)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    Scenario Projection
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Combined Risk:</span>
                      <span style={{ fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'var(--font-display)' }}>
                        {simulationResult.scenario.risk_score}/100
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Flood Probability:</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                        {formatProbability(simulationResult.scenario.flood_probability)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Landslide Probability:</span>
                      <span style={{ fontWeight: 700, color: 'var(--risk-high)' }}>
                        {formatProbability(simulationResult.scenario.landslide_probability)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Risk Level:</span>
                      <RiskBadge level={simulationResult.scenario.risk_level} size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Probability Change Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                {/* Flood Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Flood Branch Probability Shift</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                      {formatProbability(simulationResult.baseline.flood_probability)} → {formatProbability(simulationResult.scenario.flood_probability)}
                    </span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-dark-700)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round(simulationResult.scenario.flood_probability * 100)}%`,
                        backgroundColor: 'var(--primary-500)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                </div>

                {/* Landslide Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Landslide Branch Probability Shift</span>
                    <span style={{ fontWeight: 600, color: 'var(--risk-high)' }}>
                      {formatProbability(simulationResult.baseline.landslide_probability)} → {formatProbability(simulationResult.scenario.landslide_probability)}
                    </span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-dark-700)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round(simulationResult.scenario.landslide_probability * 100)}%`,
                        backgroundColor: 'var(--risk-high)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Provenance Metadata */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--card-border)',
                  paddingTop: '0.75rem',
                }}
              >
                <span>Model: <code>{simulationResult.model_versions.flood}</code></span>
                <span>Simulated: {formatTimestamp(simulationResult.scenario_metadata.simulated_at)}</span>
              </div>
            </div>
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                minHeight: '340px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-purple)',
                }}
              >
                <Sliders size={24} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No Simulation Executed Yet
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.4 }}>
                Adjust rainfall volume, intensity, duration, and soil saturation controls on the left, then click <strong>Run What-If Simulation</strong> to evaluate modeled risk deltas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
