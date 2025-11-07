# 🐍 Backend Testing Guide

## 📋 Descripción

Guía completa para testing del backend Flask + PostgreSQL de Tinder Pelis.

## 🏗️ Estructura

```
server/
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Fixtures y configuración
│   ├── unit/                # Tests unitarios
│   │   ├── test_basic.py
│   │   ├── test_aux_functions.py
│   │   ├── test_auth_functions.py
│   │   ├── test_movie_functions.py
│   │   └── test_group_functions.py
│   └── integration/         # Tests de integración
│       ├── test_app.py
│       ├── test_group_endpoints.py
│       └── test_movie_endpoints.py
├── pytest.ini              # Configuración de pytest
└── run_tests.py            # Script de utilidad
```

## 🚀 Comandos Disponibles

### Script de Utilidad (`run_tests.py`)

```bash
# Tests unitarios
python run_tests.py unit

# Tests de integración
python run_tests.py integration

# Todos los tests
python run_tests.py all

# Tests con cobertura
python run_tests.py coverage
```

### Comandos Directos

```bash
# Ejecutar todos los tests
pytest tests/ -v

# Solo tests unitarios
pytest tests/unit/ -v

# Solo tests de integración
pytest tests/integration/ -v

# Con cobertura
pytest tests/ --cov=app --cov-report=html

# Tests específicos
pytest tests/unit/test_auth_functions.py -v
```

## 🧪 Tipos de Tests

### Tests Unitarios
- **Propósito**: Probar funciones individuales en aislamiento
- **Ubicación**: `tests/unit/`
- **Ejemplos**: Validación de datos, funciones auxiliares, lógica de negocio

### Tests de Integración
- **Propósito**: Probar interacción entre componentes
- **Ubicación**: `tests/integration/`
- **Ejemplos**: Endpoints API, base de datos, servicios externos

## 🔧 Configuración

### pytest.ini
```ini
[tool:pytest]
minversion = 6.0
addopts = -s --strict-markers --ignore=app/
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
markers =
    unit: Mark a test as a unit test.
    integration: Mark a test as an integration test.
    e2e: Mark a test as an end-to-end test.
```

### conftest.py
- **Fixtures**: app, client, auth_headers, db_session, cognito_mock
- **Base de datos**: SQLite in-memory para tests
- **Mocks**: AWS Cognito, servicios externos

## 📊 Tests Actuales

### Tests Unitarios (4 archivos)
- **test_auth_functions.py** - Funciones de autenticación
- **test_aux_functions.py** - Funciones auxiliares
- **test_group_functions.py** - Funciones de grupos
- **test_movie_functions.py** - Funciones de películas

### Tests de Integración (9 archivos, 154 tests pasando)
- **test_app.py** - Configuración básica de aplicación Flask
- **test_auth_endpoints.py** - Endpoints de autenticación (register/login)
- **test_movie_endpoints.py** - Endpoints de películas (búsqueda, detalles, recomendadas)
- **test_group_endpoints.py** - Endpoints de grupos (crear, unirse, salir, usuarios)
- **test_favorites_endpoints.py** - Endpoints de favoritos
- **test_ratings_endpoints.py** - Endpoints de calificaciones
- **test_user_endpoints.py** - Endpoints de usuario
- **test_forms_endpoints.py** - Endpoints de formularios
- **test_matching_sessions_endpoints.py** - Endpoints de matching sessions

**Total:** 154 tests de integración pasando + tests unitarios

## 🎯 Mejores Prácticas

### Naming
- Archivos: `test_*.py`
- Clases: `Test*`
- Funciones: `test_*`

### Estructura
```python
@pytest.mark.unit
class TestFunctionName:
    """Tests para función específica"""
    
    def test_specific_behavior(self):
        """Test que verifica comportamiento específico"""
        # Arrange
        input_data = "test"
        
        # Act
        result = function_to_test(input_data)
        
        # Assert
        assert result == expected_output
```

### Fixtures
- Usar fixtures para setup/teardown
- Mockear servicios externos
- Usar base de datos in-memory

## 🐛 Troubleshooting

### Error: ModuleNotFoundError
```bash
# Asegurar que estás en el directorio correcto
cd server
python -m pytest tests/
```

### Error: Database connection
```bash
# Verificar configuración de SQLite
# Los tests usan SQLite in-memory automáticamente
```

### Error: Import issues
```bash
# Verificar PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

## 📈 Cobertura

### Generar Reporte
```bash
pytest tests/ --cov=app --cov-report=html
```

### Ver Reporte
```bash
open htmlcov/index.html
```

### Meta de Cobertura
- **Mínimo**: 80%
- **Objetivo**: 90%
- **Crítico**: 95%

## 🔄 CI/CD

### GitHub Actions (Próximo)
- Ejecutar tests en cada PR
- Generar reportes de cobertura
- Notificar fallos

## 📚 Recursos

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-flask](https://pytest-flask.readthedocs.io/)
- [Factory Boy](https://factoryboy.readthedocs.io/)
- [Faker](https://faker.readthedocs.io/)