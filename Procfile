web: gunicorn run:app
worker: celery -A celery_worker.celery worker --loglevel=info -P eventlet
beat: celery -A celery_worker.celery beat --loglevel=info