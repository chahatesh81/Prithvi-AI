# SIH Dual-Hazard — Frontend Module README

> Production specification for `frontend/`. React + TypeScript dashboard, interactive geospatial visualization, risk presentation, impact/alert UX, API integration, and Demo/Offline fallback.

## 0. Module Status and Source of Truth

This README is the implementation specification for the frontend boundary. The system is an AI-powered geospatial decision-support platform for flood and landslide risk prediction, impact assessment, visualization, and alerts. The overall platform deliberately separates Flood and Landslide hazard branches and exposes model output through FastAPI rather than embedding ML logic in the browser.

The API Architecture Master README is the source of truth for provider abstraction, public endpoint semantics, freshness, fallback, and API error contracts. The system architecture Master README remains the source of truth for the overall data → features → ML/DL → fusion → impact → alert flow.

## 1. Module Scope & Responsibilities

### In scope

- React + TypeScript application shell and routing.
- Dashboard, Risk Center, History, and Alerts pages.
- Interactive map and all user-controlled hazard/exposure layers.
- Calls to internal FastAPI endpoints only.
- Typed API clients and hooks: `usePredict`, `useWeather`, `useAlerts`, plus equivalent hooks for terrain, satellite, soil, impact, history, jobs, and health.
- Loading, partial-data, stale-data, unavailable-data, demo-mode, and error states.
- Rendering risk score, risk level, trend, probability, explanations, impact summaries, and alert history.
- Geospatial interaction: coordinate selection, layer toggling, risk-zone visualization, map popups, and selected-location state.
- Session/authentication state when user accounts are enabled.
- Accessibility, responsive layout, testability, and observability hooks.

### Explicit non-goals

- No direct PostgreSQL/PostGIS connection.
- No direct call to external weather/satellite/GIS providers.
- No model loading or inference in the browser.
- No SHAP calculation in the browser; only render backend-generated explanation payloads.
- No authoritative disaster confirmation. UI must call outputs probabilistic risk estimation / decision support.
- No inline provider-specific API schemas in components.

## 2. Architectural Boundary

```text
User
  │
  ▼
React + TypeScript
  │
  ├── typed API client
  ├── state/query cache
  ├── hooks
  └── presentation components
  │
  ▼
FastAPI `/api/v1/*`
  │
  ├── data services
  ├── ML service
  ├── fusion service
  ├── impact service
  └── alert service
```

The browser receives normalized application JSON. It must not need to know whether a value originated from a live provider, a local raster, Redis cache, PostGIS, or a background job.

## 3. Directory Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── queryClient.ts
│   ├── components/
│   │   ├── Map/
│   │   │   ├── Map.tsx
│   │   │   ├── BaseMap.tsx
│   │   │   ├── LayerControl.tsx
│   │   │   ├── HazardOverlay.tsx
│   │   │   ├── ExposureLayers.tsx
│   │   │   ├── LocationMarker.tsx
│   │   │   └── MapErrorBoundary.tsx
│   │   ├── RiskCard/
│   │   │   ├── RiskCard.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   └── RiskTrend.tsx
│   │   ├── WeatherCard/WeatherCard.tsx
│   │   ├── TerrainCard/TerrainCard.tsx
│   │   ├── SatelliteCard/SatelliteCard.tsx
│   │   ├── ImpactPanel/ImpactPanel.tsx
│   │   ├── AlertPanel/AlertPanel.tsx
│   │   ├── ExplanationPanel/ExplanationPanel.tsx
│   │   ├── DataFreshnessBadge/DataFreshnessBadge.tsx
│   │   ├── DemoModeBanner/DemoModeBanner.tsx
│   │   └── common/
│   │       ├── ErrorState.tsx
│   │       ├── LoadingState.tsx
│   │       └── EmptyState.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── RiskCenter.tsx
│   │   ├── History.tsx
│   │   └── Alerts.tsx
│   ├── hooks/
│   │   ├── usePredict.ts
│   │   ├── useWeather.ts
│   │   ├── useTerrain.ts
│   │   ├── useSatellite.ts
│   │   ├── useSoil.ts
│   │   ├── useImpact.ts
│   │   ├── useAlerts.ts
│   │   ├── useHistory.ts
│   │   ├── useJobs.ts
│   │   └── useHealth.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── http.ts
│   │   └── apiError.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── risk.ts
│   │   ├── geo.ts
│   │   ├── exposure.ts
│   │   └── ui.ts
│   ├── state/
│   │   ├── locationStore.ts
│   │   ├── layerStore.ts
│   │   └── modeStore.ts
│   ├── utils/
│   │   ├── risk.ts
│   │   ├── freshness.ts
│   │   ├── coordinates.ts
│   │   └── demo.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── public/
├── tests/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── e2e/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── Dockerfile
└── nginx.conf
```

## 4. Tech Stack & Explicit Dependencies

Target implementation baseline:

| Area | Required choice |
|---|---|
| Language | TypeScript 5.x |
| Runtime | Node.js 20+ LTS |
| UI | React 18+ |
| Build | Vite |
| Maps | Leaflet/react-leaflet or equivalent approved GIS library |
| HTTP | `fetch` or Axios wrapped by `services/http.ts` |
| Server/query state | TanStack Query or equivalent |
| Client UI state | Zustand or equivalent lightweight store |
| Testing | Vitest + React Testing Library; Playwright for E2E |
| Lint/format | ESLint + Prettier |
| Container | Node build stage + Nginx runtime |

The project does not prescribe one mapping vendor in the Master README. The map abstraction must therefore remain vendor-neutral enough to change the map engine without changing API contracts.

## 5. Environment Variables

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
VITE_APP_ENV=development
VITE_DEMO_MODE=false
VITE_REQUEST_TIMEOUT_MS=15000
VITE_MAP_DEFAULT_LAT=31.1048
VITE_MAP_DEFAULT_LON=77.1734
VITE_MAP_DEFAULT_ZOOM=10
VITE_ENABLE_AUTH=true
VITE_ENABLE_ALERTS=true
VITE_ENABLE_HISTORY=true
```

Never place provider API keys, database URLs, JWT signing keys, MOSDAC passwords, Copernicus client secrets, or cloud credentials in frontend variables. `VITE_*` values are publicly inspectable after bundling.

## 6. Domain Types

The frontend owns transport types that mirror backend Pydantic response schemas. Do not duplicate business logic in these types.

### Coordinate contract

```ts
export interface Coordinates {
  latitude: number;
  longitude: number;
}
```

Validation:

- latitude: `[-90, 90]`
- longitude: `[-180, 180]`
- UI selection must reject invalid coordinates before the request is sent.

### Risk contract

```ts
export type Hazard = 'flood' | 'landslide';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
export type DataMode = 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';

export interface RiskResult {
  hazard: Hazard;
  probability: number;
  risk_score: number;
  risk_level: RiskLevel;
  model_version?: string;
  trend?: 'INCREASING' | 'DECREASING' | 'STABLE' | 'UNKNOWN';
  timestamp: string;
  data_mode?: DataMode;
}
```

The classification thresholds follow the project configuration concept: 0–20 LOW, 21–40 MODERATE, 41–60 HIGH, 61–80 VERY HIGH, 81–100 CRITICAL. The frontend must render the received classification rather than recalculate it independently.

## 7. API Service Contract

All calls go through `services/api.ts` and are typed.

Required internal endpoints:

| Method | Endpoint | Frontend purpose |
|---|---|---|
| GET | `/health` | system status |
| POST | `/api/v1/predict` | generic prediction orchestration when enabled |
| POST | `/api/v1/predict/flood` | flood prediction |
| POST | `/api/v1/predict/landslide` | landslide prediction |
| POST | `/api/v1/predict/dual` | combined flood + landslide prediction |
| GET | `/api/v1/weather` | current weather |
| GET | `/api/v1/satellite` | satellite-derived indicators |
| GET | `/api/v1/terrain` | terrain features |
| GET | `/api/v1/soil` | soil features |
| GET | `/api/v1/impact` | population/infrastructure impact |
| GET | `/api/v1/alerts` | alerts |
| POST | `/api/v1/alerts` | alert creation for authorized workflows |
| GET | `/api/v1/history` | prediction trend/history |
| GET | `/api/v1/predictions/{prediction_id}/explanation` | SHAP/model explanation |
| POST | `/api/v1/jobs` | long-running ingestion/prediction job |
| GET | `/api/v1/jobs/{job_id}` | job status |
| POST | `/api/v1/auth/register` | optional registration |
| POST | `/api/v1/auth/login` | optional login |
| POST | `/api/v1/auth/refresh` | token refresh |
| POST | `/api/v1/auth/logout` | session termination |

## 8. Component Specifications

### 8.1 `Map`

Responsibilities:

- render base map;
- accept selected coordinates;
- render flood-risk overlay;
- render landslide-risk overlay;
- render rainfall/weather visualization where backend supports it;
- render satellite, terrain, historical events, roads, buildings, schools, hospitals, and population layers;
- isolate failed layers rather than taking down the complete map;
- expose layer visibility state through `layerStore`;
- never assume every layer is available.

Required layer states:

```text
OFF
LOADING
AVAILABLE
STALE
UNAVAILABLE
ERROR
```

### 8.2 `RiskCard`

Display:

- hazard name;
- probability;
- 0–100 risk score;
- backend-provided risk level;
- trend;
- timestamp/freshness;
- model version where appropriate;
- data mode.

### 8.3 `WeatherCard`

Display backend-normalized values, not provider-specific fields. Expected values include temperature, humidity, rainfall, wind speed and freshness metadata.

### 8.4 `TerrainCard`

Display elevation, slope, aspect, curvature, TPI and TRI when available. Missing values must be explicit.

### 8.5 `SatelliteCard`

Display NDVI, NDWI, change score / water change / vegetation change, observation date, cloud cover where supplied, and data mode.

### 8.6 `ImpactPanel`

Display population exposed, roads affected, buildings exposed, schools, hospitals, and other critical infrastructure returned by PostGIS-backed impact analysis.

### 8.7 `AlertPanel`

Display active alerts, severity, hazard, location, generated time, status, and stale/unavailable state. The frontend must not generate its own alert severity rule; it renders backend alert results.

## 9. Hook Specifications

### `usePredict`

```ts
usePredict({
  latitude,
  longitude,
  hazard: 'dual' | 'flood' | 'landslide'
})
```

Returns a discriminated result containing `status`, `data`, `error`, `isFetching`, `dataMode`, and request timestamp.

### `useWeather`, `useAlerts`

Hooks must use stable query keys:

```text
weather:{lat}:{lon}
alerts:{scope}
predict:{hazard}:{lat}:{lon}
history:{lat}:{lon}:{days}
```

The exact cache duration is configuration, not component logic.

## 10. Live vs Demo Fallback UX

The API architecture explicitly supports Live, cached, and demo/static data. The UI must make mode visible.

Required visual semantics:

```text
LIVE       → normal live-data presentation
CACHED     → visible stale/cached badge with retrieval time
DEMO       → persistent "DEMO / STATIC DATA" banner
UNAVAILABLE→ explicit unavailable state; never substitute silently
```

Demo data must never be labeled as real-time. This is a hard product rule.

## 11. Risk and Explanation Presentation

The backend/ML layer owns explanation generation. Frontend code only maps normalized explanation payloads to labels, charts, icons, and tooltips.

Example:

```json
{
  "prediction_id": "abc123",
  "features": [
    {"name": "rainfall_24h", "importance": 0.34},
    {"name": "slope", "importance": 0.27},
    {"name": "soil_moisture", "importance": 0.18}
  ]
}
```

Never hardcode phrases such as `Rainfall HIGH` as model explanations unless the backend explicitly provides that normalized interpretation.

## 12. Error Boundaries and Partial Failure

At minimum:

- app-level error boundary;
- map error boundary;
- per-widget error state;
- API error normalization;
- retry affordance only for retryable failures;
- `429` handling with user-safe messaging;
- `5xx` handling without leaking server internals;
- network/offline detection;
- stale-cache messaging.

A failed satellite layer must not hide flood/landslide risk cards. A failed weather API must not crash the dashboard if cached data is available.

## 13. Local Setup

```bash
cd frontend
npm install
npm run dev
```

Typical local URL:

```text
http://localhost:5173
```

Production build:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## 14. Docker Execution

```bash
docker build -t sih-frontend:dev .
docker run --rm -p 3000:80 --env VITE_API_BASE_URL=http://localhost:8000 sih-frontend:dev
```

With the root Compose stack:

```bash
docker compose up --build frontend
```

Nginx must serve the SPA and forward `/api` traffic only when the deployment design explicitly places frontend and backend behind the same reverse proxy.

## 15. Testing Specification

### Unit

- risk badge rendering;
- coordinate validation;
- layer state transitions;
- freshness formatting;
- API error mapping.

### Integration

- `usePredict` with mocked FastAPI responses;
- demo-mode responses;
- stale-data rendering;
- missing layer response;
- auth token refresh.

### E2E

Minimum scenario:

1. open dashboard;
2. select Shimla coordinates;
3. load weather/terrain/satellite cards;
4. request dual prediction;
5. render flood + landslide scores;
6. render explanation;
7. load impact;
8. render alert if returned;
9. toggle map layers;
10. verify history.

## 16. AI Coding Agent Rules (`.cursorrules`)

```text
FRONTEND MODULE RULES
1. TypeScript strict mode is mandatory.
2. No `any` unless the exact reason is documented and localized.
3. No inline styles. Use CSS modules, global tokens, or the project's approved styling system.
4. Components must be single-responsibility and composable.
5. API calls belong in services/hooks, never directly in presentational components.
6. Never call external providers from browser code.
7. Never embed ML, SHAP, risk-fusion, or PostGIS logic in the frontend.
8. Treat API schemas as contracts. Update types when backend schemas change.
9. Render backend risk_level rather than recomputing thresholds in components.
10. Render backend explanation payloads; never fabricate explanations.
11. All async work must have loading/error/empty states.
12. A failed optional map layer must not crash the map or dashboard.
13. Distinguish LIVE, CACHED, DEMO, and UNAVAILABLE visually.
14. Demo/static values must never be labeled as real-time.
15. Keep provider names out of reusable components; the UI consumes normalized application data.
16. Do not store secrets in VITE_* variables.
17. Use semantic, accessible controls for layer toggles and alerts.
18. Keep state domains separated: location, layers, mode, server data, auth.
19. Avoid duplicated fetches; use stable query keys and cache policies.
20. Every new endpoint requires a typed API method, hook if needed, unit test, and error mapping.
21. Use `async/await` in service functions and abort stale requests where applicable.
22. Do not silently coerce invalid coordinates.
23. Do not modify backend contracts to simplify a frontend implementation; coordinate with the integration contract.
```

## 17. Inter-Module Integration Contracts

| Producer | Frontend consumes |
|---|---|
| Backend | typed REST/JSON API |
| ML service via Backend | probability, risk score, risk level, trend, explanation, model version |
| Database via Backend | historical predictions, exposure, alerts |
| DevOps | `/health`, deployment env, HTTPS, reverse proxy |
| Integration module | API base URL, demo/live mode, expected ports |

The frontend must not bypass the backend/database boundary.

## 18. Definition of Done

- `npm run typecheck` passes.
- `npm run lint` passes.
- Unit and E2E suites pass for live-mocked and demo mode.
- No external provider credential exists in source or built client assets.
- Map can isolate failed layers.
- Risk cards render flood, landslide, and dual results.
- Impact, alerts, history, and explanation views consume backend contracts.
- Live/Cached/Demo/Unavailable states are distinguishable.
- No inline styles are used.
