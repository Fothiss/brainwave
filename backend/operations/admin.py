from typing import List
from django.contrib import admin
from django.db.models import Model

from operations.models import OperationRef, Law, UserGuide, OrderHdr, BasisDoc, OperationOrderBasis


class BaseAutoAdmin(admin.ModelAdmin):

    @staticmethod
    def get_model_field_names(model: Model) -> List[str]:
        return [field.name for field in model._meta.get_fields()
                if not (field.many_to_many or field.one_to_many)]

    def __init__(self, model, admin_site):
        if not hasattr(self, "list_display") or not self.list_display:
            self.list_display = self.get_model_field_names(model)

        super().__init__(model, admin_site)


@admin.register(OperationRef)
class OperationRefAdmin(BaseAutoAdmin):
    pass


@admin.register(Law)
class LawAdmin(BaseAutoAdmin):
    pass


@admin.register(UserGuide)
class UserGuideAdmin(BaseAutoAdmin):
    pass


@admin.register(OrderHdr)
class OrderHdrAdmin(BaseAutoAdmin):
    pass


@admin.register(BasisDoc)
class BasisDocAdmin(BaseAutoAdmin):
    pass


@admin.register(OperationOrderBasis)
class OperationOrderBasisAdmin(BaseAutoAdmin):
    pass
