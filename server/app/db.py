from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    # Si quisieras crear tablas sin Alembic (no recomendado en prod):
    # with app.app_context():
    #     db.create_all()
