import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MapPinOff } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MapErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '350px',
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <MapPinOff size={42} style={{ color: 'var(--risk-high)' }} />
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Geospatial Map Unavailable
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px' }}>
              The interactive map container encountered a rendering issue. Risk score metrics and analytical cards remain fully operational.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--primary-600)',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Reload Map View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
