"""Serializers de usuarios, roles y autenticación."""
import re

from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Rol, Usuario


def validar_contrasena_segura(value):
    """Valida la política de contraseñas: mínimo 8 caracteres, con al menos
    una mayúscula, una minúscula y un número. Devuelve el valor o lanza error.
    """
    if len(value) < 8:
        raise serializers.ValidationError(
            'La contraseña debe tener al menos 8 caracteres.'
        )
    if not re.search(r'[A-Z]', value):
        raise serializers.ValidationError(
            'La contraseña debe incluir al menos una letra mayúscula.'
        )
    if not re.search(r'[a-z]', value):
        raise serializers.ValidationError(
            'La contraseña debe incluir al menos una letra minúscula.'
        )
    if not re.search(r'\d', value):
        raise serializers.ValidationError(
            'La contraseña debe incluir al menos un número.'
        )
    return value


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion']


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer de lectura/escritura de usuarios."""

    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)
    rol_descripcion = serializers.CharField(source='rol.descripcion', read_only=True)
    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'username', 'rol', 'rol_nombre', 'rol_descripcion',
            'nombres', 'apellidos', 'nombre_completo', 'ci', 'telefono',
            'direccion', 'estado', 'fecha_registro', 'ultimo_acceso',
            'password', 'is_active',
        ]
        read_only_fields = ['fecha_registro', 'ultimo_acceso', 'nombre_completo']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not validated_data.get('username'):
            validated_data['username'] = validated_data.get('email')
        usuario = Usuario(**validated_data)
        if password:
            usuario.set_password(password)
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Registro público de ciudadanos."""

    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'email', 'password', 'nombres', 'apellidos', 'ci', 'telefono', 'direccion',
        ]
        extra_kwargs = {
            'nombres': {'required': True, 'allow_blank': False},
            'apellidos': {'required': True, 'allow_blank': False},
        }

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este correo.')
        return value

    def validate_password(self, value):
        return validar_contrasena_segura(value)

    def create(self, validated_data):
        password = validated_data.pop('password')
        rol_ciudadano, _ = Rol.objects.get_or_create(
            nombre=Rol.CIUDADANO,
            defaults={'descripcion': 'Ciudadano que reporta reclamos urbanos'},
        )
        usuario = Usuario(
            username=validated_data['email'],
            rol=rol_ciudadano,
            **validated_data,
        )
        usuario.set_password(password)
        usuario.save()
        return usuario


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs.get('email'), password=attrs.get('password')
        )
        if not user:
            raise serializers.ValidationError(
                {'detail': 'Correo o contraseña incorrectos.'}
            )
        if not user.is_active or user.estado == Usuario.INACTIVO:
            raise serializers.ValidationError(
                {'detail': 'La cuenta está inactiva. Contacte al administrador.'}
            )
        attrs['user'] = user
        return attrs


def build_token_response(user):
    """Construye la respuesta estándar de tokens + datos de usuario."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'usuario': UsuarioSerializer(user).data,
    }
