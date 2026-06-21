"""Admin de asignaciones."""
from django.contrib import admin

from .models import AsignacionReclamo


@admin.register(AsignacionReclamo)
class AsignacionReclamoAdmin(admin.ModelAdmin):
    list_display = ['id', 'reclamo', 'trabajador', 'encargado',
                    'estado_asignacion', 'fecha_asignacion']
    list_filter = ['estado_asignacion', 'fecha_asignacion']
    search_fields = ['reclamo__titulo', 'trabajador__email']
