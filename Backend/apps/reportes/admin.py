"""Admin de reportes."""
from django.contrib import admin

from .models import ReporteTrabajador


@admin.register(ReporteTrabajador)
class ReporteTrabajadorAdmin(admin.ModelAdmin):
    list_display = ['id', 'reclamo', 'trabajador', 'resultado', 'fecha_reporte']
    list_filter = ['resultado', 'fecha_reporte']
    search_fields = ['reclamo__titulo', 'trabajador__email']
