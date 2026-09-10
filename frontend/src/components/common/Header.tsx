import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Activity, History, Bell, MapPin, Sliders, Navigation, ToggleLeft, ToggleRight } from 'lucide-react';
import { useLocationStore } from '../../state/locationStore';
import { useModeStore } from '../../state/modeStore';
import { DataFreshnessBadge } from '../DataFreshnessBadge/DataFreshnessBadge';

export const Header: React.FC = () => {
  const { latitude, longitude, locationName, setLocation } = useLocationStore();
  const { dataMode, setMode } = useModeStore();

  const handleShimlaClick = () => {
    setLocation({ latitude: 31.1048, longitude: 77.1734 }, 'Shimla, Himachal Pradesh');
  };

  const handleToggleMode = () => {
    setMode(dataMode === 'LIVE' ? 'DEMO' : 'LIVE');
  };

  return (
    <header
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--card-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.65rem',
          paddingBottom: '0.65rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/assets/logo.png"
            alt="PRITHVI AI Logo"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                PRITHVI AI
              </h1>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', border: '1px solid var(--primary-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                NATIONAL INTEL
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
              Flood + Landslide Decision Support Platform
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-100)' : 'transparent',
              border: isActive ? '1px solid var(--primary-300)' : '1px solid transparent',
              transition: 'all 150ms ease',
            })}
          >
            <LayoutDashboard size={14} style={{ color: 'inherit' }} /> Overview
          </NavLink>

          <NavLink
            to="/risk-center"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-100)' : 'transparent',
              border: isActive ? '1px solid var(--primary-300)' : '1px solid transparent',
              transition: 'all 150ms ease',
            })}
          >
            <Activity size={14} style={{ color: 'inherit' }} /> Risk Center
          </NavLink>

          <NavLink
            to="/simulator"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-100)' : 'transparent',
              border: isActive ? '1px solid var(--primary-300)' : '1px solid transparent',
              transition: 'all 150ms ease',
            })}
          >
            <Sliders size={14} style={{ color: 'inherit' }} /> Simulator
          </NavLink>

          <NavLink
            to="/routes"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-100)' : 'transparent',
              border: isActive ? '1px solid var(--primary-300)' : '1px solid transparent',
              transition: 'all 150ms ease',
            })}
          >
            <Navigation size={14} style={{ color: 'inherit' }} /> Routes
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-100)' : 'transparent',
              border: isActive ? '1px solid var(--primary-300)' : '1px solid transparent',
              transition: 'all 150ms ease',
            })}
          >
            <History size={14} style={{ color: 'inherit' }} /> History
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-100)' : 'transparent',
              border: isActive ? '1px solid var(--primary-300)' : '1px solid transparent',
              transition: 'all 150ms ease',
            })}
          >
            <Bell size={14} style={{ color: 'inherit' }} /> Alerts
          </NavLink>
        </nav>

        {/* Right Controls: Mode Toggle & Location Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Mode Toggle Button */}
          <button
            onClick={handleToggleMode}
            title={`Click to switch to ${dataMode === 'LIVE' ? 'Demo Mode' : 'Live Mode'}`}
            className="intel-btn"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: dataMode === 'LIVE' ? 'var(--primary-100)' : 'var(--accent-cyan-bg)',
              border: `1px solid ${dataMode === 'LIVE' ? 'var(--primary-300)' : 'var(--accent-cyan-border)'}`,
              color: dataMode === 'LIVE' ? 'var(--primary-700)' : 'var(--accent-cyan)',
            }}
          >
            {dataMode === 'LIVE' ? (
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--primary-600)', display: 'inline-block' }} className="beacon-pulse" />
            ) : (
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', display: 'inline-block' }} />
            )}
            <span>{dataMode === 'LIVE' ? 'LIVE DATA' : 'DEMO MODE'}</span>
          </button>

          {/* Selected Location Pill */}
          <button
            onClick={handleShimlaClick}
            title="Click to reset to Shimla benchmark scenario"
            className="intel-btn intel-btn-secondary"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.76rem',
              color: 'var(--text-primary)',
              backgroundColor: '#FFFFFF',
              borderColor: 'var(--card-border)',
            }}
          >
            <MapPin size={13} style={{ color: 'var(--primary-600)' }} />
            <span>{locationName}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} className="tabular-nums">
              ({latitude.toFixed(2)}°, {longitude.toFixed(2)}°)
            </span>
          </button>

          <DataFreshnessBadge />
        </div>
      </div>
    </header>
  );
};
