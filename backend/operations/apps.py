from django.apps import AppConfig


class OperationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "operations"
    verbose_name = "Operations"

    def ready(self):
        try:
            import operations.signals
        except Exception as exc:
            from django.core.exceptions import ImproperlyConfigured
            raise ImproperlyConfigured(f"Ошибка при загрузке signals в приложении 'operations': {exc}")
