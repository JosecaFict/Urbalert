"""Genera datos históricos de gestión para Urbalert.

Crea usuarios adicionales (1 encargado, 5 trabajadores, 15 ciudadanos) y 170
reclamos distribuidos en 10 por mes: todo 2025 (12 meses) y 2026 hasta mayo
(5 meses). Cada reclamo recorre su flujo real con una fecha coherente en cada
paso del historial (creado, aceptado, asignado, en atención, reportado, cerrado).

Uso:
    python manage.py seed_historico [--force]
"""
import random
from datetime import datetime, timedelta
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.asignaciones.models import AsignacionReclamo
from apps.reclamos.models import (
    CategoriaReclamo, EstadoReclamo, HistorialEstadoReclamo, Reclamo,
)
from apps.reportes.models import ReporteTrabajador
from apps.usuarios.models import Rol, Usuario

E = EstadoReclamo

# --- Usuarios nuevos -------------------------------------------------------- #
ENCARGADOS_NUEVOS = [
    ('encargado2@urbalert.com', 'Roberto', 'Áñez Suárez'),
]
TRABAJADORES_NUEVOS = [
    ('trabajador2@urbalert.com', 'Luis', 'Camacho Terceros'),
    ('trabajador3@urbalert.com', 'Pedro', 'Justiniano Roca'),
    ('trabajador4@urbalert.com', 'Miguel', 'Suárez Áñez'),
    ('trabajador5@urbalert.com', 'Jorge', 'Vaca Pinto'),
    ('trabajador6@urbalert.com', 'Daniel', 'Rocha Méndez'),
]
CIUDADANOS_NUEVOS = [
    ('ciudadano2@urbalert.com', 'Lucía', 'Fernández Áñez'),
    ('ciudadano3@urbalert.com', 'Andrés', 'Mercado Roca'),
    ('ciudadano4@urbalert.com', 'Valeria', 'Suárez Ortiz'),
    ('ciudadano5@urbalert.com', 'Diego', 'Paz Cuéllar'),
    ('ciudadano6@urbalert.com', 'Camila', 'Rivero Justiniano'),
    ('ciudadano7@urbalert.com', 'Sergio', 'Áñez Vaca'),
    ('ciudadano8@urbalert.com', 'Daniela', 'Montaño Salvatierra'),
    ('ciudadano9@urbalert.com', 'Fernando', 'Ortiz Banegas'),
    ('ciudadano10@urbalert.com', 'Gabriela', 'Roca Méndez'),
    ('ciudadano11@urbalert.com', 'Mauricio', 'Céspedes Áñez'),
    ('ciudadano12@urbalert.com', 'Paola', 'Vargas Terceros'),
    ('ciudadano13@urbalert.com', 'Ricardo', 'Cuéllar Roca'),
    ('ciudadano14@urbalert.com', 'Mariana', 'Banegas Soliz'),
    ('ciudadano15@urbalert.com', 'Óscar', 'Salvatierra Áñez'),
    ('ciudadano16@urbalert.com', 'Natalia', 'Justiniano Vaca'),
]

# --- Contenido de reclamos -------------------------------------------------- #
TITULOS = {
    'Baches y daños en calles': [
        'Bache profundo en la vía', 'Calle deteriorada con huecos',
        'Pavimento hundido', 'Grietas peligrosas en la calzada',
    ],
    'Alumbrado público': [
        'Luminaria quemada', 'Poste de luz apagado',
        'Foco intermitente en la esquina', 'Tramo sin iluminación',
    ],
    'Cables eléctricos expuestos': [
        'Cable eléctrico colgando', 'Cables sueltos en el poste',
        'Cableado expuesto en la acera',
    ],
    'Basura acumulada': [
        'Basura acumulada en la esquina', 'Contenedor desbordado',
        'Escombros en la vía pública', 'Acumulación de residuos',
    ],
    'Alcantarillado y drenaje': [
        'Alcantarilla tapada', 'Drenaje obstruido',
        'Tapa de alcantarilla rota', 'Mal olor por drenaje',
    ],
    'Inundaciones': [
        'Inundación tras la lluvia', 'Acumulación de agua en la calle',
        'Calle anegada',
    ],
    'Árboles y áreas verdes': [
        'Árbol caído', 'Rama a punto de caer',
        'Maleza sin mantenimiento', 'Árbol invade la acera',
    ],
    'Fugas de agua': [
        'Fuga de agua en la vía', 'Cañería rota',
        'Pérdida de agua potable',
    ],
    'Plazas y parques': [
        'Juego infantil dañado', 'Banca rota en la plaza',
        'Parque sin mantenimiento',
    ],
}
ZONAS = [
    'Av. Banzer, 4to anillo', 'Barrio Equipetrol', 'Plan 3000',
    'Av. Santos Dumont, 5to anillo', 'Villa 1ro de Mayo', 'Av. Alemana',
    'Barrio Las Palmas', 'Av. Cristo Redentor', 'Zona del Urubó',
    'Av. Roca y Coronado', 'Barrio Hamacas', 'Av. Mutualista',
    'Av. Piraí', 'Barrio Sirari', 'Av. Grigotá', 'Doble Vía La Guardia',
]
PRIORIDADES = [Reclamo.PRIORIDAD_BAJA] * 2 + [Reclamo.PRIORIDAD_MEDIA] * 5 + [Reclamo.PRIORIDAD_ALTA] * 3

# Distribución de estados finales por tipo de mes (10 reclamos por mes)
DIST_CERRADO = (
    [E.SOLUCIONADO] * 8 + [E.NO_SOLUCIONADO] * 1 + [E.RECHAZADO] * 1
)
DIST_RECIENTE = (
    [E.SOLUCIONADO] * 3 + [E.NO_SOLUCIONADO] * 1 + [E.RECHAZADO] * 1 +
    [E.REPORTADO] * 1 + [E.EN_ATENCION] * 2 + [E.ASIGNADO] * 1 + [E.PENDIENTE] * 1
)

# Meses a generar: (año, mes). Los 2 últimos usan distribución "reciente".
MESES = [(2025, m) for m in range(1, 13)] + [(2026, m) for m in range(1, 6)]
MESES_RECIENTES = {(2026, 4), (2026, 5)}


def _aware(dt):
    return timezone.make_aware(dt) if settings.USE_TZ else dt


class Command(BaseCommand):
    help = 'Genera usuarios y 170 reclamos históricos (2025 y 2026 hasta mayo).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force', action='store_true',
            help='Genera aunque ya existan reclamos de 2025 (puede duplicar).',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        random.seed(2026)

        if Reclamo.objects.filter(fecha_registro__year=2025).exists() and not options['force']:
            self.stdout.write(self.style.WARNING(
                'Ya existen reclamos de 2025. Usá --force para generar de todos modos.'
            ))
            return

        roles = {r.nombre: r for r in Rol.objects.all()}
        self._crear_usuarios(roles)

        categorias = list(CategoriaReclamo.objects.all())
        estados = {e.nombre: e for e in EstadoReclamo.objects.all()}
        ciudadanos = list(Usuario.objects.filter(rol__nombre=Rol.CIUDADANO))
        trabajadores = list(Usuario.objects.filter(rol__nombre=Rol.TRABAJADOR))
        encargados = list(Usuario.objects.filter(rol__nombre=Rol.ENCARGADO))

        total = 0
        for (anio, mes) in MESES:
            dist = list(DIST_RECIENTE if (anio, mes) in MESES_RECIENTES else DIST_CERRADO)
            random.shuffle(dist)
            for final in dist:
                self._crear_reclamo(
                    anio, mes, final, categorias, estados,
                    random.choice(ciudadanos), trabajadores, encargados,
                )
                total += 1
            self.stdout.write(f'  {anio}-{mes:02d}: 10 reclamos')

        self.stdout.write(self.style.SUCCESS(
            f'\n[OK] {total} reclamos históricos creados. '
            f'Ciudadanos: {len(ciudadanos)}, Trabajadores: {len(trabajadores)}, '
            f'Encargados: {len(encargados)}.'
        ))

    # ----------------------------------------------------------------- #
    def _crear_usuarios(self, roles):
        bloques = [
            (ENCARGADOS_NUEVOS, Rol.ENCARGADO, 'Encargado123'),
            (TRABAJADORES_NUEVOS, Rol.TRABAJADOR, 'Trabajador123'),
            (CIUDADANOS_NUEVOS, Rol.CIUDADANO, 'Ciudadano123'),
        ]
        creados = 0
        for lista, rol_nombre, password in bloques:
            for email, nombres, apellidos in lista:
                if Usuario.objects.filter(email=email).exists():
                    continue
                u = Usuario(
                    email=email, username=email, rol=roles[rol_nombre],
                    nombres=nombres, apellidos=apellidos,
                    ci=str(random.randint(5000000, 9999999)),
                    telefono=f'7{random.randint(1000000, 9999999)}',
                    direccion=random.choice(ZONAS) + ', Santa Cruz de la Sierra',
                )
                u.set_password(password)
                u.save()
                creados += 1
        self.stdout.write(f'  Usuarios nuevos creados: {creados}')

    def _crear_reclamo(self, anio, mes, final, categorias, estados, ciudadano,
                       trabajadores, encargados):
        categoria = random.choice(categorias)
        titulo = random.choice(TITULOS.get(categoria.nombre, ['Reclamo urbano']))
        encargado = random.choice(encargados)
        trabajador = random.choice(trabajadores)

        # Fecha de registro: día aleatorio del mes
        dia = random.randint(1, 28)
        t0 = _aware(datetime(anio, mes, dia, random.randint(7, 20), random.randint(0, 59)))

        lat = Decimal(str(round(-17.78 + random.uniform(-0.06, 0.06), 7)))
        lng = Decimal(str(round(-63.18 + random.uniform(-0.06, 0.06), 7)))

        reclamo = Reclamo.objects.create(
            ciudadano=ciudadano, categoria=categoria,
            estado_actual=estados[E.PENDIENTE], titulo=titulo,
            descripcion=f'{titulo} reportado por el ciudadano en {random.choice(ZONAS)}.',
            direccion_texto=random.choice(ZONAS) + ', Santa Cruz de la Sierra',
            latitud=lat, longitud=lng, prioridad=random.choice(PRIORIDADES),
        )

        # Construir la cadena de transiciones con sus fechas
        pasos = self._construir_pasos(final, ciudadano, encargado, trabajador)
        fecha = t0
        anterior = None
        ultima_asignacion = None
        for i, (estado_nombre, actor, obs) in enumerate(pasos):
            if i > 0:
                fecha = fecha + timedelta(days=random.randint(1, 4), hours=random.randint(1, 10))
            h = HistorialEstadoReclamo.objects.create(
                reclamo=reclamo, estado_anterior=anterior,
                estado_nuevo=estados[estado_nombre], usuario=actor, observacion=obs,
            )
            HistorialEstadoReclamo.objects.filter(pk=h.pk).update(fecha_cambio=fecha)
            anterior = estados[estado_nombre]

            if estado_nombre == E.ASIGNADO:
                a = AsignacionReclamo.objects.create(
                    reclamo=reclamo, encargado=encargado, trabajador=trabajador,
                    observacion='Asignación para atención.',
                    estado_asignacion=AsignacionReclamo.ACTIVA,
                )
                AsignacionReclamo.objects.filter(pk=a.pk).update(fecha_asignacion=fecha)
                ultima_asignacion = a
            elif estado_nombre == E.REPORTADO:
                resultado = (
                    ReporteTrabajador.NO_SOLUCIONADO if final == E.NO_SOLUCIONADO
                    else ReporteTrabajador.SOLUCIONADO
                )
                r = ReporteTrabajador.objects.create(
                    reclamo=reclamo, trabajador=trabajador,
                    descripcion_trabajo='Trabajo de atención realizado en el sitio.',
                    resultado=resultado, latitud_atencion=lat, longitud_atencion=lng,
                )
                ReporteTrabajador.objects.filter(pk=r.pk).update(fecha_reporte=fecha)

        # Si quedó cerrado, la asignación se marca finalizada
        if final in (E.SOLUCIONADO, E.NO_SOLUCIONADO) and ultima_asignacion:
            AsignacionReclamo.objects.filter(pk=ultima_asignacion.pk).update(
                estado_asignacion=AsignacionReclamo.FINALIZADA
            )

        # Estado final + fechas del reclamo
        Reclamo.objects.filter(pk=reclamo.pk).update(
            estado_actual=estados[final], fecha_registro=t0, fecha_actualizacion=fecha,
        )

    def _construir_pasos(self, final, ciudadano, encargado, trabajador):
        """Devuelve [(estado, actor, observacion), ...] según el estado final."""
        creado = (E.PENDIENTE, ciudadano, 'Reclamo creado por el ciudadano.')
        if final == E.PENDIENTE:
            return [creado]
        if final == E.RECHAZADO:
            return [creado, (E.RECHAZADO, encargado, 'Reclamo rechazado: no corresponde al municipio.')]

        pasos = [
            creado,
            (E.ACEPTADO, encargado, 'Reclamo aceptado para atención.'),
            (E.ASIGNADO, encargado, 'Asignado a un trabajador.'),
            (E.EN_ATENCION, trabajador, 'El trabajador inició la atención.'),
            (E.REPORTADO, trabajador, 'El trabajador envió el reporte.'),
        ]
        orden = [E.ACEPTADO, E.ASIGNADO, E.EN_ATENCION, E.REPORTADO]
        if final in orden:
            corte = orden.index(final) + 2  # +1 por "creado", +1 inclusivo
            return pasos[:corte]
        # Solucionado / No solucionado: flujo completo + cierre del encargado
        cierre = (final, encargado,
                  'Cerrado como solucionado.' if final == E.SOLUCIONADO
                  else 'Cerrado como no solucionado.')
        return pasos + [cierre]
