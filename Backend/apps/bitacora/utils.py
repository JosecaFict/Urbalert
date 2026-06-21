"""Utilidades para registrar movimientos en la bitácora."""
from .models import Bitacora


def obtener_ip(request):
    """Extrae la IP del cliente desde la request."""
    if request is None:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def registrar_bitacora(usuario, accion, modulo, descripcion='', request=None):
    """Crea un registro de bitácora.

    Es tolerante a fallos: nunca interrumpe el flujo principal si algo falla.
    """
    try:
        Bitacora.objects.create(
            usuario=usuario if getattr(usuario, 'is_authenticated', False) else None,
            accion=accion,
            modulo=modulo,
            descripcion=descripcion,
            ip_usuario=obtener_ip(request),
        )
    except Exception:  # noqa: BLE001 - la bitácora no debe romper la operación
        pass
