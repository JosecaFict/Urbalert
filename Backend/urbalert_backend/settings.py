"""
Configuración de Django para el proyecto Urbalert.

Gestión y seguimiento de reclamos ciudadanos - Santa Cruz de la Sierra, Bolivia.
"""
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar variables de entorno desde .env si existe
load_dotenv(BASE_DIR / '.env')


def env_bool(key, default=False):
    return os.getenv(key, str(default)).lower() in ('1', 'true', 'yes', 'on')


def env_list(key, default=''):
    raw = os.getenv(key, default)
    return [item.strip() for item in raw.split(',') if item.strip()]


SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'django-insecure-cambia-esta-clave-en-produccion-urbalert-2026',
)

DEBUG = env_bool('DEBUG', True)

ALLOWED_HOSTS = env_list('ALLOWED_HOSTS', 'localhost,127.0.0.1')

# Railway expone el dominio público en esta variable: lo agregamos solo.
RAILWAY_DOMAIN = os.getenv('RAILWAY_PUBLIC_DOMAIN')
if RAILWAY_DOMAIN:
    ALLOWED_HOSTS.append(RAILWAY_DOMAIN)
ALLOWED_HOSTS += ['.up.railway.app']

# Orígenes de confianza para CSRF (necesario en HTTPS con dominios externos)
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS', '')
if RAILWAY_DOMAIN:
    CSRF_TRUSTED_ORIGINS.append(f'https://{RAILWAY_DOMAIN}')
CSRF_TRUSTED_ORIGINS += ['https://*.up.railway.app']


# --------------------------------------------------------------------------- #
# Aplicaciones
# --------------------------------------------------------------------------- #
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
]

LOCAL_APPS = [
    'apps.usuarios',
    'apps.reclamos',
    'apps.asignaciones',
    'apps.reportes',
    'apps.bitacora',
    'apps.notificaciones',
    'apps.dashboard',
    'apps.core',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'urbalert_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'urbalert_backend.wsgi.application'
ASGI_APPLICATION = 'urbalert_backend.asgi.application'


# --------------------------------------------------------------------------- #
# Base de datos (SQLite por defecto, listo para PostgreSQL)
# --------------------------------------------------------------------------- #
# Railway entrega una sola variable DATABASE_URL; si existe, la usamos.
if os.getenv('DATABASE_URL'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(
            os.getenv('DATABASE_URL'), conn_max_age=600,
        )
    }
elif os.getenv('DB_ENGINE', 'sqlite') == 'postgres':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'urbalert'),
            'USER': os.getenv('DB_USER', 'urbalert'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'urbalert'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# --------------------------------------------------------------------------- #
# Validación de contraseñas
# --------------------------------------------------------------------------- #
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 6}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# --------------------------------------------------------------------------- #
# Internacionalización
# --------------------------------------------------------------------------- #
LANGUAGE_CODE = 'es'
TIME_ZONE = 'America/La_Paz'
USE_I18N = True
USE_TZ = True


# --------------------------------------------------------------------------- #
# Archivos estáticos y media
# --------------------------------------------------------------------------- #
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# WhiteNoise sirve y comprime los estáticos en producción.
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --------------------------------------------------------------------------- #
# Cloudinary (persistencia de imágenes en producción con CDN)
# --------------------------------------------------------------------------- #
# En dev seguimos guardando en disco local para no depender de internet.
# En producción, si las 3 credenciales están cargadas como env vars,
# el DEFAULT_FILE_STORAGE apunta a Cloudinary.
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', '')

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': CLOUDINARY_CLOUD_NAME,
        'API_KEY': CLOUDINARY_API_KEY,
        'API_SECRET': CLOUDINARY_API_SECRET,
    }
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'usuarios.Usuario'


# --------------------------------------------------------------------------- #
# Django REST Framework
# --------------------------------------------------------------------------- #
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'urbalert_backend.pagination.DefaultPageNumberPagination',
    'PAGE_SIZE': 20,
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S%z',
}


# --------------------------------------------------------------------------- #
# Simple JWT
# --------------------------------------------------------------------------- #
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}


# --------------------------------------------------------------------------- #
# CORS
# --------------------------------------------------------------------------- #
CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173',
)
# Permite automáticamente cualquier dominio de Vercel (producción y previews).
CORS_ALLOWED_ORIGIN_REGEXES = [r'^https://.*\.vercel\.app$']
CORS_ALLOW_CREDENTIALS = True
