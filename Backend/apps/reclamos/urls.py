"""Rutas de reclamos: /api/reclamos/..."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ReclamoViewSet

router = DefaultRouter()
router.register('', ReclamoViewSet, basename='reclamo')

urlpatterns = [
    path('', include(router.urls)),
]
