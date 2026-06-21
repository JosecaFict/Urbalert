"""Vistas de asignaciones de reclamos."""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.bitacora.utils import registrar_bitacora
from apps.notificaciones.models import Notificacion
from apps.notificaciones.utils import notificar
from apps.reclamos.models import EstadoReclamo
from apps.reclamos.services import cambiar_estado
from apps.usuarios.models import Rol
from apps.usuarios.permissions import IsEncargado

from .models import AsignacionReclamo
from .serializers import AsignacionCreateSerializer, AsignacionSerializer


class AsignacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return AsignacionCreateSerializer
        return AsignacionSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsEncargado()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        qs = AsignacionReclamo.objects.select_related(
            'reclamo', 'reclamo__categoria', 'reclamo__estado_actual',
            'trabajador', 'encargado',
        ).all()
        if user.is_superuser or user.es_rol(Rol.ADMINISTRADOR) or user.es_rol(Rol.ENCARGADO):
            return qs
        if user.es_rol(Rol.TRABAJADOR):
            return qs.filter(trabajador=user)
        return qs.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reclamo = serializer.validated_data['reclamo']
        trabajador = serializer.validated_data['trabajador']

        if not trabajador.es_rol(Rol.TRABAJADOR):
            raise ValidationError(
                {'trabajador': 'El usuario seleccionado no es un trabajador.'}
            )
        if reclamo.estado_actual.nombre not in (
            EstadoReclamo.ACEPTADO, EstadoReclamo.ASIGNADO
        ):
            raise ValidationError(
                {'reclamo': 'Sólo se pueden asignar reclamos aceptados.'}
            )

        asignacion = serializer.save(encargado=request.user)
        cambiar_estado(
            reclamo, EstadoReclamo.ASIGNADO, request.user,
            f'Asignado a {trabajador.nombre_completo or trabajador.email}.',
        )
        registrar_bitacora(
            request.user, 'Asignación de trabajador', 'Asignaciones',
            f'Reclamo #{reclamo.id} asignado a {trabajador.email}.', request,
        )
        # Notificar al trabajador su nueva asignación...
        notificar(
            trabajador, Notificacion.ASIGNACION_NUEVA,
            'Se te asignó un reclamo',
            f'Tienes una nueva asignación: reclamo #{reclamo.id} "{reclamo.titulo}".',
            reclamo=reclamo, url=f'/trabajador/asignaciones/{asignacion.id}',
        )
        # ...y al ciudadano que su reclamo ya tiene un trabajador asignado
        notificar(
            reclamo.ciudadano, Notificacion.RECLAMO_ASIGNADO,
            'Asignamos un trabajador a tu reclamo',
            f'El reclamo #{reclamo.id} "{reclamo.titulo}" fue asignado a un trabajador.',
            reclamo=reclamo, url=f'/ciudadano/reclamos/{reclamo.id}',
        )
        salida = AsignacionSerializer(asignacion)
        return Response(salida.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='mis-asignaciones')
    def mis_asignaciones(self, request):
        qs = self.get_queryset().filter(trabajador=request.user)
        serializer = AsignacionSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def finalizar(self, request, pk=None):
        asignacion = self.get_object()
        asignacion.estado_asignacion = AsignacionReclamo.FINALIZADA
        asignacion.save(update_fields=['estado_asignacion'])
        registrar_bitacora(
            request.user, 'Finalización de asignación', 'Asignaciones',
            f'Asignación #{asignacion.id} finalizada.', request,
        )
        return Response(AsignacionSerializer(asignacion).data)
