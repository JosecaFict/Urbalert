"""Admin de notificaciones."""
from django.contrib import admin

from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ['fecha_creacion', 'usuario', 'tipo', 'titulo', 'leida']
    list_filter = ['tipo', 'leida', 'fecha_creacion']
    search_fields = ['titulo', 'mensaje', 'usuario__email']
    readonly_fields = ['fecha_creacion']
    date_hierarchy = 'fecha_creacion'
