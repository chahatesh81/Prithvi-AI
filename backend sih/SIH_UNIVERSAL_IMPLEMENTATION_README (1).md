# SIH Dual-Hazard Flood & Landslide Early Warning and Decision Support System
# UNIVERSAL IMPLEMENTATION README

> **Status:** Master cross-system implementation specification  
> **Audience:** Every coding agent and every developer working on this repository  
> **Scope:** ML, data engineering, backend, database, frontend, simulation, routing, alerts, integration, Docker, testing, CI/CD and deployment

---

## 1. PURPOSE

This document is the **universal source of truth for implementation across the SIH-NEW project**.

Any agent working on any part of the system MUST read this file before modifying code.

The project is a **Dual-Hazard Flood + Landslide Early Warning and Decision Support System**.

The architecture is intentionally separated into hazard-specific branches:

```text
                    MULTI-SOURCE DATA
                           |
                           v
               VALIDATION / PREPROCESSING
                           |
                           v
             SPATIAL + TEMPORAL ALIGNMENT
                           |
                           v
                  FEATURE ENGINEERING
                           |
             +-------------+-------------+
             |                           |
             v                           v
       FLOOD BRANCH                LANDSLIDE BRANCH
             |                           |
        XGBoost + DL                XGBoost + DL
             |                           |
             v                           v
       Flood Probability        Landslide Probability
             |                           |
             +-------------+-------------+
                           |
                           v
                      RISK FUSION
                           |
                           v
                    FINAL RISK SCORE
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
     EXPLANATION        IMPACT            TREND
          |             ANALYSIS             |
          +----------------+----------------+
                           |
                           v
                         ALERTS
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
     WHAT-IF           ALTERNATIVE       DECISION
    SIMULATOR            ROUTES           SUPPORT
                           |
                           v
                        FASTAPI
                           |
               +-----------+-----------+
               |                       |
               v                       v
       PostgreSQL/PostGIS          React/TypeScript
```

The existing project specification establishes the progression:

**DATA → FEATURES → ML/DL → RISK → IMPACT → ALERT → DECISION SUPPORT → PRODUCTION → CONTINUOUS MONITORING.**

---

# 2. NON-NEGOTIABLE ARCHITECTURE RULES

Every agent MUST follow these rules.

1. The frontend MUST NOT connect directly to PostgreSQL/PostGIS.
2. The frontend MUST NOT contain ML models or ML inference logic.
3. The frontend communicates through the FastAPI backend.
4. The backend is the central application/API gateway.
5. The ML service owns model loading, preprocessing parity, inference and model explanations.
6. PostgreSQL/PostGIS stores structured application and geospatial information.
7. Raw datasets are immutable.
8. Large raster/satellite datasets MUST NOT be blindly imported into PostgreSQL.
9. Do not invent data, labels, metrics, API responses or model performance.
10. Do not silently change another subsystem's contract.
11. Do not create duplicate APIs, database tables or services without inspecting the existing implementation.
12. Do not hard-code credentials, API keys or machine-specific paths.
13. Do not commit secrets.
14. Do not commit the large acquired dataset to GitHub.
15. Historical training data MUST NOT contain future information.
16. Random spatial splitting MUST NOT be used blindly where it creates spatial leakage.
17. Training preprocessing MUST equal inference preprocessing.
18. Exposure data must be distinguished from hazard predictors.
19. A frontend button is NOT a completed feature unless its required backend/data/ML/database path actually works.
20. Every cross-service feature must be implemented and tested end-to-end where applicable.

---

# 3. COMPLETE SYSTEM FEATURE REGISTRY

The following are system-level features.

An agent MUST determine the implementation required in every affected layer.

## 3.1 Core Hazard Prediction

### Flood

- Current rainfall
- Rainfall intensity
- 24-hour rainfall
- 3-day accumulated rainfall
- 7-day accumulated rainfall
- Antecedent rainfall
- Rainfall anomaly where supported
- Soil moisture where available
- Surface-water indicators
- Elevation
- Terrain/drainage indicators
- Land cover
- Historical flood occurrence
- Satellite-derived water indicators

### Landslide

- Rainfall
- Rainfall intensity
- Antecedent rainfall
- Elevation
- Slope
- Aspect
- Curvature
- TPI
- TRI
- Soil properties
- Land cover
- Vegetation condition
- Moisture/surface-water indicators where scientifically justified
- Historical landslide occurrence
- Satellite-derived indicators

Satellite features may include, where supported by available data:

- NDVI
- NDWI
- Vegetation change
- Water change
- Land-cover class
- Temporal change
- Radar-derived features
- Optical spectral indicators

---

# 4. DATASETS AND DATA ENGINEERING

Datasets have already been acquired.

Agents MUST first inspect what already exists.

Do NOT automatically redownload datasets.

For every dataset determine:

```text
dataset_name
source
path
format
size
spatial_extent
temporal_extent
resolution
CRS
variables/bands
raw_or_processed
hazard_role
feature_role
label_role
exposure_role
validation_status
```

## 4.1 Validation

Validate:

- File integrity
- File readability
- CRS
- Geometry
- Spatial bounds
- Resolution
- NoData
- Missing values
- Duplicate records
- Duplicate spatial features
- Timestamp validity
- Temporal coverage
- Attribute schema
- Raster dimensions
- Raster alignment
- Corrupted files

Do not silently repair raw data.

Create reproducible processed outputs instead.

## 4.2 Spatial Alignment

All spatial sources used together must have a documented alignment strategy.

Check:

- CRS
- resolution
- grid alignment
- spatial extent
- resampling method
- nearest-neighbour vs bilinear/cubic where appropriate
- geometry validity

## 4.3 Temporal Alignment

Every time-dependent feature must have an explicit timestamp relationship to the prediction/event.

Examples:

```text
prediction_time
rainfall_24h_before_prediction
rainfall_3d_before_prediction
rainfall_7d_before_prediction
satellite_observation_before_prediction
```

Do not use observations unavailable at prediction time.

---

# 5. FEATURE ENGINEERING

Feature engineering must be reproducible and versioned.

## 5.1 Common Feature Families

### Rainfall

```text
rainfall_current
rainfall_intensity
rainfall_24h
rainfall_3d
rainfall_7d
antecedent_rainfall
rainfall_anomaly
```

Only create a feature if its source and temporal definition actually exist.

### Terrain

```text
elevation
slope
aspect
curvature
tpi
tri
```

### Satellite

```text
NDVI
NDWI
vegetation_change
water_change
land_cover
radar_features
optical_features
```

### Soil

Use scientifically justified variables actually available from the acquired soil datasets.

### Exposure

Potential exposure features include:

```text
population
roads
buildings
critical_infrastructure
schools
hospitals
bridges
```

Exposure should normally be used for impact assessment unless there is a documented scientific reason to use a particular exposure variable as a predictor.

---

# 6. MACHINE LEARNING ARCHITECTURE

The ML architecture consists of two hazard branches.

```text
             SHARED FEATURE REPRESENTATION
                         |
              +----------+----------+
              |                     |
              v                     v
         FLOOD BRANCH          LANDSLIDE BRANCH
              |                     |
       +------+-------+       +-----+------+
       |              |       |            |
       v              v       v            v
    XGBoost           DL    XGBoost        DL
       |              |       |            |
       +------+-------+       +-----+------+
              |                     |
              v                     v
       Flood Probability     Landslide Probability
              |                     |
              +----------+----------+
                         |
                         v
                    Risk Fusion
                         |
                         v
                   Final Risk Score
```

## 6.1 Model Requirements

The ML subsystem must support:

- Dataset construction
- Label construction
- Spatial/temporal matching
- Feature engineering
- XGBoost
- Spatial DL/CNN as specified by the ML service specification
- Model fusion/ensemble
- Risk fusion
- SHAP/explainability
- Calibration
- Evaluation
- Versioning
- MLflow/model tracking
- Inference

## 6.2 Training/Inference Parity

The exact same transformations must be used for:

```text
TRAINING
   =
INFERENCE
```

Model packages should include:

```text
model
preprocessing
feature_schema
input_schema
output_schema
model_metadata
metrics
dataset_version
training_configuration
README
```

## 6.3 Evaluation

Do NOT report accuracy alone.

Evaluate as appropriate:

- Precision
- Recall
- F1
- ROC-AUC
- PR-AUC
- Confusion matrix
- Calibration
- Threshold-dependent performance

Do not fabricate target performance.

---

# 7. RISK FUSION

The system must combine the two hazard probabilities into a final decision-support risk score.

```text
Flood Probability
       +
Landslide Probability
       |
       v
Risk Fusion
       |
       v
Final Risk Score 0–100
       |
       v
Risk Level
```

The fusion method must be:

- deterministic
- documented
- configurable
- versioned
- tested

Never hide fusion weights inside frontend code.

---

# 8. EXPLAINABILITY

The system may provide:

- Feature contribution
- SHAP values
- Top contributing features
- Explanation summary
- Model version

Important:

**Feature contribution is not causal proof.**

The frontend must explain model output without changing the underlying model result.

---

# 9. IMPACT ASSESSMENT

Hazard probability and impact are different concepts.

```text
Hazard Risk
     |
     v
Spatial Overlay
     |
     +---- Population
     +---- Roads
     +---- Buildings
     +---- Critical Infrastructure
     |
     v
Impact Estimate
```

Potential outputs:

- affected population estimate
- affected road length
- affected buildings
- affected infrastructure
- affected schools
- affected hospitals
- affected administrative areas

Only calculate impact from available and validated exposure data.

---

# 10. ALERT ENGINE

The alert engine consumes validated risk results.

Conceptual levels:

```text
LOW
MODERATE
HIGH
VERY_HIGH
CRITICAL
```

Alert records should support:

```text
alert_id
location
hazard_type
risk_score
risk_level
trigger_reason
created_at
valid_until
model_version
status
```

Alerts must be generated by backend/service logic, not only by frontend JavaScript.

---

# 11. TREND ANALYSIS

Where sufficient historical/current observations exist:

```text
Historical Risk
      |
      v
Trend Analysis
      |
      v
Increasing / Decreasing / Stable
```

Do not infer trends from insufficient observations.

---

# 12. WHAT-IF SIMULATOR

## 12.1 Purpose

The What-If Simulator allows the user to create a hypothetical environmental scenario and evaluate how the modeled hazard/risk could change.

Example:

```text
CURRENT CONDITIONS
       |
       v
BASELINE PREDICTION
       |
       +-------------------+
                           |
                 User modifies scenario
                           |
                           v
                    SCENARIO FEATURES
                           |
                           v
                     ML INFERENCE
                           |
                           v
                     RISK FUSION
                           |
                           v
                  SCENARIO PREDICTION
                           |
                           v
                  BASELINE vs SCENARIO
```

## 12.2 Simulator Inputs

Expose only scenario variables that have a valid relationship to the trained model.

Possible controls:

- rainfall amount
- rainfall increase/decrease
- rainfall intensity
- rainfall duration
- soil moisture scenario where supported
- selected location
- scenario time
- other model-supported environmental variables

Do NOT expose arbitrary internal ML features.

## 12.3 Simulator Safety

The simulator MUST:

- preserve original observations
- never overwrite real weather/satellite data
- clearly distinguish scenario from observation
- record scenario parameters
- identify model versions
- identify simulation timestamp

## 12.4 Simulator Output

Conceptual output:

```json
{
  "baseline_flood_probability": 0.0,
  "scenario_flood_probability": 0.0,
  "baseline_landslide_probability": 0.0,
  "scenario_landslide_probability": 0.0,
  "baseline_risk_score": 0.0,
  "scenario_risk_score": 0.0,
  "risk_change": 0.0,
  "risk_level_change": "",
  "scenario_metadata": {},
  "model_versions": {}
}
```

This is a conceptual contract. Existing API contracts take precedence.

## 12.5 Simulator Architecture

```text
React Simulator
      |
      | POST scenario
      v
FastAPI
      |
      v
Scenario Service
      |
      v
Feature Service
      |
      v
ML Service
      |
      v
Flood + Landslide Models
      |
      v
Risk Fusion
      |
      v
Scenario Result
      |
      v
React
```

---

# 13. ALTERNATIVE ROUTE / ROUTE RISK

## 13.1 Purpose

The system should help users identify lower-modeled-risk routes between an origin and destination when routing data and hazard layers are available.

This is **decision support**, not a new ML prediction target.

## 13.2 Inputs

```text
origin
destination
travel mode
current/prediction time
risk preference
```

## 13.3 Route Pipeline

```text
Origin + Destination
        |
        v
Routing Engine
        |
        v
Candidate Routes
        |
        v
Hazard Spatial Overlay
        |
        +---- Flood Risk
        +---- Landslide Risk
        +---- Road Exposure
        |
        v
Route Risk Scoring
        |
        v
Route Ranking
        |
        v
Alternative Route Recommendation
```

## 13.4 Route Scoring

Where supported, consider:

- flood exposure
- landslide exposure
- combined hazard risk
- hazardous segments/hotspots
- road exposure
- distance
- estimated travel time
- road availability/status

Do NOT simply choose the shortest route.

Do NOT describe any modeled route as absolutely "safe".

Use terminology such as:

```text
Lower modeled hazard exposure
Higher modeled hazard exposure
```

## 13.5 Route Output

Conceptual output:

```text
route_id
geometry
distance
estimated_duration
flood_exposure
landslide_exposure
combined_risk
risk_level
hazard_hotspots
route_rank
```

---

# 14. BACKEND ARCHITECTURE

FastAPI is the central application/API layer.

Backend responsibilities:

- Authentication
- Request validation
- API orchestration
- External data services
- Weather service
- Satellite service
- Terrain service
- Feature service
- ML service communication
- Risk fusion where assigned
- Impact analysis
- Alert engine
- What-if simulation
- Route-risk analysis
- Database access
- Error handling
- Logging
- Health checks

Use:

```text
API Route
   |
   v
Service
   |
   v
Repository / External Service / ML Service
```

Do not put all business logic inside route handlers.

---

# 15. BACKEND API GROUPS

Conceptual API groups include:

```text
/api/v1/health
/api/v1/weather
/api/v1/locations
/api/v1/predict
/api/v1/predictions
/api/v1/risk
/api/v1/impact
/api/v1/alerts
/api/v1/simulate
/api/v1/routes
/api/v1/routes/alternative
/api/v1/explanations
/api/v1/history
```

These are conceptual names only.

Agents MUST inspect existing APIs before creating or renaming endpoints.

---

# 16. DATABASE ARCHITECTURE

Use PostgreSQL + PostGIS where specified.

The database should support structured, application and geospatial information.

Conceptual entities include:

```text
users
locations
hazard_events
weather_observations
feature_metadata
predictions
risk_assessments
impact_assessments
alerts
routes
route_risk_assessments
route_hazard_segments
simulation_scenarios
simulation_results
model_versions
audit_logs
```

These are conceptual entities.

If equivalent existing tables already exist, reuse them rather than creating duplicates.

## 16.1 Spatial Database

Use PostGIS for appropriate:

- points
- lines
- polygons
- spatial relationships
- spatial indexes

Maintain consistent SRIDs.

## 16.2 Large Data

Do NOT put the entire acquired raster/satellite dataset into PostgreSQL.

Keep large source/derived files in appropriate data/artifact storage.

Use the database for:

- metadata
- structured records
- application state
- predictions
- scenarios
- routes
- alerts
- relevant geospatial records

---

# 17. SIMULATION DATABASE CONTRACT

Simulation data must be separate from observed data.

Conceptually:

```text
simulation_scenario
       |
       +--- baseline reference
       +--- modified parameters
       +--- model versions
       |
       v
simulation_result
```

Never overwrite observations.

---

# 18. ROUTE DATABASE CONTRACT

If route persistence is required:

```text
routes
route_risk_assessments
route_hazard_segments
```

Use PostGIS geometry.

Avoid unnecessary duplication of route geometries.

---

# 19. FRONTEND ARCHITECTURE

React + TypeScript frontend responsibilities include:

## Dashboard

- Current risk
- Flood probability
- Landslide probability
- Combined risk
- Confidence
- Trend
- Active alerts

## Map

- Flood hazard
- Landslide hazard
- Combined risk
- Affected areas
- Infrastructure
- Population/exposure
- Hazard hotspots
- Route risk
- Alternative routes
- Selected locations

## Prediction

- Location selection
- Prediction request
- Risk display
- Explanation
- Timestamp
- Model version where useful

## What-If Simulator

- Scenario controls
- Baseline/scenario comparison
- Risk change
- Hazard probability change
- Scenario map where supported
- Clear "simulation" labeling

## Alternative Route

- Origin
- Destination
- Route selection
- Route comparison
- Hazard exposure
- Risk score
- Risk hotspots
- Distance
- Travel time
- Alternative route ranking

## Impact

- Population
- Roads
- Buildings
- Critical assets

## Alerts

- Alert list
- Severity
- Hazard
- Location
- Trigger reason
- Time/status

---

# 20. FRONTEND STATE MANAGEMENT

Every API-driven feature must support:

```text
IDLE
LOADING
SUCCESS
ERROR
NO_DATA
```

Do not show fake prediction values when an API fails.

Use typed API contracts.

Do not duplicate backend calculations in React.

---

# 21. API CONTRACT BETWEEN SERVICES

All services must agree on request/response schemas.

Conceptual prediction response:

```json
{
  "location": {},
  "timestamp": "",
  "flood_probability": 0.0,
  "landslide_probability": 0.0,
  "risk_score": 0.0,
  "risk_level": "",
  "confidence": 0.0,
  "model_versions": {},
  "explanation": {}
}
```

This is illustrative.

Existing versioned API contracts take precedence.

---

# 22. COMPLETE FEATURE DEPENDENCY RULE

Whenever an agent implements a feature, it MUST determine:

```text
1. What is the user-facing requirement?
2. What data is required?
3. Does ML change?
4. Does preprocessing change?
5. Does backend change?
6. Does database change?
7. Does frontend change?
8. Does an API contract change?
9. Does Docker/configuration change?
10. What tests are required?
11. What documentation must change?
```

### Example: What-If Simulator

```text
Frontend
   |
   v
Simulation API
   |
   v
Backend
   |
   v
Scenario Builder
   |
   v
Feature Service
   |
   v
ML Service
   |
   v
Flood + Landslide Models
   |
   v
Risk Fusion
   |
   v
Simulation Result
   |
   v
Frontend
```

### Example: Alternative Route

```text
Frontend
   |
   v
Route API
   |
   v
Backend
   |
   v
Routing Engine
   |
   v
Hazard Overlay
   |
   v
Risk Scoring
   |
   v
Database
   |
   v
Frontend
```

---

# 23. AUTHENTICATION AND SECURITY

Never expose:

- database passwords
- API keys
- provider tokens
- internal service credentials

Use environment variables.

Validate all user-provided:

- coordinates
- scenario parameters
- route inputs
- dates/times
- filters

Apply authorization where required.

---

# 24. OFFLINE / DEMO MODE

The system must support reliable SIH presentation.

```text
LIVE MODE
   OR
DEMO/OFFLINE MODE
```

Demo mode may use:

- validated local datasets
- packaged model artifacts
- deterministic demo scenarios

Demo data must not be presented as live observations.

The mode should be clearly identifiable internally.

---

# 25. DOCKER AND SERVICE INTEGRATION

The target integrated stack is conceptually:

```text
frontend
backend
ml-service
postgres/postgis
redis
worker
mlflow (if required)
```

Expected communication:

```text
Browser
   |
   v
localhost:frontend
   |
   v
backend
   |
   +----> ml-service
   |
   +----> postgres
   |
   +----> redis
```

Use service names inside Docker networks.

Do not hard-code Windows machine paths inside containers.

Use environment variables.

Large datasets remain outside Git and may be mounted into containers where needed.

---

# 26. TESTING

Every subsystem requires tests.

## 26.1 ML Tests

- Dataset validation
- Feature generation
- Label generation
- Spatial alignment
- Temporal alignment
- Leakage checks
- Model loading
- Inference
- Schema validation

## 26.2 Backend Tests

- API routes
- Request validation
- Services
- Database integration
- ML integration
- Simulation
- Route risk
- Alerts
- Error handling

## 26.3 Database Tests

- Migrations
- Constraints
- Foreign keys
- Spatial queries
- Indexes
- CRUD
- Rollback where supported

## 26.4 Frontend Tests

- Components
- API clients
- Prediction rendering
- Maps
- Simulator
- Routes
- Alerts
- Loading/error/no-data states

## 26.5 End-to-End

The primary path must work:

```text
Frontend
   |
   v
Backend
   |
   v
ML
   |
   v
Database
   |
   v
Backend
   |
   v
Frontend
```

---

# 27. CI/CD

The repository should support automated:

```text
Lint
Type checking
Unit tests
Integration tests
Build
Docker validation
Security checks
```

Do not deploy code that has not passed required automated checks.

---

# 28. MODEL AND ARTIFACT VERSIONING

Model artifacts must be versioned.

At minimum track:

```text
model_name
model_version
dataset_version
feature_schema_version
training_date
training_configuration
metrics
preprocessing_version
code_version
```

Do not commit large model artifacts to GitHub unless explicitly justified.

Use MLflow or appropriate artifact storage.

---

# 29. GIT AND AGENT HANDOFF

GitHub is the source-code synchronization mechanism.

Do not use GitHub as storage for the 30+ GB acquired dataset.

## Handoff process

```text
AGENT A
   |
   v
Implement
   |
   v
Test
   |
   v
Commit
   |
   v
Push
   |
   v
GITHUB
   |
   v
AGENT B
   |
   v
Pull
   |
   v
Review
   |
   v
Continue
```

Before handoff, update:

```text
README/AGENT_HANDOFF.md
```

with:

```text
Current stage:
Completed:
Files changed:
Tests passed:
Known issues:
Pending work:
API changes:
Database changes:
ML changes:
Frontend changes:
Next recommended task:
```

---

# 30. AGENT OPERATING PROTOCOL

Every coding agent entering the repository MUST:

1. Read `README/UNIVERSAL_README.md`.
2. Read the relevant subsystem README.
3. Inspect existing code.
4. Inspect existing contracts.
5. Inspect existing database schema.
6. Inspect existing ML feature schema.
7. Identify cross-layer dependencies.
8. Create an implementation plan.
9. Implement incrementally.
10. Run tests.
11. Update documentation.
12. Commit logically.
13. Update the handoff document when work is being transferred.

An agent MUST NOT:

- rebuild the entire system unnecessarily
- delete working code without justification
- silently change architecture
- fabricate data
- fabricate model performance
- bypass FastAPI
- connect frontend directly to PostgreSQL
- put ML models inside frontend code
- modify raw datasets
- invent API contracts
- invent database schema without inspection
- change ML feature definitions without updating the feature schema
- silently change risk-fusion logic

---

# 31. FEATURE DEFINITION OF DONE

A feature is complete only when all required layers work.

Checklist:

```text
[ ] Requirement understood
[ ] Data source identified
[ ] ML impact checked
[ ] Backend impact checked
[ ] Database impact checked
[ ] Frontend impact checked
[ ] API contract defined
[ ] Error handling implemented
[ ] Tests implemented
[ ] Integration tested
[ ] Documentation updated
[ ] Git commit created
```

For a cross-system feature, "button exists" is NOT sufficient.

---

# 32. UNIVERSAL AGENT PROMPT

Use this prompt when starting any new coding agent:

```text
Read README/UNIVERSAL_README.md completely.

This is the cross-system source of truth for the SIH-NEW project.

Then read the README specific to the subsystem you are working on.

Before modifying anything:

1. Inspect the existing implementation.
2. Inspect existing APIs and schemas.
3. Inspect existing database structures.
4. Inspect existing ML features/models where relevant.
5. Identify all cross-layer dependencies.
6. Determine whether the requested feature affects ML, backend, database, frontend, data, Docker, testing or deployment.
7. Do not invent missing requirements.
8. Do not duplicate existing functionality.
9. Produce an implementation plan.
10. Implement incrementally.
11. Run appropriate tests.
12. Update all affected documentation.
13. Create a clean Git commit.
14. Update README/AGENT_HANDOFF.md when handing work to another agent.

IMPORTANT:

A system feature must be implemented end-to-end when required.

Do not create a frontend-only mock for a feature that requires backend/ML/database functionality.

Do not create backend endpoints without corresponding contracts and tests.

Do not modify ML features without updating feature schemas and inference compatibility.

Do not modify database structures without migrations.

Do not modify raw datasets.

Preserve the existing architecture unless there is a documented technical reason to change it.
```

---

# 33. FINAL SYSTEM VISION

The final platform should operate as:

```text
                         USER
                          |
                          v
                  REACT DASHBOARD
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
       MONITOR        SIMULATOR        ROUTING
          |               |               |
          +---------------+---------------+
                          |
                          v
                       FASTAPI
                          |
          +---------------+----------------+
          |               |                |
          v               v                v
     DATA SERVICES    ML SERVICE      ROUTING SERVICE
          |               |                |
          |        +------+------+          |
          |        |             |          |
          |        v             v          |
          |      FLOOD       LANDSLIDE      |
          |      XGB+DL       XGB+DL        |
          |        |             |          |
          |        +------+------+          |
          |               |                 |
          |               v                 |
          |          RISK FUSION             |
          |               |                 |
          +---------------+-----------------+
                          |
                          v
                   IMPACT ANALYSIS
                          |
                          v
                        ALERTS
                          |
                          v
                    POSTGRES/POSTGIS
                          |
                          v
                    DECISION SUPPORT
```

The system should ultimately provide:

- Dual-hazard flood prediction
- Dual-hazard landslide prediction
- Combined risk fusion
- Risk confidence
- Explainability
- Impact assessment
- Risk trends
- Alerts
- Historical analysis
- What-If simulation
- Alternative route/risk-aware routing
- Live-data integration where available
- Offline/demo mode
- Model/version management
- Monitoring
- Reproducible deployment

The guiding principle is:

**Every feature must belong to the system architecture, not merely to a UI screen.**

**DATA → FEATURES → ML/DL → RISK → IMPACT → ALERT → DECISION SUPPORT → PRODUCTION → CONTINUOUS MONITORING**
