import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def current_utc_time() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time, onupdate=current_utc_time)


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    district: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    tehsil: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    village: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    administrative_context: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    geometry_geojson: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)

    weather_observations = relationship("WeatherObservation", back_populates="location", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="location", cascade="all, delete-orphan")


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("locations.id", ondelete="CASCADE"), index=True)
    observation_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, default=current_utc_time)
    retrieved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)
    source: Mapped[str] = mapped_column(String(100), default="OpenMeteo")
    
    rainfall_1h: Mapped[float] = mapped_column(Float, default=0.0)
    rainfall_24h: Mapped[float] = mapped_column(Float, default=0.0)
    rainfall_3d: Mapped[float] = mapped_column(Float, default=0.0)
    rainfall_7d: Mapped[float] = mapped_column(Float, default=0.0)
    rainfall_intensity: Mapped[float] = mapped_column(Float, default=0.0)
    temperature: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    humidity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    wind_speed: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_moisture: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    raw_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    location = relationship("Location", back_populates="weather_observations")


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("locations.id", ondelete="CASCADE"), index=True)
    hazard_type: Mapped[str] = mapped_column(String(50), index=True)  # flood, landslide, dual
    model_version: Mapped[str] = mapped_column(String(100), default="1.0.0")
    feature_schema_version: Mapped[str] = mapped_column(String(50), default="1.0")
    
    flood_probability: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    landslide_probability: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0 to 100
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False)  # LOW, MODERATE, HIGH, VERY_HIGH, CRITICAL
    confidence: Mapped[float] = mapped_column(Float, default=0.85)
    
    prediction_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, default=current_utc_time)
    feature_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    explanation: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    provenance: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    location = relationship("Location", back_populates="predictions")
    fusion_result = relationship("RiskFusionResult", back_populates="prediction", uselist=False)
    impact_assessment = relationship("ImpactAssessment", back_populates="prediction", uselist=False)


class RiskFusionResult(Base):
    __tablename__ = "risk_fusion_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    prediction_id: Mapped[str] = mapped_column(String(36), ForeignKey("predictions.id", ondelete="CASCADE"), unique=True)
    flood_probability: Mapped[float] = mapped_column(Float, default=0.0)
    landslide_probability: Mapped[float] = mapped_column(Float, default=0.0)
    rule_score: Mapped[float] = mapped_column(Float, default=0.0)
    environmental_score: Mapped[float] = mapped_column(Float, default=0.0)
    weights: Mapped[dict] = mapped_column(JSON, nullable=False)
    final_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False)
    fusion_model_version: Mapped[str] = mapped_column(String(50), default="fusion_v1.0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)

    prediction = relationship("Prediction", back_populates="fusion_result")


class ImpactAssessment(Base):
    __tablename__ = "impact_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    prediction_id: Mapped[str] = mapped_column(String(36), ForeignKey("predictions.id", ondelete="CASCADE"), unique=True)
    affected_population: Mapped[int] = mapped_column(Integer, default=0)
    exposed_road_length_km: Mapped[float] = mapped_column(Float, default=0.0)
    exposed_buildings_count: Mapped[int] = mapped_column(Integer, default=0)
    critical_infrastructure: Mapped[dict] = mapped_column(JSON, default=dict)
    severity_rating: Mapped[str] = mapped_column(String(50), default="MODERATE")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)

    prediction = relationship("Prediction", back_populates="impact_assessment")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    prediction_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True)
    location_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("locations.id", ondelete="CASCADE"), nullable=True)
    hazard_type: Mapped[str] = mapped_column(String(50), index=True)
    severity: Mapped[str] = mapped_column(String(50), index=True)  # LOW, MODERATE, HIGH, VERY_HIGH, CRITICAL
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", index=True)  # ACTIVE, ACKNOWLEDGED, RESOLVED
    message: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    fingerprint: Mapped[str] = mapped_column(String(100), index=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    location_name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    scenario_parameters: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)

    result = relationship("SimulationResult", back_populates="scenario", uselist=False, cascade="all, delete-orphan")


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    scenario_id: Mapped[str] = mapped_column(String(36), ForeignKey("simulation_scenarios.id", ondelete="CASCADE"), unique=True)
    baseline_flood_prob: Mapped[float] = mapped_column(Float, nullable=False)
    baseline_landslide_prob: Mapped[float] = mapped_column(Float, nullable=False)
    baseline_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    scenario_flood_prob: Mapped[float] = mapped_column(Float, nullable=False)
    scenario_landslide_prob: Mapped[float] = mapped_column(Float, nullable=False)
    scenario_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_delta: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level_change: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)

    scenario = relationship("SimulationScenario", back_populates="result")


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    origin_latitude: Mapped[float] = mapped_column(Float, nullable=False)
    origin_longitude: Mapped[float] = mapped_column(Float, nullable=False)
    dest_latitude: Mapped[float] = mapped_column(Float, nullable=False)
    dest_longitude: Mapped[float] = mapped_column(Float, nullable=False)
    travel_mode: Mapped[str] = mapped_column(String(50), default="driving")
    geometry_geojson: Mapped[dict] = mapped_column(JSON, nullable=False)
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    duration_minutes: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)

    risk_assessment = relationship("RouteRiskAssessment", back_populates="route", uselist=False, cascade="all, delete-orphan")


class RouteRiskAssessment(Base):
    __tablename__ = "route_risk_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    route_id: Mapped[str] = mapped_column(String(36), ForeignKey("routes.id", ondelete="CASCADE"), unique=True)
    flood_exposure: Mapped[float] = mapped_column(Float, default=0.0)
    landslide_exposure: Mapped[float] = mapped_column(Float, default=0.0)
    combined_risk: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(50), default="LOW")
    rank: Mapped[int] = mapped_column(Integer, default=1)
    hotspots: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)

    route = relationship("Route", back_populates="risk_assessment")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    model_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    hazard_type: Mapped[str] = mapped_column(String(50), nullable=False)
    feature_schema_version: Mapped[str] = mapped_column(String(50), default="1.0")
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")  # ACTIVE, DEPRECATED, CANDIDATE
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=current_utc_time)
