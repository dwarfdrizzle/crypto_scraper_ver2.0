from datetime import timedelta

# Using RabbitMQ as a message broker
CELERY_BROKER_URL = 'pyamqp://guest:guest@localhost//'
    
# Using RPC as a result backend
CELERY_RESULT_BACKEND = 'rpc://'

# Importing tasks from the tasks module
CELERY_IMPORTS = ('scraper.tasks', )

# Beats settings
CELERYBEAT_SCHEDULE = {
    'fetch_binance-every-t-seconds': {
        'task': 'scraper.tasks.fetch_binance',
        'schedule': timedelta(seconds=1),
    },
    'fetch_coinbase-every-t-seconds': {
        'task': 'scraper.tasks.fetch_coinbase',
        'schedule': timedelta(seconds=1),
    },
    'fetch_poloniex-every-t-seconds': {
        'task': 'scraper.tasks.fetch_poloniex',
        'schedule': timedelta(seconds=1),
    },
}
