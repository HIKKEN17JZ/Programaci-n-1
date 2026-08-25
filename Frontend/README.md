# Frontend — Gestión de Carrera (TP6 → TP7: Home con Bootstrap + Sistema Auth)

Frontend de la Plataforma de Gestión de Carrera e Historial Académico, construido con **React 19 + Vite** y estilizado con **Bootstrap 5.3**. El TP7 agregó un sistema de autenticación hardcodeado en memoria sobre la base del TP6.

## 🚀 Levantar la app

```bash
npm install
npm run dev
```

Se sirve en **http://localhost:3000** (configurado en `vite.config.js`).

## 📦 Scripts

| Comando             | Qué hace                                            |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Levanta el servidor de desarrollo en el puerto 3000 |
| `npm run build`     | Compila la app de producción en `dist/`             |
| `npm run lint`      | Ejecuta ESLint sobre el código                      |
| `npm run preview`   | Sirve localmente el build generado                  |

## 🧩 Estructura

```
src/
├── main.jsx               # Punto de entrada (Bootstrap + estilos + app > AuthProvider > BrowserRouter)
├── App.jsx                # Router con Routes: /login, /register, / (ProtectedRoute)
├── index.css              # Variables del tema (color primario terracota)
├── components/
│   ├── Navbar.jsx         # Barra condicional: sesión > "Hola {username} / Cerrar sesión"
│   │                     #                      > no sesión > links Login/Register
│   ├── Footer.jsx         # Pie de página con secciones y contacto
│   └── ProtectedRoute.jsx # Guard: si no hay user redirige a /login con state from
├── contexts/
│   └── AuthContext.jsx    # AuthContext + AuthProvider (users + user; login/register/logout)
├── hooks/
│   └── useAuth.js         # Hook useAuth() — lanza error si se usa fuera de AuthProvider
├── data/
│   └── hardcodedUsers.js  # Usuarios seed: admin/admin123, alumno/1234, docente/docente2024
└── views/
    ├── Home.jsx           # Vista principal (TP6) con secciones y MOCKs
    ├── Login.jsx          # Card Bootstrap; login; error genérico; redirect from state
    └── Register.jsx       # Card Bootstrap; register; redirect a /login con mensaje éxito
```

## 🎨 Tema

El color primario del tema se redefine en `src/index.css` sobre las variables de Bootstrap, por lo que `bg-primary`, `text-primary` y `btn-outline-primary` se repintan solas sin tocar los componentes:

```css
:root {
  --bs-primary: #c05621;          /* naranja mate (terracota) */
  --bs-primary-rgb: 192, 86, 33;
  --bs-link-color: #c05621;
  --bs-link-hover-color: #9a431a;
}
```

El contraste del texto blanco sobre el terracota es de ~4.6:1 (cumple WCAG AA); por eso navbar y hero usan `bg-primary` sin `bg-gradient`.

## 📐 Responsive del TP6

La Home es totalmente responsive y se validó en 320 / 768 / 1200 px:

- **`col-12 col-md-4`** → las tarjetas de métricas y de secciones apilan en 1 columna (móvil) y pasan a 3 columnas (desde `md`).
- **Navbar** → usa `navbar-expand-lg` con menú colapsable en pantallas chicas.
- **Hero** → los botones apilan con `d-flex flex-column flex-sm-row` en móvil.

## 🐛 Puntuales de accesibilidad (TP6)

- `role="progressbar"` y `aria-valuenow/min/max` están sobre la `.progress-bar` interna.
- Los badges de mesas usan `text-bg-success` si hay nota y `text-bg-secondary` si está pendiente.
- `<html lang="es">` y `<title>Gestión de Carrera</title>` en `index.html`.

Para el detalle del diseño y navegación de la vista, ver [`docs/diseno-home.md`](docs/diseno-home.md).

## 🔐 Sistema de autenticación (TP7)

Este apartado describe el sistema de auth agregado en el TP7, sobre la base del TP6.

### Contexto y proveedor (`AuthContext`)

- Los datos de usuario viven en **estado de React en memoria** (no persisten al recargar).
- `AuthProvider` expone `user`, `login`, `register` y `logout`.
- `users` es un array seed cargado de `data/hardcodedUsers.js` (3 usuarios: admin, alumno, docente).
- `useAuth()` debe usarse dentro de `<AuthProvider>`, lanza error si no lo está.

### Rutas y acceso (`ProtectedRoute` + router)

- `/login` y `/register` son rutas públicas.
- `/` (Home) está envuelto en `ProtectedRoute`: si no hay sesión de usuario, cualquier navegación a `/` redirige a `/login` guardando el destino original en `state`.
- `ProtectedRoute` usa `useLocation` de `react-router-dom` y `<Outlet>` para renderizar el layout con navbar y footer.

### Flujo de login

1. El usuario completa el formulario en `Login.jsx`.
2. `login(username, password)` busca el usuario en `users` por username y compara la contraseña.
3. Si no encuentra el usuario o la contraseña es incorrecta → `{ ok: false, message: 'Usuario o contraseña incorrecta' }` (mensaje genérico para evitar revelar existencia de usuario).
4. Si las credenciales son correctas → `setUser()` con `{ username, email, rol }` y navega a `/` (o la URL guardada en `location.state.from`).
5. Si el usuario ya estaba logueado y visita `/login`, es redirigido a `/`.

### Flujo de registro

1. El usuario completa el formulario en `Register.jsx`.
2. `register({ username, password, email })` valida que faltan datos y que el usuario no exista ya.
3. Si es exitoso → agrega el usuario al estado `users` en memoria y navega a `/login` con `state: { registered: username }` para mostrar mensaje de éxito.
4. El registro **no inicia sesión automáticamente**; el usuario debe hacer login con sus credenciales.

### Cerrar sesión (logout)

- El `Navbar` muestra un botón "Cerrar sesión" cuando hay sesión activa.
- Al hacer clic, llama `logout()` que establece `user = null` y redirige a `/login`.

### Credenciales del seed

| Usuario | Rol | Contraseña |
| ------- | --- | ---------- |
| admin | admin | admin123 |
| alumno | estudiante | 1234 |
| docente | docente | docente2024 |

**Nota:** Las credenciales viven en memoria. Al recargar la página, el estado se pierde (comportamiento esperado del TP7).

## 📝 Próximo paso (TP8)

Los usuarios hardcodeados en `data/hardcodedUsers.js` serán reemplazados por llamadas a la API:
- `login` → `POST /api/token/`
- `register` → `POST /api/register/`

Actualmente el flujo permanece completo y funcional con datos locales.

