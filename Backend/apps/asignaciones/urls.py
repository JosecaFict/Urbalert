"""Rutas de asignaciones: /api/asignaciones/..."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AsignacionViewSet

router = DefaultRouter()
router.register('', AsignacionViewSet, basename='asignacion')

urlpatterns = [
    path('', include(router.urls)),
]
