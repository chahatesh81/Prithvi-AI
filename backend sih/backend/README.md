# SIH Dual-Hazard — Backend Module README

> Production specification for `backend/`. FastAPI gateway, provider adapters, data services, feature orchestration, ML/DL inference, fusion, impact, alerts, jobs, authentication, resilience, and observability.

## 0. Source of Truth

This module reconciles the system Master README and API Architecture Master README. FastAPI is the central application/API layer. External provider complexity stays behind adapters. The frontend consumes only normalized internal APIs. The backend remains the only module allowed to orchestrate external APIs, ML services, PostGIS repositories, caching, and background jobs.

## 1. Module Scope & Responsibilities

### In scope

- FastAPI application and `/api/v1/*` routes.
- Pydantic request/response contracts.
- Provider integration adapters.
- Weather, satellite, terrain, soil, geocoding, OSM/GIS, MOSDAC, Copernicus, and Earth Engine integration boundaries.
- Feature-generation orchestration.
- ML/DL inference requests to the ML service.
- Risk-fusion orchestration.
- Impact analysis orchestration.
- Alert generation/storage orchestration.
- PostgreSQL/PostGIS repository access through a dedicated DB layer.
- Redis caching and Celery/background jobs.
- JWT auth, password hashing, RBAC where enabled, rate limiting, CORS.
- Structured JSON logging and request IDs.
- P95 latency and external provider metrics.
- Fallback and freshness decisions.

### Explicit non-goals

- UI rendering.
- Direct browser access to external providers.
- Training models inside an HTTP route.
- Raw SQL scattered through route handlers.
- Business rules embedded in Pydantic serializers.

## 2. Request Flow

```text
React
  │
  ▼
FastAPI Route
  │
  ▼
Pydantic Validation
  │
  ▼
Service Layer
  │
  ├── Cache / Redis
  ├── Provider adapters
  ├── Repository
  ├── ML service
  ├── Fusion service
  ├── Impact service
  └── Alert service
  │
  ▼
Normalized response
```

## 3. Directory Structure

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── locations.py
│   │       ├── weather.py
│   │       ├── satellite.py
│   │       ├── terrain.py
│   │       ├── soil.py
│   │       ├── predictions.py
│   │       ├── risk.py
│   │       ├── impact.py
│   │       ├── alerts.py
│   │       ├── history.py
│   │       ├── explanations.py
│   │       ├── jobs.py
│   │       └── health.py
│   ├── schemas/
│   │   ├── common.py
│   │   ├── auth.py
│   │   ├── prediction.py
│   │   ├── weather.py
│   │   ├── satellite.py
│   │   ├── terrain.py
│   │   ├── soil.py
│   │   ├── impact.py
│   │   ├── alert.py
│   │   ├── history.py
│   │   ├── explanation.py
│   │   └── jobs.py
│   ├── services/
│   │   ├── weather_service.py
│   │   ├── terrain_service.py
│   │   ├── satellite_service.py
│   │   ├── soil_service.py
│   │   ├── feature_service.py
│   │   ├── prediction_service.py
│   │   ├── ml_service.py
│   │   ├── fusion_service.py
│   │   ├── impact_service.py
│   │   ├── alert_service.py
│   │   ├── history_service.py
│   │   └── job_service.py
│   ├── integrations/
│   │   ├── weather/
│   │   │   ├── base.py
│   │   │   └── provider.py
│   │   ├── copernicus/
│   │   │   ├── stac.py
│   │   │   ├── sentinelhub.py
│   │   │   ├── openeo.py
│   │   │   └── ogc.py
│   │   ├── mosdac/client.py
│   │   ├── earth_engine/client.py
│   │   ├── osm/client.py
│   │   ├── geocoding/client.py
│   │   └── common/
│   │       ├── retry.py
│   │       ├── rate_limit.py
│   │       └── models.py
│   ├── repositories/
│   │   ├── predictions.py
│   │   ├── locations.py
│   │   ├── observations.py
│   │   ├── exposure.py
│   │   ├── alerts.py
│   │   └── model_versions.py
│   ├── db/
│   │   ├── session.py
│   │   ├── base.py
│   │   └── models.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   ├── metrics.py
│   │   └── exceptions.py
│   ├── workers/
│   │   ├── celery_app.py
│   │   └── tasks.py
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── api/
│   ├── integrations/
│   └── fixtures/
├── alembic/
├── requirements.txt
├── Dockerfile
└── .env.example
```

## 4. Tech Stack & Explicit Dependencies

- Python 3.12.x baseline for the service container.
- FastAPI + Uvicorn/Gunicorn.
- Pydantic v2 settings/schema validation.
- SQLAlchemy 2.x async style.
- PostgreSQL + PostGIS.
- `asyncpg` for async PostgreSQL access.
- `httpx` for async external HTTP integration.
- Redis + Celery for long-running/scheduled background jobs.
- PyJWT or an equivalent vetted JWT library.
- Passlib/Argon2 or bcrypt-compatible password hashing strategy approved by the security baseline.
- `tenacity` or equivalent retry utility where needed.
- Prometheus instrumentation.
- GeoPandas/Shapely/PyProj/Rasterio only in services that actually require geospatial operations.

## 5. Environment Variables

```dotenv
APP_ENV=development
APP_NAME=sih-backend
API_PREFIX=/api/v1
DATABASE_URL=postgresql+asyncpg://sih:sih@postgres:5432/sih
REDIS_URL=redis://redis:6379/0
SECRET_KEY=replace-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW_SECONDS=60
REQUEST_TIMEOUT_SECONDS=15
WEATHER_API_BASE_URL=
WEATHER_API_KEY=
COPERNICUS_CLIENT_ID=
COPERNICUS_CLIENT_SECRET=
COPERNICUS_BASE_URL=
MOSDAC_USERNAME=
MOSDAC_PASSWORD=
EARTH_ENGINE_PROJECT=
MODEL_SERVICE_URL=http://ml_service:8100
MODEL_REGISTRY_URL=
MODEL_PATH=/models
MLFLOW_URL=http://mlflow:5000
DATA_ROOT=/data
DEMO_MODE=false
DEMO_DATA_PATH=/data/demo
CACHE_TTL_WEATHER=300
CACHE_TTL_SATELLITE=3600
```

## 6. API Contract Matrix

### Health

`GET /health`

```json
{
  "status": "healthy",
  "database": "healthy",
  "models": "loaded",
  "external_services": {
    "weather": "healthy",
    "satellite": "healthy"
  }
}
```

### Prediction

- `POST /api/v1/predict`
- `POST /api/v1/predict/flood`
- `POST /api/v1/predict/landslide`
- `POST /api/v1/predict/dual`

Coordinates are required and validated. Hazard-specific requests must not accept arbitrary unknown hazard strings.

Example dual request:

```json
{
  "latitude": 31.1048,
  "longitude": 77.1734
}
```

Example dual response:

```json
{
  "location": {
    "latitude": 31.1048,
    "longitude": 77.1734
  },
  "flood": {
    "probability": 0.72,
    "risk_score": 72,
    "risk_level": "HIGH"
  },
  "landslide": {
    "probability": 0.87,
    "risk_score": 87,
    "risk_level": "HIGH"
  },
  "combined_risk": 84
}
```

### Environmental APIs

- `GET /api/v1/weather?lat=...&lon=...`
- `GET /api/v1/satellite?lat=...&lon=...&start_date=...&end_date=...`
- `GET /api/v1/terrain?lat=...&lon=...`
- `GET /api/v1/soil?lat=...&lon=...`

### Impact / alerts / history

- `GET /api/v1/impact?latitude=...&longitude=...&risk_radius=...`
- `GET /api/v1/alerts`
- `POST /api/v1/alerts`
- `GET /api/v1/history?lat=...&lon=...&days=30`
- `GET /api/v1/predictions/{prediction_id}/explanation`

### Jobs

- `POST /api/v1/jobs`
- `GET /api/v1/jobs/{job_id}`

Long-running satellite/data ingestion must be asynchronous.

## 7. Normalized Provider Adapter Contract

Every provider adapter should implement a stable internal contract.

```python
class WeatherProvider(Protocol):
    async def get_current(self, latitude: float, longitude: float) -> NormalizedWeather:
        ...
```

Normalized object example:

```json
{
  "temperature": 24.5,
  "humidity": 81,
  "rainfall": 112.4,
  "wind_speed": 14.2,
  "observation_time": "2026-09-09T12:00:00Z",
  "retrieved_at": "2026-09-09T12:05:00Z",
  "source": "provider_name",
  "data_mode": "LIVE"
}
```

The frontend must never see provider-specific fields such as `temp` or `rain`.

## 8. External API Integration Map

| Integration | Classification | Primary purpose |
|---|---|---|
| Weather API | Live | current/forecast weather |
| Rainfall source | Live/scheduled/historical depending provider | precipitation features |
| Copernicus CDSE | scheduled/data service | Sentinel-1/2, STAC, Sentinel Hub, openEO, OGC |
| MOSDAC | scheduled/live access-profile dependent | Indian EO/met data |
| Earth Engine | processing platform | large-area EO processing |
| SoilGrids | static/periodic | soil predictors |
| DEM/CartoDEM/SRTM | static/periodic | elevation/terrain derivatives |
| Dynamic World | scheduled | land cover and vegetation/water context |
| WorldCover | static/periodic | land cover |
| Global Surface Water | static/periodic | water occurrence |
| OSM/PBF | scheduled/batch | roads/buildings/infrastructure |
| Population | scheduled/static | exposure |
| Geocoding | live request | name → coordinates |

The exact provider remains replaceable through adapters.

## 9. Data Freshness Contract

All external observations must preserve:

- `observation_time`
- `retrieved_at`
- `source`
- `data_mode`
- optional `processing_time`

The API must never equate successful HTTP retrieval with real-time observation.

Satellite responses must expose the actual observation date/time and never promise universally same-day satellite availability.

## 10. Reliability and Failure Handling

Required strategy:

```text
Request
  ↓
Timeout
  ↓
Retry + backoff
  ↓
Second failure
  ↓
Cache lookup
  ↓
Freshness check
  ├── acceptable → return CACHED
  └── too old → mark UNAVAILABLE
```

Use circuit breakers where provider instability warrants them.

Error format:

```json
{
  "error": {
    "code": "EXTERNAL_API_TIMEOUT",
    "message": "Weather service did not respond.",
    "request_id": "req_123"
  }
}
```

Do not return stack traces, credentials, upstream tokens, or internal file paths.

## 11. Service-Layer Specifications

### `weather_service`

- validate coordinates;
- check Redis cache;
- call normalized weather provider;
- validate nonnegative rainfall and expected ranges;
- compute/return temporal accumulations when supported by source/cache;
- persist observations when configured.

### `terrain_service`

- query preprocessed local rasters/PostGIS;
- never download a large DEM synchronously during a dashboard request;
- return elevation/slope/aspect/curvature/TPI/TRI.

### `satellite_service`

- query inventory first;
- select scene/product by AOI/date/cloud criteria;
- use direct download, Sentinel Hub, STAC, openEO, OGC, or Earth Engine through adapters;
- expose observation/retrieval metadata;
- push heavy work to Celery.

### `feature_service`

- assemble normalized environmental data;
- enforce spatial and temporal alignment;
- produce feature schema compatible with ML artifacts;
- never invent missing features.

### `ml_service`

- call ML service or model runtime;
- return probabilities and model version;
- request SHAP/explanation output when supported;
- validate numeric outputs in `[0,1]`.

### `fusion_service`

- consume flood and/or landslide branch outputs plus rule/environmental scores;
- use configurable weights;
- validate weight sum equals 1;
- return 0–100 risk score and classification.

### `impact_service`

- create/query risk geometry;
- ask repository/PostGIS for population, roads, buildings, schools, hospitals, and critical assets;
- return exposure summary and optional geometry references.

### `alert_service`

- evaluate backend-configured rules;
- generate alert records;
- maintain alert history;
- do not infer alert severity in frontend.

## 12. Prediction Orchestration Contract

```text
POST /predict/dual
   ↓
validate coordinates
   ↓
load cached/current environmental data
   ↓
feature_service
   ↓
parallel flood + landslide inference
   ↓
fusion_service
   ↓
impact_service
   ↓
alert_service
   ↓
persist prediction + feature snapshot + provenance
   ↓
return normalized JSON
```

For potentially slow satellite acquisition, return a job instead of blocking.

## 13. Background Job Contract

```json
POST /api/v1/jobs
{
  "job_type": "SATELLITE_INGESTION",
  "parameters": {
    "latitude": 31.1048,
    "longitude": 77.1734
  }
}
```

Response:

```json
{
  "job_id": "job_123",
  "status": "queued"
}
```

Poll:

```text
GET /api/v1/jobs/job_123
```

## 14. Security Guardrails

- JWT when auth is enabled.
- Role checks for administrator/officer-only operations.
- Password hashes only; never plaintext.
- CORS allowlist from environment.
- Per-user/IP rate limiting on expensive endpoints.
- HTTPS required in production.
- File uploads, if enabled, must enforce MIME/type/size/path restrictions.
- Provider credentials only through environment/secret manager.
- SQL only through repository layer.
- Audit-sensitive operations where appropriate.

## 15. Structured Logging and Metrics

Every request log should contain:

```text
timestamp
request_id
endpoint
user/location where needed
hazard
model_version
latency
status_code
error
```

Track:

- request count;
- error rate;
- P50/P95/P99 latency;
- provider latency and failure rate;
- retry count;
- cache hit rate;
- prediction count;
- inference latency;
- model version distribution.

Do not log secrets or unnecessary personal information.

## 16. Local Setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Docs:

```text
http://localhost:8000/docs
http://localhost:8000/redoc
http://localhost:8000/health
```

## 17. Docker Execution

```bash
docker build -t sih-backend:dev .
docker run --rm -p 8000:8000 --env-file .env.example sih-backend:dev
```

Preferred multi-service path:

```bash
docker compose up --build backend postgres redis
```

## 18. Testing Strategy

### Unit

- Pydantic schema validation;
- risk classification boundary tests;
- adapter normalization;
- retry/fallback logic;
- coordinate validation;
- fusion weight validation.

### Integration

- FastAPI + PostGIS;
- FastAPI + Redis;
- FastAPI + mock provider;
- FastAPI + ML service;
- migration tests.

### API

- every endpoint status code;
- OpenAPI contract consistency;
- auth and rate limiting;
- stale/fallback metadata.

### E2E

Run full Shimla scenario through the master integration stack.

## 19. AI Coding Agent Rules (`.cursorrules`)

```text
BACKEND MODULE RULES
1. Python 3.12 baseline unless the root project explicitly changes it.
2. FastAPI routes are thin adapters; business logic belongs in services.
3. Repository code owns persistence queries; routes never issue SQL directly.
4. Use SQLAlchemy 2.x patterns and async DB access for request paths.
5. Use async/await for FastAPI I/O and httpx provider calls.
6. CPU-heavy raster/ML work must not block the event loop; move it to Celery/worker or a dedicated ML service.
7. Every external provider must be accessed through an adapter implementing a normalized internal contract.
8. Never leak provider-specific response shapes to frontend callers.
9. Every external response must preserve observation/retrieval/source metadata where relevant.
10. Never call a large satellite/DEM download synchronously inside `/predict`.
11. Validate all Pydantic input and all external payloads.
12. Normalize all errors to the project error envelope.
13. Never log secrets, JWTs, passwords, or unnecessary PII.
14. Parameterize all DB queries. No string-built SQL from request input.
15. Keep CORS, rate limits, timeouts, retries, cache TTLs, and provider URLs in configuration.
16. Never hardcode risk-fusion weights. Read configurable weights and validate their sum.
17. Do not silently fill missing ML features with arbitrary constants.
18. Keep routes, services, repositories, integrations, and schemas in separate modules.
19. Any new endpoint requires schema tests, API tests, and documentation.
20. Preserve backwards compatibility within `/api/v1` unless versioning is intentionally changed.
21. Add request IDs and latency measurements to new external/provider paths.
22. Any fallback must label data as cached/demo/unavailable rather than pretending it is live.
23. Do not let a failed optional provider crash unrelated application functionality.
24. Keep model training outside this module; backend orchestrates inference only.
25. Before changing provider logic, check adapter contract tests.
```

## 20. Inter-Module Integration Contracts

| Module | Contract |
|---|---|
| Frontend | typed REST JSON under `/api/v1` |
| ML service | feature vector in; branch probabilities/model metadata out |
| Database | repositories/SQLAlchemy/PostGIS |
| DevOps | env, health, metrics, Docker ports |
| Integration | provider adapters, jobs, fallback mode |

## 21. Definition of Done

- OpenAPI schema matches implementation.
- All routes are thin and typed.
- No direct DB access in routes.
- Provider adapters are independently testable.
- Redis cache and fallback semantics are observable.
- `/health` reports dependency health.
- P95 latency is instrumented.
- Heavy work is asynchronous.
- Auth/CORS/rate limits are environment-driven.
