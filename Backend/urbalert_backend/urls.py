"""Rutas raíz del proyecto Urbalert."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.usuarios.urls_auth')),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/categorias/', include('apps.reclamos.urls_categorias')),
    path('api/reclamos/', include('apps.reclamos.urls')),
    path('api/asignaciones/', include('apps.asignaciones.urls')),
    path('api/reportes/', include('apps.reportes.urls')),
    path('api/bitacora/', include('apps.bitacora.urls')),
    path('api/notificaciones/', include('apps.notificaciones.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
