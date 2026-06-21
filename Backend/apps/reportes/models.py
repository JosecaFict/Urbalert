"""Modelo de reporte de atención del trabajador."""
from django.conf import settings
from django.db import models

from apps.reclamos.models import Reclamo


class ReporteTrabajador(models.Model):
    """Reporte de atención que el trabajador sube tras atender un reclamo."""

    SOLUCIONADO = 'solucionado'
    NO_SOLUCIONADO = 'no_solucionado'
    REQUIERE_REVISION = 'requiere_revision'
    RESULTADO_CHOICES = [
        (SOLUCIONADO, 'Solucionado'),
        (NO_SOLUCIONADO, 'No solucionado'),
        (REQUIERE_REVISION, 'Requiere revisión'),
    ]

    reclamo = models.ForeignKey(
        Reclamo, on_delete=models.CASCADE, related_name='reportes'
    )
    trabajador = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name='reportes',
    )
    descripcion_trabajo = models.TextField()
    resultado = models.CharField(max_length=20, choices=RESULTADO_CHOICES)
    foto_evidencia = models.ImageField(
        upload_to='reportes/', null=True, blank=True
    )
    latitud_atencion = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    longitud_atencion = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    fecha_reporte = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Reporte de trabajador'
        verbose_name_plural = 'Reportes de trabajador'
        ordering = ['-fecha_reporte']

    def __str__(self):
        return f'Reporte de {self.reclamo} ({self.get_resultado_display()})'
