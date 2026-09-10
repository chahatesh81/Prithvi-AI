from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter(
    "http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds", "HTTP request latency in seconds", ["endpoint"]
)

ML_INFERENCE_COUNT = Counter(
    "ml_inference_total", "Total ML inference calls", ["hazard_type", "status"]
)

ML_INFERENCE_LATENCY = Histogram(
    "ml_inference_duration_seconds", "ML inference latency", ["hazard_type"]
)
