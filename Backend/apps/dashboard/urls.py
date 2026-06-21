"""Rutas del dashboard: /api/dashboard/..."""
from django.urls import path

from .views import (
    ActividadRecienteView,
    ReclamosPorCategoriaView,
    ReclamosPorEstadoView,
    ReclamosPorMesView,
    ReclamosUbicacionesView,
    ResumenView,
)

urlpatterns = [
    path('resumen/', ResumenView.as_view(), name='dashboard-resumen'),
    path('reclamos-por-estado/', ReclamosPorEstadoView.as_view(),
         name='dashboard-por-estado'),
    path('reclamos-ubicaciones/', ReclamosUbicacionesView.as_view(),
         name='dashboard-ubicaciones'),
    path('reclamos-por-categoria/', ReclamosPorCategoriaView.as_view(),
         name='dashboard-por-categoria'),
    path('reclamos-por-mes/', ReclamosPorMesView.as_view(),
         name='dashboard-por-mes'),
    path('actividad-reciente/', ActividadRecienteView.as_view(),
         name='dashboard-actividad'),
]
