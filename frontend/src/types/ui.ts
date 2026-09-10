export type TabPath = '/' | '/risk-center' | '/history' | '/alerts';

export interface LocationPreset {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  description: string;
}

export interface NavItem {
  label: string;
  path: TabPath;
  iconName: string;
}
