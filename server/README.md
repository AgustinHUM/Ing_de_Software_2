# Server (Flask MVC)

## 1) Setup
```bash
pipenv install --dev
pipenv shell
cp .env.example .env
python wsgi.py
# -> http://127.0.0.1:5000/health  => {"status":"ok"}
```

## 2) Estructura
```
app/
  __init__.py        # app factory
  config.py          # configuración (env)
  db.py              # SQLAlchemy init
  routes/            # endpoints (V)
    __init__.py
    health.py
  models/            # modelos (M)
    __init__.py
    user.py
  controllers/       # lógica de negocio (C/servicios)
    __init__.py
    user_controller.py
wsgi.py
```

## 3) Migraciones (Alembic)
```bash
alembic init migrations
# editar migrations/env.py
#   from dotenv import load_dotenv; load_dotenv()
#   import os; config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))
alembic revision -m "init" --autogenerate
alembic upgrade head
```

## 4) Docker (opcional)
```bash
docker compose up --build
# API: http://127.0.0.1:5000/health
```
