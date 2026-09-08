# TP4 - Matriz de Pruebas

## 1. Autenticacion

| # | Endpoint | Metodo | Rol | Accion | Resultado Esperado | Estado |
|---|----------|--------|-----|--------|-------------------|--------|
| 1.1 | /api/token/ | POST | ANON | Login con ADMIN valido (username + password correctos) | 200 + access + refresh tokens | Pendiente |
| 1.2 | /api/token/ | POST | ANON | Login con DOCENTE valido | 200 + access + refresh tokens | Pendiente |
| 1.3 | /api/token/ | POST | ANON | Login con ESTUDIANTE valido | 200 + access + refresh tokens | Pendiente |
| 1.4 | /api/token/ | POST | ANON | Login con contrasena incorrecta | 401 Unauthorized | Pendiente |
| 1.5 | /api/token/ | POST | ANON | Login con usuario inexistente | 401 Unauthorized | Pendiente |
| 1.6 | /api/token/refresh/ | POST | ANON | Refresh token valido (enviar refresh token) | 200 + nuevo access token | Pendiente |
| 1.7 | /api/token/refresh/ | POST | ANON | Refresh token invalido/expirado | 401 Unauthorized | Pendiente |
| 1.8 | /api/users/me/ | GET | CUALQUIER | GET con token de autenticacion valido | 200 + datos del usuario (id, username, email, role, facultad, plan_estudio_nombre) | Pendiente |
| 1.9 | /api/users/me/ | GET | ANON | GET sin token de autenticacion | 401 Unauthorized | Pendiente |
| 1.10 | /api/users/register/ | POST | ANON | POST con datos validos (username, email, password, facultad_id opcional) | 201 Created + datos del usuario (sin password) | Pendiente |
| 1.11 | /api/users/register/ | POST | ANON | POST con email duplicado | 400 Bad Request (validacion unica) | Pendiente |

## 2. CRUD Facultades (roles)

| # | Endpoint | Metodo | Rol | Accion | Resultado Esperado | Estado |
|---|----------|--------|-----|--------|-------------------|--------|
| 2.1 | /api/facultades/ | GET | ANON | Listar facultades sin autenticacion | 200 OK (lectura publica por IsAuthenticatedOrReadOnly) | Pendiente |
| 2.2 | /api/facultades/ | GET | CUALQUIER | Listar facultades con autenticacion | 200 OK + lista de facultades | Pendiente |
| 2.3 | /api/facultades/{id}/ | GET | ANON | Obtener detalle de una facultad sin auth | 200 OK | Pendiente |
| 2.4 | /api/facultades/ | POST | ADMIN | Crear facultad con datos validos (nombre, sede) | 201 Created | Pendiente |
| 2.5 | /api/facultades/ | POST | DOCENTE | Crear facultad con datos validos | 403 Forbidden (IsAdminOnly bloquea DOCENTE) | Pendiente |
| 2.6 | /api/facultades/ | POST | ESTUDIANTE | Crear facultad | 403 Forbidden (IsAdminOnly bloquea ESTUDIANTE) | Pendiente |
| 2.7 | /api/facultades/ | POST | ANON | Crear facultad sin autenticacion | 403 Forbidden | Pendiente |
| 2.8 | /api/facultades/{id}/ | PUT | ADMIN | Actualizar facultad existente | 200 OK | Pendiente |
| 2.9 | /api/facultades/{id}/ | PUT | DOCENTE | Actualizar facultad existente | 403 Forbidden (IsAdminOnly bloquea DOCENTE) | Pendiente |
| 2.10 | /api/facultades/{id}/ | PUT | ESTUDIANTE | Actualizar facultad | 403 Forbidden | Pendiente |
| 2.11 | /api/facultades/{id}/ | DELETE | DOCENTE | Eliminar facultad | 403 Forbidden (IsAdminOnly bloquea DOCENTE) | Pendiente |
| 2.12 | /api/facultades/{id}/ | DELETE | ADMIN | Eliminar facultad | 204 No Content | Pendiente |
| 2.13 | /api/facultades/{id}/ | DELETE | ANON | Eliminar facultad sin auth | 403 Forbidden | Pendiente |

## 3. CRUD Materias (roles + ownership)

| # | Endpoint | Metodo | Rol | Accion | Resultado Esperado | Estado |
|---|----------|--------|-----|--------|-------------------|--------|
| 3.1 | /api/materias/ | GET | DOCENTE | Listar materias propias | 200 OK + solo materias del usuario | Pendiente |
| 3.2 | /api/materias/ | GET | ESTUDIANTE | Listar materias propias | 200 OK + solo materias del usuario | Pendiente |
| 3.3 | /api/materias/ | GET | ADMIN | Listar todas las materias | 200 OK + todas las materias | Pendiente |
| 3.4 | /api/materias/ | GET | ANON | Listar materias sin auth | 200 OK + lista vacia (get_queryset retorna none) | Pendiente |
| 3.5 | /api/materias/ | POST | ESTUDIANTE | Crear materia | 403 Forbidden (IsAdminOrDocente bloquea ESTUDIANTE) | Pendiente |
| 3.6 | /api/materias/ | POST | DOCENTE | Crear materia con datos validos (nombre, ano_dictado, creditos_totales, estado) | 201 Created + usuario asignado automaticamente via perform_create | Pendiente |
| 3.7 | /api/materias/ | POST | ADMIN | Crear materia con datos validos | 201 Created (perform_create asigna request.user como usuario) | Pendiente |
| 3.8 | /api/materias/{id}/ | PUT | DOCENTE owner | Actualizar materia propia | 200 OK | Pendiente |
| 3.9 | /api/materias/{id}/ | PUT | DOCENTE NO-owner | Actualizar materia de otro usuario | 403 Forbidden (IsOwnerOrReadOnly bloquea) | Pendiente |
| 3.10 | /api/materias/{id}/ | PUT | ADMIN | Actualizar materia ajena | 200 OK (IsOwnerOrReadOnly tiene bypass para ADMIN) | Pendiente |
| 3.11 | /api/materias/{id}/ | DELETE | DOCENTE owner | Eliminar materia propia | 204 No Content | Pendiente |
| 3.12 | /api/materias/{id}/ | DELETE | DOCENTE NO-owner | Eliminar materia ajena | 403 Forbidden | Pendiente |
| 3.13 | /api/materias/999/ | GET | DOCENTE | Obtener materia con id inexistente | 404 Not Found | Pendiente |

## 4. CRUD Examenes (roles + ownership via materia)

| # | Endpoint | Metodo | Rol | Accion | Resultado Esperado | Estado |
|---|----------|--------|-----|--------|-------------------|--------|
| 4.1 | /api/examenes/ | GET | DOCENTE | Listar examenes de materias propias | 200 OK + solo examenes de materias del usuario | Pendiente |
| 4.2 | /api/examenes/ | GET | ESTUDIANTE | Listar examenes propios | 200 OK + solo examenes de sus materias | Pendiente |
| 4.3 | /api/examenes/ | GET | ADMIN | Listar todos los examenes | 200 OK + todos los examenes | Pendiente |
| 4.4 | /api/examenes/ | POST | ESTUDIANTE | Crear examen | 403 Forbidden (IsAdminOrDocente bloquea ESTUDIANTE) | Pendiente |
| 4.5 | /api/examenes/ | POST | DOCENTE | Crear examen para materia propia (datos validos: materia, fecha, nota, tipo) | 201 Created | Pendiente |
| 4.6 | /api/examenes/ | POST | DOCENTE | Crear examen para materia ajena | 403 Forbidden (PermissionDenied en perform_create) | Pendiente |
| 4.7 | /api/examenes/ | POST | ADMIN | Crear examen para materia de otro usuario | 201 Created (ADMIN tiene bypass en perform_create) | Pendiente |
| 4.8 | /api/examenes/{id}/ | DELETE | DOCENTE owner (via materia) | Eliminar examen de materia propia | 204 No Content | Pendiente |
| 4.9 | /api/examenes/{id}/ | DELETE | DOCENTE NO-owner | Eliminar examen de materia ajena | 403 Forbidden (IsOwnerOrReadOnly via materia.usuario) | Pendiente |
| 4.10 | /api/examenes/{id}/ | DELETE | ADMIN | Eliminar examen de materia ajena | 204 No Content (IsOwnerOrReadOnly tiene bypass para ADMIN) | Pendiente |

## 5. Validacion de Reglas de Negocio (Casos de Borde)

| # | Endpoint | Metodo | Rol | Accion | Resultado Esperado | Estado |
|---|----------|--------|-----|--------|-------------------|--------|
| 5.1 | /api/materias/ | POST | DOCENTE | Crear materia con ano_dictado negativo (-1) | 400 Bad Request (validacion en serializer) | Pendiente |
| 5.2 | /api/materias/ | POST | DOCENTE | Crear materia con creditos_totales negativos (-5) | 400 Bad Request (validacion en serializer) | Pendiente |
| 5.3 | /api/materias/ | POST | DOCENTE | Crear materia con nombre vacio ("") | 400 Bad Request (CharField requiere string no vacio) | Pendiente |
| 5.4 | /api/materias/ | POST | DOCENTE | Crear materia con estado invalido ("XXX") | 400 Bad Request (choices del modelo) | Pendiente |
| 5.5 | /api/materias/ | POST | DOCENTE | Crear materia sin campos requeridos | 400 Bad Request | Pendiente |
| 5.6 | /api/examenes/ | POST | DOCENTE | Crear examen con nota negativa (-1) | 400 Bad Request (validacion en serializer) | Pendiente |
| 5.7 | /api/examenes/ | POST | DOCENTE | Crear examen con nota > 20 (ej: 25) | 400 Bad Request (validacion en serializer) | Pendiente |
| 5.8 | /api/examenes/ | POST | DOCENTE | Crear examen sin materia | 400 Bad Request (FK requerido) | Pendiente |
| 5.9 | /api/examenes/ | POST | DOCENTE | Crear examen sin fecha | 400 Bad Request (DateField requerido) | Pendiente |
| 5.10 | /api/examenes/ | POST | DOCENTE | Crear examen con tipo invalido ("XXX") | 400 Bad Request (choices del modelo) | Pendiente |
| 5.11 | /api/examenes/ | POST | DOCENTE | Crear examen con nota null (examen sin calificar) | 201 Created (nota es null=True, blank=True) | Pendiente |

## 6. Flujo Completo

| # | Pasos | Rol | Resultado Esperado | Estado |
|---|-------|-----|-------------------|--------|
| 6.1 | 1. POST /api/token/ (login DOCENTE) -> 2. POST /api/materias/ (crear materia) -> 3. POST /api/examenes/ (crear examen con esa materia) -> 4. GET /api/examenes/ (verificar que aparece) | DOCENTE | Cada paso retorna codigo correcto (200, 201, 201, 200 con el examen creado) | Pendiente |
| 6.2 | 1. POST /api/token/ (login ESTUDIANTE) -> 2. POST /api/materias/ (intentar crear materia) -> 3. GET /api/materias/ (ver solo las suyas) | ESTUDIANTE | Paso 2: 403 Forbidden, Paso 3: 200 OK con lista (posiblemente vacia) | Pendiente |
| 6.3 | 1. POST /api/token/ (login DOCENTE) -> 2. POST /api/materias/ (crear materia) -> 3. POST /api/examenes/ (crear examen) -> 4. Intentar DELETE /api/materias/{id}/ con token invalido/vencido | DOCENTE | Paso 4: 401 Unauthorized | Pendiente |

---

## Bugs Detectados y Corregidos

### BUG #1 - FacultadViewSet: solo ADMIN puede modificar/borrar ✅ CORREGIDO
- **Archivo**: `core/views.py:9` + `users/permissions.py:12-19`
- **Solucion**: Se creo permiso `IsAdminOnly` y se aplico a FacultadViewSet.

### BUG #2 - MateriaViewSet.get_queryset() no filtra por usuario ✅ CORREGIDO
- **Archivo**: `core/views.py:16-20`
- **Solucion**: Filtra por `usuario=self.request.user` (ADMIN ve todas).

### BUG #3 - ExamenViewSet.get_queryset() no filtra por usuario ✅ CORREGIDO
- **Archivo**: `core/views.py:28-32`
- **Solucion**: Filtra por `materia__usuario=self.request.user` (ADMIN ve todas).

### BUG #4 - ExamenViewSet.perform_create: ADMIN no puede crear examen para materia ajena ✅ CORREGIDO
- **Archivo**: `core/views.py:34`
- **Solucion**: Se agrego bypass para ADMIN en la validacion de ownership.

### BUG #5 - Materia: sin validacion de ano_dictado ✅ CORREGIDO
- **Archivo**: `core/serializers.py:11`
- **Solucion**: Se agrego `min_value=1900, max_value=2100`.

### BUG #6 - Materia: sin validacion de creditos_totales ✅ CORREGIDO
- **Archivo**: `core/serializers.py:12`
- **Solucion**: Se agrego `min_value=0`.

### BUG #7/#8 - Examen: sin validacion de rango de nota ✅ CORREGIDO
- **Archivo**: `core/serializers.py:24-27`
- **Solucion**: Se agrego validacion custom `validate_nota` con rango 0-20.

### BUG #9 - ExamenSerializer: expone todos los campos sin restriccion ✅ CORREGIDO
- **Archivo**: `core/serializers.py:21`
- **Solucion**: Se elimino `read_only_fields` (materia es requerido para POST, ownership se valida en perform_create).

### BUG #10 - ADMIN no puede modificar materias ajenas ✅ CORREGIDO
- **Archivo**: `users/permissions.py:31-33`
- **Solucion**: Se agrego bypass para ADMIN en `IsOwnerOrReadOnly`.
