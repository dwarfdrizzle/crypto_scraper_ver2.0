from datetime import timedelta
import os

# Using RabbitMQ as a message broker with CLOUDAMQP on Heroku and local default RabbitMQ
CELERY_BROKER_URL = os.environ.get('CLOUDAMQP_URL', 'amqps://ipmkxngc:4haXrXwqipmSQ7H0JmfQ0pUfJuk_yN7a@toad.rmq.cloudamqp.com/ipmkxngc')

# No need for RPC or backend, because fire and forget solution reduce load
CELERY_RESULT_BACKEND = None

# Importing tasks from the tasks module
CELERY_IMPORTS = ('scraper.tasks', )

BROKER_POOL_LIMIT = 1

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
