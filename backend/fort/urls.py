from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from chat.views import ChatAPIView
from chat.mock import ChatMockAPIView
from mermaid.views import MermaidAPIView
from mermaid.mock import MermaidMockAPIView
from confluence.views import ConfluenceApiView

from operations.views import OperationRefListView, OperationDetailsView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/chat/<int:agent_id>', ChatAPIView.as_view()),
    path('api/v1/mermaid', MermaidAPIView.as_view()),
    path('api/v1/mermaid/mock', MermaidMockAPIView.as_view()),
    path('api/v1/chat/<int:agent_id>/mock', ChatMockAPIView.as_view()),
    path('api/v1/create-confluence-tz/', ConfluenceApiView.as_view(), name='create-confluence-tz'),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),

    path('api/v1/operations/', OperationRefListView.as_view(), name='operations-list'),
    path('api/v1/operations/details/', OperationDetailsView.as_view(), name="operations-details"),
]
