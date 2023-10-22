from app import create_app
from celery import Celery

def make_celery():
    app = create_app()
    celery = Celery(app.import_name)
    celery.config_from_object('celery_config')

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery()

if __name__ == '__main__':
    celery.start()
    print("[DEBUG] Creating Celery instance.")