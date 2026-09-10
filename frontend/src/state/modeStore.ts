import { create } from 'zustand';
import { DataMode } from '../types/risk';

interface ModeState {
  dataMode: DataMode;
  isBackendConnected: boolean;
  setMode: (mode: DataMode) => void;
  setBackendConnected: (connected: boolean) => void;
}

const isDefaultDemo = import.meta.env.VITE_DEMO_MODE === 'true';

export const useModeStore = create<ModeState>((set) => ({
  dataMode: isDefaultDemo ? 'DEMO' : 'LIVE',
  isBackendConnected: true,
  setMode: (dataMode) => set({ dataMode }),
  setBackendConnected: (isBackendConnected) => set({ isBackendConnected }),
}));
