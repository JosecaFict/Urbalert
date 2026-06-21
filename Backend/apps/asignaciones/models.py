"""Modelo de asignación de reclamos a trabajadores."""
from django.conf import settings
from django.db import models

from apps.reclamos.models import Reclamo


class AsignacionReclamo(models.Model):
    """Asignación de un reclamo a un trabajador hecha por un encargado."""

    ACTIVA = 'activa'
    FINALIZADA = 'finalizada'
    ESTADO_CHOICES = [
        (ACTIVA, 'Activa'),
        (FINALIZADA, 'Finalizada'),
    ]

    reclamo = models.ForeignKey(
        Reclamo, on_delete=models.CASCADE, related_name='asignaciones'
    )
    encargado = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name='asignaciones_creadas',
    )
    trabajador = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='asignaciones_recibidas',
    )
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    observacion = models.TextField(blank=True)
    estado_asignacion = models.CharField(
        max_length=20, choices=ESTADO_CHOICES, default=ACTIVA
    )

    class Meta:
        verbose_name = 'Asignación de reclamo'
        verbose_name_plural = 'Asignaciones de reclamo'
        ordering = ['-fecha_asignacion']

    def __str__(self):
        return f'{self.reclamo} → {self.trabajador}'
