"""Permisos personalizados por rol para Urbalert."""
from rest_framework.permissions import BasePermission

from .models import Rol


class RolePermission(BasePermission):
    """Permite el acceso sólo a usuarios cuyo rol esté en `allowed_roles`."""

    allowed_roles = []

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return user.rol is not None and user.rol.nombre in self.allowed_roles


class IsAdministrador(RolePermission):
    allowed_roles = [Rol.ADMINISTRADOR]


class IsCiudadano(RolePermission):
    allowed_roles = [Rol.CIUDADANO]


class IsEncargado(RolePermission):
    allowed_roles = [Rol.ENCARGADO]


class IsTrabajador(RolePermission):
    allowed_roles = [Rol.TRABAJADOR]


class IsAdminOrEncargado(RolePermission):
    allowed_roles = [Rol.ADMINISTRADOR, Rol.ENCARGADO]


class IsPersonalInterno(RolePermission):
    """Personal que gestiona el flujo del reclamo (no incluye al ciudadano)."""

    allowed_roles = [Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.TRABAJADOR]


class IsAdministradorOrReadOnly(BasePermission):
    """Lectura para cualquier autenticado; escritura sólo administrador."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        if user.is_superuser:
            return True
        return user.rol is not None and user.rol.nombre == Rol.ADMINISTRADOR
