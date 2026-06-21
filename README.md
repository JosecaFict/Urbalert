# 🚨 Urbalert

**Sistema web de gestión y seguimiento de reclamos ciudadanos**
para la ciudad de **Santa Cruz de la Sierra, Bolivia**.

Urbalert resuelve un problema real: hoy muchos reclamos ciudadanos se hacen por
WhatsApp u otros canales informales y el ciudadano **nunca sabe** si su reclamo
fue recibido, revisado, atendido, rechazado o solucionado. Urbalert hace todo el
proceso **transparente y trazable**, con ubicación en mapa, foto de evidencia,
historial de estados y bitácora.

---

## 📋 Descripción

El ciudadano crea un reclamo (categoría, título, descripción, dirección,
ubicación exacta en mapa con latitud/longitud y foto). Un **encargado** lo revisa
y lo acepta o rechaza; si lo acepta, lo asigna a un **trabajador**. El trabajador
lo atiende, sube un reporte con descripción, foto, ubicación de atención y
resultado. Finalmente el encargado revisa el reporte y cierra el reclamo como
**solucionado** o **no solucionado**. El **administrador** tiene un panel general
con estadísticas, gestión de usuarios, categorías, historial y bitácora.

## 🧰 Tecnologías

**Frontend:** React · Vite · TypeScript · Tailwind CSS · React Router DOM ·
Axios · Lucide React · Recharts · Leaflet + React Leaflet

**Backend:** Python · Django · Django REST Framework · Simple JWT ·
django-cors-headers · SQLite (preparado para PostgreSQL)

## 👥 Roles

| Rol           | Capacidades principales |
|---------------|--------------------------|
| **Administrador** | Acceso total: dashboard, usuarios, categorías, todos los reclamos, bitácora, estadísticas |
| **Ciudadano**     | Registro/login, crear reclamos, ver sus reclamos y su historial |
| **Encargado**     | Revisar pendientes, aceptar/rechazar, asignar trabajadores, revisar reportes, cerrar reclamos |
| **Trabajador**    | Ver reclamos asignados, marcar "En atención", crear reporte con foto y resultado |

## 🗂️ Estructura del proyecto

```
Urbalert/
  Backend/          API Django REST (apps modulares)
  Frontend/         App React + Vite + TypeScript
  README.md         Este archivo
```

## 🔄 Flujo principal del sistema

```
Ciudadano crea reclamo (Pendiente)
        │
   Encargado revisa ──► Rechaza (Rechazado, con motivo)
        │
     Acepta (Aceptado)
        │
   Asigna a trabajador (Asignado)
        │
   Trabajador inicia (En atención)
        │
   Trabajador reporta (Reportado)  ── foto + resultado + ubicación
        │
   Encargado cierra ──► Solucionado  /  No solucionado
        │
   Ciudadano ve estado final + historial completo
```

### Estados y colores

| Estado | Color | Estado | Color |
|--------|-------|--------|-------|
| Pendiente | 🟡 Amarillo | En atención | 🟠 Naranja |
| Aceptado | 🔵 Azul | Reportado | 🩵 Celeste |
| Rechazado | 🔴 Rojo | Solucionado | 🟢 Verde |
| Asignado | 🟣 Morado | No solucionado | ⚫ Gris oscuro |

---

## 🚀 Instalación y ejecución

### 1) Backend (Django)

```bash
cd Backend
python -m venv venv
venv\Scripts\activate            # Windows (o: source venv/bin/activate)
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data        # carga roles, usuarios, categorías y reclamos de ejemplo
python manage.py runserver
```

Backend en `http://127.0.0.1:8000/`.

> En Windows, si el comando `python` no existe, usa `py` (p. ej. `py -m venv venv`).

### 2) Frontend (React)

En otra terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend en `http://localhost:5173/`. El proxy de Vite conecta automáticamente
con el backend.

---

## 🔑 Usuarios de prueba

| Rol           | Correo                    | Contraseña     |
|---------------|---------------------------|----------------|
| Administrador | admin@urbalert.com        | admin123       |
| Encargado     | encargado@urbalert.com    | encargado123   |
| Trabajador    | trabajador@urbalert.com   | trabajador123  |
| Ciudadano     | ciudadano@urbalert.com    | ciudadano123   |

## ✅ Qué se puede demostrar

Login · Registro de ciudadano · Dashboard por rol · Creación de reclamos ·
Mapa con ubicación (Leaflet) · Foto de evidencia · Gestión por encargado ·
Asignación a trabajador · Reporte del trabajador · Cierre del reclamo ·
Historial del reclamo · Bitácora · Dashboard estadístico (Recharts) ·
Gestión de usuarios y categorías.

---

*Proyecto desarrollado para la materia de Gestión de Proyecto.*
