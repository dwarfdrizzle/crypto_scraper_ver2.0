from flask import Blueprint, jsonify, render_template
from sqlalchemy.exc import OperationalError
from .models import BTCPrice
from . import db

main = Blueprint('main', __name__)

@main.route('/display')
def display():
    data = db.session.query(BTCPrice).all()
    return render_template('display_data.html', data=data)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/<string:crypto_type>_prices', methods=['GET'])
def get_crypto_prices(crypto_type):
    if crypto_type.lower() == 'btc':
        try:
            prices = BTCPrice.query.order_by(BTCPrice.timestamp.desc()).limit(100).all()
            prices_data = [{'exchange': price.exchange, 'price': price.price, 'timestamp': price.timestamp} for price in prices]
            return jsonify(prices_data)
        except OperationalError:
            return jsonify({'message': 'No data available yet.'}), 200
    else:
        return jsonify({'message': f'Prices for {crypto_type.upper()} not available yet.'}), 200
    
