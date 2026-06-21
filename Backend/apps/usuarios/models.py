"""Modelos de usuarios y roles para Urbalert."""
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class Rol(models.Model):
    """Rol del sistema: Administrador, Ciudadano, Encargado, Trabajador."""

    ADMINISTRADOR = 'administrador'
    CIUDADANO = 'ciudadano'
    ENCARGADO = 'encargado'
    TRABAJADOR = 'trabajador'

    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.nombre


class UsuarioManager(BaseUserManager):
    """Manager personalizado que usa el correo como identificador principal."""

    use_in_migrations = True

    def _create_user(self, username, email, password, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        if not username:
            username = email
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username=None, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(username, email, password, **extra_fields)

    def create_superuser(self, username=None, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True')
        return self._create_user(username, email, password, **extra_fields)


class Usuario(AbstractUser):
    """Usuario personalizado de Urbalert.

    Se autentica por correo electrónico y pertenece a un rol del sistema.
    """

    ACTIVO = 'activo'
    INACTIVO = 'inactivo'
    ESTADO_CHOICES = [
        (ACTIVO, 'Activo'),
        (INACTIVO, 'Inactivo'),
    ]

    email = models.EmailField('Correo electrónico', unique=True)
    rol = models.ForeignKey(
        Rol, on_delete=models.PROTECT, related_name='usuarios', null=True, blank=True
    )
    nombres = models.CharField('Nombres', max_length=100, blank=True)
    apellidos = models.CharField('Apellidos', max_length=100, blank=True)
    # Se mantiene sincronizado automáticamente a partir de nombres + apellidos
    # (ver save()). Se conserva como campo para no romper lecturas existentes.
    nombre_completo = models.CharField(max_length=150, blank=True)
    ci = models.CharField('Carnet de identidad', max_length=20, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.CharField(max_length=255, blank=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default=ACTIVO)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-fecha_registro']

    def save(self, *args, **kwargs):
        # Mantener nombre_completo derivado de nombres + apellidos.
        compuesto = f'{self.nombres} {self.apellidos}'.strip()
        if compuesto:
            self.nombre_completo = compuesto
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.nombre_completo or self.email}'

    @property
    def primer_nombre(self):
        """Solo los nombres de pila (para saludos y barra superior)."""
        return self.nombres or self.nombre_completo or self.email

    @property
    def rol_nombre(self):
        return self.rol.nombre if self.rol else None

    def es_rol(self, nombre):
        return self.rol is not None and self.rol.nombre == nombre
