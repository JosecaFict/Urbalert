"""Modelos de reclamos, categorías, estados, imágenes, historial y comentarios."""
from django.conf import settings
from django.db import models


class CategoriaReclamo(models.Model):
    """Categoría de un reclamo urbano (baches, alumbrado, etc.)."""

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    estado = models.BooleanField('Activa', default=True)

    class Meta:
        verbose_name = 'Categoría de reclamo'
        verbose_name_plural = 'Categorías de reclamo'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class EstadoReclamo(models.Model):
    """Estado del ciclo de vida de un reclamo."""

    PENDIENTE = 'Pendiente'
    ACEPTADO = 'Aceptado'
    RECHAZADO = 'Rechazado'
    ASIGNADO = 'Asignado'
    EN_ATENCION = 'En atención'
    REPORTADO = 'Reportado'
    SOLUCIONADO = 'Solucionado'
    NO_SOLUCIONADO = 'No solucionado'

    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Estado de reclamo'
        verbose_name_plural = 'Estados de reclamo'
        ordering = ['orden']

    def __str__(self):
        return self.nombre


class Reclamo(models.Model):
    """Reclamo urbano creado por un ciudadano."""

    PRIORIDAD_BAJA = 'baja'
    PRIORIDAD_MEDIA = 'media'
    PRIORIDAD_ALTA = 'alta'
    PRIORIDAD_CHOICES = [
        (PRIORIDAD_BAJA, 'Baja'),
        (PRIORIDAD_MEDIA, 'Media'),
        (PRIORIDAD_ALTA, 'Alta'),
    ]

    ciudadano = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reclamos'
    )
    categoria = models.ForeignKey(
        CategoriaReclamo, on_delete=models.PROTECT, related_name='reclamos'
    )
    estado_actual = models.ForeignKey(
        EstadoReclamo, on_delete=models.PROTECT, related_name='reclamos'
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    direccion_texto = models.CharField(max_length=255)
    latitud = models.DecimalField(max_digits=10, decimal_places=7)
    longitud = models.DecimalField(max_digits=10, decimal_places=7)
    foto_principal = models.ImageField(
        upload_to='reclamos/', null=True, blank=True
    )
    prioridad = models.CharField(
        max_length=10, choices=PRIORIDAD_CHOICES, default=PRIORIDAD_MEDIA
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Reclamo'
        verbose_name_plural = 'Reclamos'
        ordering = ['-fecha_registro']

    def __str__(self):
        return f'#{self.pk} - {self.titulo}'


class ImagenReclamo(models.Model):
    """Imágenes adicionales asociadas a un reclamo."""

    EVIDENCIA = 'evidencia'
    ATENCION = 'atencion'
    TIPO_CHOICES = [
        (EVIDENCIA, 'Evidencia'),
        (ATENCION, 'Atención'),
    ]

    reclamo = models.ForeignKey(
        Reclamo, on_delete=models.CASCADE, related_name='imagenes'
    )
    imagen = models.ImageField(upload_to='reclamos/adjuntos/')
    tipo_imagen = models.CharField(
        max_length=20, choices=TIPO_CHOICES, default=EVIDENCIA
    )
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Imagen de reclamo'
        verbose_name_plural = 'Imágenes de reclamo'

    def __str__(self):
        return f'Imagen de {self.reclamo}'


class HistorialEstadoReclamo(models.Model):
    """Historial de cambios de estado de un reclamo (timeline)."""

    reclamo = models.ForeignKey(
        Reclamo, on_delete=models.CASCADE, related_name='historial'
    )
    estado_anterior = models.ForeignKey(
        EstadoReclamo, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='+',
    )
    estado_nuevo = models.ForeignKey(
        EstadoReclamo, on_delete=models.PROTECT, related_name='+'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    observacion = models.TextField(blank=True)
    fecha_cambio = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Historial de estado'
        verbose_name_plural = 'Historial de estados'
        ordering = ['fecha_cambio']

    def __str__(self):
        return f'{self.reclamo} → {self.estado_nuevo}'


class ComentarioReclamo(models.Model):
    """Comentarios u observaciones sobre un reclamo."""

    reclamo = models.ForeignKey(
        Reclamo, on_delete=models.CASCADE, related_name='comentarios'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    comentario = models.TextField()
    tipo_comentario = models.CharField(max_length=50, default='general')
    fecha_comentario = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Comentario de reclamo'
        verbose_name_plural = 'Comentarios de reclamo'
        ordering = ['fecha_comentario']

    def __str__(self):
        return f'Comentario en {self.reclamo}'
