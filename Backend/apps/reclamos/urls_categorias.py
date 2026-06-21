"""Rutas de categorías: /api/categorias/..."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoriaReclamoViewSet

router = DefaultRouter()
router.register('', CategoriaReclamoViewSet, basename='categoria')

urlpatterns = [
    path('', include(router.urls)),
]
