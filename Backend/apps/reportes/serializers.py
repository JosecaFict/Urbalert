"""Serializers de reportes de trabajador."""
from rest_framework import serializers

from .models import ReporteTrabajador


class ReporteSerializer(serializers.ModelSerializer):
    trabajador_nombre = serializers.SerializerMethodField()
    resultado_display = serializers.CharField(
        source='get_resultado_display', read_only=True
    )
    reclamo_titulo = serializers.CharField(source='reclamo.titulo', read_only=True)

    class Meta:
        model = ReporteTrabajador
        fields = [
            'id', 'reclamo', 'reclamo_titulo', 'trabajador', 'trabajador_nombre',
            'descripcion_trabajo', 'resultado', 'resultado_display',
            'foto_evidencia', 'latitud_atencion', 'longitud_atencion',
            'fecha_reporte',
        ]
        read_only_fields = ['trabajador']

    def get_trabajador_nombre(self, obj):
        if obj.trabajador:
            return obj.trabajador.nombre_completo or obj.trabajador.email
        return None


class ReporteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteTrabajador
        fields = [
            'id', 'reclamo', 'descripcion_trabajo', 'resultado',
            'foto_evidencia', 'latitud_atencion', 'longitud_atencion',
        ]
