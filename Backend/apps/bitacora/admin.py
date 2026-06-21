"""Admin de bitácora."""
from django.contrib import admin

from .models import Bitacora


@admin.register(Bitacora)
class BitacoraAdmin(admin.ModelAdmin):
    list_display = ['fecha_hora', 'usuario', 'accion', 'modulo', 'ip_usuario']
    list_filter = ['modulo', 'accion', 'fecha_hora']
    search_fields = ['descripcion', 'accion', 'usuario__email']
    readonly_fields = ['fecha_hora']
    date_hierarchy = 'fecha_hora'
