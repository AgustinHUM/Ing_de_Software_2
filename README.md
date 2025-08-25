# Tinder de Películas — Sprint 1 (Setup)

Este repo contiene el **andamiaje inicial** para el proyecto:
- Backend **Flask** en arquitectura **MVC** con endpoint `/health`
- Conexión a **PostgreSQL** (local)
- Archivo `.env.example`
- Instrucciones para **Mobile (Expo)** y **AWS** en `docs/`

> Objetivo del Sprint 1: que cualquiera pueda **clonar, configurar y levantar** el backend y un **ping** desde la app móvil en 10–15 minutos.

---

## 0) Requisitos locales

- macOS (Intel o Apple Silicon)
- `git`
- **Homebrew** (si no lo tenés):  
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
- **Node.js** vía `nvm`:
  ```bash
  brew install nvm
  mkdir -p ~/.nvm
  # Agregar a ~/.zshrc
  echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
  echo '[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"' >> ~/.zshrc
  source ~/.zshrc
  nvm install --lts
  nvm use --lts
  ```
- **Python 3.11** (sugerido con `pyenv`) y **pipenv**:
  ```bash
  brew install pyenv
  pyenv install 3.11.9
  pyenv global 3.11.9
  python -m pip install --upgrade pip
  pip install pipenv
  ```
- **PostgreSQL 16**:
  ```bash
  brew install postgresql@16
  brew services start postgresql@16
  createdb tinderpelis_dev
  psql -d tinderpelis_dev -c "CREATE USER tinder WITH PASSWORD 'tinder';"
  psql -d tinderpelis_dev -c "GRANT ALL PRIVILEGES ON DATABASE tinderpelis_dev TO tinder;"
  ```

---

## 1) Backend (Flask MVC)

### 1.1 Variables de entorno
Copiá `.env.example` a `.env` dentro de `server/` y ajustá si querés:
```bash
cp server/.env.example server/.env
```

### 1.2 Instalar dependencias y correr
```bash
cd server
pipenv install --dev
pipenv shell
python wsgi.py
```
Abrí: http://127.0.0.1:5000/health → debería responder `{"status":"ok"}`.

### 1.3 Migraciones (opcional en Sprint 1)
Inicializá Alembic:
```bash
alembic init migrations
# Editá migrations/env.py para leer la URL desde .env (ver server/README.md)
alembic revision -m "init" --autogenerate
alembic upgrade head
```

---

## 2) Mobile (Expo)

Seguí `mobile/README.md` para crear el proyecto con Expo y pegar el `App.tsx` sugerido. La app debe tener un botón **Ping API** que haga `fetch` a `http://127.0.0.1:5000/health` y muestre `ok`.

---

## 3) AWS (base)
En `docs/aws-setup.md` están los pasos para:
- Crear cuenta y activar MFA
- Crear Budget
- Configurar AWS CLI (SSO recomendado)
- Crear un bucket S3 para artefactos

---

## 4) Docker (opcional)
Podés levantar API + DB con `docker-compose.yml` (ver `server/README.md`).

---

## Flujo de ramas sugerido

- `main`: estable
- `dev`: integración del sprint
- `feat/*`: ramas de feature con PR a `dev` (1 review)

Plantillas de PR/Issues pueden sumarse más adelante.
