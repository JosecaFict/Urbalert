"""Admin de reclamos."""
from django.contrib import admin

from .models import (
    CategoriaReclamo,
    ComentarioReclamo,
    EstadoReclamo,
    HistorialEstadoReclamo,
    ImagenReclamo,
    Reclamo,
)


@admin.register(CategoriaReclamo)
class CategoriaReclamoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'estado']
    list_filter = ['estado']
    search_fields = ['nombre']


@admin.register(EstadoReclamo)
class EstadoReclamoAdmin(admin.ModelAdmin):
    list_display = ['orden', 'nombre', 'descripcion']
    ordering = ['orden']


class ImagenReclamoInline(admin.TabularInline):
    model = ImagenReclamo
    extra = 0


class HistorialInline(admin.TabularInline):
    model = HistorialEstadoReclamo
    extra = 0
    readonly_fields = ['fecha_cambio']


@admin.register(Reclamo)
class ReclamoAdmin(admin.ModelAdmin):
    list_display = ['id', 'titulo', 'categoria', 'estado_actual',
                    'ciudadano', 'prioridad', 'fecha_registro']
    list_filter = ['estado_actual', 'categoria', 'prioridad']
    search_fields = ['titulo', 'direccion_texto', 'ciudadano__email']
    inlines = [ImagenReclamoInline, HistorialInline]
    date_hierarchy = 'fecha_registro'


@admin.register(ComentarioReclamo)
class ComentarioReclamoAdmin(admin.ModelAdmin):
    list_display = ['id', 'reclamo', 'usuario', 'fecha_comentario']
