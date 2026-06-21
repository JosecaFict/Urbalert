"""Vistas de bitácora (sólo lectura, filtrable)."""
from rest_framework import viewsets

from apps.usuarios.permissions import IsAdministrador

from .models import Bitacora
from .serializers import BitacoraSerializer


class BitacoraViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BitacoraSerializer
    permission_classes = [IsAdministrador]

    def get_queryset(self):
        qs = Bitacora.objects.select_related('usuario', 'usuario__rol').all()
        params = self.request.query_params

        usuario = params.get('usuario')
        if usuario:
            qs = qs.filter(usuario_id=usuario)

        accion = params.get('accion')
        if accion:
            qs = qs.filter(accion__icontains=accion)

        modulo = params.get('modulo')
        if modulo:
            qs = qs.filter(modulo__icontains=modulo)

        desde = params.get('desde')
        if desde:
            qs = qs.filter(fecha_hora__date__gte=desde)

        hasta = params.get('hasta')
        if hasta:
            qs = qs.filter(fecha_hora__date__lte=hasta)

        return qs
