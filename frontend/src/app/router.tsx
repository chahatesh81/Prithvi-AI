import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { DemoModeBanner } from '../components/DemoModeBanner/DemoModeBanner';
import { Dashboard } from '../pages/Dashboard';
import { RiskCenter } from '../pages/RiskCenter';
import { History } from '../pages/History';
import { Alerts } from '../pages/Alerts';
import { Simulator } from '../pages/Simulator';
import { Routes as RoutesPage } from '../pages/Routes';

const AppLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <DemoModeBanner />
      <Header />
      <main style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <div className="app-container">
          <Outlet />
        </div>
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--card-border)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div
          className="app-container"
          style={{
            paddingTop: '1.25rem',
            paddingBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/assets/logo.png" alt="PRITHVI AI" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
            <span>&copy; {new Date().getFullYear()} Prithvi AI. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <span style={{ cursor: 'pointer' }}>About</span>
            <span style={{ color: 'var(--card-border)' }}>|</span>
            <span style={{ cursor: 'pointer' }}>Documentation</span>
            <span style={{ color: 'var(--card-border)' }}>|</span>
            <span style={{ cursor: 'pointer' }}>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="risk-center" element={<RiskCenter />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="history" element={<History />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </RouterRoutes>
    </BrowserRouter>
  );
};
