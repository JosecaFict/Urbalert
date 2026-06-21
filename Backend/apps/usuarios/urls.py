"""Rutas de usuarios y roles: /api/usuarios/..."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import RolViewSet, UsuarioViewSet

router = DefaultRouter()
router.register('roles', RolViewSet, basename='rol')
router.register('', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
]
