from flask import Flask
from flask_cors import CORS
from .config import Config
from .db import init_db
from .routes.health import health_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    init_db(app)

    # Blueprints
    app.register_blueprint(health_bp, url_prefix="/")

    return app
