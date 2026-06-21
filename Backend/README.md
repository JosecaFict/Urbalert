# Urbalert · Backend

API REST de **Urbalert**, sistema de gestión y seguimiento de reclamos ciudadanos
de Santa Cruz de la Sierra, Bolivia. Construido con **Django + Django REST Framework**.

## Tecnologías

- Python 3.9+
- Django 4.2 (LTS)
- Django REST Framework
- Simple JWT (autenticación por tokens)
- django-cors-headers
- SQLite (desarrollo) — preparado para PostgreSQL
- Pillow (manejo de imágenes)

## Arquitectura (apps modulares)

```
apps/
  usuarios/      Roles, usuario personalizado, autenticación JWT, permisos
  reclamos/      Categorías, estados, reclamos, imágenes, historial, comentarios
  asignaciones/  Asignación de reclamos a trabajadores
  reportes/      Reportes de atención de los trabajadores
  bitacora/      Registro de movimientos del sistema
  dashboard/     Estadísticas y resúmenes
  core/          Comando seed_data (datos iniciales)
```

## Instalación

```bash
cd Backend
python -m venv venv
venv\Scripts\activate            # Windows
# source venv/bin/activate       # Linux / Mac

pip install -r requirements.txt

# (opcional) copiar variables de entorno
copy .env.example .env           # Windows
# cp .env.example .env           # Linux / Mac

python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

> En Windows, si `python` no está disponible usa el lanzador `py` en su lugar.

La API queda disponible en `http://127.0.0.1:8000/`.

## Usuarios de prueba (creados por `seed_data`)

| Rol           | Correo                    | Contraseña     |
|---------------|---------------------------|----------------|
| Administrador | admin@urbalert.com        | admin123       |
| Encargado     | encargado@urbalert.com    | encargado123   |
| Trabajador    | trabajador@urbalert.com   | trabajador123  |
| Ciudadano     | ciudadano@urbalert.com    | ciudadano123   |

## Endpoints principales

### Autenticación
- `POST /api/auth/login/`
- `POST /api/auth/register/`
- `POST /api/auth/logout/`
- `GET  /api/auth/me/`

### Usuarios
- `GET|POST /api/usuarios/`
- `GET|PUT|DELETE /api/usuarios/{id}/`
- `GET /api/usuarios/ciudadanos/` · `/encargados/` · `/trabajadores/`

### Categorías
- `GET|POST /api/categorias/` · `GET|PUT|DELETE /api/categorias/{id}/`

### Reclamos
- `GET|POST /api/reclamos/`
- `GET|PUT|DELETE /api/reclamos/{id}/`
- `GET /api/reclamos/mis-reclamos/`
- `GET /api/reclamos/pendientes/`
- `PATCH /api/reclamos/{id}/aceptar/`
- `PATCH /api/reclamos/{id}/rechazar/`
- `PATCH /api/reclamos/{id}/cambiar-estado/`
- `GET /api/reclamos/{id}/historial/`

### Asignaciones
- `GET|POST /api/asignaciones/`
- `GET /api/asignaciones/mis-asignaciones/`
- `PATCH /api/asignaciones/{id}/finalizar/`

### Reportes
- `GET|POST /api/reportes/`
- `GET /api/reportes/por-reclamo/{id}/`

### Bitácora
- `GET /api/bitacora/` (filtros: `usuario`, `accion`, `modulo`, `desde`, `hasta`)

### Dashboard
- `GET /api/dashboard/resumen/`
- `GET /api/dashboard/reclamos-por-estado/`
- `GET /api/dashboard/reclamos-por-categoria/`
- `GET /api/dashboard/reclamos-por-mes/`
- `GET /api/dashboard/actividad-reciente/`

## Cambiar a PostgreSQL

En `.env`:

```
DB_ENGINE=postgres
DB_NAME=urbalert
DB_USER=urbalert
DB_PASSWORD=urbalert
DB_HOST=localhost
DB_PORT=5432
```

Luego `python manage.py migrate` y `python manage.py seed_data`.
