"""Lógica de negocio reutilizable para reclamos."""
from .models import EstadoReclamo, HistorialEstadoReclamo, Reclamo


def obtener_estado(nombre):
    """Devuelve la instancia de EstadoReclamo por nombre."""
    return EstadoReclamo.objects.get(nombre=nombre)


def cambiar_estado(reclamo: Reclamo, nombre_estado_nuevo, usuario=None, observacion=''):
    """Cambia el estado de un reclamo y registra el historial.

    Devuelve la instancia de historial creada.
    """
    estado_anterior = reclamo.estado_actual
    estado_nuevo = obtener_estado(nombre_estado_nuevo)

    reclamo.estado_actual = estado_nuevo
    reclamo.save(update_fields=['estado_actual', 'fecha_actualizacion'])

    return HistorialEstadoReclamo.objects.create(
        reclamo=reclamo,
        estado_anterior=estado_anterior,
        estado_nuevo=estado_nuevo,
        usuario=usuario if getattr(usuario, 'is_authenticated', False) else None,
        observacion=observacion,
    )
