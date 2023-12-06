from app import db

class BTCPrice(db.Model):
    __tablename__= 'price' #Sets table name
    id = db.Column(db.Integer, primary_key=True)
    exchange = db.Column(db.String(50), nullable=False)
    currency_pair = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    volume = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    def as_dict(self):
        return {
            'id': self.id,
            'exchange': self.exchange,
            'currency_pair': self.currency_pair,
            'price': self.price,
            'volume': self.volume,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }