"""Vistas de reportes de trabajador."""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.bitacora.utils import registrar_bitacora
from apps.notificaciones.models import Notificacion
from apps.notificaciones.utils import notificar_rol
from apps.reclamos.models import EstadoReclamo
from apps.reclamos.services import cambiar_estado
from apps.usuarios.models import Rol

from .models import ReporteTrabajador
from .serializers import ReporteCreateSerializer, ReporteSerializer


class ReporteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ReporteCreateSerializer
        return ReporteSerializer

    def get_queryset(self):
        user = self.request.user
        qs = ReporteTrabajador.objects.select_related(
            'reclamo', 'trabajador'
        ).all()
        if user.is_superuser or user.es_rol(Rol.ADMINISTRADOR) or user.es_rol(Rol.ENCARGADO):
            return qs
        if user.es_rol(Rol.TRABAJADOR):
            return qs.filter(trabajador=user)
        if user.es_rol(Rol.CIUDADANO):
            return qs.filter(reclamo__ciudadano=user)
        return qs.none()

    def create(self, request, *args, **kwargs):
        if not (request.user.es_rol(Rol.TRABAJADOR) or request.user.is_superuser):
            raise PermissionDenied('Sólo los trabajadores pueden crear reportes.')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reclamo = serializer.validated_data['reclamo']

        # El reclamo debe estar asignado a este trabajador
        if not reclamo.asignaciones.filter(trabajador=request.user).exists() \
                and not request.user.is_superuser:
            raise PermissionDenied('Este reclamo no está asignado a usted.')

        if reclamo.estado_actual.nombre not in (
            EstadoReclamo.ASIGNADO, EstadoReclamo.EN_ATENCION
        ):
            raise ValidationError(
                {'reclamo': 'El reclamo debe estar asignado o en atención.'}
            )

        reporte = serializer.save(trabajador=request.user)
        cambiar_estado(
            reclamo, EstadoReclamo.REPORTADO, request.user,
            'El trabajador envió el reporte de atención.',
        )
        registrar_bitacora(
            request.user, 'Creación de reporte', 'Reportes',
            f'Reporte enviado para el reclamo #{reclamo.id}.', request,
        )
        # Notificar a los encargados que hay un reporte listo para revisar y cerrar
        notificar_rol(
            Rol.ENCARGADO, Notificacion.REPORTE_ENVIADO,
            'Reporte listo para revisar',
            f'El reclamo #{reclamo.id} "{reclamo.titulo}" tiene un reporte; revísalo y ciérralo.',
            reclamo=reclamo, url=f'/encargado/reclamos/{reclamo.id}',
        )
        return Response(
            ReporteSerializer(reporte).data, status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='por-reclamo/(?P<reclamo_id>[^/.]+)')
    def por_reclamo(self, request, reclamo_id=None):
        qs = self.get_queryset().filter(reclamo_id=reclamo_id)
        serializer = ReporteSerializer(qs, many=True)
        return Response(serializer.data)
