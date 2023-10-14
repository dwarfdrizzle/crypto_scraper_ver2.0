from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from config.app_config import Config

BASE_DIR = Config.BASE_DIR
db = SQLAlchemy()

#app = Flask(__name__)

print("[DEBUG] About to create Flask app.")
def create_app():
    
    app = Flask(__name__, static_folder='../frontend/static', static_url_path='/static')
    app.config.from_object('config.app_config.Config')

    db.init_app(app)
    print("[DEBUG] Initializing database with app.")
    with app.app_context():
        if not os.path.exists(os.path.join(BASE_DIR, 'instance', 'crypto_data.db')):
            db.create_all()

    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)
    print("[DEBUG] Registering blueprints.")
    return app