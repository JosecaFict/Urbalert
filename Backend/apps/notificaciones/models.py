"""Modelo de notificaciones dirigidas a cada usuario."""
from django.conf import settings
from django.db import models


class Notificacion(models.Model):
    """Notificación personal para un usuario (campana de la aplicación).

    Cada cambio relevante del flujo genera una notificación dirigida sólo a
    quien le corresponde enterarse o actuar. El campo ``url`` indica a dónde
    debe direccionar el frontend al hacer clic.
    """

    # Tipos: usados por el frontend para el icono y el color
    RECLAMO_NUEVO = 'reclamo_nuevo'
    RECLAMO_ACEPTADO = 'reclamo_aceptado'
    RECLAMO_RECHAZADO = 'reclamo_rechazado'
    RECLAMO_ASIGNADO = 'reclamo_asignado'
    ASIGNACION_NUEVA = 'asignacion_nueva'
    RECLAMO_EN_ATENCION = 'reclamo_en_atencion'
    REPORTE_ENVIADO = 'reporte_enviado'
    RECLAMO_SOLUCIONADO = 'reclamo_solucionado'
    RECLAMO_NO_SOLUCIONADO = 'reclamo_no_solucionado'
    USUARIO_NUEVO = 'usuario_nuevo'

    TIPO_CHOICES = [
        (RECLAMO_NUEVO, 'Reclamo nuevo'),
        (RECLAMO_ACEPTADO, 'Reclamo aceptado'),
        (RECLAMO_RECHAZADO, 'Reclamo rechazado'),
        (RECLAMO_ASIGNADO, 'Reclamo asignado'),
        (ASIGNACION_NUEVA, 'Asignación nueva'),
        (RECLAMO_EN_ATENCION, 'Reclamo en atención'),
        (REPORTE_ENVIADO, 'Reporte enviado'),
        (RECLAMO_SOLUCIONADO, 'Reclamo solucionado'),
        (RECLAMO_NO_SOLUCIONADO, 'Reclamo no solucionado'),
        (USUARIO_NUEVO, 'Usuario nuevo'),
    ]

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones',
    )
    tipo = models.CharField(max_length=40, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=150)
    mensaje = models.TextField(blank=True)
    reclamo = models.ForeignKey(
        'reclamos.Reclamo',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notificaciones',
    )
    url = models.CharField(max_length=255, blank=True)
    leida = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f'{self.get_tipo_display()} → {self.usuario}'
