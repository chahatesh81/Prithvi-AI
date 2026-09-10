import time
from app.workers.celery_app import celery_app


@celery_app.task(name="sih.tasks.ingest_satellite_data")
def ingest_satellite_data(latitude: float, longitude: float):
    # Asynchronous heavy satellite acquisition job
    time.sleep(2)
    return {
        "status": "COMPLETED",
        "latitude": latitude,
        "longitude": longitude,
        "scenes_processed": 4
    }
