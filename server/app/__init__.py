from flask import Flask
from flask_cors import CORS
from .config import Config
from .db import db
from flask_migrate import Migrate
from .routes.health import health_bp

migrate = Migrate() 

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)


    from .models import models


    return app
