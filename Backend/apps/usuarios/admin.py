"""Admin de usuarios y roles."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Rol, Usuario


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'descripcion']
    search_fields = ['nombre']


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ['id', 'email', 'nombre_completo', 'rol', 'estado', 'fecha_registro']
    list_filter = ['rol', 'estado', 'is_active']
    search_fields = ['email', 'nombres', 'apellidos', 'nombre_completo', 'ci']
    ordering = ['-fecha_registro']

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Datos personales', {
            'fields': ('nombres', 'apellidos', 'ci', 'telefono', 'direccion', 'rol', 'estado')
        }),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Fechas', {'fields': ('last_login', 'fecha_registro', 'ultimo_acceso')}),
    )
    readonly_fields = ['fecha_registro', 'ultimo_acceso', 'last_login', 'nombre_completo']

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'nombres', 'apellidos', 'rol',
                       'password1', 'password2'),
        }),
    )
