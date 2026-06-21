"""Serializers de asignaciones."""
from rest_framework import serializers

from apps.reclamos.serializers import ReclamoListSerializer

from .models import AsignacionReclamo


class AsignacionSerializer(serializers.ModelSerializer):
    reclamo_detalle = ReclamoListSerializer(source='reclamo', read_only=True)
    trabajador_nombre = serializers.SerializerMethodField()
    encargado_nombre = serializers.SerializerMethodField()

    class Meta:
        model = AsignacionReclamo
        fields = [
            'id', 'reclamo', 'reclamo_detalle', 'encargado', 'encargado_nombre',
            'trabajador', 'trabajador_nombre', 'fecha_asignacion', 'observacion',
            'estado_asignacion',
        ]

    def get_trabajador_nombre(self, obj):
        return obj.trabajador.nombre_completo or obj.trabajador.email

    def get_encargado_nombre(self, obj):
        if obj.encargado:
            return obj.encargado.nombre_completo or obj.encargado.email
        return None


class AsignacionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignacionReclamo
        fields = ['id', 'reclamo', 'trabajador', 'observacion']
