# SIH Dual-Hazard — Cloud, CI/CD & Deployment README

> Production specification for `devops/`. Docker, Compose, Nginx, cloud hosting, CI/CD, secrets, monitoring, model deployment gates, database migration, and offline demo reliability.

## 1. Module Scope & Responsibilities

### In scope

- Container build specifications.
- Docker Compose development stack.
- Nginx reverse proxy.
- TLS/HTTPS boundary.
- GitHub Actions CI/CD.
- Container registry publishing.
- Environment/secret injection.
- Database migrations during deployment.
- Application health/readiness/liveness.
- Prometheus/Grafana metrics.
- Structured log collection.
- Deployment rollback principles.
- Offline/demo fallback packaging.

### Explicit non-goals

- Implementing UI components.
- Writing ML algorithms.
- Defining DB schema business semantics.
- Calling external APIs from CI for ordinary unit tests.

## 2. Deployment Topology

```text
                         Internet
                            │
                         HTTPS
                            ▼
                        Nginx / TLS
                     ┌──────┴──────┐
                     ▼             ▼
                React/Nginx     FastAPI
                                   │
            ┌──────────────────────┼─────────────────────┐
            ▼                      ▼                     ▼
        PostgreSQL               Redis             ML Service
         + PostGIS                                     │
                                                       ▼
                                                     MLflow
                                                       
External APIs are reached by FastAPI/adapters; frontend never reaches them directly.
```

## 3. Directory Structure

```text
devops/
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── ml.Dockerfile
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
├── compose/
│   ├── docker-compose.yml
│   ├── docker-compose.demo.yml
│   └── docker-compose.prod.yml
├── prometheus/
│   └── prometheus.yml
├── grafana/
│   ├── dashboards/
│   └── provisioning/
├── deployment/
│   ├── aws/
│   ├── gcp/
│   ├── azure/
│   └── scripts/
├── backup/
├── scripts/
└── README.md

.github/
└── workflows/
    ├── ci.yml
    ├── cd.yml
    └── model-validation.yml
```

## 4. Tech Stack & Explicit Dependencies

- Docker Engine + Docker Compose.
- Node 20+ builder image for frontend.
- Python 3.12 base for backend/ML services.
- `postgis/postgis` for local DB.
- Redis.
- Nginx.
- GitHub Actions.
- Container registry of choice.
- Prometheus + Grafana.
- Cloud host: AWS/GCP/Azure VM or managed application/container service consistent with team deployment choice.

## 5. Environment Variables / Secrets

```dotenv
COMPOSE_PROJECT_NAME=sih
APP_ENV=production
FRONTEND_PORT=3000
BACKEND_PORT=8000
ML_PORT=8100
POSTGRES_PORT=5432
REDIS_PORT=6379
MLFLOW_PORT=5000
DATABASE_URL=postgresql+asyncpg://sih:${POSTGRES_PASSWORD}@postgres:5432/sih
REDIS_URL=redis://redis:6379/0
SECRET_KEY=
WEATHER_API_KEY=
MOSDAC_USERNAME=
MOSDAC_PASSWORD=
COPERNICUS_CLIENT_ID=
COPERNICUS_CLIENT_SECRET=
MODEL_REGISTRY_URL=
MODEL_PATH=/models
DEMO_MODE=false
```

Production secrets must come from a cloud secret manager, CI/CD secret store, Docker secrets, or equivalent. `.env` files are local development artifacts only.

## 6. Multi-Container Compose Contract

Required services:

```yaml
services:
  frontend:
    build: ./frontend
    depends_on:
      - backend

  backend:
    build: ./backend
    depends_on:
      - postgres
      - redis
      - ml_service

  ml_service:
    build: ./ml_service

  postgres:
    image: postgis/postgis
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7

  mlflow:
    image: mlflow/mlflow
    profiles: ["ml"]
```

Actual image versions must be pinned in the repository.

## 7. Port Matrix

| Service | Host port | Container port |
|---|---:|---:|
| Frontend dev | 3000 or 5173 | 80 or Vite port |
| Backend | 8000 | 8000 |
| ML service | 8100 | 8100 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| MLflow | 5000 | 5000 |
| Nginx production | 80/443 | 80/443 |

Only Nginx and intentionally public application ports should be exposed in production.

## 8. Frontend Dockerfile Contract

```text
Node builder
  ↓
install
  ↓
validate types/tests
  ↓
npm run build
  ↓
Nginx runtime
  ↓
serve static assets
```

Do not copy secrets into the image. Remember that `VITE_*` values are build-time client-visible configuration.

## 9. Backend Dockerfile Contract

```text
Python base
  ↓
install pinned dependencies
  ↓
copy application
  ↓
run migrations as controlled deployment step
  ↓
serve via Uvicorn/Gunicorn
```

Production uses a process manager/ASGI configuration appropriate to the host. Development uses `--reload`; production does not.

## 10. Nginx Reverse Proxy

Production flow:

```text
Browser
  │ HTTPS
  ▼
Nginx
  ├── /        → frontend
  └── /api/    → FastAPI
```

Requirements:

- TLS certificates;
- HTTP→HTTPS redirect;
- security headers;
- request size limits;
- upstream timeouts;
- access/error logs;
- WebSocket configuration only if a future channel requires it.

## 11. CI Pipeline

On pull requests:

```text
git push
  ↓
GitHub Actions
  ├── checkout
  ├── dependency install
  ├── lint
  ├── format check
  ├── TypeScript type check
  ├── Python type check
  ├── unit tests
  ├── API tests
  ├── ML tests
  ├── integration tests
  ├── security checks
  └── Docker build verification
```

Tests must prefer mocks/fixtures for external providers.

## 12. CD Pipeline

After protected-branch approval:

```text
main
 ↓
build images
 ↓
immutable image tag
 ↓
push registry
 ↓
deploy candidate
 ↓
run Alembic migration
 ↓
health/readiness checks
 ↓
smoke test
 ↓
traffic enabled
```

Use immutable tags such as:

```text
sih-backend:<git-sha>
sih-frontend:<git-sha>
sih-ml:<git-sha>
```

Do not deploy mutable `latest` as the production identity.

## 13. Model Deployment Pipeline

```text
Train
 ↓
Evaluate
 ↓
MLflow register
 ↓
Model validation workflow
 ↓
Candidate deployment
 ↓
Health check
 ↓
Production promotion
```

A model artifact must carry its model version, dataset version and feature schema version.

## 14. Database Migration Deployment

```bash
alembic upgrade head
```

Migration is a first-class deployment step and must be tested in CI against a fresh PostGIS database.

## 15. Cloud Architecture

The deployment can be hosted on AWS, GCP or Azure using VM/container/application services. The exact cloud service is intentionally a deployment choice, but the logical boundary must remain:

```text
Internet
  ↓
Load balancer/reverse proxy
  ↓
Frontend + Backend
  ↓
Private PostgreSQL/PostGIS + Redis + ML services
```

Production DB and Redis should not be publicly reachable.

## 16. Monitoring

Prometheus metrics should include:

### Application

- request count;
- status code rate;
- latency;
- P95/P99;
- active requests.

### ML

- prediction count;
- inference latency;
- model version;
- prediction distribution;
- model/service health.

### Infrastructure

- CPU;
- memory;
- disk;
- container health;
- DB connections.

Grafana dashboards should provide a system overview and drill-down panels.

## 17. Logging

JSON structured logs should carry:

```text
timestamp
request_id
service
endpoint
hazard
model_version
latency
status_code
error
```

Never log passwords, API keys, access tokens, or unnecessary personal information.

## 18. Health / Readiness / Liveness

`GET /health` should verify critical dependencies and report a structured state. Production orchestration may additionally expose separate liveness/readiness endpoints.

Health example:

```json
{
  "status": "healthy",
  "database": "connected",
  "models": "loaded",
  "version": "1.0.0"
}
```

## 19. Offline Demo Deployment

The system must be demonstrable even when external APIs are unavailable.

```text
DEMO_MODE=true
  ↓
Validated static datasets / fallback JSONs
  ↓
Same normalized backend contracts
  ↓
Same frontend UI
```

Demo mode is a controlled data source, not an exception path sprinkled across UI components.

## 20. Local Execution

Root project:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Keep named volumes unless intentionally resetting development state:

```bash
docker compose down -v
```

## 21. Testing

### CI

- lint/type check;
- unit tests;
- API tests;
- integration tests;
- ML regression tests;
- migration tests;
- Docker build.

### Deployment smoke tests

- `GET /health`;
- frontend loads;
- login if enabled;
- weather endpoint;
- dual prediction endpoint using a deterministic fixture/demo source;
- history/impact/alerts;
- database connectivity.

## 22. Security Hardening

- least privilege container users where supported;
- read-only filesystems where feasible;
- no secrets in Dockerfiles;
- pinned dependencies/images;
- immutable image tags;
- HTTPS;
- private DB network;
- restrictive security groups/firewalls;
- rate limiting at proxy/backend;
- CI dependency and image scanning.

## 23. AI Coding Agent Rules (`.cursorrules`)

```text
DEVOPS MODULE RULES
1. Never hardcode secrets in Dockerfiles, Compose files, scripts, or workflows.
2. All credentials arrive through environment/secrets injection.
3. Do not use mutable production image tags as release identity.
4. Every production image is traceable to a commit SHA/version.
5. Pin base images and critical dependency versions.
6. Keep frontend/backend/ML containers separately buildable.
7. Use health checks for services with readiness dependencies.
8. Never expose PostgreSQL/Redis publicly in production unless there is an explicit reviewed reason.
9. Migrations are a controlled deployment step, not an application startup side effect unless explicitly designed and guarded.
10. CI uses mocks/fixtures for external APIs; do not make ordinary PR tests depend on provider availability.
11. Production deployments require health/smoke verification before full traffic.
12. Rollback must restore the previous application image without destroying persistent DB state.
13. Docker Compose development defaults must not be copied blindly to production security posture.
14. Monitoring and structured logs are part of Definition of Done for new services.
15. Demo mode must use clearly labeled static/cached data.
16. Do not modify Nginx routing without verifying CORS/API path behavior.
17. Any new environment variable must be documented in every relevant .env.example and deployment secret list.
18. Least privilege is the default container/runtime policy.
19. CI workflow changes require validation of secrets, permissions, cache usage, and artifact publication paths.
20. Cloud-specific code belongs under infra/deployment, not in application modules.
```

## 24. Inter-Module Integration Contracts

| Module | DevOps contract |
|---|---|
| Frontend | Node build, Nginx static server, `VITE_API_BASE_URL` strategy |
| Backend | Python container, `/health`, env vars, port 8000 |
| ML | model artifacts, port 8100, MLflow integration |
| Database | PostGIS image, volume, migrations |
| Integration | external provider secrets, Redis cache, scheduled workers |

## 25. Definition of Done

- clean production Docker builds;
- CI gates enforced;
- CD publishes immutable images;
- migration step tested;
- health checks pass;
- monitoring dashboards exist;
- secrets are externalized;
- offline demo stack works;
- rollback procedure is tested.
