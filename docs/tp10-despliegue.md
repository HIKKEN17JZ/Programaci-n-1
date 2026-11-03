# **Trabajo Práctico N°10: Despliegue de la Aplicación en la Nube**

**Materia:** Programación I  
**Profesor:** Carballo Nicolás  
**Alumno:** Andres Alejandro Aguirre Jerez  
**Fecha:** 03/11/2026  

---

## **Objetivo**

El objetivo de este trabajo práctico fue desplegar la aplicación completa en la nube:
1. La **API RESTful** desarrollada con Django y Django REST Framework alojada en el servicio en la nube **Render**, conectada a una base de datos relacional **PostgreSQL**, utilizando **Gunicorn** como servidor WSGI de producción y **WhiteNoise** para el empaquetado y servicio eficiente de archivos estáticos (Swagger UI y Django Admin).
2. La aplicación cliente **Frontend SPA** desarrollada con **React 19** y **Vite** alojada en **Vercel**, consumiendo la API pública en tiempo real con soporte completo para navegación SPA sin pérdida de rutas al recargar.

Este documento detalla los entregables, las URLs públicas, la evidencia de funcionamiento con capturas de pantalla y el paso a paso técnico del proceso de despliegue ("Cómo se subió").

---

## **Entregables**

A continuación se presentan los entregables requeridos para la aprobación del TP:

### **1. URLs Públicas del Proyecto**
* **URL Frontend (Aplicación Web en Vivo):** [https://academicogestor.vercel.app](https://academicogestor.vercel.app)
* **URL Backend (API REST en Producción):** [https://gestor-apo.onrender.com/api](https://gestor-apo.onrender.com/api)
* **Documentación Interactiva Swagger / OpenAPI:** [https://gestor-apo.onrender.com/api/docs/](https://gestor-apo.onrender.com/api/docs/)
* **Endpoint de Salud / Health Check:** [https://gestor-apo.onrender.com/api/health/](https://gestor-apo.onrender.com/api/health/)

### **2. Repositorio de Código y Pull Request**
El código fuente completo del proyecto monorepo (Backend Django + Frontend React) junto con todos los archivos de configuración para el despliegue (`render.yaml`, `Procfile`, `requirements.txt`, `vercel.json`) se encuentra disponible en:
* **Repositorio en GitHub:** [https://github.com/HIKKEN17JZ/Programaci-n-1](https://github.com/HIKKEN17JZ/Programaci-n-1)
* **Pull Request Oficial (TP10):** [https://github.com/HIKKEN17JZ/Programaci-n-1/pull/12](https://github.com/HIKKEN17JZ/Programaci-n-1/pull/12)

---

## **Capturas de Pantalla del Proyecto en Producción**

*(En esta sección se adjuntan las capturas de pantalla de la aplicación funcionando en internet)*

### **1. Documentación con Swagger UI en Producción**
La documentación de la API generada automáticamente mediante `drf-spectacular` se encuentra accesible y estilizada en producción gracias a WhiteNoise:

<!-- PEGAR AQUÍ CAPTURA 1: Swagger UI abierto en https://gestor-apo.onrender.com/api/docs/ -->
![Captura 1: Documentación Swagger UI en Producción](capturas/captura1-swagger.png)

---

### **2. Endpoint de Health Check (`/api/health/`)**
El endpoint de monitoreo verifica tanto el estado del servicio web como la conectividad activa con PostgreSQL, devolviendo código HTTP 200 OK y confirmación JSON:

<!-- PEGAR AQUÍ CAPTURA 2: Respuesta JSON en https://gestor-apo.onrender.com/api/health/ -->
![Captura 2: Endpoint Health Check respondiendo 200 OK](capturas/captura2-health.png)

---

### **3. Acceso a Endpoints Protegidos (Autenticación JWT)**
Demostración del control de acceso mediante tokens JSON Web Tokens (SimpleJWT):

#### **Acceso no autorizado (Error 401 Unauthorized sin credenciales):**
Al intentar consultar un recurso protegido (ej. `/api/users/me/`) sin proveer el header de autorización, la API responde con `401`:

<!-- PEGAR AQUÍ CAPTURA 3A: Petición a endpoint protegido sin token devolviendo 401 -->
![Captura 3A: Error 401 No Autorizado](capturas/captura3a-401.png)

#### **Acceso autorizado (Respuesta 200 OK con Bearer Token):**
Al autenticarse mediante `/api/token/` e incluir el `access token` en el header `Authorization: Bearer <token>`, el endpoint responde `200 OK` con los datos del usuario:

<!-- PEGAR AQUÍ CAPTURA 3B: Petición con Bearer Token devolviendo 200 OK -->
![Captura 3B: Acceso Autorizado 200 OK](capturas/captura3b-200.png)

---

### **4. Frontend en Producción (Vercel) consumiendo la API de Render**
La aplicación web en React 19 renderiza el Dashboard, el progreso de carrera con semáforo y las materias conectándose en vivo a la base de datos de Render:

<!-- PEGAR AQUÍ CAPTURA 4: Frontend abierto en https://academicogestor.vercel.app con sesión iniciada y materias cargadas -->
![Captura 4: Frontend en Vercel cargando datos reales de la API](capturas/captura4-frontend.png)

---

### **5. Panel de Control de los Proveedores Cloud**

#### **Panel de Render (API + PostgreSQL):**
El servicio Web de Django `gestor-apo` y la base de datos `gestor-db` se encuentran en estado **"Live"**:

<!-- PEGAR AQUÍ CAPTURA 5A: Dashboard de Render mostrando gestor-apo Live y la base PostgreSQL -->
![Captura 5A: Panel de Render con Web Service y Database en estado Live](capturas/captura5a-render.png)

#### **Panel de Vercel (Frontend):**
El proyecto `academicogestor` se encuentra desplegado con éxito en estado **"Ready"**:

<!-- PEGAR AQUÍ CAPTURA 5B: Dashboard de Vercel mostrando el deployment en estado Ready -->
![Captura 5B: Panel de Vercel en estado Ready](capturas/captura5b-vercel.png)

---

## **Documentación del Proceso de Despliegue: "Cómo se subió"**

### **Backend: Despliegue de Django API en Render con PostgreSQL**

El proceso de despliegue del backend se realizó siguiendo estos pasos:

1. **Creación de la Base de Datos PostgreSQL en Render**:
   - En el dashboard de **Render**, se seleccionó **"New +"** → **"PostgreSQL"**.
   - Nombre: `gestor-db`, Base de datos: `gestor_db`, Usuario: `gestor_user`.
   - Se seleccionó el plan **Free** ($0/mes) y se obtuvo la cadena de conexión interna (`Internal Database URL`).

2. **Creación del Web Service en Render**:
   - Se conectó el repositorio de GitHub `HIKKEN17JZ/Programaci-n-1` y la rama de despliegue (`feature/deploy_tp10`).
   - Nombre del servicio: `gestor-apo`.
   - Runtime: `Python 3`.
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start Command**:
     ```bash
     gunicorn Gestor.wsgi:application
     ```
   - Plan: **Free** ($0/mes).

3. **Configuración de Variables de Entorno en Render**:
   En la sección **Environment Variables** del servicio se definieron:
   - `DATABASE_URL`: Cadena de conexión inyectada desde la base de datos PostgreSQL.
   - `SECRET_KEY`: Clave segura generada para producción.
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.onrender.com`

4. **Ajustes de Configuración en el Código (`Gestor/settings.py`)**:
   - **Conexión dinámica de Base de Datos**: Integración con `dj_database_url` para alternar fluidamente entre PostgreSQL local y la URL inyectada en la nube:
     ```python
     DATABASES = {
         'default': dj_database_url.config(
             default=f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}",
             conn_max_age=600,
         )
     }
     ```
   - **WhiteNoise para Archivos Estáticos**: Inclusión de `whitenoise.middleware.WhiteNoiseMiddleware` y configuración de almacenamiento comprimido `whitenoise.storage.CompressedStaticFilesStorage`.
   - **Políticas de CORS**: Configuración de `CORS_ALLOWED_ORIGIN_REGEXES = [r"^https:\/\/.*\.vercel\.app$"]` para admitir de forma segura las peticiones provenientes de subdominios de Vercel.

---

### **Frontend: Despliegue de React (Vite) en Vercel**

El despliegue del frontend se llevó a cabo de la siguiente manera:

1. **Importación del Proyecto en Vercel**:
   - Se ingresó a [vercel.com](https://vercel.com/) con la cuenta de GitHub.
   - Se importó el repositorio `HIKKEN17JZ/Programaci-n-1`.

2. **Configuración del Directorio y Compilación**:
   - **Project Name**: `academicogestor` (generando el dominio `https://academicogestor.vercel.app`).
   - **Root Directory**: `Frontend` (seleccionado mediante el botón Edit para compilar exclusivamente la SPA).
   - **Framework Preset**: `Vite` (detectado automáticamente).
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.

3. **Variables de Entorno**:
   - Se añadió la clave `VITE_API_URL` apuntando a la API en producción:
     `https://gestor-apo.onrender.com/api`

4. **Manejo de Rutas SPA (`vercel.json`)**:
   - Para evitar errores 404 al recargar el navegador en rutas dinámicas como `/login`, `/materias` o `/perfil`, se incorporó el archivo de configuración `Frontend/vercel.json`:
     ```json
     {
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```

5. **Deploy**:
   - Se inició la compilación (`Deploy`), generando el paquete estático minificado y activando HTTPS automáticamente con certificado SSL.

---

## **Conclusión**

La arquitectura cliente-servidor se encuentra completamente desplegada y comunicada en internet:
- El backend gestiona de forma segura la autenticación JWT y las operaciones CRUD académicas sobre PostgreSQL.
- El frontend presenta una interfaz reactiva, moderna y responsive que consume los datos de la nube sin fallas de CORS ni problemas de recarga de rutas.
- Se cuenta con una suite de 72 pruebas en backend y 161 pruebas en frontend que respaldan la estabilidad técnica de la solución.
