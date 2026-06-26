"""Vistas de autenticación y gestión de usuarios."""
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bitacora.utils import registrar_bitacora
from apps.notificaciones.models import Notificacion
from apps.notificaciones.utils import notificar_rol

from .models import Rol, Usuario
from .permissions import IsAdministrador, IsAdminOrEncargado
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    RolSerializer,
    UsuarioSerializer,
    build_token_response,
    validar_contrasena_segura,
)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.ultimo_acceso = timezone.now()
        user.save(update_fields=['ultimo_acceso'])
        registrar_bitacora(
            user, 'Inicio de sesión', 'Autenticación',
            f'El usuario {user.email} inició sesión.', request,
        )
        return Response(build_token_response(user))


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        registrar_bitacora(
            user, 'Registro de ciudadano', 'Autenticación',
            f'Nuevo ciudadano registrado: {user.email}.', request,
        )
        # Supervisión: avisar a los administradores del nuevo registro
        notificar_rol(
            Rol.ADMINISTRADOR, Notificacion.USUARIO_NUEVO,
            'Nuevo usuario registrado',
            f'Se registró un nuevo ciudadano: {user.nombre_completo or user.email}.',
            url='/admin/ciudadanos',
        )
        return Response(build_token_response(user), status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        registrar_bitacora(
            request.user, 'Cierre de sesión', 'Autenticación',
            f'El usuario {request.user.email} cerró sesión.', request,
        )
        return Response({'detail': 'Sesión cerrada correctamente.'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)

    def patch(self, request):
        # El usuario puede editar su propio perfil (campos limitados)
        campos = ['nombres', 'apellidos', 'ci', 'telefono', 'direccion']
        data = {k: v for k, v in request.data.items() if k in campos}
        serializer = UsuarioSerializer(request.user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.select_related('rol').all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdministrador]

    def get_permissions(self):
        # El encargado necesita ver la lista de trabajadores para asignarlos.
        if self.action == 'trabajadores':
            return [IsAdminOrEncargado()]
        return super().get_permissions()

    def perform_create(self, serializer):
        usuario = serializer.save()
        registrar_bitacora(
            self.request.user, 'Creación de usuario', 'Usuarios',
            f'Se creó el usuario {usuario.email} ({usuario.rol_nombre}).',
            self.request,
        )

    def perform_update(self, serializer):
        usuario = serializer.save()
        registrar_bitacora(
            self.request.user, 'Edición de usuario', 'Usuarios',
            f'Se editó el usuario {usuario.email}.', self.request,
        )

    def perform_destroy(self, instance):
        email = instance.email
        instance.delete()
        registrar_bitacora(
            self.request.user, 'Eliminación de usuario', 'Usuarios',
            f'Se eliminó el usuario {email}.', self.request,
        )

    @action(detail=True, methods=['post'], url_path='restablecer-contrasena')
    def restablecer_contrasena(self, request, pk=None):
        usuario = self.get_object()
        nueva = request.data.get('password', '')
        # `validate_password` lanza ValidationError con el mensaje específico
        validar_contrasena_segura(nueva)
        usuario.set_password(nueva)
        usuario.save(update_fields=['password'])
        registrar_bitacora(
            request.user, 'Restablecimiento de contraseña', 'Usuarios',
            f'Se restableció la contraseña de {usuario.email}.', request,
        )
        return Response({'detail': 'Contraseña actualizada.'})

    def _por_rol(self, nombre_rol):
        qs = self.queryset.filter(rol__nombre=nombre_rol)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ciudadanos(self, request):
        return self._por_rol(Rol.CIUDADANO)

    @action(detail=False, methods=['get'])
    def encargados(self, request):
        return self._por_rol(Rol.ENCARGADO)

    @action(detail=False, methods=['get'])
    def trabajadores(self, request):
        return self._por_rol(Rol.TRABAJADOR)


class RolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]
