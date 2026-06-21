# Urbalert · Frontend

Interfaz web de **Urbalert** construida con **React + Vite + TypeScript + Tailwind CSS**.

## Tecnologías

- React 18 + Vite + TypeScript
- Tailwind CSS
- React Router DOM (rutas protegidas y por rol)
- Axios (servicios separados por módulo)
- Lucide React (iconos)
- Recharts (gráficos del dashboard)
- Leaflet + React Leaflet (mapas con OpenStreetMap)

## Instalación

```bash
cd Frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173/`.

> El backend debe estar corriendo en `http://127.0.0.1:8000/`.
> Vite hace proxy automático de `/api` y `/media` hacia el backend
> (ver `vite.config.ts`), así que no necesitas configurar nada más.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — compila TypeScript y genera el build de producción
- `npm run preview` — sirve el build de producción
- `npm run lint` — chequeo de tipos con TypeScript

## Estructura

```
src/
  api/         Servicios Axios (auth, reclamos, usuarios, dashboard, ...)
  components/  Componentes reutilizables
    common/    Button, Input, Select, Textarea, Badge, Modal, Card, Table, ...
    layout/    Sidebar, Topbar, DashboardLayout, AuthLayout
    reclamos/  ReclamoCard, ReclamoTable, ReclamoTimeline, ReclamoForm, ...
    maps/      MapPicker, MapViewer
    uploads/   ImageUpload
    routes/    ProtectedRoute, RoleRoute
    admin/     Gestores de usuarios reutilizables
  context/     AuthContext, ToastContext
  pages/       Pantallas por rol (auth, admin, ciudadano, encargado, trabajador)
  routes/      AppRoutes
  types/       Tipos TypeScript del dominio
  utils/       Formato de fechas, colores de estado, etiquetas de rol
  data/        Datos de referencia de Santa Cruz de la Sierra
  styles/      index.css (Tailwind + Leaflet)
```

## Cuentas de prueba

| Rol           | Correo                    | Contraseña     |
|---------------|---------------------------|----------------|
| Administrador | admin@urbalert.com        | admin123       |
| Encargado     | encargado@urbalert.com    | encargado123   |
| Trabajador    | trabajador@urbalert.com   | trabajador123  |
| Ciudadano     | ciudadano@urbalert.com    | ciudadano123   |

En la pantalla de login puedes hacer clic en cualquiera de las cuentas de
prueba para rellenar las credenciales automáticamente.
