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

#API URLs
BINANCE_API_URL = "https://api.binance.com/api/v3/ticker?symbol=BTCUSDT" #avgPrice change for binance 
COINBASEPRO_API_URL = "https://api.pro.coinbase.com/products/BTC-USD/ticker"
POLONIEX_API_URL = "https://api.poloniex.com/markets/btc_usdt/price" #no api endpoint for price + volume
BYBIT_API_URL = "https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT" #volume 24
GATEIO_API_URL = "https://data.gateapi.io/api2/1/ticker/btc_usdt" #GATEIO api
BITFINEX_API_URL = "https://api.bitfinex.com/v1/pubticker/btcusd" #BitfinexAPI 


@celery.task #Binance
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
            volume=float(data['volume']),
            timestamp=datetime.utcnow()
        )

        db.session.add(price)
        db.session.commit()

        prune_oldest_records()  # Call the pruning func here

@celery.task #Coinbase
def fetch_coinbase():
    with app.app_context():
        response = requests.get(COINBASEPRO_API_URL)
        data = response.json()

        price = BTCPrice(
            exchange="Coinbase Pro",
            currency_pair="BTC/USDT",
            price=float(data['price']),
            volume=float(data['volume']),
            timestamp=datetime.utcnow()
        )
        
        db.session.add(price)
        db.session.commit()
        
        prune_oldest_records() #And here

        

#@celery.task
#d ef fetch_poloniex():
    #with app.app_context():
        #response = requests.get(POLONIEX_API_URL)
        #data = response.json()

        #price = BTCPrice(
            #exchange="Poloniex",
            #currency_pair="BTC/USDT",
            #price=float(data['price']),
            #volume=float(data['volume']),
            #timestamp=datetime.utcnow()
        #)
        
        #db.session.add(price)
        #db.session.commit()
        
        #prune_oldest_records () 


@celery.task #Bybit
def fetch_bybit():
    with app.app_context():
        response = requests.get(BYBIT_API_URL)
        data = response.json()

        try:
            # Accessing the nested 'lastPrice' within the 'list' inside 'result'
            btc_ticker = data['result']['list'][0]  # Assuming BTCUSDT is the first item in the list
            price_value = float(btc_ticker['lastPrice'])

            price = BTCPrice(
                exchange="Bybit",
                currency_pair="BTC/USDT",
                price=price_value,
                volume=btc_ticker.get('volume24h', 0),  # Using .get() for safe access
                timestamp=datetime.utcnow()
            )

            db.session.add(price)
            db.session.commit()

            prune_oldest_records()

        except (KeyError, IndexError, TypeError) as e:
            print(f"Error accessing data in the Bybit API response: {e}")

@celery.task #GateIO
def fetch_gateio():
    with app.app_context():
        response = requests.get(GATEIO_API_URL)
        data = response.json()
        try:
            price_value = float(data['last'])
        except KeyError:
            print("Price key not found in the GateIO API response!")
            return  # Exit the function/task if 'price' key is not found
        
        try:
            volume_value = float(data['baseVolume'])
        except KeyError:
            print("Volume key not found in the GateIO API response!")
            return # it should complete

        price = BTCPrice(
            exchange="Gateio",
            currency_pair="BTC/USDT",
            price=price_value,
            volume=volume_value,
            timestamp=datetime.utcnow()
        )

        db.session.add(price)
        db.session.commit()

        prune_oldest_records()  # Call the pruning func here

@celery.task #Bitfinex
def fetch_bitfinex():
    with app.app_context():
        response = requests.get(BITFINEX_API_URL)
        data = response.json()
        try:
            price_value = float(data['last_price'])
        except KeyError:
            print("Price key not found in the Bitfinex API response!")
            return  # Exit the function/task if 'price' key is not found
        
        try:
            volume_value = float(data['volume'])
        except KeyError:
            print("Volume key not found in the Bitfinex API response!")
            return # it should complete

        price = BTCPrice(
            exchange="Bitfinex",
            currency_pair="BTC/USDT",
            price=price_value,
            volume=volume_value,
            timestamp=datetime.utcnow()
        )

        db.session.add(price)
        db.session.commit()

        prune_oldest_records()  # Call the pruning func here

if __name__ == "__main__":
    fetch_binance()
    fetch_coinbase()
    #fetch_poloniex()
    fetch_bybit()
    fetch_gateio()
    fetch_bitfinex