from django.contrib import admin

from operations.models import OperationRef, Law, UserGuide, OrderHdr, BasisDoc, OperationOrderBasis


def get_all_model_fields(model):
    return [field.name for field in model._meta.fields]


@admin.register(OperationRef)
class OperationRefAdmin(admin.ModelAdmin):
    list_display = get_all_model_fields(OperationRef)


@admin.register(Law)
class LawAdmin(admin.ModelAdmin):
    list_display = get_all_model_fields(Law)


@admin.register(UserGuide)
class UserGuideAdmin(admin.ModelAdmin):
    list_display = get_all_model_fields(UserGuide)


@admin.register(OrderHdr)
class OrderHdrAdmin(admin.ModelAdmin):
    list_display = get_all_model_fields(OrderHdr)


@admin.register(BasisDoc)
class BasisDocAdmin(admin.ModelAdmin):
    list_display = get_all_model_fields(BasisDoc)


@admin.register(OperationOrderBasis)
class OperationOrderBasisAdmin(admin.ModelAdmin):
    list_display = get_all_model_fields(OperationOrderBasis)
