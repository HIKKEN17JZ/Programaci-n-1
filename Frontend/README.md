# Frontend — Plataforma de Gestión de Carrera e Historial Académico (TP9)

Frontend de la **Plataforma de Gestión de Carrera e Historial Académico**, desarrollado con **React 19 + Vite** y estilizado con **Bootstrap 5.3**. Conectado a la API REST de **Django REST Framework** mediante autenticación JWT (SimpleJWT) y diseñado con arquitectura basada en componentes, principios de **Clean Code** y **TDD (Test-Driven Development)**.

---

## 🚀 Inicio Rápido

### Requisitos previos
- Node.js $\ge$ 20.x
- Servidor Backend de Django ejecutándose en `http://localhost:8000`

### Ejecución en desarrollo

```bash
npm install
npm run dev
```

El servidor Vite se inicia en **http://localhost:3000** (configurado en `vite.config.js`).

---

## 📦 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en el puerto 3000 con Hot Reload |
| `npm run build` | Compila la aplicación optimizada para producción en `dist/` |
| `npm run lint` | Ejecuta ESLint para validar calidad de código |
| `npm test` | Ejecuta la suite de 116 pruebas unitarias con el test runner nativo de Node (`node:test`) |
| `npm run preview` | Previsualiza localmente el build de producción |

---

## 🗺️ Mapa de Rutas de la Aplicación

| Ruta | Componente | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `/login` | `Login.jsx` | Público | Acceso con diseño diagonal interactivo en dos paneles y persistencia de tokens JWT. |
| `/register` | `Register.jsx` | Público | Registro de estudiantes y docentes con validación en tiempo real. |
| `/` | `Home.jsx` | Autenticado | Panel principal con resumen curricular, progreso académico y tarjetas de acceso. |
| `/materias` | `MateriasList.jsx` | Autenticado | Catálogo de materias con buscador en vivo, filtros por estado/año y modales CRUD. |
| `/materias/:id` | `MateriaDetail.jsx` | Autenticado | Ficha curricular con historial de evaluaciones, promedio individual y edición. |
| `/examenes` | `ExamenesList.jsx` | Autenticado | Mesas de examen, promedios con/sin aplazos, actas y registro de notas. |
| `/perfil` | `Profile.jsx` | Autenticado | Perfil del usuario, avatar con iniciales, datos de cuenta y semáforo de cursada. |
| `/unauthorized` / `/403` | `Unauthorized.jsx` | Público/Auth | Pantalla de Acceso Denegado (HTTP 403) con rol actual y alternativas de navegación. |
| `*` | `NotFound.jsx` | Público/Auth | Pantalla de Página No Encontrada (HTTP 404) dentro del Layout con Navbar y Footer. |

---

## 🧩 Arquitectura del Proyecto

```
Frontend/src/
├── main.jsx                     # Punto de entrada (StrictMode, AuthProvider, BrowserRouter)
├── App.jsx                      # Router central con protección de rutas y Layout maestro
├── index.css                    # Variables de marca (#c05621), fondo diagonal y utilidades
├── components/
│   ├── Navbar.jsx               # Barra de navegación con isotipo SVG y recuadro de usuario
│   ├── Footer.jsx               # Pie de página responsive
│   ├── StatCard.jsx             # Tarjetas de estadísticas con micro-interacciones
│   ├── ProgressCard.jsx         # Monitor de avance curricular y semáforo académico
│   ├── PlanEstudioCard.jsx      # Card de resumen del plan con enlaces al catálogo
│   ├── MesasExamenCard.jsx      # Card de turnos y calificaciones recientes
│   ├── ProtectedRoute.jsx       # Guardián de rutas autenticadas
│   ├── RoleProtectedRoute.jsx   # Guardián de rutas con validación RBAC (Role-Based Access Control)
│   ├── MateriaModal.jsx         # Modal interactivo para Crear y Editar Asignaturas
│   ├── ExamenModal.jsx          # Modal interactivo para Registrar y Calificar Exámenes
│   └── ConfirmModal.jsx         # Modal reutilizable de confirmación para eliminaciones seguras
├── contexts/
│   └── AuthContext.jsx          # Contexto de autenticación conectado con JWT y sesión persistente
├── hooks/
│   └── useAuth.js               # Hook consumidor del contexto de autenticación
├── services/
│   ├── apiClient.js             # Cliente HTTP con interceptores JWT, Bearer token y ApiError
│   ├── authService.js           # Servicios de login, register, refresh token y logout
│   ├── tokenStorage.js          # Almacenamiento seguro de tokens en LocalStorage
│   └── academicService.js       # CRUD completo contra /api/materias/, /api/examenes/ y /api/facultades/
├── utils/
│   ├── academicValidators.js    # Validadores de formularios de materias y exámenes (TDD)
│   ├── materiaFilters.js        # Motor de búsqueda y filtrado de materias (TDD)
│   ├── progress.js              # Cálculo de promedios, créditos y semáforo visual (TDD)
│   ├── roles.js                 # Constantes y permisos de usuario RBAC (TDD)
│   └── routeGuards.js           # Decisiones de acceso a rutas y mensajes de autorización (TDD)
└── views/
    ├── Home.jsx                 # Dashboard principal del estudiante / docente
    ├── Login.jsx                # Vista de acceso con diseño dividido
    ├── Register.jsx             # Vista de registro con diseño dividido
    ├── MateriasList.jsx         # Catálogo completo con buscador y gestión interactiva
    ├── MateriaDetail.jsx        # Detalle de materia con actas de evaluación
    ├── ExamenesList.jsx         # Mesas de examen y registro de notas
    ├── Profile.jsx              # Perfil de usuario y semáforo académico
    ├── Unauthorized.jsx         # Vista HTTP 403 (Acceso Denegado)
    └── NotFound.jsx             # Vista HTTP 404 (Página No Encontrada)
```

---

## 🎨 Paleta de Color Institucional

El diseño se adhiere de forma estricta a la paleta cálida institucional de la aplicación:

- **Color Primario (Terracota / Naranja Mate)**: `--bs-primary: #c05621` (`rgb(192, 86, 33)`)
- **Hover de Enlaces**: `--bs-link-hover-color: #9a431a`
- **Fondo de Autenticación**: Corte diagonal de esquina a esquina (`linear-gradient(to bottom right, #c05621 50%, #f4f6f8 50.1%)`)
- **Semáforo Curricular**:
  - `0% - 39%`: Crítico / Inicio (Rojo - `text-bg-danger`)
  - `40% - 74%`: En Proceso (Amarillo - `text-bg-warning`)
  - `75% - 100%`: Avanzado / Completado (Verde - `text-bg-success`)

---

## 🔑 Credenciales para Pruebas en Base de Datos

| Usuario | Contraseña | Rol | Perfil y Acciones |
| :--- | :--- | :--- | :--- |
| **`alumno`** | `alumno123` | **ESTUDIANTE** | Gestor personal: carga su plan de estudio, registra notas y sigue su avance. |
| **`admin`** | `admin123` | **ADMIN** | Superusuario: acceso y gestión global de materias, exámenes y facultades. |

---

## 🧪 Pruebas Unitarias y Calidad (TDD)

El proyecto cuenta con **116 pruebas unitarias automatizadas** que cubren el 100% de la lógica de negocio, validaciones y servicios HTTP:

```bash
npm test
```

### Cobertura de pruebas:
- **`academicService.test.js`**: Operaciones CRUD para materias, exámenes y facultades con respuestas paginadas.
- **`academicValidators.test.js`**: Validaciones de formularios de materias y actas de exámenes.
- **`apiClient.test.js`**: Manejo de Bearer tokens, serialización JSON y normalización de errores de Django REST Framework.
- **`authService.test.js`**: Flujos de login, renovación de token ante 401, registro y logout resiliente.
- **`materiaFilters.test.js`**: Buscador en tiempo real y filtros combinados.
- **`progress.test.js`**: Fórmulas de avance curricular, promedios con y sin aplazos, y semáforo.
- **`roles.test.js`**: Jerarquía de permisos RBAC para estudiantes, docentes y administradores.
- **`routeGuards.test.js`**: Control de acceso a rutas protegidas y generación de mensajes de error.
- **`tokenStorage.test.js`**: Persistencia y ciclo de vida de tokens JWT.
