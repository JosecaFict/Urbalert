"""Vistas de notificaciones del usuario autenticado."""
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notificacion
from .serializers import NotificacionSerializer


class NotificacionViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Cada usuario sólo ve y gestiona SUS propias notificaciones."""

    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Notificacion.objects.filter(usuario=self.request.user)
        if self.request.query_params.get('no_leidas') in ('1', 'true', 'True'):
            qs = qs.filter(leida=False)
        return qs

    @action(detail=False, methods=['get'], url_path='no-leidas')
    def no_leidas(self, request):
        """Devuelve el conteo de notificaciones sin leer (para el badge)."""
        total = Notificacion.objects.filter(
            usuario=request.user, leida=False
        ).count()
        return Response({'no_leidas': total})

    @action(detail=True, methods=['patch'], url_path='marcar-leida')
    def marcar_leida(self, request, pk=None):
        """Marca una notificación como leída."""
        actualizadas = Notificacion.objects.filter(
            pk=pk, usuario=request.user
        ).update(leida=True)
        return Response({'actualizadas': actualizadas})

    @action(detail=False, methods=['patch'], url_path='marcar-todas')
    def marcar_todas(self, request):
        """Marca todas las notificaciones del usuario como leídas."""
        actualizadas = Notificacion.objects.filter(
            usuario=request.user, leida=False
        ).update(leida=True)
        return Response({'actualizadas': actualizadas})
