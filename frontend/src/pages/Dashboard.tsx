import React, { useState } from 'react';
import { Search, MapPin, AlertCircle, RefreshCw, FileText, AlertTriangle, Leaf, ShieldCheck, BarChart3, Users, Info } from 'lucide-react';
import { useLocationStore } from '../state/locationStore';
import { useModeStore } from '../state/modeStore';
import { usePredict } from '../hooks/usePredict';
import { useWeather } from '../hooks/useWeather';
import { useTerrain } from '../hooks/useTerrain';
import { useSatellite } from '../hooks/useSatellite';
import { useImpact } from '../hooks/useImpact';
import { useAlerts } from '../hooks/useAlerts';
import { Map } from '../components/Map/Map';
import { RiskCard } from '../components/RiskCard/RiskCard';
import { RiskBadge } from '../components/RiskCard/RiskBadge';
import { WeatherCard } from '../components/WeatherCard/WeatherCard';
import { TerrainCard } from '../components/TerrainCard/TerrainCard';
import { SatelliteCard } from '../components/SatelliteCard/SatelliteCard';
import { AlertPanel } from '../components/AlertPanel/AlertPanel';
import { PredictionDetailsModal } from '../components/PredictionDetails/PredictionDetailsModal';
import { validateCoordinates } from '../utils/coordinates';
import { LocationPreset } from '../types/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Alert } from '../types/api';

const PRESET_LOCATIONS: LocationPreset[] = [
  { name: 'Shimla Ridge', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734, description: 'High landslide & heavy rainfall vulnerability zone' },
  { name: 'Joshimath', state: 'Uttarakhand', latitude: 30.5562, longitude: 79.5647, description: 'Critical slope subsidence & landslide prone sector' },
  { name: 'Wayanad', state: 'Kerala', latitude: 11.6854, longitude: 76.1320, description: 'Heavy monsoon flash flood & debris flow region' },
  { name: 'Darjeeling', state: 'West Bengal', latitude: 27.0410, longitude: 88.2663, description: 'Steep terrain hillside instability area' },
];

export const Dashboard: React.FC = () => {
  const { latitude, longitude, setLocation } = useLocationStore();
  const { setMode } = useModeStore();
  const queryClient = useQueryClient();

  const [latInput, setLatInput] = useState(latitude.toString());
  const [lonInput, setLonInput] = useState(longitude.toString());
  const [inputError, setInputError] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Queries
  const predictQuery = usePredict({ latitude, longitude, hazard: 'dual' });
  const weatherQuery = useWeather(latitude, longitude);
  const terrainQuery = useTerrain(latitude, longitude);
  const satelliteQuery = useSatellite(latitude, longitude);
  const impactQuery = useImpact(latitude, longitude);
  const alertsQuery = useAlerts();

  const explanationQuery = useQuery({
    queryKey: ['explanation', predictQuery.data?.prediction_id || 'active', latitude, longitude],
    queryFn: () => apiService.getExplanation(predictQuery.data?.prediction_id || 'pred_active_01'),
    enabled: isDetailsOpen || !!predictQuery.data,
  });

  const handleCoordinateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(latInput);
    const lonNum = parseFloat(lonInput);
    const validation = validateCoordinates(latNum, lonNum);

    if (!validation.isValid) {
      setInputError(validation.error || 'Invalid coordinates');
      return;
    }

    setInputError(null);
    setLocation({ latitude: latNum, longitude: lonNum });
  };

  const handlePresetSelect = (preset: LocationPreset) => {
    setLatInput(preset.latitude.toString());
    setLonInput(preset.longitude.toString());
    setInputError(null);
    setLocation({ latitude: preset.latitude, longitude: preset.longitude }, `${preset.name}, ${preset.state}`);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      setActionLoadingId(alertId);
      await apiService.acknowledgeAlert(alertId);
      queryClient.setQueryData<Alert[]>(['alerts'], (old = []) =>
        old.map((a) =>
          a.id === alertId
            ? { ...a, status: 'ACKNOWLEDGED', acknowledged: true, acknowledged_at: new Date().toISOString() }
            : a
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      setActionLoadingId(alertId);
      await apiService.resolveAlert(alertId);
      queryClient.setQueryData<Alert[]>(['alerts'], (old = []) =>
        old.map((a) =>
          a.id === alertId
            ? { ...a, status: 'RESOLVED', resolved_at: new Date().toISOString() }
            : a
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const dualData = predictQuery.data;

  return (
    <div className="page-content">
      {/* Error state if backend fails */}
      {predictQuery.isError && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            borderLeft: '4px solid var(--risk-critical)',
            backgroundColor: 'rgba(220, 38, 38, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} style={{ color: 'var(--risk-critical)' }} />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--risk-critical)' }}>
                Prediction Service Unavailable
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {predictQuery.error?.message || 'The backend ML prediction service did not respond. Ensure FastAPI is running on http://localhost:8000.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => predictQuery.refetch()}
              className="intel-btn intel-btn-secondary"
            >
              <RefreshCw size={14} /> Retry Request
            </button>
            <button
              onClick={() => setMode('DEMO')}
              className="intel-btn intel-btn-primary"
            >
              Switch to Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* Executive Command Hero Panel with Mountain Landscape Backdrop */}
      <section
        style={{
          position: 'relative',
          padding: '2.5rem 1.5rem 2rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#FFFFFF',
          backgroundImage: "url('/assets/mountain-bg.jpg')",
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* Hero Top Title & Purpose Statement */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                MULTI-HAZARD FUSION TELEMETRY
              </span>
              <span style={{ width: '32px', height: '2px', backgroundColor: 'var(--primary-600)', borderRadius: '2px' }} />
            </div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Spatial Early Warning & <span style={{ color: 'var(--primary-700)' }}>Decision Support</span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>
              Integrated risk intelligence for flood and landslide hazards.
            </p>
          </div>

          {/* Environmental Mission Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--card-border)',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>Safer Communities</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-700)', fontWeight: 600, fontStyle: 'italic' }}>Stronger Tomorrows</div>
            </div>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={14} style={{ color: 'var(--primary-700)' }} />
            </div>
          </div>
        </div>

        {/* Unified Main Hazard Summary Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--card-border)',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* 3-Column Metric, Search, and Action Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 1.2fr) minmax(320px, 1.6fr) auto',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            {/* Col 1: National Hazard Score Readout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderRight: '1px solid var(--card-border-subtle)', paddingRight: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                <BarChart3 size={18} style={{ color: 'var(--primary-600)' }} />
                <span>NATIONAL HAZARD SCORE</span>
                <Info size={13} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }} className="tabular-nums">
                    {dualData ? dualData.combined_risk : '--'}
                  </span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', fontWeight: 600 }}>/100</span>
                </div>
                {dualData && <RiskBadge level={dualData.combined_risk_level} size="md" />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} style={{ color: 'var(--primary-600)' }} />
                  <span>Target: <strong style={{ color: 'var(--text-primary)' }}>{latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E</strong></span>
                </div>
                {/* Mini Telemetry Spark Bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
                  {[4, 7, 5, 9, 12, 8, 11].map((h, i) => (
                    <span key={i} style={{ width: '3px', height: `${h}px`, backgroundColor: i >= 5 ? 'var(--hazard-landslide)' : 'var(--primary-300)', borderRadius: '1px' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2: Coordinate Target Evaluation Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                <MapPin size={13} style={{ color: 'var(--primary-600)' }} />
                <span>COORDINATE EVALUATION TARGET</span>
              </div>
              <form onSubmit={handleCoordinateSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FFFFFF', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lat:</span>
                  <input
                    type="number"
                    step="any"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className="tabular-nums"
                    style={{ width: '85px', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}
                    placeholder="31.1048"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FFFFFF', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lon:</span>
                  <input
                    type="number"
                    step="any"
                    value={lonInput}
                    onChange={(e) => setLonInput(e.target.value)}
                    className="tabular-nums"
                    style={{ width: '85px', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}
                    placeholder="77.1734"
                  />
                </div>

                <button
                  type="submit"
                  className="intel-btn intel-btn-primary"
                  style={{ padding: '0.5rem 1.15rem' }}
                >
                  <Search size={14} /> Evaluate Risk
                </button>
              </form>
              {inputError && (
                <div style={{ color: 'var(--risk-high)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={13} /> {inputError}
                </div>
              )}
            </div>

            {/* Col 3: Secondary Audit & Refresh Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', borderLeft: '1px solid var(--card-border-subtle)', paddingLeft: '1.25rem' }}>
              <button
                onClick={() => setIsDetailsOpen(true)}
                className="intel-btn intel-btn-secondary"
                style={{ width: '100%', whiteSpace: 'nowrap' }}
              >
                <FileText size={14} /> Audit Prediction Details
              </button>
              <button
                onClick={() => predictQuery.refetch()}
                className="intel-btn intel-btn-secondary"
                style={{ width: '100%', whiteSpace: 'nowrap' }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Bottom Presets Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              HIGH-VULNERABILITY BENCHMARKS:
            </span>
            {PRESET_LOCATIONS.map((preset) => {
              const isMatch = Math.abs(latitude - preset.latitude) < 0.001 && Math.abs(longitude - preset.longitude) < 0.001;
              return (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  title={preset.description}
                  className="intel-btn"
                  style={{
                    padding: '0.3rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.76rem',
                    fontWeight: isMatch ? 700 : 500,
                    border: `1px solid ${isMatch ? 'var(--primary-600)' : 'var(--card-border)'}`,
                    color: isMatch ? 'var(--primary-700)' : 'var(--text-secondary)',
                    backgroundColor: isMatch ? 'var(--primary-100)' : '#FFFFFF',
                    boxShadow: isMatch ? '0 1px 4px rgba(22, 163, 74, 0.15)' : 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {preset.name} ({preset.state})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Workspace Grid: Map on Left + Hazard Branches on Right */}
      <section className="responsive-dashboard-grid">
        {/* Left Column: Interactive Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary-600)' }}>🗺️</span> Spatial Risk & Exposure Matrix
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Click map to select evaluation coordinates
            </span>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)' }}>
            <Map predictionData={dualData} impactData={impactQuery.data} height="520px" />
            {/* Map Legend Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.65rem 0.5rem 0.2rem 0.5rem', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--risk-low)' }} /> Low Risk
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--risk-moderate)' }} /> Moderate
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--risk-high)' }} /> High Risk
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--risk-critical)' }} /> Critical
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Hazard Branches & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ color: 'var(--primary-600)' }}>🧬</span> Dual-Hazard Telemetry Branches
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Hydrological & Geotechnical Analysis
            </span>
          </div>

          {dualData ? (
            <div className="responsive-2col" style={{ gap: '1rem' }}>
              <RiskCard data={dualData.flood} title="Flood Hazard Branch" />
              <RiskCard data={dualData.landslide} title="Landslide Hazard Branch" />
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <span>{predictQuery.isLoading ? 'Evaluating hazard probabilities...' : 'No prediction data available.'}</span>
            </div>
          )}

          <AlertPanel
            alerts={alertsQuery.data}
            isLoading={alertsQuery.isLoading}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            actionLoadingId={actionLoadingId}
          />
        </div>
      </section>

      {/* Environmental Telemetry Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Real-Time Environmental & Sensor Telemetry
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Atmospheric, Topographic, and Satellite Observational Feeds
          </span>
        </div>
        <div className="responsive-3col">
          <WeatherCard data={weatherQuery.data} isLoading={weatherQuery.isLoading} />
          <TerrainCard data={terrainQuery.data} isLoading={terrainQuery.isLoading} />
          <SatelliteCard data={satelliteQuery.data} isLoading={satelliteQuery.isLoading} />
        </div>
      </section>

      {/* Environmental & Societal Value Pillars Banner matching Reference Image */}
      <section
        style={{
          padding: '1.35rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr)) 1.2fr',
          alignItems: 'center',
          gap: '1.25rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-700)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>Safer Regions</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Through Early Warnings</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-cyan)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>Smarter Decisions</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>With Data Intelligence</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-cyan)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>Resilient Communities</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>For a Safer Tomorrow</p>
          </div>
        </div>

        <div style={{ textAlign: 'right', borderLeft: '1px solid var(--card-border-subtle)', paddingLeft: '1.25rem' }}>
          <div style={{ fontStyle: 'italic', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            &ldquo;From Risk Insight to Real-World Impact&rdquo;
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            PRITHVI AI &nbsp;|&nbsp; NATIONAL INTEL
          </div>
        </div>
      </section>

      {/* Central Community Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
        <span style={{ width: '40px', height: '1px', backgroundColor: 'var(--card-border)' }} />
        <span>PEOPLE &nbsp;•&nbsp; PLACES &nbsp;•&nbsp; A SAFER TOMORROW</span>
        <span style={{ width: '40px', height: '1px', backgroundColor: 'var(--card-border)' }} />
      </div>

      {/* Prediction Details Modal */}
      <PredictionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        dualData={dualData}
        explanationData={explanationQuery.data}
        impactData={impactQuery.data}
        alerts={alertsQuery.data}
      />
    </div>
  );
};
