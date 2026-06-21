"""Modelo de bitácora del sistema."""
from django.conf import settings
from django.db import models


class Bitacora(models.Model):
    """Registro de movimientos importantes del sistema."""

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movimientos_bitacora',
    )
    accion = models.CharField(max_length=100)
    modulo = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    ip_usuario = models.GenericIPAddressField(null=True, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Movimiento de bitácora'
        verbose_name_plural = 'Bitácora'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f'{self.fecha_hora:%Y-%m-%d %H:%M} - {self.accion}'
