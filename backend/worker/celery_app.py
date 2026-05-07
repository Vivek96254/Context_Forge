from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "rag_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    task_soft_time_limit=3000,
)

# Ensure tasks are registered when the worker starts.
# Without this, queued tasks like `worker.tasks.process_document_task`
# can fail with KeyError in the consumer.
import worker.tasks  # noqa: F401
