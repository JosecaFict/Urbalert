"""Vistas del dashboard: estadísticas y resúmenes."""
from datetime import timedelta

from django.db.models import Count, Max
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.asignaciones.models import AsignacionReclamo
from apps.bitacora.models import Bitacora
from apps.bitacora.serializers import BitacoraSerializer
from apps.reclamos.models import EstadoReclamo, HistorialEstadoReclamo, Reclamo
from apps.reclamos.serializers import ReclamoListSerializer
from apps.reportes.models import ReporteTrabajador
from apps.usuarios.models import Rol, Usuario

# Días sin atención a partir de los cuales un reclamo pendiente se considera "antiguo".
DIAS_PENDIENTE_UMBRAL = 7


def _metricas_supervision(qs):
    """Calcula tiempo promedio de resolución y pendientes antiguos."""
    # Tiempo promedio (en días) de Pendiente -> Solucionado
    solucionados = qs.filter(estado_actual__nombre=EstadoReclamo.SOLUCIONADO)
    fechas_registro = {r.id: r.fecha_registro for r in solucionados}
    fechas_solucion = (
        HistorialEstadoReclamo.objects
        .filter(
            estado_nuevo__nombre=EstadoReclamo.SOLUCIONADO,
            reclamo_id__in=fechas_registro.keys(),
        )
        .values('reclamo_id')
        .annotate(ultima=Max('fecha_cambio'))
    )
    dias = []
    for fila in fechas_solucion:
        registro = fechas_registro.get(fila['reclamo_id'])
        if registro and fila['ultima']:
            dias.append((fila['ultima'] - registro).total_seconds() / 86400)
    tiempo_promedio = round(sum(dias) / len(dias), 1) if dias else None

    # Reclamos pendientes con más de N días sin atención
    limite = timezone.now() - timedelta(days=DIAS_PENDIENTE_UMBRAL)
    pendientes_antiguos = qs.filter(
        estado_actual__nombre=EstadoReclamo.PENDIENTE,
        fecha_registro__lt=limite,
    ).count()

    return {
        'tiempo_promedio_dias': tiempo_promedio,
        'pendientes_antiguos': pendientes_antiguos,
        'dias_pendiente_umbral': DIAS_PENDIENTE_UMBRAL,
    }


MESES_ES = [
    '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]


def _reclamos_para(user):
    """Devuelve el queryset de reclamos visible según el rol."""
    qs = Reclamo.objects.all()
    if user.is_superuser or user.es_rol(Rol.ADMINISTRADOR) or user.es_rol(Rol.ENCARGADO):
        return qs
    if user.es_rol(Rol.CIUDADANO):
        return qs.filter(ciudadano=user)
    if user.es_rol(Rol.TRABAJADOR):
        return qs.filter(asignaciones__trabajador=user).distinct()
    return qs.none()


def _conteo_por_estado(qs):
    base = {e: 0 for e in [
        EstadoReclamo.PENDIENTE, EstadoReclamo.ACEPTADO, EstadoReclamo.RECHAZADO,
        EstadoReclamo.ASIGNADO, EstadoReclamo.EN_ATENCION, EstadoReclamo.REPORTADO,
        EstadoReclamo.SOLUCIONADO, EstadoReclamo.NO_SOLUCIONADO,
    ]}
    for fila in qs.values('estado_actual__nombre').annotate(total=Count('id')):
        nombre = fila['estado_actual__nombre']
        if nombre in base:
            base[nombre] = fila['total']
    return base


class ResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _reclamos_para(request.user)
        estados = _conteo_por_estado(qs)
        data = {
            'total_reclamos': qs.count(),
            'pendientes': estados[EstadoReclamo.PENDIENTE],
            'aceptados': estados[EstadoReclamo.ACEPTADO],
            'rechazados': estados[EstadoReclamo.RECHAZADO],
            'asignados': estados[EstadoReclamo.ASIGNADO],
            'en_atencion': estados[EstadoReclamo.EN_ATENCION],
            'reportados': estados[EstadoReclamo.REPORTADO],
            'solucionados': estados[EstadoReclamo.SOLUCIONADO],
            'no_solucionados': estados[EstadoReclamo.NO_SOLUCIONADO],
        }

        # Estadísticas globales sólo para administrador / encargado
        if request.user.is_superuser or request.user.es_rol(Rol.ADMINISTRADOR) \
                or request.user.es_rol(Rol.ENCARGADO):
            data.update({
                'total_ciudadanos': Usuario.objects.filter(
                    rol__nombre=Rol.CIUDADANO).count(),
                'total_trabajadores': Usuario.objects.filter(
                    rol__nombre=Rol.TRABAJADOR).count(),
                'total_encargados': Usuario.objects.filter(
                    rol__nombre=Rol.ENCARGADO).count(),
                'total_asignaciones': AsignacionReclamo.objects.count(),
                'reportes_pendientes': qs.filter(
                    estado_actual__nombre=EstadoReclamo.REPORTADO).count(),
                'total_reportes': ReporteTrabajador.objects.count(),
            })
            data.update(_metricas_supervision(qs))
        return Response(data)


class ReclamosUbicacionesView(APIView):
    """Coordenadas de los reclamos visibles, para mostrarlos en un mapa."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _reclamos_para(request.user).select_related('estado_actual')
        data = [
            {
                'id': r.id,
                'titulo': r.titulo,
                'estado': r.estado_actual.nombre,
                'prioridad': r.prioridad,
                'lat': float(r.latitud),
                'lng': float(r.longitud),
            }
            for r in qs
        ]
        return Response(data)


class ReclamosPorEstadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _reclamos_para(request.user)
        estados = _conteo_por_estado(qs)
        data = [{'estado': nombre, 'total': total}
                for nombre, total in estados.items()]
        return Response(data)


class ReclamosPorCategoriaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _reclamos_para(request.user)
        filas = qs.values('categoria__nombre').annotate(
            total=Count('id')).order_by('-total')
        data = [{'categoria': f['categoria__nombre'], 'total': f['total']}
                for f in filas]
        return Response(data)


class ReclamosPorMesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _reclamos_para(request.user)
        filas = (
            qs.annotate(mes=TruncMonth('fecha_registro'))
            .values('mes')
            .annotate(total=Count('id'))
            .order_by('mes')
        )
        data = []
        for f in filas:
            mes = f['mes']
            etiqueta = f'{MESES_ES[mes.month]} {mes.year}' if mes else 'N/D'
            data.append({'mes': etiqueta, 'total': f['total']})
        return Response(data)


class ActividadRecienteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _reclamos_para(request.user).select_related(
            'categoria', 'estado_actual', 'ciudadano'
        )[:8]
        ultimos_reclamos = ReclamoListSerializer(
            qs, many=True, context={'request': request}
        ).data

        actividad = []
        if request.user.is_superuser or request.user.es_rol(Rol.ADMINISTRADOR):
            actividad = BitacoraSerializer(
                Bitacora.objects.select_related('usuario', 'usuario__rol')[:10],
                many=True,
            ).data

        return Response({
            'ultimos_reclamos': ultimos_reclamos,
            'actividad': actividad,
        })
