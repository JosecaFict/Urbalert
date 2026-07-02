"""Vistas de reclamos y categorías."""
import logging
import traceback

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)

from apps.bitacora.utils import registrar_bitacora
from apps.notificaciones.models import Notificacion
from apps.notificaciones.utils import notificar, notificar_rol
from apps.usuarios.models import Rol
from apps.usuarios.permissions import (
    IsAdministradorOrReadOnly,
    IsEncargado,
    IsPersonalInterno,
)

from .models import CategoriaReclamo, EstadoReclamo, Reclamo
from .serializers import (
    CategoriaReclamoSerializer,
    HistorialEstadoReclamoSerializer,
    ReclamoCreateSerializer,
    ReclamoDetailSerializer,
    ReclamoListSerializer,
)
from .services import cambiar_estado


class CategoriaReclamoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaReclamo.objects.all()
    serializer_class = CategoriaReclamoSerializer
    permission_classes = [IsAdministradorOrReadOnly]

    def perform_create(self, serializer):
        categoria = serializer.save()
        registrar_bitacora(
            self.request.user, 'Creación de categoría', 'Categorías',
            f'Se creó la categoría "{categoria.nombre}".', self.request,
        )

    def perform_update(self, serializer):
        categoria = serializer.save()
        registrar_bitacora(
            self.request.user, 'Edición de categoría', 'Categorías',
            f'Se editó la categoría "{categoria.nombre}".', self.request,
        )


class ReclamoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ReclamoCreateSerializer
        if self.action in ('list', 'mis_reclamos', 'pendientes'):
            return ReclamoListSerializer
        return ReclamoDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Reclamo.objects.select_related(
            'categoria', 'estado_actual', 'ciudadano'
        ).all()

        # Filtrado por rol
        if user.is_superuser or user.es_rol(Rol.ADMINISTRADOR):
            pass  # ve todo
        elif user.es_rol(Rol.CIUDADANO):
            qs = qs.filter(ciudadano=user)
        elif user.es_rol(Rol.TRABAJADOR):
            qs = qs.filter(asignaciones__trabajador=user).distinct()
        # encargado ve todo (gestiona el flujo)

        # Filtros opcionales por query params
        params = self.request.query_params
        estado = params.get('estado')
        if estado:
            qs = qs.filter(estado_actual__nombre=estado)
        categoria = params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)
        return qs

    # --- Creación de reclamo (ciudadano) --- #
    def create(self, request, *args, **kwargs):
        if not (request.user.es_rol(Rol.CIUDADANO) or request.user.is_superuser):
            raise PermissionDenied('Sólo los ciudadanos pueden crear reclamos.')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        estado_pendiente = EstadoReclamo.objects.get(
            nombre=EstadoReclamo.PENDIENTE
        )
        try:
            reclamo = serializer.save(
                ciudadano=request.user, estado_actual=estado_pendiente
            )
        except Exception as exc:
            logger.error(
                'FALLO_CREACION_RECLAMO tipo=%s mensaje=%s',
                type(exc).__name__, str(exc),
            )
            logger.error('TRACEBACK_COMPLETO:\n%s', traceback.format_exc())
            raise
        # Registrar historial inicial
        from .models import HistorialEstadoReclamo
        HistorialEstadoReclamo.objects.create(
            reclamo=reclamo, estado_anterior=None, estado_nuevo=estado_pendiente,
            usuario=request.user, observacion='Reclamo creado por el ciudadano.',
        )
        registrar_bitacora(
            request.user, 'Creación de reclamo', 'Reclamos',
            f'Se creó el reclamo "{reclamo.titulo}" (#{reclamo.id}).', request,
        )
        # Notificar a los encargados: hay un reclamo nuevo por revisar
        notificar_rol(
            Rol.ENCARGADO, Notificacion.RECLAMO_NUEVO,
            'Nuevo reclamo pendiente',
            f'Reclamo #{reclamo.id} "{reclamo.titulo}" espera revisión.',
            reclamo=reclamo, url=f'/encargado/reclamos/{reclamo.id}',
        )
        salida = ReclamoDetailSerializer(reclamo, context={'request': request})
        return Response(salida.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='mis-reclamos')
    def mis_reclamos(self, request):
        qs = Reclamo.objects.select_related(
            'categoria', 'estado_actual', 'ciudadano'
        ).filter(ciudadano=request.user)
        serializer = ReclamoListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        qs = Reclamo.objects.select_related(
            'categoria', 'estado_actual', 'ciudadano'
        ).filter(estado_actual__nombre=EstadoReclamo.PENDIENTE)
        serializer = ReclamoListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        reclamo = self.get_object()
        serializer = HistorialEstadoReclamoSerializer(
            reclamo.historial.all(), many=True
        )
        return Response(serializer.data)

    # --- Acciones del encargado --- #
    @action(detail=True, methods=['patch'], permission_classes=[IsEncargado])
    def aceptar(self, request, pk=None):
        reclamo = self.get_object()
        if reclamo.estado_actual.nombre != EstadoReclamo.PENDIENTE:
            raise ValidationError('Sólo se pueden aceptar reclamos pendientes.')
        observacion = request.data.get('observacion', 'Reclamo aceptado.')
        cambiar_estado(reclamo, EstadoReclamo.ACEPTADO, request.user, observacion)
        registrar_bitacora(
            request.user, 'Aceptación de reclamo', 'Reclamos',
            f'Se aceptó el reclamo #{reclamo.id}.', request,
        )
        # Notificar al ciudadano dueño del reclamo
        notificar(
            reclamo.ciudadano, Notificacion.RECLAMO_ACEPTADO,
            'Tu reclamo fue aceptado',
            f'El reclamo #{reclamo.id} "{reclamo.titulo}" fue aceptado y será atendido.',
            reclamo=reclamo, url=f'/ciudadano/reclamos/{reclamo.id}',
        )
        return Response(ReclamoDetailSerializer(reclamo).data)

    @action(detail=True, methods=['patch'], permission_classes=[IsEncargado])
    def rechazar(self, request, pk=None):
        reclamo = self.get_object()
        if reclamo.estado_actual.nombre != EstadoReclamo.PENDIENTE:
            raise ValidationError('Sólo se pueden rechazar reclamos pendientes.')
        motivo = request.data.get('observacion', '').strip()
        if not motivo:
            raise ValidationError(
                {'observacion': 'Debe indicar el motivo del rechazo.'}
            )
        cambiar_estado(reclamo, EstadoReclamo.RECHAZADO, request.user, motivo)
        registrar_bitacora(
            request.user, 'Rechazo de reclamo', 'Reclamos',
            f'Se rechazó el reclamo #{reclamo.id}. Motivo: {motivo}', request,
        )
        # Notificar al ciudadano dueño del reclamo, con el motivo
        notificar(
            reclamo.ciudadano, Notificacion.RECLAMO_RECHAZADO,
            'Tu reclamo fue rechazado',
            f'El reclamo #{reclamo.id} "{reclamo.titulo}" fue rechazado. Motivo: {motivo}',
            reclamo=reclamo, url=f'/ciudadano/reclamos/{reclamo.id}',
        )
        return Response(ReclamoDetailSerializer(reclamo).data)

    @action(detail=True, methods=['patch'], url_path='cambiar-estado',
            permission_classes=[IsPersonalInterno])
    def cambiar_estado_action(self, request, pk=None):
        reclamo = self.get_object()
        nuevo = request.data.get('estado')
        observacion = request.data.get('observacion', '')
        if not nuevo:
            raise ValidationError({'estado': 'Debe indicar el nuevo estado.'})
        if not EstadoReclamo.objects.filter(nombre=nuevo).exists():
            raise ValidationError({'estado': 'Estado inválido.'})
        # El trabajador sólo puede iniciar la atención; cerrar el reclamo
        # (Solucionado/No solucionado) es responsabilidad del encargado.
        if request.user.es_rol(Rol.TRABAJADOR) and not request.user.is_superuser:
            if nuevo != EstadoReclamo.EN_ATENCION:
                raise PermissionDenied(
                    'El trabajador sólo puede marcar el reclamo como "En atención".'
                )
        cambiar_estado(reclamo, nuevo, request.user, observacion)
        registrar_bitacora(
            request.user, 'Cambio de estado', 'Reclamos',
            f'Reclamo #{reclamo.id} cambió a "{nuevo}".', request,
        )
        self._notificar_cambio_estado(reclamo, nuevo)
        return Response(ReclamoDetailSerializer(reclamo).data)

    def _notificar_cambio_estado(self, reclamo, nuevo):
        """Genera las notificaciones según el estado al que cambió el reclamo."""
        url_ciudadano = f'/ciudadano/reclamos/{reclamo.id}'
        if nuevo == EstadoReclamo.EN_ATENCION:
            notificar(
                reclamo.ciudadano, Notificacion.RECLAMO_EN_ATENCION,
                'Tu reclamo está siendo atendido',
                f'Un trabajador comenzó a atender el reclamo #{reclamo.id} "{reclamo.titulo}".',
                reclamo=reclamo, url=url_ciudadano,
            )
        elif nuevo == EstadoReclamo.SOLUCIONADO:
            notificar(
                reclamo.ciudadano, Notificacion.RECLAMO_SOLUCIONADO,
                'Tu reclamo fue solucionado',
                f'El reclamo #{reclamo.id} "{reclamo.titulo}" se marcó como Solucionado.',
                reclamo=reclamo, url=url_ciudadano,
            )
        elif nuevo == EstadoReclamo.NO_SOLUCIONADO:
            notificar(
                reclamo.ciudadano, Notificacion.RECLAMO_NO_SOLUCIONADO,
                'Tu reclamo no pudo solucionarse',
                f'El reclamo #{reclamo.id} "{reclamo.titulo}" se marcó como No solucionado.',
                reclamo=reclamo, url=url_ciudadano,
            )
            # Supervisión: avisar a los administradores de un cierre fallido
            notificar_rol(
                Rol.ADMINISTRADOR, Notificacion.RECLAMO_NO_SOLUCIONADO,
                'Reclamo cerrado como No solucionado',
                f'El reclamo #{reclamo.id} "{reclamo.titulo}" se cerró como No solucionado.',
                reclamo=reclamo, url='/admin/reclamos',
            )
