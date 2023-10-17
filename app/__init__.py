from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from config.app_config import Config
from dotenv import load_dotenv

BASE_DIR = Config.BASE_DIR

# Load the .env file from the parent directory of BASE_DIR (which is the root directory of crypto_scraper)
load_dotenv(os.path.join(os.path.dirname(BASE_DIR), '.env'))

db = SQLAlchemy()

print("[DEBUG] About to create Flask app.")
def create_app():
    app = Flask(__name__, static_folder='../frontend/static', static_url_path='/static')
    app.config.from_object('config.app_config.Config')
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///crypto_data.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # set secret key with heroku
    app.secret_key = os.environ.get('FLASK_SECRET_KEY') or 'a_default_secret_key'

    db.init_app(app)
    print("[DEBUG] Initializing database with app.")

    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)
    print("[DEBUG] Registering blueprints.")
    return app