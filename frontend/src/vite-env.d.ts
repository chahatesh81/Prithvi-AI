/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_PREFIX?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_REQUEST_TIMEOUT_MS?: string;
  readonly VITE_MAP_DEFAULT_LAT?: string;
  readonly VITE_MAP_DEFAULT_LON?: string;
  readonly VITE_MAP_DEFAULT_ZOOM?: string;
  readonly VITE_ENABLE_AUTH?: string;
  readonly VITE_ENABLE_ALERTS?: string;
  readonly VITE_ENABLE_HISTORY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
