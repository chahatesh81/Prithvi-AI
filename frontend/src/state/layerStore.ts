import { create } from 'zustand';
import { LayerState, LayerStatus } from '../types/geo';

interface LayerStore extends LayerState {
  setBaseMap: (baseMap: LayerState['baseMap']) => void;
  toggleLayer: (layerKey: keyof Omit<LayerState, 'baseMap' | 'layerStatuses'>) => void;
  setLayerStatus: (layerKey: string, status: LayerStatus) => void;
  resetLayers: () => void;
}

const initialLayers: Omit<LayerStore, 'setBaseMap' | 'toggleLayer' | 'setLayerStatus' | 'resetLayers'> = {
  baseMap: 'dark',
  combinedOverlay: true,
  floodOverlay: true,
  landslideOverlay: true,
  weatherOverlay: false,
  satelliteOverlay: false,
  terrainOverlay: false,
  routesOverlay: true,
  hazardHotspots: true,
  roads: true,
  buildings: true,
  schools: true,
  hospitals: true,
  population: false,
  layerStatuses: {
    combined: 'AVAILABLE',
    flood: 'AVAILABLE',
    landslide: 'AVAILABLE',
    weather: 'AVAILABLE',
    satellite: 'AVAILABLE',
    terrain: 'AVAILABLE',
    routes: 'AVAILABLE',
    infrastructure: 'AVAILABLE',
  },
};

export const useLayerStore = create<LayerStore>((set) => ({
  ...initialLayers,
  setBaseMap: (baseMap) => set({ baseMap }),
  toggleLayer: (layerKey) =>
    set((state) => ({
      [layerKey]: !state[layerKey],
    })),
  setLayerStatus: (layerKey, status) =>
    set((state) => ({
      layerStatuses: {
        ...state.layerStatuses,
        [layerKey]: status,
      },
    })),
  resetLayers: () => set(initialLayers),
}));
