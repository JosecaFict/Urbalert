"""Serializers de reclamos, categorías, estados, historial y comentarios."""
from rest_framework import serializers

from .models import (
    CategoriaReclamo,
    ComentarioReclamo,
    EstadoReclamo,
    HistorialEstadoReclamo,
    ImagenReclamo,
    Reclamo,
)


class CategoriaReclamoSerializer(serializers.ModelSerializer):
    total_reclamos = serializers.IntegerField(source='reclamos.count', read_only=True)

    class Meta:
        model = CategoriaReclamo
        fields = ['id', 'nombre', 'descripcion', 'estado', 'total_reclamos']


class EstadoReclamoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoReclamo
        fields = ['id', 'nombre', 'descripcion', 'orden']


class ImagenReclamoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenReclamo
        fields = ['id', 'imagen', 'tipo_imagen', 'fecha_subida']


class HistorialEstadoReclamoSerializer(serializers.ModelSerializer):
    estado_anterior_nombre = serializers.CharField(
        source='estado_anterior.nombre', read_only=True, default=None
    )
    estado_nuevo_nombre = serializers.CharField(
        source='estado_nuevo.nombre', read_only=True
    )
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = HistorialEstadoReclamo
        fields = [
            'id', 'estado_anterior', 'estado_anterior_nombre', 'estado_nuevo',
            'estado_nuevo_nombre', 'usuario', 'usuario_nombre', 'observacion',
            'fecha_cambio',
        ]

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.nombre_completo or obj.usuario.email
        return 'Sistema'


class ComentarioReclamoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = ComentarioReclamo
        fields = [
            'id', 'reclamo', 'usuario', 'usuario_nombre', 'comentario',
            'tipo_comentario', 'fecha_comentario',
        ]
        read_only_fields = ['usuario']

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.nombre_completo or obj.usuario.email
        return 'Sistema'


class ReclamoListSerializer(serializers.ModelSerializer):
    """Serializer compacto para listados y tablas."""

    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    estado_nombre = serializers.CharField(source='estado_actual.nombre', read_only=True)
    ciudadano_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Reclamo
        fields = [
            'id', 'titulo', 'categoria', 'categoria_nombre', 'estado_actual',
            'estado_nombre', 'ciudadano', 'ciudadano_nombre', 'direccion_texto',
            'latitud', 'longitud', 'prioridad', 'foto_principal',
            'fecha_registro', 'fecha_actualizacion',
        ]

    def get_ciudadano_nombre(self, obj):
        return obj.ciudadano.nombre_completo or obj.ciudadano.email


class ReclamoDetailSerializer(serializers.ModelSerializer):
    """Serializer completo con relaciones anidadas."""

    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    estado_nombre = serializers.CharField(source='estado_actual.nombre', read_only=True)
    ciudadano_nombre = serializers.SerializerMethodField()
    ciudadano_telefono = serializers.CharField(
        source='ciudadano.telefono', read_only=True
    )
    imagenes = ImagenReclamoSerializer(many=True, read_only=True)
    historial = HistorialEstadoReclamoSerializer(many=True, read_only=True)
    comentarios = ComentarioReclamoSerializer(many=True, read_only=True)

    class Meta:
        model = Reclamo
        fields = [
            'id', 'titulo', 'descripcion', 'categoria', 'categoria_nombre',
            'estado_actual', 'estado_nombre', 'ciudadano', 'ciudadano_nombre',
            'ciudadano_telefono', 'direccion_texto', 'latitud', 'longitud',
            'foto_principal', 'prioridad', 'fecha_registro', 'fecha_actualizacion',
            'imagenes', 'historial', 'comentarios',
        ]

    def get_ciudadano_nombre(self, obj):
        return obj.ciudadano.nombre_completo or obj.ciudadano.email


class ReclamoCreateSerializer(serializers.ModelSerializer):
    """Serializer de creación: el ciudadano crea su reclamo."""

    class Meta:
        model = Reclamo
        fields = [
            'id', 'titulo', 'descripcion', 'categoria', 'direccion_texto',
            'latitud', 'longitud', 'foto_principal', 'prioridad',
        ]

    def validate_latitud(self, value):
        if value is None:
            raise serializers.ValidationError('La latitud es obligatoria.')
        return value

    def validate_longitud(self, value):
        if value is None:
            raise serializers.ValidationError('La longitud es obligatoria.')
        return value
