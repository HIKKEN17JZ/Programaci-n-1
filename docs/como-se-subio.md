# Cómo se subió la aplicación (TP10 - Despliegue en la Nube)

## 🌐 URLs de Producción

- **Frontend Público**: `https://academicogestor.vercel.app`
- **API Pública**: `https://gestor-apo.onrender.com/api`
- **Documentación Swagger / OpenAPI**: `https://gestor-apo.onrender.com/api/docs/`
- **Health Check**: `https://gestor-apo.onrender.com/api/health/`
- **Almacenamiento Media (Cloudinary)**: No aplica (el modelo de dominio académico no utiliza subida de imágenes o archivos multimedia).

---

## 🛠️ Servicios Utilizados

- **Backend / API**: Railway (o Render)
- **Base de Datos**: PostgreSQL en la nube (Railway Postgres / Render PostgreSQL)
- **Frontend**: Vercel
- **Servidor WSGI**: Gunicorn
- **Servidor de Estáticos**: WhiteNoise (para servir Swagger UI y Django Admin en producción)

---

## 🚀 Método de Deploy

- [x] Git (Conexión automática con repositorio GitHub, rama `main` o `feature/deploy_tp10`).

---

## 📦 Pasos Detallados para la API (Backend en Render - 100% Gratuito)

1. **Crear Base de Datos PostgreSQL en Render**:
   - Ingresar a [render.com](https://render.com/) con cuenta de GitHub.
   - Hacer clic en **"New +"** → **"PostgreSQL"**.
   - Nombre: `gestor-db`, Plan: **Free**.
   - Presionar **"Create Database"** y copiar la **Internal Database URL** (o External).

2. **Crear Web Service para la API**:
   - Hacer clic en **"New +"** → **"Web Service"**.
   - Conectar el repositorio `HIKKEN17JZ/Programaci-n-1` y la rama `feature/deploy_tp10` (o `main`).
   - Runtime: `Python 3`.
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn Gestor.wsgi:application`
   - Plan: **Free**.

3. **Variables de Entorno en Render**:
   - `DATABASE_URL`: Pegar la URL de la base de datos copiada en el paso 1.
   - `SECRET_KEY`: Clave segura aleatoria de Django.
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.onrender.com`

*(Alternativa: Si se usa el archivo `render.yaml` incluido en el repositorio, Render crea la base de datos y el servicio web automáticamente mediante Blueprint).*

---

## 📦 Pasos Detallados para la API (Backend en Railway)

1. **Crear Proyecto en Railway**:
   - Ingresar a [railway.app](https://railway.app/) con cuenta de GitHub.
   - Seleccionar **"New Project"** → **"Deploy from GitHub repo"**.
   - Elegir el repositorio `HIKKEN17JZ/Programaci-n-1` y la rama correspondiente (`main` o `feature/deploy_tp10`).
2. **Agregar Base de Datos PostgreSQL**:
   - En el dashboard del proyecto, hacer clic en **"New"** → **"Database"** → **"Add PostgreSQL"**.
   - Railway creará la base de datos e inyectará automáticamente la variable de entorno `DATABASE_URL` a los servicios vinculados.
3. **Configurar Variables de Entorno en el servicio Web**:
   - En el servicio de la API, ir a la pestaña **"Variables"** y definir:
     - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (enlace automático con el servicio Postgres).
     - `SECRET_KEY`: Una clave segura de producción de más de 32 caracteres.
     - `DEBUG`: `False`
     - `ALLOWED_HOSTS`: `.up.railway.app,localhost,127.0.0.1`
     - `CORS_ALLOWED_ORIGINS`: La URL pública de tu frontend en Vercel (ej: `https://mi-app.vercel.app`).
4. **Comandos de Construcción e Inicio**:
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn Gestor.wsgi:application` (o Railway lo detecta automáticamente desde el `Procfile`).
5. **Generar Dominio Público**:
   - En **"Settings"** → **"Networking"** → hacer clic en **"Generate Domain"** (ejemplo: `mi-gestor-academico.up.railway.app`).
6. **Verificación de Endpoints**:
   - Health check: `https://<tu-dominio>/api/health/` → responde `{"status": "ok", "service": "api"}`.
   - Swagger docs: `https://<tu-dominio>/api/docs/` → Swagger UI interactivo cargando estilos con WhiteNoise.

---

## 💻 Pasos Detallados para el Frontend (Vercel)

1. **Importar Proyecto en Vercel**:
   - Ingresar a [vercel.com](https://vercel.com/) con cuenta de GitHub.
   - Hacer clic en **"Add New..."** → **"Project"** y seleccionar el repositorio `HIKKEN17JZ/Programaci-n-1`.
2. **Configuración del Directorio y Build**:
   - **Root Directory**: `Frontend` (hacer clic en "Edit" y seleccionar la carpeta `Frontend`).
   - **Framework Preset**: `Vite` (detectado automáticamente).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Variables de Entorno**:
   - En la sección **"Environment Variables"**, añadir:
     - `VITE_API_URL`: La URL pública de la API seguida de `/api` (ej: `https://mi-gestor-academico.up.railway.app/api`).
4. **Desplegar**:
   - Presionar **"Deploy"**. Vercel compilará la aplicación y asignará un dominio público (ej: `https://programacion-1.vercel.app`).
5. **Manejo de Rutas SPA**:
   - El archivo `Frontend/vercel.json` configurado en el repositorio asegura que rutas como `/materias`, `/examenes` y `/perfil` se reescriban correctamente a `index.html` al recargar el navegador.

---

## 📸 Capturas de Pantalla Requeridas

*Adjuntar capturas tomadas en producción para completar la entrega:*

1. **Swagger / OpenAPI en producción**: Captura de `/api/docs/` respondiendo con estilos completos.
2. **Health Check en producción**: Captura de `/api/health/` con respuesta JSON `{"status": "ok", "service": "api"}`.
3. **Endpoint protegido**:
   - Acceso no autenticado (HTTP 401 Unauthorized).
   - Acceso autenticado con JWT Bearer Token (HTTP 200 OK con datos de `/api/materias/` o `/api/users/me/`).
4. **Frontend en Producción**: Captura del Dashboard o Listado de Materias cargando datos reales desde la API en la nube.
5. **Panel del Proveedor**: Captura de Railway y Vercel mostrando el servicio en estado **"Active / Running"**.
