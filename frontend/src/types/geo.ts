export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoBoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export type LayerStatus = 'OFF' | 'LOADING' | 'AVAILABLE' | 'STALE' | 'UNAVAILABLE' | 'ERROR';

export interface LayerState {
  baseMap: 'streets' | 'satellite' | 'dark' | 'terrain';
  combinedOverlay: boolean;
  floodOverlay: boolean;
  landslideOverlay: boolean;
  weatherOverlay: boolean;
  satelliteOverlay: boolean;
  terrainOverlay: boolean;
  routesOverlay: boolean;
  hazardHotspots: boolean;
  roads: boolean;
  buildings: boolean;
  schools: boolean;
  hospitals: boolean;
  population: boolean;
  layerStatuses: Record<string, LayerStatus>;
}
