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
| 2.5 | /api/facultades/ | POST | DOCENTE | Crear facultad con datos validos | 201 Created | Pendiente |
| 2.6 | /api/facultades/ | POST | ESTUDIANTE | Crear facultad | 403 Forbidden (IsAdminOrDocente bloquea ESTUDIANTE) | Pendiente |
| 2.7 | /api/facultades/ | POST | ANON | Crear facultad sin autenticacion | 403 Forbidden | Pendiente |
| 2.8 | /api/facultades/{id}/ | PUT | ADMIN | Actualizar facultad existente | 200 OK | Pendiente |
| 2.9 | /api/facultades/{id}/ | PUT | DOCENTE | Actualizar facultad existente | 200 OK (DOCENTE tiene permiso de escritura) | Pendiente |
| 2.10 | /api/facultades/{id}/ | PUT | ESTUDIANTE | Actualizar facultad | 403 Forbidden | Pendiente |
| 2.11 | /api/facultades/{id}/ | DELETE | DOCENTE | Eliminar facultad | 403 Forbidden (IsOwnerOrReadOnly: no es owner, Facultad no tiene campo usuario) | Pendiente |
| 2.12 | /api/facultades/{id}/ | DELETE | ADMIN | Eliminar facultad | 204 No Content (o 403 si IsOwnerOrReadOnly lo bloquea - VER BUG #1) | Pendiente |
| 2.13 | /api/facultades/{id}/ | DELETE | ANON | Eliminar facultad sin auth | 403 Forbidden | Pendiente |

## 3. CRUD Materias (roles + ownership)

| # | Endpoint | Metodo | Rol | Accion | Resultado Esperado | Estado |
|---|----------|--------|-----|--------|-------------------|--------|
| 3.1 | /api/materias/ | GET | DOCENTE | Listar materias (el endpoint retorna todas, no solo las propias - VER BUG #2) | 200 OK + todas las materias (deberia ser solo las propias) | Pendiente |
| 3.2 | /api/materias/ | GET | DOCENTE | Listar materias propias (comportamiento esperado ideal) | 200 OK + solo materias del usuario | Pendiente |
| 3.3 | /api/materias/ | GET | ESTUDIANTE | Listar materias propias | 200 OK + solo materias del usuario (deberia, VER BUG #2) | Pendiente |
| 3.4 | /api/materias/ | GET | ANON | Listar materias sin auth | 403 Forbidden (IsAdminOrDocente requiere auth para escritura, pero lectura pasa por SAFE_METHODS -> 200 OK) | Pendiente |
| 3.5 | /api/materias/ | POST | ESTUDIANTE | Crear materia | 403 Forbidden (IsAdminOrDocente bloquea ESTUDIANTE) | Pendiente |
| 3.6 | /api/materias/ | POST | DOCENTE | Crear materia con datos validos (nombre, ano_dictado, creditos_totales, estado) | 201 Created + usuario asignado automaticamente via perform_create | Pendiente |
| 3.7 | /api/materias/ | POST | ADMIN | Crear materia con datos validos | 201 Created (perform_create asigna request.user como usuario) | Pendiente |
| 3.8 | /api/materias/{id}/ | PUT | DOCENTE owner | Actualizar materia propia | 200 OK | Pendiente |
| 3.9 | /api/materias/{id}/ | PUT | DOCENTE NO-owner | Actualizar materia de otro usuario | 403 Forbidden (IsOwnerOrReadOnly bloquea) | Pendiente |
| 3.10 | /api/materias/{id}/ | PUT | ADMIN | Actualizar materia ajena (ADMIN no es owner) | 403 Forbidden (IsOwnerOrReadOnly bloquea, ADMIN no tiene bypass de ownership) | Pendiente |
| 3.11 | /api/materias/{id}/ | DELETE | DOCENTE owner | Eliminar materia propia | 204 No Content | Pendiente |
| 3.12 | /api/materias/{id}/ | DELETE | DOCENTE NO-owner | Eliminar materia ajena | 403 Forbidden | Pendiente |
| 3.13 | /api/materias/999/ | GET | DOCENTE | Obtener materia con id inexistente | 404 Not Found | Pendiente |

## 4. CRUD Examenes (roles + ownership via materia)

| # | Endpoint | Metodo | Rol | Accion | Resultado Esperado | Estado |
|---|----------|--------|-----|--------|-------------------|--------|
| 4.1 | /api/examenes/ | GET | DOCENTE | Listar examenes (el endpoint retorna todos - VER BUG #3) | 200 OK + todos los examenes (deberia ser solo los propios) | Pendiente |
| 4.2 | /api/examenes/ | GET | DOCENTE | Listar examenes de materias propias (comportamiento esperado ideal) | 200 OK + solo examenes de materias del usuario | Pendiente |
| 4.3 | /api/examenes/ | GET | ESTUDIANTE | Listar examenes propios | 200 OK + solo examenes de sus materias (deberia, VER BUG #3) | Pendiente |
| 4.4 | /api/examenes/ | POST | ESTUDIANTE | Crear examen | 403 Forbidden (IsAdminOrDocente bloquea ESTUDIANTE) | Pendiente |
| 4.5 | /api/examenes/ | POST | DOCENTE | Crear examen para materia propia (datos validos: materia, fecha, nota, tipo) | 201 Created | Pendiente |
| 4.6 | /api/examenes/ | POST | DOCENTE | Crear examen para materia ajena | 403 Forbidden (PermissionDenied en perform_create) | Pendiente |
| 4.7 | /api/examenes/ | POST | ADMIN | Crear examen para materia de otro usuario | 201 Created (perform_create solo valida ownership, ADMIN bypass si es admin - VER BUG #4) | Pendiente |
| 4.8 | /api/examenes/{id}/ | DELETE | DOCENTE owner (via materia) | Eliminar examen de materia propia | 204 No Content | Pendiente |
| 4.9 | /api/examenes/{id}/ | DELETE | DOCENTE NO-owner | Eliminar examen de materia ajena | 403 Forbidden (IsOwnerOrReadOnly via materia.usuario) | Pendiente |
| 4.10 | /api/examenes/{id}/ | DELETE | ESTUDIANTE | Eliminar examen | 403 Forbidden | Pendiente |

## 5. Validacion de Reglas de Negocio (Casos de Borde)

| # | Endpoint | Metodo | Rol | Accion | Resultado Esperado | Estado |
|---|----------|--------|-----|--------|-------------------|--------|
| 5.1 | /api/materias/ | POST | DOCENTE | Crear materia con ano_dictado negativo (-1) | 400 Bad Request (validacion) o 201 (si no hay validacion - VER BUG #5) | Pendiente |
| 5.2 | /api/materias/ | POST | DOCENTE | Crear materia con creditos_totales negativos (-5) | 400 Bad Request o 201 (VER BUG #6) | Pendiente |
| 5.3 | /api/materias/ | POST | DOCENTE | Crear materia con nombre vacio ("") | 400 Bad Request (CharField max_length impide string vacio por defecto) | Pendiente |
| 5.4 | /api/materias/ | POST | DOCENTE | Crear materia con estado invalido ("XXX") | 400 Bad Request (choices del modelo) | Pendiente |
| 5.5 | /api/materias/ | POST | DOCENTE | Crear materia sin campos requeridos | 400 Bad Request | Pendiente |
| 5.6 | /api/examenes/ | POST | DOCENTE | Crear examen con nota negativa (-1) | 400 Bad Request o 201 (VER BUG #7) | Pendiente |
| 5.7 | /api/examenes/ | POST | DOCENTE | Crear examen con nota > 20 (ej: 25) | 400 Bad Request o 201 (VER BUG #8 - no hay validacion de rango en modelo ni serializer) | Pendiente |
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

## Bugs Detectados en Revision del Codigo

### BUG #1 - FacultadViewSet: DELETE bloqueado para ADMIN por IsOwnerOrReadOnly
- **Archivo**: `core/views.py:9` + `users/permissions.py:12-26`
- **Problema**: El FacultadViewSet usa `permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrDocente]`. Falta `IsOwnerOrReadOnly` en la lista, pero el problema real es que **Facultad no tiene campo `usuario`**, asi que si se agrega `IsOwnerOrReadOnly`, el `has_object_permission` busca `obj.usuario` (None) y luego `obj.materia` (None) y retorna False. Ningun usuario podria eliminar/actualizar una Facultad.
- **Impacto**: El DELETE de Facultad funciona actualmente porque NO usa IsOwnerOrReadOnly, pero el DELETE/PUT de Facultad es accesible para DOCENTE y ADMIN por igual (IsAdminOrDocente). Si se quisiera restrictivo solo para ADMIN, hay que crear un permiso dedicado.

### BUG #2 - MateriaViewSet.get_queryset() no filtra por usuario
- **Archivo**: `core/views.py:15-16`
- **Problema**: `get_queryset()` retorna `Materia.objects.all()` en lugar de filtrar por `self.request.user`. Todos los usuarios autenticados (y anónimos en GET) pueden ver TODAS las materias de TODOS los usuarios.
- **Impacto**: Falta total de aislamiento de datos. Los tests existentes en `core/tests.py` (test_user_cannot_see_others_materias) **deberian fallar** con este codigo.
- **Solucion**: Cambiar a `return Materia.objects.filter(usuario=self.request.user)` (excepto para ADMIN, que podria ver todas).

### BUG #3 - ExamenViewSet.get_queryset() no filtra por usuario
- **Archivo**: `core/views.py:25-26`
- **Problema**: Similar al BUG #2. `get_queryset()` retorna `Examen.objects.all()`. Todos los usuarios pueden ver todos los examenes.
- **Impacto**: Falta de aislamiento. Cualquier usuario puede ver examenes de materias ajenas.
- **Solucion**: Filtrar por las materias del usuario: `Examen.objects.filter(materia__usuario=self.request.user)`.

### BUG #4 - ExamenViewSet.perform_create: ADMIN no puede crear examen para materia ajena
- **Archivo**: `core/views.py:28-32`
- **Problema**: `perform_create` valida `materia.usuario != self.request.user` y lanza PermissionDenied. Un ADMIN que intente crear un examen para una materia de otro usuario recibira 403. El ADMIN no tiene bypass para esta validacion.
- **Impacto**: El ADMIN no puede administrar examenes de materia ajena.

### BUG #5 - Materia: sin validacion de ano_dictado
- **Archivo**: `core/models.py:21`
- **Problema**: `ano_dictado` es un `IntegerField()` sin ` validators=[]` ni `min_value`. Se puede crear materia con año negativo, cero, o valores absurdos (99999).
- **Impacto**: Datos inconsistentes en la base de datos.

### BUG #6 - Materia: sin validacion de creditos_totales
- **Archivo**: `core/models.py:22`
- **Problema**: `creditos_totales` es `IntegerField(default=0)` sin validacion de valor minimo. Se pueden asignar creditos negativos.
- **Impacto**: Datos inconsistentes.

### BUG #7 - Examen: sin validacion de rango de nota
- **Archivo**: `core/models.py:38` + `core/serializers.py:15-18`
- **Problema**: `nota` es `DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)` sin validators. No hay validacion en el serializer tampoco. Se pueden crear notas negativas o mayores a 20.
- **Impacto**: Notas fuera de rango valido.

### BUG #8 - Examen: sin validacion de rango de nota > 20
- **Archivo**: `core/models.py:38`
- **Problema**: Parte del BUG #7. No hay constraint de maximo 20 para la nota.
- **Impacto**: Notas academicamente invalidas.

### BUG #9 - ExamenSerializer: expone todos los campos sin restriccion
- **Archivo**: `core/serializers.py:15-18`
- **Problema**: El serializer usa `fields = '__all__'` sin `read_only_fields`. El campo `materia` es escribible directamente, lo que permite que un usuario envie任意 materia_id sin pasar por la validacion de `perform_create` de manera consistente.
- **Impacto**: Aunque perform_create valida ownership, el serializer no guia al usuario.

### BUG #10 - MateriaViewSet: IsAdminOrDocente + IsOwnerOrReadOnly interactuan incorrectly
- **Archivo**: `core/views.py:12-13`
- **Problema**: Para una accion POST/PUT/DELETE, AMBOS permisos deben pasar. `IsAdminOrDocente` permite ADMIN y DOCENTE. `IsOwnerOrReadOnly` permite solo al owner en PUT/DELETE. Resultado: un ADMIN puede crear (POST) materias pero NO puede actualizar/eliminar materias de otros (porque no es owner). Un ADMIN solo puede actualizar/eliminar materias que el mismo creo.
- **Impacto**: Limitacion inesperada para el rol ADMIN.
