# Frontend — Gestión de Carrera (TP6 · Home con Bootstrap)

Frontend de la Plataforma de Gestión de Carrera e Historial Académico, construido con **React 19 + Vite** y estilizado con **Bootstrap 5.3**.

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
├── main.jsx               # Punto de entrada (Bootstrap + estilos + app)
├── App.jsx                # Composición: Navbar + Home + Footer
├── index.css              # Variables del tema (color primario terracota)
├── components/
│   ├── Navbar.jsx         # Barra de navegación responsive (navbar-expand-lg)
│   └── Footer.jsx         # Pie de página con secciones y contacto
└── views/
    └── Home.jsx           # Vista principal (TP6) con secciones y MOCKs
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

- `role="progressbar"` y `aria-valuenow/min/max` están sobre la `.progress-bar` interna (elemento con la barra pintada).
- Los badges de mesas usan `text-bg-success` si hay nota y `text-bg-secondary` si está pendiente.
- `<html lang="es">` y `<title>Gestión de Carrera</title>` en `index.html`.

Para el detalle del diseño y navegación de la vista, ver [`docs/diseno-home.md`](docs/diseno-home.md).