"""Utilidades para crear notificaciones dirigidas a los usuarios.

Estas funciones son tolerantes a fallos: nunca interrumpen el flujo principal
si algo falla (igual que la bitácora).
"""
from apps.usuarios.models import Usuario

from .models import Notificacion


def notificar(usuario, tipo, titulo, mensaje='', reclamo=None, url=''):
    """Crea una notificación para un usuario concreto."""
    if usuario is None:
        return
    try:
        Notificacion.objects.create(
            usuario=usuario,
            tipo=tipo,
            titulo=titulo,
            mensaje=mensaje,
            reclamo=reclamo,
            url=url,
        )
    except Exception:  # noqa: BLE001 - una notificación no debe romper la operación
        pass


def notificar_rol(nombre_rol, tipo, titulo, mensaje='', reclamo=None, url='',
                  excluir=None):
    """Crea una notificación para todos los usuarios activos de un rol.

    ``excluir`` permite no notificar al propio usuario que originó la acción.
    """
    try:
        qs = Usuario.objects.filter(rol__nombre=nombre_rol, estado=Usuario.ACTIVO)
        if excluir is not None and getattr(excluir, 'pk', None):
            qs = qs.exclude(pk=excluir.pk)
        for usuario in qs:
            notificar(usuario, tipo, titulo, mensaje, reclamo, url)
    except Exception:  # noqa: BLE001 - nunca romper el flujo principal
        pass
