# SIH Dual-Hazard — ML & DL Model Service README

> Production specification for `ml_service/`. Data alignment, feature engineering, training, inference, hybrid XGBoost + CNN spatial modelling, SHAP, fusion contracts, model artifacts, MLflow, validation, and model safety.

## 0. Model Boundary

The model layer converts validated, spatially and temporally aligned environmental inputs into probabilistic hazard outputs. Flood and Landslide remain separate physical branches. Each branch may use a tabular XGBoost model plus a spatial CNN/DL model, followed by branch fusion and then system-level risk fusion.

The external API master is relevant here because the model pipeline receives **normalized** backend data, never provider-specific payloads. API freshness and provenance must be preserved into the feature snapshot.

## 1. Module Scope & Responsibilities

### In scope

- Training and inference preprocessing parity.
- Dataset construction from historical events.
- Positive/negative sample generation.
- Spatial matching and temporal matching.
- Feature engineering.
- Tabular XGBoost modelling.
- Spatial CNN/DL modelling.
- Branch probabilities.
- Rule/environmental score inputs to fusion.
- SHAP explanation for supported tabular models.
- MLflow experiment tracking and model artifact packaging.
- Model validation, calibration, schema checking and versioning.

### Explicit non-goals

- HTTP API routing.
- Database migrations.
- Browser-side inference.
- Direct live provider credentials.
- Silent repair of invalid datasets without a documented transformation.

## 2. Directory Structure

```text
ml_service/
├── app/
│   ├── inference/
│   │   ├── predictor.py
│   │   ├── flood.py
│   │   ├── landslide.py
│   │   └── loader.py
│   ├── preprocessing/
│   │   ├── schema.py
│   │   ├── validation.py
│   │   ├── spatial.py
│   │   ├── temporal.py
│   │   └── transforms.py
│   ├── features/
│   │   ├── rainfall.py
│   │   ├── terrain.py
│   │   ├── satellite.py
│   │   ├── historical.py
│   │   └── build.py
│   ├── models/
│   │   ├── xgboost_model.py
│   │   ├── cnn_model.py
│   │   ├── flood_branch.py
│   │   ├── landslide_branch.py
│   │   └── fusion.py
│   ├── explainability/
│   │   └── shap.py
│   ├── tracking/
│   │   └── mlflow.py
│   ├── training/
│   │   ├── dataset.py
│   │   ├── train_xgb.py
│   │   ├── train_cnn.py
│   │   └── evaluate.py
│   └── config.py
├── artifacts/
│   ├── flood/
│   └── landslide/
├── tests/
├── notebooks/
├── scripts/
├── requirements.txt
├── Dockerfile
└── .env.example
```

## 3. Tech Stack & Explicit Dependencies

- Python 3.12.x baseline.
- NumPy, pandas, scikit-learn.
- XGBoost.
- PyTorch **or** TensorFlow; the exact DL framework is a project configuration decision and must not be mixed without explicit migration.
- SHAP.
- Rasterio, GeoPandas, Shapely, PyProj.
- MLflow.
- Joblib for compatible preprocessing artifacts.
- Optional DVC/object storage tooling if adopted by the deployment plan.

## 4. Environment Variables

```dotenv
ML_ENV=development
MODEL_ROOT=/models
DATA_ROOT=/data
MLFLOW_TRACKING_URI=http://mlflow:5000
MLFLOW_EXPERIMENT_PREFIX=sih
FEATURE_SCHEMA_VERSION=1.0
FLOOD_MODEL_VERSION=flood_xgb_v1.0
FLOOD_DL_MODEL_VERSION=flood_cnn_v1.0
LANDSLIDE_MODEL_VERSION=landslide_xgb_v1.0
LANDSLIDE_DL_MODEL_VERSION=landslide_cnn_v1.0
FUSION_MODEL_VERSION=fusion_v1.0
TARGET_CRS=EPSG:4326
RASTER_GRID_RESOLUTION=project-defined
PREDICTION_NODATA_POLICY=fail
DEVICE=auto
MAX_RASTER_MEMORY_MB=4096
```

No API credentials belong here unless a training ingestion workflow explicitly requires them; preferably ingestion remains outside the ML runtime.

## 5. Data Selection Rule

Every dataset entering the pipeline must have a documented role:

```text
Predictor
Target / Label
Exposure Feature
Validation / Reference
```

This prevents irrelevant datasets from becoming uncontrolled model inputs.

Typical project data:

- rainfall/weather;
- DEM-derived elevation, slope, aspect, curvature, TPI, TRI;
- SoilGrids soil properties;
- Sentinel-1/2-derived signals;
- Dynamic World / WorldCover;
- Global Surface Water;
- historical flood inventories;
- historical landslide inventories including NRSC/Bhuvan-derived records;
- exposure datasets for impact assessment.

Exposure should remain conceptually separate from hazard prediction unless the modelling specification explicitly promotes a feature into the predictor set.

## 6. Spatial Alignment Rules

Every dataset must be associated with:

- CRS;
- spatial resolution;
- bounds/extent;
- geometry/raster grid definition;
- nodata policy;
- pixel alignment convention.

The common representation is:

```text
Source datasets
  ↓
CRS normalization
  ↓
common spatial grid
  ↓
raster/vector alignment
  ↓
feature stack
```

The model must not assume two rasters are aligned because their filenames or dimensions match.

## 7. Temporal Alignment Rules

Historical events represent a point in time. Predictors must correspond to information available **at prediction time**, not after it.

Example:

```text
event_date = 2023-08-15
rainfall_window = 2023-08-14 → 2023-08-15
satellite = nearest valid observation available before/at the event cutoff
terrain = static/reference layer
soil = static/periodically updated layer
```

Post-event environmental values that would leak outcome information are prohibited.

## 8. Feature Engineering Contract

Required canonical features include, where data supports them:

### Rainfall

```text
rainfall_1h
rainfall_3h
rainfall_6h
rainfall_24h
rainfall_3d
rainfall_7d
rainfall_intensity
cumulative_rainfall
```

### Terrain

```text
elevation
slope
aspect
curvature
tpi
tri
ruggedness
```

### Satellite

```text
ndvi
ndwi
change_score
water_change
vegetation_change
landcover
```

### Historical

```text
distance_to_previous_event
historical_event_density
historical_susceptibility
time_since_previous_event
```

## 9. Feature Validation

Hard validation examples:

- latitude in `[-90,90]`;
- longitude in `[-180,180]`;
- rainfall >= 0;
- NDVI/NDWI in `[-1,1]` where those normalized indices are used;
- probability in `[0,1]`;
- risk score in `[0,100]`.

Invalid data must be:

```text
rejected
OR
corrected using a documented physical/data-quality rule
OR
marked missing
```

Do not silently clip all outliers to make a model run.

## 10. Hybrid Model Architecture

```text
                  Shared Feature Representation
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        FLOOD BRANCH              LANDSLIDE BRANCH
              │                         │
       ┌──────┴──────┐            ┌─────┴─────┐
       ▼             ▼            ▼           ▼
    XGBoost         CNN         XGBoost      CNN
       │             │            │           │
       ▼             ▼            ▼           ▼
   ML probability DL probability ML prob.  DL prob.
       │             │            │           │
       └──────┬──────┘            └────┬──────┘
              ▼                         ▼
         Flood fusion            Landslide fusion
              │                         │
              ▼                         ▼
       Flood probability       Landslide probability
              │                         │
              └──────────┬──────────────┘
                         ▼
                   Risk Fusion
```

The DL branch is complementary to XGBoost; it is not a replacement.

## 11. Flood Branch Contract

Primary features:

- rainfall and accumulations;
- elevation/slope;
- surface water;
- land cover;
- soil;
- drainage-related features where available;
- historical flood events;
- satellite water/change indicators.

Output:

```json
{
  "hazard": "flood",
  "ml_probability": 0.81,
  "dl_probability": 0.76,
  "branch_probability": 0.79,
  "model_versions": {
    "xgboost": "flood_xgb_v1.0",
    "dl": "flood_cnn_v1.0"
  }
}
```

## 12. Landslide Branch Contract

Primary features:

- rainfall and accumulations;
- slope/elevation/aspect/curvature/TPI/TRI;
- soil properties;
- NDVI/NDWI;
- vegetation change;
- land cover;
- historical landslides.

Output:

```json
{
  "hazard": "landslide",
  "ml_probability": 0.87,
  "dl_probability": 0.79,
  "branch_probability": 0.84,
  "model_versions": {
    "xgboost": "landslide_xgb_v1.0",
    "dl": "landslide_cnn_v1.0"
  }
}
```

## 13. Rule-Based Indicators

Rule-based hazard indicators may combine interpretable conditions such as:

```text
heavy rainfall
+
steep slope
+
high soil moisture
+
vegetation degradation
+
historical susceptibility
```

Rules are supporting evidence. They must not blindly override ML/DL output.

## 14. Risk Fusion Contract

Conceptual implementation:

```text
final_score =
    w_ml   * ml_probability
  + w_dl   * dl_probability
  + w_rule * rule_score
  + w_env  * environmental_score
```

Constraint:

```text
w_ml + w_dl + w_rule + w_env = 1
```

Weights must be configuration + experiment artifacts, not source-code constants.

The final score is normalized to 0–100 and classified using configurable thresholds. The frontend receives the authoritative risk level from the backend.

## 15. SHAP Explainability

For XGBoost:

1. load the exact trained preprocessing pipeline;
2. transform inference features identically;
3. calculate SHAP values with the compatible explainer;
4. map feature names from `feature_schema.json`;
5. produce a bounded, serializable explanation payload.

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

Explanations must be generated from the model pipeline, not hardcoded manually.

## 16. Model Artifact Contract

Every deployable model package must contain:

```text
model/
├── model.pkl / model.json
├── preprocessing.pkl
├── feature_schema.json
├── model_metadata.json
└── README.md
```

Metadata minimum:

```json
{
  "model_name": "landslide_xgboost",
  "version": "1.0",
  "features": [],
  "training_date": "",
  "metrics": {},
  "dataset_version": "",
  "feature_schema_version": "1.0",
  "target_definition": "",
  "crs": "EPSG:4326"
}
```

## 17. MLflow Tracking

Log at minimum:

- experiment name;
- parameters;
- metrics;
- dataset version;
- feature configuration/version;
- model artifact;
- evaluation results;
- model version.

Required evaluation metrics:

- precision;
- recall;
- F1;
- ROC-AUC;
- PR-AUC;
- confusion matrix;
- calibration where available.

Accuracy alone is insufficient for imbalanced disaster-event datasets.

## 18. Training Pipeline

```text
Historical events
  ↓
positive samples
  ↓
negative samples
  ↓
spatial matching
  ↓
temporal matching
  ↓
feature extraction
  ↓
feature validation
  ↓
train/validation/test split
  ↓
preprocessing
  ↓
XGBoost + DL training
  ↓
evaluation
  ↓
SHAP
  ↓
model versioning
  ↓
registry
```

Split strategy must avoid spatial/temporal leakage where the dataset design allows repeated neighboring or same-event observations.

## 19. Inference Pipeline

```text
Backend normalized inputs
  ↓
feature schema validation
  ↓
exact training preprocessing
  ↓
XGBoost inference + CNN inference
  ↓
branch fusion
  ↓
SHAP/explanation
  ↓
model provenance
  ↓
backend normalized result
```

## 20. Raster Memory Management

Heavy raster stacks must not be fully loaded into memory by default.

Required patterns:

- windowed reads with Rasterio;
- chunked processing;
- bounded concurrency;
- explicit `nodata` handling;
- `float32` where numerically sufficient;
- release references to large arrays after each stage;
- avoid accidental raster duplication during alignment;
- use on-disk intermediates for large jobs.

## 21. Model Deployment Gate

```text
Train
  ↓
Evaluate
  ↓
Register
  ↓
Validate
  ↓
Deploy candidate
  ↓
Health check
  ↓
Production
```

A new model must not automatically replace the production model solely because training completed.

## 22. Local Setup

```bash
cd ml_service
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
```

Training example:

```bash
python -m app.training.train_xgb --hazard landslide
python -m app.training.train_cnn --hazard landslide
python -m app.training.evaluate --hazard landslide
```

## 23. Docker Execution

```bash
docker build -t sih-ml-service:dev .
docker compose up --build ml_service mlflow
```

The ML runtime must mount model artifacts read-only in production where possible.

## 24. Testing Specification

### Unit

- feature functions;
- schema validation;
- probability range;
- fusion arithmetic;
- risk classification;
- artifact metadata validation.

### Regression

- training/inference preprocessing parity;
- fixed test fixtures;
- feature ordering;
- model output shape;
- model version.

### Geospatial

- CRS conversion;
- raster alignment;
- nodata propagation;
- temporal cutoff.

### Model quality

- precision/recall/F1;
- ROC-AUC/PR-AUC;
- calibration;
- confusion matrix;
- drift baseline.

## 25. AI Coding Agent Rules (`.cursorrules`)

```text
ML SERVICE RULES
1. Training preprocessing and inference preprocessing must be identical by artifact, not merely conceptually similar.
2. Never hardcode the production feature vector order.
3. Feature order comes from feature_schema.json.
4. Any feature rename is a schema/version change.
5. Never train with post-event information that would not be known at prediction time.
6. Never mix CRS silently; every raster/vector carries explicit CRS metadata.
7. Never assume raster resolution or alignment.
8. Use Rasterio windowed/chunked IO for heavy rasters.
9. Release large arrays and file handles deterministically.
10. Flood and landslide branches must remain separate even if they share utilities.
11. XGBoost and DL outputs must be numerically validated before fusion.
12. Fusion weights are configuration/experiment artifacts, not magic numbers in code.
13. SHAP must use the exact compatible model/preprocessing feature names.
14. Model artifacts are immutable once registered; create a new version for changes.
15. Do not change training data splits merely to improve a single metric without documenting the rationale.
16. Accuracy is never the sole acceptance metric for disaster-event models.
17. Do not claim certainty or 100% predictive accuracy.
18. Keep model loading separate from inference logic.
19. Any model change requires tests for output shape, probability range, schema, version, and representative predictions.
20. Never put external API secrets into the model package.
21. Long raster operations must be asynchronous/offloaded from the FastAPI request event loop.
22. Log dataset version, feature schema version, and model version for reproducibility.
```

## 26. Inter-Module Integration Contracts

| Consumer | Input/Output |
|---|---|
| Backend | normalized feature representation → probabilities, model versions, explanation |
| Database | model metadata and prediction provenance stored through backend |
| DevOps | immutable artifact/package + health/version info |
| Integration | provider freshness/provenance preserved into model feature metadata |
| Frontend | receives only backend-normalized result |

## 27. Definition of Done

- Training and inference produce identical feature schema.
- Every deployable artifact is versioned and traceable.
- Leakage checks are enforced.
- Spatial/temporal alignment tests pass.
- Flood and landslide branches are independently executable.
- Fusion and SHAP payloads are test-covered.
- MLflow records experiment context.
- Raster jobs obey memory bounds.
