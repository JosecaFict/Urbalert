"""Comando para cargar datos iniciales de Urbalert.

Uso:
    python manage.py seed_data
"""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.asignaciones.models import AsignacionReclamo
from apps.notificaciones.models import Notificacion
from apps.reclamos.models import (
    CategoriaReclamo,
    EstadoReclamo,
    HistorialEstadoReclamo,
    Reclamo,
)
from apps.usuarios.models import Rol, Usuario


ROLES = [
    (Rol.ADMINISTRADOR, 'Acceso total al sistema'),
    (Rol.CIUDADANO, 'Ciudadano que reporta reclamos urbanos'),
    (Rol.ENCARGADO, 'Revisa, acepta, asigna y cierra reclamos'),
    (Rol.TRABAJADOR, 'Atiende reclamos asignados y reporta'),
]

ESTADOS = [
    (EstadoReclamo.PENDIENTE, 'Reclamo recién creado, en espera de revisión', 1),
    (EstadoReclamo.ACEPTADO, 'Reclamo aceptado por el encargado', 2),
    (EstadoReclamo.RECHAZADO, 'Reclamo rechazado con observación', 3),
    (EstadoReclamo.ASIGNADO, 'Reclamo asignado a un trabajador', 4),
    (EstadoReclamo.EN_ATENCION, 'El trabajador está atendiendo el reclamo', 5),
    (EstadoReclamo.REPORTADO, 'El trabajador envió su reporte de atención', 6),
    (EstadoReclamo.SOLUCIONADO, 'Reclamo cerrado como solucionado', 7),
    (EstadoReclamo.NO_SOLUCIONADO, 'Reclamo cerrado como no solucionado', 8),
]

CATEGORIAS = [
    'Baches y daños en calles',
    'Alumbrado público',
    'Cables eléctricos expuestos',
    'Basura acumulada',
    'Alcantarillado y drenaje',
    'Inundaciones',
    'Árboles y áreas verdes',
    'Fugas de agua',
    'Plazas y parques',
]

USUARIOS = [
    {
        'email': 'admin@urbalert.com', 'password': 'admin123',
        'rol': Rol.ADMINISTRADOR, 'nombres': 'Ana Gabriela', 'apellidos': 'Soto Vargas',
        'ci': '1000001', 'telefono': '70000001',
        'direccion': 'Av. Beni, Santa Cruz de la Sierra',
        'is_staff': True, 'is_superuser': True,
    },
    {
        'email': 'encargado@urbalert.com', 'password': 'encargado123',
        'rol': Rol.ENCARGADO, 'nombres': 'Carlos', 'apellidos': 'Mendoza Rojas',
        'ci': '2000002', 'telefono': '70000002',
        'direccion': 'Barrio Equipetrol, Santa Cruz de la Sierra',
    },
    {
        'email': 'trabajador@urbalert.com', 'password': 'trabajador123',
        'rol': Rol.TRABAJADOR, 'nombres': 'Juan', 'apellidos': 'Pérez Flores',
        'ci': '3000003', 'telefono': '70000003',
        'direccion': 'Plan 3000, Santa Cruz de la Sierra',
    },
    {
        'email': 'ciudadano@urbalert.com', 'password': 'ciudadano123',
        'rol': Rol.CIUDADANO, 'nombres': 'María', 'apellidos': 'Gutiérrez Soliz',
        'ci': '4000004', 'telefono': '70000004',
        'direccion': 'Av. Santos Dumont, 4to anillo, Santa Cruz de la Sierra',
    },
]

# Reclamos de ejemplo: (titulo, categoria, direccion, lat, lng, prioridad, estado)
RECLAMOS = [
    ('Bache profundo en Av. Santos Dumont, 4to anillo',
     'Baches y daños en calles', 'Av. Santos Dumont, 4to anillo',
     '-17.7920000', '-63.1750000', 'alta', EstadoReclamo.PENDIENTE),
    ('Poste sin luz en Barrio Equipetrol',
     'Alumbrado público', 'Barrio Equipetrol, 2do anillo',
     '-17.7700000', '-63.1900000', 'media', EstadoReclamo.ACEPTADO),
    ('Basura acumulada en zona Los Lotes',
     'Basura acumulada', 'Zona Los Lotes, Plan 3000',
     '-17.8200000', '-63.1300000', 'media', EstadoReclamo.ASIGNADO),
    ('Fuga de agua en Av. Banzer',
     'Fugas de agua', 'Av. Banzer, 3er anillo',
     '-17.7650000', '-63.1850000', 'alta', EstadoReclamo.EN_ATENCION),
    ('Árbol caído cerca de Plaza 24 de Septiembre',
     'Árboles y áreas verdes', 'Plaza 24 de Septiembre, Centro',
     '-17.7833000', '-63.1821000', 'media', EstadoReclamo.REPORTADO),
    ('Alcantarilla tapada en Plan 3000',
     'Alcantarillado y drenaje', 'Av. Virgen de Cotoca, Plan 3000',
     '-17.8100000', '-63.1200000', 'alta', EstadoReclamo.SOLUCIONADO),
    ('Cable eléctrico expuesto en Av. Virgen de Cotoca',
     'Cables eléctricos expuestos', 'Av. Virgen de Cotoca, 5to anillo',
     '-17.8000000', '-63.1400000', 'alta', EstadoReclamo.RECHAZADO),
]

# Secuencia de estados por los que "pasó" cada reclamo, para construir historial
SECUENCIA = {
    EstadoReclamo.PENDIENTE: [EstadoReclamo.PENDIENTE],
    EstadoReclamo.ACEPTADO: [EstadoReclamo.PENDIENTE, EstadoReclamo.ACEPTADO],
    EstadoReclamo.RECHAZADO: [EstadoReclamo.PENDIENTE, EstadoReclamo.RECHAZADO],
    EstadoReclamo.ASIGNADO: [
        EstadoReclamo.PENDIENTE, EstadoReclamo.ACEPTADO, EstadoReclamo.ASIGNADO],
    EstadoReclamo.EN_ATENCION: [
        EstadoReclamo.PENDIENTE, EstadoReclamo.ACEPTADO, EstadoReclamo.ASIGNADO,
        EstadoReclamo.EN_ATENCION],
    EstadoReclamo.REPORTADO: [
        EstadoReclamo.PENDIENTE, EstadoReclamo.ACEPTADO, EstadoReclamo.ASIGNADO,
        EstadoReclamo.EN_ATENCION, EstadoReclamo.REPORTADO],
    EstadoReclamo.SOLUCIONADO: [
        EstadoReclamo.PENDIENTE, EstadoReclamo.ACEPTADO, EstadoReclamo.ASIGNADO,
        EstadoReclamo.EN_ATENCION, EstadoReclamo.REPORTADO,
        EstadoReclamo.SOLUCIONADO],
}


class Command(BaseCommand):
    help = 'Carga datos iniciales de Urbalert (roles, usuarios, categorías, reclamos).'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Cargando datos iniciales de Urbalert...')

        roles = self._crear_roles()
        estados = self._crear_estados()
        categorias = self._crear_categorias()
        usuarios = self._crear_usuarios(roles)
        self._crear_reclamos(usuarios, categorias, estados)

        self.stdout.write(self.style.SUCCESS('\n[OK] Datos iniciales cargados.'))
        self.stdout.write('\nUsuarios de prueba:')
        for u in USUARIOS:
            self.stdout.write(f"  - {u['email']} / {u['password']} ({u['rol']})")

    def _crear_roles(self):
        roles = {}
        for nombre, desc in ROLES:
            rol, _ = Rol.objects.get_or_create(
                nombre=nombre, defaults={'descripcion': desc})
            roles[nombre] = rol
        self.stdout.write(f'  Roles: {len(roles)}')
        return roles

    def _crear_estados(self):
        estados = {}
        for nombre, desc, orden in ESTADOS:
            estado, _ = EstadoReclamo.objects.get_or_create(
                nombre=nombre, defaults={'descripcion': desc, 'orden': orden})
            estados[nombre] = estado
        self.stdout.write(f'  Estados: {len(estados)}')
        return estados

    def _crear_categorias(self):
        categorias = {}
        for nombre in CATEGORIAS:
            cat, _ = CategoriaReclamo.objects.get_or_create(
                nombre=nombre, defaults={'estado': True})
            categorias[nombre] = cat
        self.stdout.write(f'  Categorías: {len(categorias)}')
        return categorias

    def _crear_usuarios(self, roles):
        usuarios = {}
        for datos in USUARIOS:
            email = datos['email']
            usuario = Usuario.objects.filter(email=email).first()
            if usuario is None:
                usuario = Usuario(
                    email=email,
                    username=email,
                    rol=roles[datos['rol']],
                    nombres=datos['nombres'],
                    apellidos=datos['apellidos'],
                    ci=datos['ci'],
                    telefono=datos['telefono'],
                    direccion=datos['direccion'],
                    is_staff=datos.get('is_staff', False),
                    is_superuser=datos.get('is_superuser', False),
                )
                usuario.set_password(datos['password'])
                usuario.save()
            usuarios[datos['rol']] = usuario
        self.stdout.write(f'  Usuarios: {len(usuarios)}')
        return usuarios

    def _crear_reclamos(self, usuarios, categorias, estados):
        ciudadano = usuarios[Rol.CIUDADANO]
        encargado = usuarios[Rol.ENCARGADO]
        trabajador = usuarios[Rol.TRABAJADOR]

        if Reclamo.objects.exists():
            self.stdout.write('  Reclamos: ya existen, se omite la carga.')
            return

        creados = 0
        for (titulo, cat_nombre, direccion, lat, lng,
             prioridad, estado_final) in RECLAMOS:
            reclamo = Reclamo.objects.create(
                ciudadano=ciudadano,
                categoria=categorias[cat_nombre],
                estado_actual=estados[estado_final],
                titulo=titulo,
                descripcion=(
                    f'Reporte ciudadano: {titulo.lower()}. '
                    'Se solicita la pronta atención de las autoridades municipales.'
                ),
                direccion_texto=direccion,
                latitud=Decimal(lat),
                longitud=Decimal(lng),
                prioridad=prioridad,
            )

            # Construir historial de estados
            secuencia = SECUENCIA.get(estado_final, [estado_final])
            anterior = None
            for nombre_estado in secuencia:
                usuario_cambio = ciudadano if nombre_estado == EstadoReclamo.PENDIENTE \
                    else (trabajador if nombre_estado in (
                        EstadoReclamo.EN_ATENCION, EstadoReclamo.REPORTADO)
                        else encargado)
                HistorialEstadoReclamo.objects.create(
                    reclamo=reclamo,
                    estado_anterior=estados[anterior] if anterior else None,
                    estado_nuevo=estados[nombre_estado],
                    usuario=usuario_cambio,
                    observacion=f'Estado actualizado a "{nombre_estado}".',
                )
                anterior = nombre_estado

            # Crear asignación si corresponde
            asignacion = None
            if estado_final in (
                EstadoReclamo.ASIGNADO, EstadoReclamo.EN_ATENCION,
                EstadoReclamo.REPORTADO, EstadoReclamo.SOLUCIONADO,
            ):
                asignacion = AsignacionReclamo.objects.create(
                    reclamo=reclamo,
                    encargado=encargado,
                    trabajador=trabajador,
                    observacion='Asignación generada por datos de ejemplo.',
                    estado_asignacion=(
                        AsignacionReclamo.FINALIZADA
                        if estado_final == EstadoReclamo.SOLUCIONADO
                        else AsignacionReclamo.ACTIVA
                    ),
                )

            # Notificaciones de ejemplo coherentes con el estado final
            self._notificaciones_demo(
                reclamo, estado_final, asignacion,
                ciudadano, encargado, trabajador,
            )
            creados += 1

        # Notificación de supervisión para el administrador
        admin = usuarios[Rol.ADMINISTRADOR]
        Notificacion.objects.create(
            usuario=admin, tipo=Notificacion.USUARIO_NUEVO,
            titulo='Nuevo usuario registrado',
            mensaje='Se registró un nuevo ciudadano: María Gutiérrez.',
            url='/admin/ciudadanos',
        )

        self.stdout.write(f'  Reclamos: {creados}')

    def _notificaciones_demo(self, reclamo, estado_final, asignacion,
                             ciudadano, encargado, trabajador):
        """Genera la notificación que el flujo real habría producido para el
        estado actual de un reclamo de ejemplo."""
        url_ciudadano = f'/ciudadano/reclamos/{reclamo.id}'
        url_encargado = f'/encargado/reclamos/{reclamo.id}'
        titulo = reclamo.titulo
        n = f'#{reclamo.id}'

        if estado_final == EstadoReclamo.PENDIENTE:
            Notificacion.objects.create(
                usuario=encargado, tipo=Notificacion.RECLAMO_NUEVO,
                titulo='Nuevo reclamo pendiente',
                mensaje=f'Reclamo {n} "{titulo}" espera revisión.',
                reclamo=reclamo, url=url_encargado,
            )
        elif estado_final == EstadoReclamo.ACEPTADO:
            Notificacion.objects.create(
                usuario=ciudadano, tipo=Notificacion.RECLAMO_ACEPTADO,
                titulo='Tu reclamo fue aceptado',
                mensaje=f'El reclamo {n} "{titulo}" fue aceptado y será atendido.',
                reclamo=reclamo, url=url_ciudadano,
            )
        elif estado_final == EstadoReclamo.RECHAZADO:
            Notificacion.objects.create(
                usuario=ciudadano, tipo=Notificacion.RECLAMO_RECHAZADO,
                titulo='Tu reclamo fue rechazado',
                mensaje=f'El reclamo {n} "{titulo}" fue rechazado.',
                reclamo=reclamo, url=url_ciudadano,
            )
        elif estado_final == EstadoReclamo.ASIGNADO:
            if asignacion is not None:
                Notificacion.objects.create(
                    usuario=trabajador, tipo=Notificacion.ASIGNACION_NUEVA,
                    titulo='Se te asignó un reclamo',
                    mensaje=f'Tienes una nueva asignación: reclamo {n} "{titulo}".',
                    reclamo=reclamo,
                    url=f'/trabajador/asignaciones/{asignacion.id}',
                )
            Notificacion.objects.create(
                usuario=ciudadano, tipo=Notificacion.RECLAMO_ASIGNADO,
                titulo='Asignamos un trabajador a tu reclamo',
                mensaje=f'El reclamo {n} "{titulo}" fue asignado a un trabajador.',
                reclamo=reclamo, url=url_ciudadano,
            )
        elif estado_final == EstadoReclamo.EN_ATENCION:
            Notificacion.objects.create(
                usuario=ciudadano, tipo=Notificacion.RECLAMO_EN_ATENCION,
                titulo='Tu reclamo está siendo atendido',
                mensaje=f'Un trabajador comenzó a atender el reclamo {n} "{titulo}".',
                reclamo=reclamo, url=url_ciudadano,
            )
        elif estado_final == EstadoReclamo.REPORTADO:
            Notificacion.objects.create(
                usuario=encargado, tipo=Notificacion.REPORTE_ENVIADO,
                titulo='Reporte listo para revisar',
                mensaje=f'El reclamo {n} "{titulo}" tiene un reporte; revísalo y ciérralo.',
                reclamo=reclamo, url=url_encargado,
            )
        elif estado_final == EstadoReclamo.SOLUCIONADO:
            Notificacion.objects.create(
                usuario=ciudadano, tipo=Notificacion.RECLAMO_SOLUCIONADO,
                titulo='Tu reclamo fue solucionado',
                mensaje=f'El reclamo {n} "{titulo}" se marcó como Solucionado.',
                reclamo=reclamo, url=url_ciudadano,
            )
