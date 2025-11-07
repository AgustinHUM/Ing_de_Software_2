# Bugs para Arreglar en el Código



## PROBLEMAS CRÍTICOS - Endpoint `/register`

### **1. Falta validación de email en registro**

**Test que falla:** `test_register_no_email`

**Problema:**
- El código no valida si el campo `email` está presente antes de usarlo
- Cuando `email` es `None`, el código intenta usarlo en Cognito y falla

**Error actual:**
```
botocore.exceptions.ParamValidationError: Parameter validation failed:
Invalid type for parameter Username, value: None, type: <class 'NoneType'>
```

**Ubicación del código:**
```python
# server/app/controllers/session_controller.py - línea ~19-30
mail = info.get("email")  # Puede ser None
# NO HAY VALIDACIÓN
# Va directo a usar mail en Cognito
Config.COGNITO_CLIENT.admin_create_user(
    Username=mail,  # mail puede ser None
    ...
)
```

**Solución sugerida:**
```python
mail = info.get("email")
if not mail:
    return jsonify({"msg": "Email is required"}), 400
```

---

### **2. Falta validación de password en registro**

**Test que falla:** `test_register_no_password`

**Problema:**
- El código no valida si el campo `password` está presente antes de usarlo
- Cuando `password` es `None`, bcrypt lanza una excepción

**Error actual:**
```
ValueError: Password must be non-empty.
```

**Ubicación del código:**
```python
# server/app/controllers/session_controller.py - línea ~21-26
contrasenia = info.get("password")  # Puede ser None
# NO HAY VALIDACIÓN
hash_contr = bcrypt.generate_password_hash(contrasenia)  # Falla si contrasenia es None
```

**Solución sugerida:**
```python
contrasenia = info.get("password")
if not contrasenia:
    return jsonify({"msg": "Password is required"}), 400
```

---

### **3. Falta validación de username en registro**

**Test que falla:** `test_register_no_username`

**Problema:**
- El código no valida si el campo `username` está presente antes de usarlo
- Cuando `username` es `None`, Cognito puede rechazarlo

**Ubicación del código:**
```python
# server/app/controllers/session_controller.py - línea ~20
nombre_usuario = info.get("username")  # Puede ser None
# NO HAY VALIDACIÓN
# Se usa directamente en Cognito
```

**Solución sugerida:**
```python
nombre_usuario = info.get("username")
if not nombre_usuario:
    return jsonify({"msg": "Username is required"}), 400
```

---

### **4. Falta validación de datos vacíos en registro**

**Test que falla:** `test_register_empty_data`

**Problema:**
- El código no valida si los datos están vacíos
- Cuando se envía `{}`, todos los campos son `None` y falla

**Error actual:**
```
ValueError: Password must be non-empty.
```

**Solución sugerida:**
Agregar validación al inicio:
```python
if not info or not info.get("email") or not info.get("password") or not info.get("username"):
    return jsonify({"msg": "Email, username and password are required"}), 400
```

---

## Resumen de Cambios Necesarios

### Archivo: `server/app/controllers/session_controller.py`

**Función:** `handle_register()`

**Cambios necesarios:**

1. **Agregar validaciones al inicio de la función:**
```python
def handle_register(info = None):
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        mail = info.get("email")
        nombre_usuario = info.get("username")
        contrasenia = info.get("password")
        
        # ✅ AGREGAR ESTAS VALIDACIONES:
        if not mail:
            return jsonify({"msg": "Email is required"}), 400
        
        if not nombre_usuario:
            return jsonify({"msg": "Username is required"}), 400
        
        if not contrasenia:
            return jsonify({"msg": "Password is required"}), 400
        
        # Validar formato de email (opcional pero recomendado)
        if "@" not in mail:
            return jsonify({"msg": "Invalid email format"}), 400
        
        # Validar longitud mínima de password (opcional pero recomendado)
        if len(contrasenia) < 8:
            return jsonify({"msg": "Password must be at least 8 characters"}), 400
        
        # ... resto del código ...
```





---



## PROBLEMAS CRÍTICOS - Endpoint `/groups` (Crear Grupo)

### **5. Falta validación de `group_name` al crear grupo**

**Test que falla:** `test_create_group_endpoint_no_data`

**Problema:**
- El código no valida si el campo `group_name` está presente antes de usarlo
- Cuando `group_name` es `None`, el código intenta crear un grupo con nombre `None`
- Retorna 404 en lugar de 400 cuando falta el dato

**Error actual:**
- Retorna 404 NOT FOUND en lugar de 400 BAD REQUEST

**Ubicación del código:**
```python
# server/app/controllers/group_controller.py - línea ~17
nombre_grupo_nuevo = info.get("group_name")  # Puede ser None
# NO HAY VALIDACIÓN
nuevo_grupo = Grupo(id_grupo=id_nuevo_grupo, nombre_grupo=nombre_grupo_nuevo)
# Se crea un grupo con nombre None
```

**Solución sugerida:**
```python
nombre_grupo_nuevo = info.get("group_name")
if not nombre_grupo_nuevo:
    return jsonify({"msg": "group_name is required"}), 400
```



---

## PROBLEMAS CRÍTICOS - Endpoint `/groups/join` (Unirse a Grupo)

### **6. Falta validación de `group_join_id` al unirse a grupo**

**Test que falla:** `test_join_group_endpoint_no_data`

**Problema:**
- El código no valida si el campo `group_join_id` está presente antes de hacer operaciones matemáticas
- Cuando `group_join_id` es `None`, el código intenta hacer `(None - 13) // 7` y falla

**Error actual:**
```
TypeError: unsupported operand type(s) for -: 'NoneType' and 'int'
```

**Ubicación del código:**
```python
# server/app/controllers/group_controller.py - línea ~43-44
codigo_union = info.get("group_join_id")  # Puede ser None
id_grupo = (codigo_union - 13) // 7  #  Falla si codigo_union es None
```

**Solución sugerida:**
```python
codigo_union = info.get("group_join_id")
if not codigo_union:
    return jsonify({"msg": "group_join_id is required"}), 400

try:
    id_grupo = (int(codigo_union) - 13) // 7
except (ValueError, TypeError):
    return jsonify({"msg": "Invalid group_join_id format"}), 400
```

**Prioridad:** ALTA

---

## Endpoint `/groups/leave` (Dejar Grupo)

### **7. Comportamiento inconsistente al dejar grupo cuando no es miembro**

**Test que falla:** `test_leave_group_not_member`

**Problema:**
- El test espera que retorne 400 cuando el usuario intenta dejar un grupo del que no es miembro
- El código actual retorna 200 OK en lugar de 400
- Esto puede ser confuso para el cliente de la API

**Comportamiento actual:**
- Retorna 200 OK cuando el usuario no es miembro del grupo
- El código en línea 114 retorna 400, pero el test está fallando porque retorna 200

**Ubicación del código:**
```python
# server/app/controllers/group_controller.py - línea ~95-114
if usuario in grupo.usuarios:
    # Remover usuario
    ...
    return jsonify(...), 200
else:
    return jsonify({"msg": "User is not a member of this group"}), 400
```

**Nota:** El código parece correcto (retorna 400), pero el test está fallando. Puede ser que:
1. El usuario SÍ está en el grupo cuando no debería estar (problema con el test)
2. Hay un problema con la lógica de verificación de membresía



---



### Archivo: `server/app/controllers/group_controller.py`

**Función:** `create_group()`

**Cambios necesarios:**
```python
def create_group():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        nombre_grupo_nuevo = info.get("group_name")
        
        # AGREGAR VALIDACIÓN:
        if not nombre_grupo_nuevo:
            return jsonify({"msg": "group_name is required"}), 400
        
        # ... resto del código ...
```

**Función:** `add_user_to_group()`

**Cambios necesarios:**
```python
def add_user_to_group():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        codigo_union = info.get("group_join_id")
        
        # AGREGAR VALIDACIÓN:
        if not codigo_union:
            return jsonify({"msg": "group_join_id is required"}), 400
        
        try:
            id_grupo = (int(codigo_union) - 13) // 7
        except (ValueError, TypeError):
            return jsonify({"msg": "Invalid group_join_id format"}), 400
        
        # ... resto del código ...
```

---



## Endpoints de Favoritos, Ratings y User

### **8. Controladores no verifican errores de token en favoritos**

**Tests que fallan:**
- `test_add_favorite_invalid_token`
- `test_get_favorites_no_token`
- `test_get_favorites_invalid_token`

**Problema:**
- Los controladores `add_remove_favorite_movie()` y `show_favorites()` no verifican si `get_token_user_fav()` retornó un error
- Cuando hay un error de token, la función retorna una tupla `(jsonify(...), status_code)`, pero el código intenta usar esa tupla como si fuera un objeto `Usuario`
- Esto causa `AttributeError` o comportamientos inesperados

**Ubicación del código:**
```python
# server/app/controllers/user_actions_controller.py - línea ~27
usuario = get_token_user_fav(request)
# NO VERIFICA SI ES UNA TUPLA (ERROR)
accion = info.get("action", "add").lower()  # Falla si usuario es tupla
```

**Solución sugerida:**
```python
usuario = get_token_user_fav(request)
# ✅ VERIFICAR SI ES ERROR
if isinstance(usuario, tuple):
    return usuario[0], usuario[1]
```


---

### **9. Controladores no verifican errores de token en ratings**

**Tests que fallan:**
- `test_rate_movie_invalid_token`
- `test_rate_movie_invalid_rating` (puede ser otro bug)
- `test_get_user_rating_no_token`
- `test_get_user_rating_invalid_token`
- `test_get_seen_movies_no_token`
- `test_get_seen_movies_invalid_token`

**Problema:**
- Los controladores `rate_movie()`, `get_user_rating()` y `get_seen_movies()` no verifican si `get_token_user()` retornó un error
- Similar al bug anterior, intentan usar una tupla como objeto `Usuario`

**Ubicación del código:**
```python
# server/app/controllers/user_actions_controller.py - línea ~72, ~103, ~122
usuario = get_token_user(request, "User not found")
# NO VERIFICA SI ES UNA TUPLA (ERROR)
movie_id = int(info.get("movie_id"))  # Falla si usuario es tupla
```

**Solución sugerida:**
```python
usuario = get_token_user(request, "User not found")
# VERIFICAR SI ES ERROR
if isinstance(usuario, tuple):
    return usuario[0], usuario[1]
```



---

### **10. Controladores no verifican errores de token en user info**

**Tests que fallan:**
- `test_get_user_info_no_token`
- `test_get_user_info_invalid_token`
- `test_update_user_info_no_token`
- `test_update_user_info_invalid_token`
- `test_update_user_info_wrong_method` (puede ser otro bug)

**Problema:**
- Los controladores `show_user_info()` y `update_user_info()` no verifican si `get_token_full_user()` o `get_token_user_join()` retornaron un error
- Similar a los bugs anteriores

**Ubicación del código:**
```python
# server/app/controllers/user_config_controller.py - línea ~16, ~41
usuario = get_token_full_user(request)
# NO VERIFICA SI ES UNA TUPLA (ERROR)
pais = usuario.pais  # AttributeError si usuario es tupla
```

**Solución sugerida:**
```python
usuario = get_token_full_user(request)
# ✅ VERIFICAR SI ES ERROR
if isinstance(usuario, tuple):
    return usuario[0], usuario[1]
```



---



### Archivo: `server/app/controllers/user_actions_controller.py`

**Funciones a modificar:**
- `add_remove_favorite_movie()` - línea ~27
- `show_favorites()` - línea ~53
- `rate_movie()` - línea ~72
- `get_user_rating()` - línea ~103
- `get_seen_movies()` - línea ~122

**Cambios necesarios:**
```python
# Agregar después de cada llamada a get_token_*:
usuario = get_token_user_fav(request)  # o get_token_user
if isinstance(usuario, tuple):
    return usuario[0], usuario[1]
```

### Archivo: `server/app/controllers/user_config_controller.py`

**Funciones a modificar:**
- `show_user_info()` - línea ~16
- `update_user_info()` - línea ~41

**Cambios necesarios:**
```python
# Agregar después de cada llamada a get_token_*:
usuario = get_token_full_user(request)  # o get_token_user_join
if isinstance(usuario, tuple):
    return usuario[0], usuario[1]
```

---

## MATCHING SESSIONS (2 bugs)

### **23. Validación de membresía de grupo en `create_session`**

**Test que falla:** `test_create_session_not_group_member`

**Problema:**
- El código no valida correctamente si el usuario es miembro del grupo antes de crear una sesión
- Retorna 201 (Created) en lugar de 403 (Forbidden) cuando el usuario no es miembro

**Ubicación del código:**
```python
# server/app/controllers/match_session_controller.py - línea ~350
if user not in grupo.usuarios:
    return jsonify({"msg": "User is not a member of this group"}), 403
```

**Comportamiento actual:**
- El código tiene la validación, pero parece que la relación `grupo.usuarios` no está cargada correctamente o hay un problema con la comparación
- El test espera 403 pero recibe 201

**Solución sugerida:**
- Verificar que la relación `grupo.usuarios` esté correctamente cargada
- Asegurar que la comparación `user not in grupo.usuarios` funcione correctamente
- Considerar usar `grupo.usuarios.filter_by(mail=user.mail).first()` para verificar membresía


---

### **24. Validación de datos vacíos en `create_session`**

**Test que falla:** `test_create_session_solo_success` (cuando se envía `{}`)

**Problema:**
- El código rechaza `{}` (diccionario vacío) como datos válidos
- Un diccionario vacío `{}` es "falsy" en Python, por lo que `if not data:` retorna `True`
- Esto impide crear sesiones "solo" (sin grupo) enviando `{}`

**Ubicación del código:**
```python
# server/app/controllers/match_session_controller.py - línea ~341
data = request.get_json()
if not data:  # {} es falsy, rechaza sesiones solo
    return jsonify({"msg": "No JSON data provided"}), 400
```

**Comportamiento actual:**
- Si se envía `{}`, retorna 400 "No JSON data provided"
- Para crear sesión solo, se debe enviar `{"group_id": None}` explícitamente

**Solución sugerida:**
```python
data = request.get_json()
if data is None:  # Solo rechazar si realmente es None
    return jsonify({"msg": "No JSON data provided"}), 400
# Permitir {} para sesiones solo
```





