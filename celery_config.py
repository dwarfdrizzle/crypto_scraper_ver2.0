from datetime import timedelta
import os

# Using RabbitMQ as a message broker with CLOUDAMQP on Heroku and local default RabbitMQ
broker_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# No need for RPC or backend, because fire and forget solution reduce load
result_backend = None

# Importing tasks from the tasks module
imports = ('scraper.tasks', )

broker_pool_limit = 1

# Beats settings
beat_schedule = {
    'fetch_binance-every-t-seconds': {
        'task': 'scraper.tasks.fetch_binance',
        'schedule': timedelta(seconds=1),
    },
    'fetch_coinbase-every-t-seconds': {
        'task': 'scraper.tasks.fetch_coinbase',
        'schedule': timedelta(seconds=1),
    },
    #'fetch_poloniex-every-t-seconds': {
        #'task': 'scraper.tasks.fetch_poloniex',
        #'schedule': timedelta(seconds=1),
    #},
    'fetch_bybit-every-t-seconds': {
        'task': 'scraper.tasks.fetch_bybit',
        'schedule': timedelta(seconds=1),
    },
    'fetch_gateio-every-t-seconds': {
        'task': 'scraper.tasks.fetch_gateio',
        'schedule': timedelta(seconds=1),
    },
      'fetch_bitfinex-every-t-seconds': {
        'task': 'scraper.tasks.fetch_bitfinex',
        'schedule': timedelta(seconds=1),
    },
    'fetch_cryptocom-every-t-seconds': {
        'task': 'scraper.tasks.fetch_cryptocom',
        'schedule': timedelta(seconds=1),
    },
}
