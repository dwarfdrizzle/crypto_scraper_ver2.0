import requests
import sys
import os
from datetime import datetime
from celery_worker import celery
from app import db
from db_operations import prune_oldest_records

# Get the directory of the current script (tasks.py)
current_directory = os.path.dirname(os.path.abspath(__file__))

#sys.path.append(os.path.dirname(os.path.abspath(r'C:\Users\ewanl\Desktop\crypto_scraper\app')))

# Go one level up to crypto_scraper and then append the app folder
app_directory = os.path.join(current_directory, '..', 'app')
# Add this directory to sys.path
sys.path.append(app_directory)

from app.models import BTCPrice
from app import db, create_app


app = create_app()

BINANCE_API_URL = "https://api.binance.com/api/v3/ticker?symbol=BTCUSDT" #avgPrice change for binance 
COINBASEPRO_API_URL = "https://api.pro.coinbase.com/products/BTC-USD/ticker"
POLONIEX_API_URL = "https://api.poloniex.com/markets/btc_usdt/price"

@celery.task
def fetch_binance():
    with app.app_context():
        response = requests.get(BINANCE_API_URL)
        data = response.json()
        try:
            price_value = float(data['lastPrice'])
        except KeyError:
            print("Price key not found in the Binance API response!")
            return  # Exit the function/task if 'price' key is not found

        price = BTCPrice(
            exchange="Binance",
            currency_pair="BTC/USDT",
            price=price_value,
            timestamp=datetime.utcnow()
        )

        db.session.add(price)
        db.session.commit()

        prune_oldest_records()  # Call the pruning func here

@celery.task
def fetch_coinbase():
    with app.app_context():
        response = requests.get(COINBASEPRO_API_URL)
        data = response.json()

        price = BTCPrice(
            exchange="Coinbase Pro",
            currency_pair="BTC/USDT",
            price=float(data['price']),
            timestamp=datetime.utcnow()
        )
        
        db.session.add(price)
        db.session.commit()
        
        prune_oldest_records() #And here

        

@celery.task
def fetch_poloniex():
    with app.app_context():
        response = requests.get(POLONIEX_API_URL)
        data = response.json()

        price = BTCPrice(
            exchange="Poloniex",
            currency_pair="BTC/USDT",
            price=float(data['price']),
            timestamp=datetime.utcnow()
        )
        
        db.session.add(price)
        db.session.commit()
        
        prune_oldest_records () #Again

        

if __name__ == "__main__":
    fetch_binance()
    fetch_coinbase()
    fetch_poloniex()