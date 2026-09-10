# SIH Dual-Hazard — Master Integration & Orchestration README

> System-level contract for end-to-end execution, API integration, service startup, live/cached/demo modes, port/CORS rules, Shimla verification, and cross-module invariants.

## 1. Module Scope & Responsibilities

This module owns the seams between Frontend, Backend, ML/DL, Database/PostGIS and DevOps. It defines how the system starts, how data moves, how APIs are abstracted, how failures degrade safely, and how an end-to-end scenario is verified.

It does **not** implement UI components, ML algorithms, DB migrations, or infrastructure primitives itself. It specifies their integration behavior.

## 2. System Invariants

1. React never calls external data providers directly.
2. FastAPI is the sole public application API gateway.
3. External providers are accessed through backend adapters.
4. Provider-specific schemas are normalized before model consumption.
5. Observation time and retrieval time are distinct metadata fields.
6. Live, Cached, Demo and Unavailable states are never conflated.
7. Flood and Landslide are separate model branches.
8. XGBoost and spatial DL outputs are complementary.
9. Risk fusion is configurable and validated.
10. Predictions persist feature snapshots and provenance.
11. PostGIS owns spatial impact operations.
12. Heavy downloads/processing run as background jobs.
13. Model training and inference preprocessing must be identical.
14. Secrets are never committed to Git.
15. The system must not claim certainty or 100% predictive accuracy.

## 3. End-to-End Mermaid Diagram

```mermaid
flowchart TD
    U[User] --> FE[React TypeScript Dashboard]
    FE --> API[FastAPI /api/v1 Gateway]

    API --> W[Weather Adapter]
    API --> C[Copernicus Adapter]
    API --> M[MOSDAC Adapter]
    API --> EE[Earth Engine Adapter]
    API --> OSM[OSM/GIS Adapter]
    API --> GEO[Geocoding Adapter]

    W --> N[Normalization + Freshness]
    C --> N
    M --> N
    EE --> N
    OSM --> N
    GEO --> N

    API --> REDIS[(Redis Cache)]
    N --> FS[Feature Service]
    LOCAL[Static/Processed Data] --> FS
    POSTGIS[(PostgreSQL + PostGIS)] --> FS

    FS --> ALIGN[Spatial + Temporal Alignment]
    ALIGN --> F[Feature Vector / Raster Stack]

    F --> FLOOD[Flood Branch]
    F --> LAND[Landslide Branch]

    FLOOD --> FX[XGBoost]
    FLOOD --> FC[CNN Spatial DL]
    LAND --> LX[XGBoost]
    LAND --> LC[CNN Spatial DL]

    FX --> FP[Flood Probability]
    FC --> FP
    LX --> LP[Landslide Probability]
    LC --> LP

    FP --> RF[Risk Fusion Engine]
    LP --> RF
    RF --> RS[0-100 Risk Score + Risk Level + Trend]

    RS --> IMP[PostGIS Impact Assessment]
    RS --> SHAP[SHAP Explanation]
    RS --> ALERT[Alert Engine]

    IMP --> RESP[Normalized API Response]
    SHAP --> RESP
    ALERT --> RESP
    RESP --> DB[(Prediction / History / Alerts)]
    RESP --> FE

    JOB[Celery Background Jobs] --> C
    JOB --> M
    JOB --> EE
    JOB --> OSM
    JOB --> DB

    MON[Prometheus + Grafana] -.-> API
    MON -.-> JOB
    MON -.-> DB
```

## 4. Master `.env.example`

```dotenv
# --- Global ---
APP_ENV=development
DEMO_MODE=false
API_PREFIX=/api/v1

# --- Frontend ---
VITE_API_BASE_URL=http://localhost:8000
VITE_DEMO_MODE=false
VITE_MAP_DEFAULT_LAT=31.1048
VITE_MAP_DEFAULT_LON=77.1734

# --- Backend ---
SECRET_KEY=replace-me
JWT_ALGORITHM=HS256
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
REQUEST_TIMEOUT_SECONDS=15
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW_SECONDS=60

# --- Database ---
POSTGRES_DB=sih
POSTGRES_USER=sih
POSTGRES_PASSWORD=replace-me
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql+asyncpg://sih:replace-me@postgres:5432/sih
DEFAULT_SRID=4326

# --- Redis / Jobs ---
REDIS_URL=redis://redis:6379/0

# --- External providers ---
WEATHER_API_BASE_URL=
WEATHER_API_KEY=
COPERNICUS_CLIENT_ID=
COPERNICUS_CLIENT_SECRET=
COPERNICUS_BASE_URL=
MOSDAC_USERNAME=
MOSDAC_PASSWORD=
EARTH_ENGINE_PROJECT=

# --- ML ---
MODEL_SERVICE_URL=http://ml_service:8100
MODEL_PATH=/models
MLFLOW_TRACKING_URI=http://mlflow:5000
FLOOD_MODEL_VERSION=flood_xgb_v1.0
FLOOD_DL_MODEL_VERSION=flood_cnn_v1.0
LANDSLIDE_MODEL_VERSION=landslide_xgb_v1.0
LANDSLIDE_DL_MODEL_VERSION=landslide_cnn_v1.0
FUSION_MODEL_VERSION=fusion_v1.0
FEATURE_SCHEMA_VERSION=1.0

# --- Storage ---
DATA_ROOT=/data
DEMO_DATA_PATH=/data/demo

# --- Observability ---
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
LOG_LEVEL=INFO
```

## 5. Port Mapping Matrix

| Component | Local port | Purpose |
|---|---:|---|
| Frontend | 3000 / 5173 | UI |
| FastAPI | 8000 | application API |
| ML service | 8100 | inference |
| PostgreSQL/PostGIS | 5432 | persistence |
| Redis | 6379 | cache/jobs |
| MLflow | 5000 | model tracking |
| Prometheus | 9090 | metrics |
| Grafana | 3001 | monitoring UI |
| Nginx | 80/443 | reverse proxy |

In production, keep internal service ports private and expose only the reverse proxy/application entry point as appropriate.

## 6. CORS Rules

Development may allow:

```text
http://localhost:3000
http://localhost:5173
```

Production must use an explicit allowlist matching the deployed frontend origin. Never use `*` for credentialed production authentication flows.

The frontend should never need CORS permissions for Copernicus, MOSDAC, Weather, OSM, or other external providers because it never calls them directly.

## 7. API Surface

### Prediction

```text
POST /api/v1/predict
POST /api/v1/predict/flood
POST /api/v1/predict/landslide
POST /api/v1/predict/dual
```

### Environmental

```text
GET /api/v1/weather
GET /api/v1/satellite
GET /api/v1/terrain
GET /api/v1/soil
```

### Decision support

```text
GET /api/v1/impact
GET /api/v1/alerts
POST /api/v1/alerts
GET /api/v1/history
GET /api/v1/predictions/{prediction_id}/explanation
```

### Long-running work

```text
POST /api/v1/jobs
GET /api/v1/jobs/{job_id}
```

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Health

```text
GET /health
```

## 8. External API Classification Matrix

| Source class | Request path | Recommended mode |
|---|---|---|
| Current weather | Weather service | Live + cache |
| Hourly/daily rainfall | Weather/rainfall service | Live + scheduled cache |
| Sentinel-1/2 | Copernicus/CDSE | Scheduled / on-demand job |
| STAC | Copernicus | Metadata/catalog lookup |
| Sentinel Hub | Copernicus | On-demand processing where useful |
| openEO | Copernicus | Scheduled/on-demand processing |
| OGC | Copernicus/GIS | Layer/visualization |
| MOSDAC | MOSDAC API | Scheduled/live depending dataset/access profile |
| Earth Engine | GEE | Processing/inventory |
| SoilGrids | local/static/periodic | Local query |
| DEM | local/static/periodic | Local query |
| Dynamic World | scheduled | Local processed layer |
| WorldCover | static/periodic | Local processed layer |
| Global Surface Water | static/periodic | Local processed layer |
| OSM/PBF | batch | Local/PostGIS |
| Population | periodic/static | Local/PostGIS |
| Geocoding | live | User search |

The system does not call every source on every dashboard open.

## 9. API Adapter Contract

```text
FastAPI Service
  ↓
Provider Adapter
  ↓
Raw provider payload
  ↓
Validation
  ↓
Normalization
  ↓
Normalized application object
  ↓
Cache/persist
```

Example normalized weather:

```json
{
  "temperature": 24.5,
  "rainfall": 112.4,
  "humidity": 81,
  "observation_time": "2026-09-09T12:00:00Z",
  "retrieved_at": "2026-09-09T12:05:00Z",
  "source": "provider_name",
  "data_mode": "LIVE"
}
```

## 10. Data Freshness Contract

Every dynamic value should distinguish:

```text
observation_time
processing_time if applicable
retrieved_at
```

The UI must not infer real-time from request success. Satellite imagery must be described according to actual acquisition/processing/publication times.

## 11. Startup Sequence

### Step 1 — Database

```bash
docker compose up -d postgres
alembic upgrade head
```

Validate PostGIS and indexes.

### Step 2 — Redis

```bash
docker compose up -d redis
```

Validate connectivity.

### Step 3 — ML artifacts/service

Load the registered/validated model artifacts. Verify:

- feature schema;
- model versions;
- artifact checksums where implemented;
- inference smoke test.

### Step 4 — Background workers

Start Celery/worker processes and schedules. Do not enable large external ingestion jobs until credentials and output paths are validated.

### Step 5 — FastAPI

```bash
uvicorn app.main:app --reload --port 8000
```

Verify `/health`.

### Step 6 — Frontend

```bash
npm install
npm run dev
```

Verify API connectivity and mode banner.

## 12. Complete Prediction Flow

```text
1. User selects location
2. Frontend sends latitude/longitude
3. FastAPI validates coordinates
4. Backend checks cache/current data
5. Weather/terrain/satellite/historical data assembled
6. Spatial + temporal alignment
7. Feature validation
8. Flood XGBoost + DL inference
9. Landslide XGBoost + DL inference
10. Branch probabilities produced
11. Risk fusion
12. 0–100 score + risk level + trend
13. SHAP/explanation
14. PostGIS impact analysis
15. Alert rule evaluation
16. Prediction + feature snapshot + provenance stored
17. Normalized JSON response returned
18. Frontend updates dashboard/map
```

## 13. Live, Cached, Demo, Unavailable State Machine

```text
              LIVE REQUEST
                   │
             success? ── yes ──> LIVE
                   │
                  no
                   ▼
              Retry/backoff
                   │
             success? ── yes ──> LIVE
                   │
                  no
                   ▼
                Cache
                   │
          fresh enough? ── yes ──> CACHED
                   │
                  no
                   ▼
             DEMO enabled?
              │         │
             yes        no
              ▼          ▼
            DEMO    UNAVAILABLE
```

All outputs must carry a data mode/freshness indication so that downstream components do not confuse fallback data with live observations.

## 14. Offline Demo Mode

### Supported sources

- validated local processed datasets;
- cached normalized JSON fixtures;
- prepackaged prediction fixtures;
- precomputed impact/alert responses for a deterministic presentation path.

### Data root

The project uses a large external data store architecture. On the documented development workstation, large project data is stored under:

```text
D:\SIH-DATA
```

with the project-side dataset path maintained through the existing junction arrangement. Do not commit this large data tree to Git.

### Example local mapping

```text
D:\SIH-DATA\datasets
D:\SIH-DATA\raw
D:\SIH-DATA\processed
D:\SIH-DATA\models
D:\SIH-DATA\exports
```

Linux/container deployments should map these datasets into `/data` or an equivalent mounted volume via configuration rather than hardcoding the Windows path in application modules.

## 15. Shimla / Himachal Pradesh End-to-End Scenario

The Master README includes a representative Shimla scenario using coordinates around:

```text
latitude  = 31.1048
longitude = 77.1734
```

Representative demonstration values include rainfall, humidity, elevation, slope, NDVI, NDWI and change score, followed by XGBoost and DL probabilities, a final risk score, explanation, impact assessment and alert generation.

These values are demonstration/reference values, not a claim about current real-world conditions.

### Verification sequence

1. Open dashboard.
2. Search/select Shimla.
3. Verify coordinates on map.
4. Request weather.
5. Request terrain.
6. Request satellite indicators.
7. Request dual prediction.
8. Verify flood and landslide branch outputs exist.
9. Verify final risk is 0–100.
10. Verify risk level is backend-provided.
11. Load explanation endpoint and verify non-empty feature importance payload when supported.
12. Load impact endpoint and verify population/road/building/school/hospital fields.
13. Verify alert endpoint/state.
14. Verify prediction history.
15. Toggle flood/landslide/exposure layers.
16. Confirm demo/live mode indicator.
17. Simulate weather provider failure and verify cached/demo/unavailable behavior.
18. Verify prediction record, feature snapshot and provenance in PostgreSQL.

## 16. API Failure Drill

Simulate:

```text
Weather provider timeout
Satellite provider 5xx
MOSDAC authentication failure
Redis unavailable
ML service unavailable
PostGIS unavailable
```

Expected behavior:

| Failure | Expected result |
|---|---|
| Weather | retry → cache/fallback; label stale/unavailable |
| Satellite | optional layer unavailable or async job; do not crash dashboard |
| MOSDAC | provider status/error; do not expose credentials |
| Redis | application may continue with direct path where safe, with degraded caching |
| ML service | prediction marked unavailable; never fabricate result |
| PostGIS | health failure; impact/history/storage degrade explicitly |

## 17. Prediction Provenance Contract

Every prediction should persist/expose:

```json
{
  "prediction_id": "pred_001",
  "timestamp": "2026-09-09T18:30:00Z",
  "latitude": 31.1048,
  "longitude": 77.1734,
  "hazard": "landslide",
  "model_version": "landslide_xgb_v1.0",
  "feature_schema_version": "1.0",
  "data_sources": ["weather", "terrain", "soil", "satellite", "history"],
  "risk_score": 87,
  "risk_level": "CRITICAL"
}
```

Exact severity classification is configuration-driven; the example is illustrative.

## 18. Verification Matrix

| Boundary | Verify |
|---|---|
| Frontend → Backend | typed JSON + correct CORS |
| Backend → Provider | adapter + timeout/retry + normalization |
| Backend → Redis | cache key/TTL/freshness |
| Backend → ML | feature schema parity + output range |
| Backend → PostGIS | SRID + spatial query correctness |
| Backend → Frontend | stable schema + error envelope |
| DevOps → all services | health, env, network, logs, metrics |

## 19. Local Full-Stack Commands

```bash
# root
cp .env.example .env

docker compose up --build
```

Backend docs:

```text
http://localhost:8000/docs
```

Frontend:

```text
http://localhost:3000
```

Health:

```text
http://localhost:8000/health
```

## 20. CI/CD System Verification

CI must run:

```text
frontend lint/typecheck/tests
backend lint/typecheck/tests
integration adapter tests
ML regression tests
migration tests
API contract tests
Docker build
```

CD must run:

```text
build immutable images
push registry
deploy candidate
migrate DB
health check
smoke test
promote/rollback
```

## 21. AI Coding Agent Rules (`.cursorrules`)

```text
INTEGRATION MODULE RULES
1. Treat module boundaries as contracts, not suggestions.
2. Frontend talks only to FastAPI.
3. FastAPI talks to external providers through adapters.
4. ML service consumes normalized feature inputs, not provider payloads.
5. Database access occurs through backend repositories/services.
6. Never add direct frontend-to-database or frontend-to-provider shortcuts.
7. Preserve observation_time and retrieved_at for dynamic data.
8. Preserve data_mode: LIVE, CACHED, DEMO, or UNAVAILABLE.
9. Never present cached/demo observations as real-time.
10. Heavy ingestion and satellite processing belong to background jobs.
11. Keep Flood and Landslide pipelines logically separate.
12. Never fabricate a prediction when required features/models are unavailable.
13. Every new public endpoint requires a versioned schema and cross-module tests.
14. Coordinate changes must preserve latitude/longitude ordering and explicit SRID handling.
15. Any provider replacement must be isolated to an adapter/integration layer.
16. All new env variables require propagation to local, Docker, CI/CD and documentation config.
17. Preserve error envelope compatibility across frontend/backend.
18. End-to-end behavior is more important than local module success; test the full path.
19. Do not hardcode machine-specific paths such as D:\SIH-DATA into portable application code.
20. Demo mode is a deterministic operational mode, not a random fallback scattered through modules.
```

## 22. Inter-Module Integration Contracts

| Module | Required integration |
|---|---|
| Frontend | `/api/v1/*`, health, mode/freshness metadata |
| Backend | adapters, service orchestration, jobs, auth, errors |
| ML service | feature schema, probabilities, model version, explanations |
| Database | persistence, history, PostGIS impact, provenance |
| DevOps | Docker network, env, secrets, monitoring, CI/CD |

## 23. Definition of Done

The integration module is complete when a clean environment can:

1. start the full stack;
2. initialize PostGIS;
3. load ML artifacts;
4. start Redis/workers;
5. start FastAPI;
6. load React;
7. execute a deterministic Shimla dual-hazard prediction;
8. show explanation, impact, alert and history;
9. survive an external API failure through explicit fallback behavior;
10. pass CI contract tests and production smoke checks.
