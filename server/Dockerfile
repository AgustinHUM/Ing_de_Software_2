FROM python:3.11-slim

WORKDIR /app
COPY . /app

# Instalar pipenv y dependencias
RUN pip install --no-cache-dir pipenv &&     pipenv install --system --deploy

EXPOSE 5000
CMD ["python", "wsgi.py"]
