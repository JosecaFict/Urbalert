"""Serializer de bitácora."""
from rest_framework import serializers

from .models import Bitacora


class BitacoraSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    usuario_rol = serializers.SerializerMethodField()

    class Meta:
        model = Bitacora
        fields = [
            'id', 'usuario', 'usuario_nombre', 'usuario_rol', 'accion',
            'modulo', 'descripcion', 'ip_usuario', 'fecha_hora',
        ]

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.nombre_completo or obj.usuario.email
        return 'Sistema'

    def get_usuario_rol(self, obj):
        if obj.usuario and obj.usuario.rol:
            return obj.usuario.rol.nombre
        return None
