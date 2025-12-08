"""
ASGI config for fort project.

Exposes the ASGI application callable as a module-level variable named ``application``.

See:
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

# Set default settings module only if not already defined
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fort.settings")


def create_asgi_application():
    """
    Создаёт и возвращает ASGI-приложение.
    Вынесено в функцию, чтобы облегчить расширение в будущем
    (например, подключить WebSocket-роутинг).
    """
    return get_asgi_application()


# ASGI entrypoint
application = create_asgi_application()
