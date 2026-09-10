import { create } from 'zustand';
import { Coordinates } from '../types/geo';

interface LocationState extends Coordinates {
  locationName: string;
  setLocation: (coords: Coordinates, name?: string) => void;
  setLatitude: (lat: number) => void;
  setLongitude: (lon: number) => void;
}

const DEFAULT_LAT = parseFloat(import.meta.env.VITE_MAP_DEFAULT_LAT || '31.1048');
const DEFAULT_LON = parseFloat(import.meta.env.VITE_MAP_DEFAULT_LON || '77.1734');

export const useLocationStore = create<LocationState>((set) => ({
  latitude: DEFAULT_LAT,
  longitude: DEFAULT_LON,
  locationName: 'Shimla, Himachal Pradesh',
  setLocation: (coords, name) =>
    set({
      latitude: coords.latitude,
      longitude: coords.longitude,
      locationName: name || `${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°`,
    }),
  setLatitude: (latitude) => set((state) => ({ latitude, locationName: `${latitude.toFixed(4)}°, ${state.longitude.toFixed(4)}°` })),
  setLongitude: (longitude) => set((state) => ({ longitude, locationName: `${state.latitude.toFixed(4)}°, ${longitude.toFixed(4)}°` })),
}));
