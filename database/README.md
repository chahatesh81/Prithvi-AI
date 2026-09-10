# SIH Dual-Hazard — Database & Geospatial README

> Production specification for `database/`. PostgreSQL + PostGIS schema, SQLAlchemy/Alembic migrations, spatial indexing, prediction provenance, exposure queries, impact buffers, and geospatial safety.

## 1. Module Scope & Responsibilities

### In scope

- PostgreSQL relational schema.
- PostGIS spatial schema and functions.
- SQLAlchemy ORM/models and repository support.
- Alembic migrations.
- GIST spatial indexes and supporting B-tree indexes.
- Prediction history and feature snapshot JSONB.
- Geospatial impact analysis.
- Population/infrastructure exposure intersections.
- Spatial provenance needed by the ML/backend modules.

### Explicit non-goals

- ML training.
- React map rendering.
- Calling external APIs.
- Business logic in raw SQL that belongs in backend services.

## 2. Canonical Architecture

```text
FastAPI
  ↓
Repository Layer
  ↓
SQLAlchemy
  ↓
PostgreSQL + PostGIS
  ├── relational records
  ├── geometry columns
  ├── JSONB feature snapshots
  └── spatial indexes
```

## 3. Directory Structure

```text
database/
├── migrations/
│   ├── versions/
│   └── env.py
├── schema/
│   ├── extensions.sql
│   ├── indexes.sql
│   └── reference_data.sql
├── queries/
│   ├── impact.sql
│   ├── spatial.sql
│   └── health.sql
├── seeds/
├── tests/
│   ├── test_schema.py
│   ├── test_migrations.py
│   ├── test_spatial.py
│   └── test_impact.py
├── README.md
└── .env.example
```

Application ORM models remain under `backend/app/db/models.py` unless the team intentionally separates persistence into a package.

## 4. Tech Stack & Explicit Dependencies

- PostgreSQL 15+ target baseline unless deployment standard changes it.
- PostGIS 3.x compatible with the selected PostgreSQL version.
- SQLAlchemy 2.x.
- `asyncpg` for async backend access.
- Alembic.
- GeoPandas/Shapely/PyProj for offline/preprocessing utilities where needed.
- `postgis/postgis` container image for local development.

The exact server versions must be pinned in deployment configuration once selected.

## 5. Environment Variables

```dotenv
POSTGRES_DB=sih
POSTGRES_USER=sih
POSTGRES_PASSWORD=replace-me
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql+asyncpg://sih:replace-me@postgres:5432/sih
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_STATEMENT_TIMEOUT_MS=15000
DEFAULT_SRID=4326
```

## 6. Schema

Required logical tables from the system Master README/API architecture:

```text
users
locations
weather_observations
terrain_features
satellite_features
soil_features
historical_events
predictions
risk_fusion_results
infrastructure
population_exposure
alerts
alert_history
model_versions
```

## 7. Canonical Table Specifications

### `users`

```text
id PK
email UNIQUE
password_hash
role
is_active
created_at
updated_at
```

### `locations`

```text
id PK
latitude
longitude
geom geometry(Point,4326)
name nullable
administrative_context JSONB nullable
created_at
```

### `weather_observations`

```text
id PK
location_id FK
observation_time
retrieved_at
source
rainfall_1h
rainfall_3h
rainfall_24h
rainfall_3d
rainfall_7d
temperature
humidity
wind_speed
raw_metadata JSONB
geom geometry(Point,4326) nullable
```

### `terrain_features`

```text
id PK
location_id FK
source
version
observed_or_generated_at
elevation
slope
aspect
curvature
tpi
tri
metadata JSONB
geom geometry(Point,4326)
```

### `satellite_features`

```text
id PK
location_id FK
source
collection
observation_time
retrieved_at
cloud_cover
ndvi
ndwi
change_score
water_change
vegetation_change
landcover
metadata JSONB
geom geometry(Point,4326)
```

### `soil_features`

```text
id PK
location_id FK
source
depth
clay
sand
silt
organic_carbon
bulk_density
ph
metadata JSONB
geom geometry(Point,4326)
```

### `historical_events`

```text
id PK
event_type -- flood/landslide
external_event_id
occurred_at
severity
latitude
longitude
geom geometry(Point,4326)
source
attributes JSONB
```

### `predictions`

Required fields:

```text
id PK
location_id FK
hazard_type
model_version
feature_schema_version
probability
risk_score
risk_level
prediction_timestamp
feature_snapshot JSONB
explanation JSONB
provenance JSONB
geom geometry(Point,4326)
```

The feature snapshot is critical because it allows the platform to explain the model inputs associated with a historic prediction.

### `risk_fusion_results`

```text
id PK
prediction_id FK
ml_probability
dl_probability
rule_score
environmental_score
weights JSONB
final_score
risk_level
fusion_model_version
created_at
```

### `infrastructure`

```text
id PK
asset_type
name
source
attributes JSONB
geom geometry(Geometry,4326)
```

### `population_exposure`

```text
id PK
source
population_count
attributes JSONB
geom geometry(Geometry,4326)
```

### `alerts`

```text
id PK
prediction_id nullable
hazard_type
severity
status
message
latitude
longitude
geom geometry(Point,4326)
generated_at
expires_at nullable
metadata JSONB
```

### `alert_history`

```text
id PK
alert_id FK
action
actor_id nullable
created_at
metadata JSONB
```

### `model_versions`

```text
id PK
model_name
version
hazard_type
artifact_uri
feature_schema_version
metrics JSONB
dataset_version
training_date
status
```

## 8. Spatial Reference Rules

Default application geometry uses `EPSG:4326` for API-facing coordinates. Spatial operations may use an appropriate projected CRS when distance/area calculations require metric units; the transformation must be explicit.

Never mix coordinate systems silently.

Example creation:

```sql
ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
```

The parameter order is longitude then latitude when constructing a geographic point.

## 9. Indexing Strategy

Required index patterns:

- GIST on geometry columns.
- B-tree on `prediction_timestamp`.
- B-tree on `hazard_type`.
- composite index for location/time where query patterns justify it.
- B-tree on `model_version`.
- alert status/time indexes.

Example:

```sql
CREATE INDEX idx_locations_geom
ON locations
USING GIST (geom);

CREATE INDEX idx_predictions_geom
ON predictions
USING GIST (geom);

CREATE INDEX idx_predictions_time_hazard
ON predictions (prediction_timestamp, hazard_type);
```

## 10. PostGIS Impact Queries

### Point-in-polygon

```sql
SELECT id, name
FROM administrative_regions
WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326));
```

### Risk-zone buffer

Buffer distance must use a CRS/unit-safe approach. For metric buffers, transform explicitly to an appropriate projected CRS before `ST_Buffer`, then transform back if necessary.

### Infrastructure intersection

```sql
SELECT i.id, i.asset_type, i.name
FROM infrastructure i
WHERE ST_Intersects(i.geom, :risk_geometry);
```

### Population exposure

```sql
SELECT COALESCE(SUM(p.population_count), 0)
FROM population_exposure p
WHERE ST_Intersects(p.geom, :risk_geometry);
```

Exact area-weighting logic must be used if population polygons only partially overlap the risk geometry; do not automatically treat any overlap as total exposure unless the dataset semantics justify it.

## 11. Impact Pipeline

```text
Final risk map/zone
   ↓
Risk geometry/buffer
   ↓
Spatial intersections
   ├── roads
   ├── buildings
   ├── schools
   ├── hospitals
   ├── bridges/critical assets
   └── population
   ↓
Exposure summary
   ↓
Backend impact response
```

## 12. Database Freshness / Provenance

Store data-source provenance with environmental observations and prediction feature snapshots.

Minimum provenance fields where applicable:

```text
source
provider
dataset
version
observation_time
retrieved_at
resolution
CRS
processing_method
```

## 13. Migrations

Flow:

```text
ORM/schema change
  ↓
alembic revision
  ↓
review generated SQL
  ↓
CI migration test
  ↓
staging migration
  ↓
production migration
```

Never edit an applied migration in place. Create a new migration.

## 14. Connection Pooling

The backend must use bounded DB pools. Long-running bulk spatial jobs should not starve the interactive API pool. Use separate worker/database policies where needed.

## 15. Local Setup

Using Docker Compose is preferred because PostGIS behavior is a core dependency.

```bash
docker compose up -d postgres
```

Migrations:

```bash
cd backend
alembic upgrade head
```

## 16. Docker Execution

```bash
docker compose up --build postgres backend
```

Persist database data using a named Docker volume.

## 17. Testing Specification

### Schema

- all required tables exist;
- PostGIS extension enabled;
- geometry types/SRIDs correct;
- required unique/FK constraints exist.

### Spatial

- point-in-polygon;
- buffer correctness;
- intersection correctness;
- CRS transformation tests.

### Impact

- known synthetic risk polygon intersects expected assets;
- population totals are stable;
- partial overlaps follow documented weighting rules.

### Security

- parameterized queries;
- no request input concatenated into SQL;
- restricted DB role for application user where operationally possible.

## 18. AI Coding Agent Rules (`.cursorrules`)

```text
DATABASE MODULE RULES
1. PostgreSQL + PostGIS is the authoritative application store.
2. Every geometry column has an explicit SRID.
3. API-facing latitude/longitude is EPSG:4326 unless the contract says otherwise.
4. Never mix SRIDs implicitly.
5. Use parameterized SQL only.
6. No SQL string concatenation using user-controlled values.
7. Repository layer owns database access; API routes do not query the DB directly.
8. Spatial indexes are required for frequently queried geometry columns.
9. Use GIST for geometry where appropriate.
10. Use explicit CRS transformations for metric distances/areas.
11. Do not assume overlapping polygons imply full population exposure.
12. Predictions must preserve feature_snapshot JSONB and provenance.
13. Every prediction must identify hazard, model version, feature schema version, probability, score, and timestamp.
14. Migrations must be additive/reviewable and tested from an empty database.
15. Never edit an already-applied migration instead of creating a new migration.
16. Keep raw SQL isolated in clearly named query modules when ORM is insufficient.
17. Add indexes based on measured query patterns, not blindly.
18. Do not store massive raster binaries in relational tables unless the storage design explicitly requires it.
19. External API credentials never belong in the database schema.
20. Tests must cover both relational and geospatial semantics.
```

## 19. Inter-Module Integration Contracts

| Consumer | Contract |
|---|---|
| Backend | repositories, SQLAlchemy models, impact query services |
| ML service | prediction feature snapshots and model metadata persisted through backend |
| Frontend | no direct DB access; consumes backend JSON |
| DevOps | PostGIS image, persistent volume, backups, migration command |
| Integration | stores normalized observations, provenance, history, alerts |

## 20. Definition of Done

- migrations reproducible;
- PostGIS extensions and indexes verified;
- SRID policy enforced;
- feature snapshots/provenance stored;
- impact queries tested;
- DB connection limits configured;
- backup/restore procedure documented in DevOps.
