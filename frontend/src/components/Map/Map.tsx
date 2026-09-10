import React from 'react';
import { MapErrorBoundary } from './MapErrorBoundary';
import { BaseMap } from './BaseMap';
import { DualRiskResponse } from '../../types/risk';
import { ImpactSummary } from '../../types/exposure';
import { CandidateRoute } from '../../types/route';

interface MapProps {
  predictionData?: DualRiskResponse;
  impactData?: ImpactSummary;
  routes?: CandidateRoute[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  height?: string;
}

export const Map: React.FC<MapProps> = (props) => {
  return (
    <MapErrorBoundary>
      <BaseMap {...props} />
    </MapErrorBoundary>
  );
};
