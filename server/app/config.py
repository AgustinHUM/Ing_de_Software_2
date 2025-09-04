import os


class Config:
<<<<<<< HEAD
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or "sqlite:///instance/dev.db"
=======
    SQLALCHEMY_DATABASE_URI = 'postgresql://dbmaster:password@ingsoft2.cj06eqq0ykhj.us-east-2.rds.amazonaws.com:5432/IngSoft2_db'
>>>>>>> origin/rama_lautaro
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")


'postgresql://dbmaster:password@ingsoft2.cj06eqq0ykhj.us-east-2.rds.amazonaws.com:5432/IngSoft2_db'