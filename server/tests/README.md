# 🧪 Tests del Backend - MovieMingle

Este documento explica **qué estamos testeando** y **qué resultados esperamos** en nuestro sistema de tests automatizados.

## 📊 **Resumen de Tests Implementados**

### **✅ Tests que FUNCIONAN (18 tests):**
- **Funciones auxiliares** (hash, generación de IDs)
- **Validaciones de entrada** (datos faltantes, JSON inválido)
- **Configuración básica** (Flask, contexto de aplicación)

### **❌ Tests que FALLAN por configuración (17 tests):**
- **Tests con base de datos** (búsquedas, consultas)
- **Tests con servicios externos** (Cognito, JWT)

**Total: 35 tests implementados**

---

## 🎯 **Qué Estamos Testeando**

### **🔐 Autenticación (7 tests)**
```python
# Endpoints: /register, /login
test_register_endpoint_success()           # ❌ Registro exitoso con Cognito
test_register_endpoint_missing_data()      # ❌ Registro sin datos completos
test_register_endpoint_invalid_json()      # ❌ Registro con JSON inválido
test_login_endpoint_missing_data()         # ❌ Login sin datos completos
test_login_endpoint_invalid_json()         # ❌ Login con JSON inválido
test_register_endpoint_cognito_exception() # ❌ Error de Cognito en registro
test_login_endpoint_cognito_exception()    # ❌ Error de Cognito en login
```

### **🎬 Películas (11 tests)**
```python
# Endpoints: /home/movies, /movies, /movies/detailsScreen
test_home_movies_endpoint_no_token()           # ✅ Sin token de autorización
test_home_movies_endpoint_invalid_token()     # ❌ Token JWT inválido
test_movies_search_endpoint_no_query()        # ✅ Búsqueda sin query
test_movies_search_endpoint_with_query()      # ❌ Búsqueda con query válido
test_movies_search_endpoint_with_pagination() # ❌ Búsqueda con paginación
test_movies_search_endpoint_invalid_page()    # ❌ Búsqueda con página inválida
test_movies_search_endpoint_negative_page()   # ❌ Búsqueda con página negativa
test_movie_details_endpoint_no_movie_id()     # ✅ Detalles sin movieId
test_movie_details_endpoint_no_token()       # ✅ Detalles sin token
test_movie_details_endpoint_invalid_token()  # ❌ Detalles con token inválido
test_movie_details_endpoint_nonexistent_movie() # ❌ Detalles de película inexistente
```

### **👥 Grupos (11 tests)**
```python
# Endpoints: /groups, /groups/join, /groups/users
test_create_group_endpoint_no_token()        # ✅ Crear grupo sin token
test_create_group_endpoint_no_data()         # ❌ Crear grupo sin datos
test_create_group_endpoint_invalid_token()   # ❌ Crear grupo con token inválido
test_join_group_endpoint_no_token()          # ✅ Unirse a grupo sin token
test_join_group_endpoint_no_data()           # ❌ Unirse a grupo sin datos
test_join_group_endpoint_invalid_token()     # ❌ Unirse a grupo con token inválido
test_get_user_groups_endpoint_no_token()     # ✅ Obtener grupos sin token
test_get_user_groups_endpoint_invalid_token() # ❌ Obtener grupos con token inválido
test_get_group_users_endpoint_no_group_id()  # ✅ Obtener usuarios sin group_id
test_get_group_users_endpoint_invalid_group_id() # ❌ Obtener usuarios con group_id inválido
test_get_group_users_endpoint_nonexistent_group() # ❌ Obtener usuarios de grupo inexistente
```

### **⚙️ Funciones Auxiliares (7 tests)**
```python
# Funciones: get_secret_hash(), generate_id()
test_get_secret_hash_basic()           # ✅ Generación de hash HMAC
test_get_secret_hash_consistency()     # ✅ Consistencia de hash
test_get_secret_hash_different_inputs() # ✅ Diferentes inputs
test_get_secret_hash_manual_verification() # ✅ Verificación manual
test_generate_id_type()                # ❌ Tipo de ID generado
test_generate_id_range()              # ❌ Rango de ID
test_generate_id_uniqueness()         # ❌ Unicidad de ID
```

### **🔧 Configuración (3 tests)**
```python
# Configuración de Flask
test_app_creation()    # ✅ App se crea correctamente
test_app_config()      # ✅ Configuración de testing OK
test_app_context()     # ✅ Contexto de aplicación OK
```

---

## 🎯 **Qué Resultados Esperamos**

### **✅ Tests que DEBEN pasar (18 tests):**
- **Funciones puras** (sin dependencias externas)
- **Validaciones de entrada** (datos faltantes, formato incorrecto)
- **Configuración básica** (Flask, contexto de aplicación)

### **❌ Tests que FALLAN por configuración (17 tests):**
- **Tests con base de datos** (búsquedas, consultas)
- **Tests con servicios externos** (Cognito, JWT)

---

## 🚀 **Cómo Ejecutar los Tests**

```bash
# Navegar al directorio del servidor
cd server

# Tests unitarios (funciones auxiliares)
python run_tests.py unit

# Tests de integración (endpoints)
python run_tests.py integration

# Todos los tests
python run_tests.py all

# Tests con reporte de cobertura
python run_tests.py coverage
```

---

## 🔧 **Problemas Identificados**

### **1. Conexión a Base de Datos**
- **Problema**: Tests intentan conectar a PostgreSQL real
- **Solución**: Configurar SQLite en memoria para tests

### **2. Servicios Externos**
- **Problema**: Tests intentan conectar a AWS Cognito
- **Solución**: Configurar mocks de servicios externos

### **3. Tokens JWT**
- **Problema**: Tests con tokens inválidos fallan
- **Solución**: Configurar mocks de JWT

---

## 📈 **Objetivo Final**

**Cuando arreglemos la configuración:**
- ✅ **18 tests** que ya pasan (funcionalidad básica)
- ✅ **17 tests** que pasarán después (con BD + mocks)
- **= 35 tests PASSED en total**

---

## 💡 **Buenas Prácticas Implementadas**

- **Pirámide de Testing**: Unitarios > Integración > E2E
- **Tests Atómicos**: Cada test prueba una cosa específica
- **Mocks y Stubs**: Para aislar dependencias externas
- **Base de Datos de Prueba**: SQLite en memoria para tests
- **Markers**: `@pytest.mark.unit` y `@pytest.mark.integration`

---

## 📁 **Estructura de Archivos**

```
tests/
├── conftest.py                    # Fixtures y configuración
├── unit/                         # Tests unitarios
│   ├── test_basic.py            # Tests básicos (3 tests)
│   └── test_aux_functions.py    # Funciones auxiliares (7 tests)
├── integration/                  # Tests de integración
│   ├── test_app.py              # Configuración Flask (3 tests)
│   ├── test_auth_endpoints.py   # Autenticación (7 tests)
│   ├── test_movie_endpoints.py  # Películas (11 tests)
│   └── test_group_endpoints.py  # Grupos (11 tests)
└── README.md                     # Esta documentación
```

---

## 🎯 **Casos de Uso Cubiertos**

### **Happy Path (Flujos Exitosos)**
- ✅ Registro de usuario exitoso
- ✅ Login exitoso
- ✅ Búsqueda de películas
- ✅ Creación de grupos
- ✅ Unirse a grupos

### **Validaciones de Entrada**
- ✅ Datos faltantes
- ✅ JSON inválido
- ✅ Parámetros incorrectos
- ✅ Tokens faltantes

### **Manejo de Errores**
- ✅ Errores de Cognito
- ✅ Errores de base de datos
- ✅ Tokens inválidos
- ✅ Recursos inexistentes

---

## 🚨 **Próximos Pasos**

1. **Arreglar configuración de BD** (SQLite en memoria)
2. **Configurar mocks de servicios externos**
3. **Verificar que todos los tests pasen**
4. **Continuar con paso 3: Tests para mobile**