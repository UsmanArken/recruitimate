from celery import Celery
from app.core.config import get_settings


def make_celery() -> Celery:
    settings = get_settings()
    app = Celery(
        "recruitimate",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
        include=["app.workers.tasks"],
    )
    app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
    )
    return app


celery = make_celery()
