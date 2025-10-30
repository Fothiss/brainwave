from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from operations.views import OperationRefListView, OperationDetailsView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),

    path('api/v1/operations/', OperationRefListView.as_view(), name='operations-list'),
    path('api/v1/operations/details/', OperationDetailsView.as_view(), name="operations-details"),
]
