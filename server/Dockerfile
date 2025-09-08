FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		build-essential \
		libpq-dev \
	&& rm -rf /var/lib/apt/lists/*
# Instalar pipenv y dependencias
RUN pip install --no-cache-dir pipenv &&     pipenv install   --system --deploy


EXPOSE 5000
CMD ["python", "wsgi.py"]
